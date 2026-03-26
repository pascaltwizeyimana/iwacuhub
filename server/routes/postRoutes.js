const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

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

// Create post with image/video upload
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  const { caption, location, hashtags, media_type = 'image' } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!mediaUrl) {
    return res.status(400).json({ success: false, message: 'Media is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, caption, media_url, media_type, location, hashtags) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, caption, mediaUrl, media_type, location, hashtags]
    );
    
    // Update user's posts count
    await pool.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?', [req.userId]);
    
    // Process hashtags
    if (hashtags) {
      const hashtagList = hashtags.match(/#[\w\u0600-\u06FF]+/g) || [];
      for (const tag of hashtagList) {
        const tagName = tag.substring(1).toLowerCase();
        let [hashtag] = await pool.query('SELECT id FROM hashtags WHERE name = ?', [tagName]);
        
        if (hashtag.length === 0) {
          const [newTag] = await pool.query('INSERT INTO hashtags (name) VALUES (?)', [tagName]);
          hashtag = [{ id: newTag.insertId }];
        }
        
        await pool.query('INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)', [result.insertId, hashtag[0].id]);
        await pool.query('UPDATE hashtags SET posts_count = posts_count + 1 WHERE id = ?', [hashtag[0].id]);
      }
    }
    
    // Get the created post with user info
    const [newPost] = await pool.query(`
      SELECT p.*, u.username, u.full_name, u.avatar, u.is_verified 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [result.insertId]);
    
    res.json({ success: true, post: newPost[0] });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// Get feed posts
router.get('/feed', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.username, u.full_name, u.avatar, u.is_verified,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.userId, parseInt(limit), parseInt(offset)]);
    
    // Format posts
    const formattedPosts = posts.map(post => ({
      ...post,
      is_liked: post.is_liked === 1,
      likes_count: parseInt(post.likes_count),
      comments_count: parseInt(post.comments_count),
      shares_count: parseInt(post.shares_count),
      views_count: parseInt(post.views_count)
    }));
    
    res.json({ 
      success: true, 
      posts: formattedPosts, 
      hasMore: posts.length === parseInt(limit) 
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load feed' });
  }
});

// Like a post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  
  try {
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [req.userId, postId]
    );
    
    if (existing.length > 0) {
      // Unlike
      await pool.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.userId, postId]);
      await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.userId, postId]);
      await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      
      // Create notification
      const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
      if (post[0].user_id !== req.userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id) VALUES (?, ?, ?, ?)',
          [post[0].user_id, req.userId, 'like', postId]
        );
      }
      
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, message: 'Failed to process like' });
  }
});

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  
  try {
    const [comments] = await pool.query(`
      SELECT c.*, u.username, u.full_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, [postId]);
    
    // Get replies for each comment
    for (const comment of comments) {
      const [replies] = await pool.query(`
        SELECT r.*, u.username, u.full_name, u.avatar
        FROM comments r
        JOIN users u ON r.user_id = u.id
        WHERE r.parent_id = ?
        ORDER BY r.created_at ASC
      `, [comment.id]);
      comment.replies = replies;
    }
    
    res.json({ success: true, comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Add comment to post
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { comment, parentId } = req.body;
  
  if (!comment) {
    return res.status(400).json({ success: false, message: 'Comment is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)',
      [postId, req.userId, comment, parentId || null]
    );
    
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);
    
    // Create notification for post owner or parent comment owner
    if (parentId) {
      const [parentComment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [parentId]);
      if (parentComment[0].user_id !== req.userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [parentComment[0].user_id, req.userId, 'comment', postId, result.insertId]
        );
      }
    } else {
      const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
      if (post[0].user_id !== req.userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [post[0].user_id, req.userId, 'comment', postId, result.insertId]
        );
      }
    }
    
    const [newComment] = await pool.query(`
      SELECT c.*, u.username, u.full_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);
    
    res.json({ success: true, comment: newComment[0] });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// Get trending hashtags
router.get('/hashtags/trending', async (req, res) => {
  try {
    const [hashtags] = await pool.query(
      'SELECT name, posts_count FROM hashtags ORDER BY posts_count DESC LIMIT 10'
    );
    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hashtags' });
  }
});

module.exports = router;