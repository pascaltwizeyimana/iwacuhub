const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// Middleware to verify token
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
    
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { full_name, bio, location, website } = req.body;
  
  try {
    await pool.query(
      'UPDATE users SET full_name = ?, bio = ?, location = ?, website = ? WHERE id = ?',
      [full_name, bio, location, website, req.userId]
    );
    
    const [updatedUser] = await pool.query(
      'SELECT id, username, full_name, bio, avatar, location, website, is_verified FROM users WHERE id = ?',
      [req.userId]
    );
    
    res.json({ success: true, user: updatedUser[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Follow a user
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
      await pool.query(
        'INSERT INTO notifications (user_id, from_user_id, type) VALUES (?, ?, ?)',
        [userId, req.userId, 'follow']
      );
      
      res.json({ success: true, following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to process follow' });
  }
});

// Get user's posts
router.get('/:userId/posts', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.username, u.full_name, u.avatar, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('User posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

module.exports = router;