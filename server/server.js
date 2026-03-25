require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iwacuhub_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'iwacuhub-secret-key-2024';

// Middleware to verify JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT id, username, email, full_name, avatar, is_verified FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// ============= AUTH ROUTES =============
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  try {
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || username]
    );
    
    // Generate token
    const token = jwt.sign({ id: result.insertId, username, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      user: { id: result.insertId, username, email, full_name: full_name || username },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last active
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]);
    
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        bio: user.bio,
        is_verified: user.is_verified,
        followers_count: user.followers_count,
        following_count: user.following_count
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ============= POSTS ROUTES =============
app.post('/api/posts', authenticateToken, upload.single('media'), async (req, res) => {
  const { caption, location, hashtags } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const mediaType = req.file?.mimetype?.startsWith('video') ? 'video' : 'image';
  
  if (!mediaUrl) {
    return res.status(400).json({ success: false, message: 'Media is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, caption, media_url, media_type, location) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, caption, mediaUrl, mediaType, location]
    );
    
    // Update user posts count
    await pool.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?', [req.user.id]);
    
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

app.get('/api/posts/feed', authenticateToken, async (req, res) => {
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
    `, [req.user.id, parseInt(limit), parseInt(offset)]);
    
    res.json({ success: true, posts, hasMore: posts.length === parseInt(limit) });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load feed' });
  }
});

// ============= LIKES ROUTES =============
app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  
  try {
    const [existing] = await pool.query('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
    
    if (existing.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
      await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId]);
      res.json({ success: true, liked: false });
    } else {
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId]);
      await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      
      // Create notification
      const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
      if (post[0].user_id !== req.user.id) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id) VALUES (?, ?, ?, ?)',
          [post[0].user_id, req.user.id, 'like', postId]
        );
        
        // Emit real-time notification
        io.to(`user_${post[0].user_id}`).emit('notification', {
          type: 'like',
          from_user: req.user.username,
          post_id: postId
        });
      }
      
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, message: 'Failed to process like' });
  }
});

// ============= COMMENTS ROUTES with nested replies =============
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { comment, parentId } = req.body;
  
  if (!comment) {
    return res.status(400).json({ success: false, message: 'Comment is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)',
      [postId, req.user.id, comment, parentId || null]
    );
    
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);
    
    // Create notification for parent comment or post owner
    if (parentId) {
      const [parentComment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [parentId]);
      if (parentComment[0].user_id !== req.user.id) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [parentComment[0].user_id, req.user.id, 'comment', postId, result.insertId]
        );
      }
    } else {
      const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
      if (post[0].user_id !== req.user.id) {
        await pool.query(
          'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [post[0].user_id, req.user.id, 'comment', postId, result.insertId]
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

app.get('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  
  try {
    const [comments] = await pool.query(`
      SELECT c.*, u.username, u.full_name, u.avatar,
      EXISTS(SELECT 1 FROM likes WHERE comment_id = c.id AND user_id = ?) as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, [req.user?.id || null, postId]);
    
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

// ============= FOLLOW ROUTES =============
app.post('/api/users/:userId/follow', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
  }
  
  try {
    const [existing] = await pool.query('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, userId]);
    
    if (existing.length > 0) {
      await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [req.user.id]);
      res.json({ success: true, following: false });
    } else {
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, userId]);
      await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [userId]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [req.user.id]);
      
      // Create notification
      await pool.query(
        'INSERT INTO notifications (user_id, from_user_id, type) VALUES (?, ?, ?)',
        [userId, req.user.id, 'follow']
      );
      
      io.to(`user_${userId}`).emit('notification', {
        type: 'follow',
        from_user: req.user.username
      });
      
      res.json({ success: true, following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to process follow' });
  }
});

// ============= HASHTAG FEEDS =============
app.get('/api/hashtags/:tag', async (req, res) => {
  const { tag } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.username, u.full_name, u.avatar, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN post_hashtags ph ON p.id = ph.post_id
      JOIN hashtags h ON ph.hashtag_id = h.id
      WHERE h.name = ? AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [tag.toLowerCase(), parseInt(limit), parseInt(offset)]);
    
    const [hashtag] = await pool.query('SELECT posts_count FROM hashtags WHERE name = ?', [tag.toLowerCase()]);
    
    res.json({ 
      success: true, 
      posts, 
      hashtag: hashtag[0],
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Hashtag feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load hashtag feed' });
  }
});

// ============= SEARCH =============
app.get('/api/search', async (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q) {
    return res.json({ success: true, users: [], posts: [], hashtags: [] });
  }
  
  try {
    const searchTerm = `%${q}%`;
    let results = { users: [], posts: [], hashtags: [] };
    
    if (type === 'all' || type === 'users') {
      const [users] = await pool.query(`
        SELECT id, username, full_name, avatar, bio, followers_count, is_verified
        FROM users
        WHERE username LIKE ? OR full_name LIKE ?
        LIMIT 10
      `, [searchTerm, searchTerm]);
      results.users = users;
    }
    
    if (type === 'all' || type === 'posts') {
      const [posts] = await pool.query(`
        SELECT p.*, u.username, u.full_name, u.avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.caption LIKE ? AND p.is_active = TRUE
        ORDER BY p.created_at DESC
        LIMIT 10
      `, [searchTerm]);
      results.posts = posts;
    }
    
    if (type === 'all' || type === 'hashtags') {
      const [hashtags] = await pool.query(`
        SELECT name, posts_count
        FROM hashtags
        WHERE name LIKE ?
        ORDER BY posts_count DESC
        LIMIT 10
      `, [searchTerm]);
      results.hashtags = hashtags;
    }
    
    res.json({ success: true, ...results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ============= NOTIFICATIONS =============
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(`
      SELECT n.*, u.username, u.full_name, u.avatar,
      p.media_url as post_media,
      c.comment as comment_text
      FROM notifications n
      JOIN users u ON n.from_user_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      LEFT JOIN comments c ON n.comment_id = c.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
});

// ============= STORIES (24-hour disappearing) =============
app.post('/api/stories', authenticateToken, upload.single('media'), async (req, res) => {
  const { caption } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const mediaType = req.file?.mimetype?.startsWith('video') ? 'video' : 'image';
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  if (!mediaUrl) {
    return res.status(400).json({ success: false, message: 'Media is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO stories (user_id, media_url, media_type, caption, expires_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, mediaUrl, mediaType, caption, expiresAt]
    );
    
    res.json({ success: true, story: { id: result.insertId, media_url: mediaUrl, expires_at: expiresAt } });
  } catch (error) {
    console.error('Story creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create story' });
  }
});

app.get('/api/stories', authenticateToken, async (req, res) => {
  try {
    // Delete expired stories
    await pool.query('DELETE FROM stories WHERE expires_at < NOW()');
    
    const [stories] = await pool.query(`
      SELECT s.*, u.username, u.full_name, u.avatar, u.is_verified,
      EXISTS(SELECT 1 FROM story_views WHERE story_id = s.id AND user_id = ?) as has_viewed
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `, [req.user.id]);
    
    // Group by user
    const groupedStories = stories.reduce((acc, story) => {
      if (!acc[story.user_id]) {
        acc[story.user_id] = {
          user: {
            id: story.user_id,
            username: story.username,
            full_name: story.full_name,
            avatar: story.avatar,
            is_verified: story.is_verified
          },
          stories: []
        };
      }
      acc[story.user_id].stories.push(story);
      return acc;
    }, {});
    
    res.json({ success: true, stories: Object.values(groupedStories) });
  } catch (error) {
    console.error('Stories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stories' });
  }
});

app.post('/api/stories/:storyId/view', authenticateToken, async (req, res) => {
  const { storyId } = req.params;
  
  try {
    const [existing] = await pool.query('SELECT id FROM story_views WHERE story_id = ? AND user_id = ?', [storyId, req.user.id]);
    
    if (existing.length === 0) {
      await pool.query('INSERT INTO story_views (story_id, user_id) VALUES (?, ?)', [storyId, req.user.id]);
      await pool.query('UPDATE stories SET views_count = views_count + 1 WHERE id = ?', [storyId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Story view error:', error);
    res.status(500).json({ success: false, message: 'Failed to view story' });
  }
});

// ============= CHAT & WEBSOCKET =============
// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('user_online', (userId) => {
    socket.join(`user_${userId}`);
    socket.userId = userId;
    
    // Broadcast to friends that user is online
    socket.broadcast.emit('user_status', { userId, status: 'online' });
  });
  
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });
  
  socket.on('send_message', async (data) => {
    const { chatId, message, receiverId } = data;
    
    try {
      // Save message to database
      const [result] = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)',
        [chatId, socket.userId, message]
      );
      
      // Update chat's last message
      await pool.query('UPDATE chats SET last_message = ?, last_message_time = NOW() WHERE id = ?', [message, chatId]);
      
      const [newMessage] = await pool.query(`
        SELECT m.*, u.username, u.full_name, u.avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `, [result.insertId]);
      
      // Emit to chat room
      io.to(`chat_${chatId}`).emit('new_message', newMessage[0]);
      
      // Create notification for offline user
      const [chat] = await pool.query('SELECT user1_id, user2_id FROM chats WHERE id = ?', [chatId]);
      const receiverIdFromChat = chat[0].user1_id === socket.userId ? chat[0].user2_id : chat[0].user1_id;
      
      await pool.query(
        'INSERT INTO notifications (user_id, from_user_id, type, message) VALUES (?, ?, ?, ?)',
        [receiverIdFromChat, socket.userId, 'message', message]
      );
      
      io.to(`user_${receiverIdFromChat}`).emit('notification', {
        type: 'message',
        from_user: data.username,
        message: message
      });
      
    } catch (error) {
      console.error('Message error:', error);
    }
  });
  
  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      socket.broadcast.emit('user_status', { userId: socket.userId, status: 'offline' });
    }
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/api/chats', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  
  try {
    // Check if chat exists
    let [chat] = await pool.query(
      'SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [req.user.id, userId, userId, req.user.id]
    );
    
    if (chat.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)',
        [req.user.id, userId]
      );
      chat = [{ id: result.insertId }];
    }
    
    res.json({ success: true, chatId: chat[0].id });
  } catch (error) {
    console.error('Chat creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create chat' });
  }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const [chats] = await pool.query(`
      SELECT c.*, 
      u.id as other_user_id, u.username, u.full_name, u.avatar, u.is_verified, u.last_active,
      (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND is_read = FALSE AND sender_id != ?) as unread_count
      FROM chats c
      JOIN users u ON (u.id = c.user1_id OR u.id = c.user2_id) AND u.id != ?
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.last_message_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Fetch chats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
});

app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  const { chatId } = req.params;
  
  try {
    const [messages] = await pool.query(`
      SELECT m.*, u.username, u.full_name, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC
      LIMIT 100
    `, [chatId]);
    
    // Mark messages as read
    await pool.query('UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE chat_id = ? AND sender_id != ?', [chatId, req.user.id]);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// ============= USER PROFILE =============
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [users] = await pool.query(`
      SELECT id, username, full_name, email, bio, avatar, location, website, 
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

app.get('/api/users/:userId/posts', async (req, res) => {
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

// ============= ANALYTICS =============
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const [userStats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = ?) as total_posts,
        (SELECT SUM(likes_count) FROM posts WHERE user_id = ?) as total_likes,
        (SELECT SUM(comments_count) FROM posts WHERE user_id = ?) as total_comments,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
    
    const [topPosts] = await pool.query(`
      SELECT id, caption, media_url, likes_count, comments_count, shares_count, views_count, created_at
      FROM posts
      WHERE user_id = ?
      ORDER BY likes_count DESC
      LIMIT 5
    `, [req.user.id]);
    
    res.json({ success: true, stats: userStats[0], topPosts });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// ============= START SERVER =============
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║     🚀 IwacuHub Server Running!                 ║
  ╠══════════════════════════════════════════════════╣
  ║  Port: ${PORT}                                      ║
  ║  URL: http://localhost:${PORT}                     ║
  ║  WebSocket: ✅ Ready for real-time chat          ║
  ║  Database: ✅ Connected                          ║
  ╚══════════════════════════════════════════════════╝
  `);
});