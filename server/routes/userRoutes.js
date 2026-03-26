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

// Get user profile
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
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
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
    
    res.json({ success: true, user: { ...users[0], is_following: isFollowing } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Follow/Unfollow a user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (parseInt(userId) === req.userId) {
    return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
  }
  
  try {
    const [existing] = await pool.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.userId, userId]
    );
    
    if (existing.length > 0) {
      // Unfollow
      await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [req.userId]);
      res.json({ success: true, following: false });
    } else {
      // Follow
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.userId, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [req.userId]);
      
      // Create notification
      const [user] = await pool.query('SELECT username FROM users WHERE id = ?', [req.userId]);
      await pool.query(
        'INSERT INTO notifications (user_id, from_user_id, type, message) VALUES (?, ?, ?, ?)',
        [userId, req.userId, 'follow', `${user[0].username} started following you`]
      );
      
      res.json({ success: true, following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to process follow' });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [followers] = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.avatar, u.is_verified
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, followers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch followers' });
  }
});



// Follow/Unfollow a user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (parseInt(userId) === req.userId) {
    return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
  }
  
  try {
    // Check if already following
    const [existing] = await pool.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.userId, userId]
    );
    
    if (existing.length > 0) {
      // Unfollow
      await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [req.userId]);
      
      console.log(`User ${req.userId} unfollowed ${userId}`);
      res.json({ success: true, following: false });
    } else {
      // Follow
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.userId, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [req.userId]);
      
      // Create notification
      const [user] = await pool.query('SELECT username FROM users WHERE id = ?', [req.userId]);
      await pool.query(
        'INSERT INTO notifications (user_id, from_user_id, type, message) VALUES (?, ?, ?, ?)',
        [userId, req.userId, 'follow', `${user[0].username} started following you`]
      );
      
      console.log(`User ${req.userId} followed ${userId}`);
      res.json({ success: true, following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to process follow' });
  }
});

// Get user's following
router.get('/:userId/following', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [following] = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.avatar, u.is_verified
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, following });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch following' });
  }
});

module.exports = router;