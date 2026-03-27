const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwacuhub-secret-key-2024');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Get user profile with follow status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [users] = await pool.query(`
      SELECT id, username, full_name, bio, avatar, location, website, 
      followers_count, following_count, posts_count, is_verified, is_creator, created_at
      FROM users
      WHERE id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if current user is following this user
    let isFollowing = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwacuhub-secret-key-2024');
          const [follow] = await pool.query(
            'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
            [decoded.id, userId]
          );
          isFollowing = follow.length > 0;
        } catch (e) {}
      }
    }
    
    res.json({ 
      success: true, 
      user: { ...users[0], is_following: isFollowing } 
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Follow/Unfollow a user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;
  const followingId = parseInt(userId);
  
  console.log(`Follow request: User ${followerId} wants to follow/unfollow user ${followingId}`);
  
  if (followerId === followingId) {
    return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
  }
  
  try {
    // Check if the target user exists
    const [targetUser] = await pool.query('SELECT id, username, followers_count FROM users WHERE id = ?', [followingId]);
    if (targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if already following
    const [existing] = await pool.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    if (existing.length > 0) {
      // UNFOLLOW
      await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
      await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [followingId]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [followerId]);
      
      // Get updated counts
      const [updatedFollower] = await pool.query('SELECT followers_count, following_count FROM users WHERE id = ?', [followerId]);
      const [updatedFollowing] = await pool.query('SELECT followers_count FROM users WHERE id = ?', [followingId]);
      
      console.log(`✅ User ${followerId} unfollowed ${followingId}`);
      
      res.json({ 
        success: true, 
        following: false,
        followerCount: updatedFollower[0].following_count,
        targetFollowersCount: updatedFollowing[0].followers_count
      });
    } else {
      // FOLLOW
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
      await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [followingId]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [followerId]);
      
      // Get user info for notification
      const [follower] = await pool.query('SELECT username, full_name FROM users WHERE id = ?', [followerId]);
      const [following] = await pool.query('SELECT username FROM users WHERE id = ?', [followingId]);
      
      // Get updated counts
      const [updatedFollower] = await pool.query('SELECT followers_count, following_count FROM users WHERE id = ?', [followerId]);
      const [updatedFollowing] = await pool.query('SELECT followers_count FROM users WHERE id = ?', [followingId]);
      
      // Create notification
      await pool.query(
        `INSERT INTO notifications (user_id, from_user_id, type, message) 
         VALUES (?, ?, ?, ?)`,
        [followingId, followerId, 'follow', `${follower[0].full_name || follower[0].username} started following you`]
      );
      
      console.log(`✅ User ${followerId} followed ${followingId}`);
      
      res.json({ 
        success: true, 
        following: true,
        followerCount: updatedFollower[0].following_count,
        targetFollowersCount: updatedFollowing[0].followers_count
      });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to process follow', error: error.message });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [followers] = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.avatar, u.is_verified,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, followers });
  } catch (error) {
    console.error('Fetch followers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch followers' });
  }
});

// Get user's following
router.get('/:userId/following', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [following] = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.avatar, u.is_verified,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, following });
  } catch (error) {
    console.error('Fetch following error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch following' });
  }
});

// Get suggested users (users not followed by current user)
router.get('/suggested', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.avatar, u.is_verified, u.followers_count,
      EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM users u
      WHERE u.id != ?
      ORDER BY u.followers_count DESC
      LIMIT 10
    `, [req.userId, req.userId]);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Suggested users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggested users' });
  }
});

module.exports = router;