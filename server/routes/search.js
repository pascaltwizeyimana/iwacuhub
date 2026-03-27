const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// Search endpoint - searches users, posts, and hashtags
router.get('/', async (req, res) => {
  const { q, type = 'all' } = req.query;
  
  console.log('Search request:', { q, type });
  
  if (!q || q.trim() === '') {
    return res.json({ 
      success: true, 
      users: [], 
      posts: [], 
      hashtags: [] 
    });
  }
  
  const searchTerm = `%${q.trim()}%`;
  let results = { users: [], posts: [], hashtags: [] };
  
  try {
    // Search users (by username or full name)
    if (type === 'all' || type === 'users') {
      const [users] = await pool.query(`
        SELECT 
          id, 
          username, 
          full_name, 
          avatar, 
          bio, 
          followers_count, 
          is_verified,
          created_at
        FROM users
        WHERE username LIKE ? OR full_name LIKE ?
        ORDER BY followers_count DESC
        LIMIT 20
      `, [searchTerm, searchTerm]);
      
      results.users = users.map(user => ({
        ...user,
        avatar: user.avatar || null,
        full_name: user.full_name || user.username
      }));
    }
    
    // Search posts (by caption or hashtags)
    if (type === 'all' || type === 'posts') {
      const [posts] = await pool.query(`
        SELECT 
          p.*, 
          u.username, 
          u.full_name, 
          u.avatar, 
          u.is_verified,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE (p.caption LIKE ? OR p.hashtags LIKE ?) AND p.is_active = TRUE
        ORDER BY p.created_at DESC
        LIMIT 20
      `, [searchTerm, searchTerm]);
      
      results.posts = posts;
    }
    
    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      const [hashtags] = await pool.query(`
        SELECT name, posts_count
        FROM hashtags
        WHERE name LIKE ?
        ORDER BY posts_count DESC
        LIMIT 20
      `, [searchTerm]);
      
      results.hashtags = hashtags;
    }
    
    console.log('Search results:', {
      users: results.users.length,
      posts: results.posts.length,
      hashtags: results.hashtags.length
    });
    
    res.json({ success: true, ...results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed',
      error: error.message 
    });
  }
});

// Get trending hashtags
router.get('/trending', async (req, res) => {
  try {
    const [hashtags] = await pool.query(`
      SELECT name, posts_count
      FROM hashtags
      ORDER BY posts_count DESC
      LIMIT 10
    `);
    
    res.json({ success: true, hashtags });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch trending hashtags' 
    });
  }
});

// Get recent searches (from local storage on frontend, this endpoint can save searches)
router.post('/recent', async (req, res) => {
  const { query, userId } = req.body;
  
  if (!query || !userId) {
    return res.json({ success: true });
  }
  
  try {
    // Optional: Save search to database for analytics
    await pool.query(
      'INSERT INTO search_history (user_id, query) VALUES (?, ?) ON DUPLICATE KEY UPDATE searched_at = NOW()',
      [userId, query]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Save search error:', error);
    res.json({ success: true }); // Don't fail if save fails
  }
});

module.exports = router;