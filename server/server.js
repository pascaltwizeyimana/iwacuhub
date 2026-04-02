const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// ============= MIDDLEWARE =============
// server.js
app.use(cors({
  origin: true, // This allows any origin that sends the request
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= IMPORT MODELS =============
const User = require('./models/userModel');
const Post = require('./models/postModel');
const Video = require('./models/videoModel');

// ============= MONGODB CONNECTION =============
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log(`📡 Database: ${mongoose.connection.name}\n`);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'ok' : 'degraded',
    mongodb: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============= SEED DATABASE ROUTE (Fix: Includes Posts) =============
app.post('/api/seed', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, error: 'DB not connected' });
    }

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("Pac*123#", salt);

    // Create Users
    const users = await User.insertMany([
      {
        username: "pac",
        email: "pac@gmail.com",
        password,
        full_name: "Pascal Twizeyimana",
        bio: "Welcome to IwacuHub! 🇷🇼",
        role: "admin"
      },
      {
        username: "alice",
        email: "alice@gmail.com",
        password,
        full_name: "Alice Keza",
        bio: "Exploring Rwanda 🌍",
        role: "user"
      }
    ]);

    // Create Posts for searching
    await Post.insertMany([
      {
        user: users[0]._id,
        content: "Discover the beauty of Kigali City! #Rwanda #Kigali #IwacuHub",
        hashtags: ["Rwanda", "Kigali", "IwacuHub"],
        location: "Kigali, Rwanda",
        visibility: "public"
      },
      {
        user: users[1]._id,
        content: "The coffee in Musanze is amazing! ☕ #Coffee #Travel #Rwanda",
        hashtags: ["Coffee", "Travel", "Rwanda"],
        location: "Musanze, Rwanda",
        visibility: "public"
      }
    ]);

    res.json({ success: true, message: "Database seeded with Users and Posts!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= AUTH & ADMIN ROUTES =============
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ============= USER ROUTES =============
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SEARCH ROUTE (Fix: Actual Database Query) =============
app.get('/api/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({ success: true, users: [], posts: [], hashtags: [] });
    }
    
    // Clean search: remove # if typed, and create regex
    const searchTerm = q.trim().replace(/^#/, '');
    const searchRegex = new RegExp(searchTerm, 'i');
    
    let results = { users: [], posts: [], hashtags: [] };
    
    // 1. Search Users
    if (!type || type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { full_name: searchRegex },
          { bio: searchRegex }
        ]
      }).select('-password').limit(parseInt(limit));
    }
    
    // 2. Search Posts
    if (!type || type === 'posts' || type === 'all') {
      results.posts = await Post.find({
        $or: [
          { content: searchRegex },
          { hashtags: { $in: [searchRegex] } }, // Array searching
          { location: searchRegex }
        ]
      })
      .populate('user', 'username full_name')
      .sort({ created_at: -1 })
      .limit(parseInt(limit));
    }

    // 3. Aggregate Hashtags
    if (!type || type === 'hashtags' || type === 'all') {
      results.hashtags = await Post.aggregate([
        { $unwind: '$hashtags' },
        { $match: { hashtags: searchRegex } },
        { $group: { _id: '$hashtags', posts_count: { $sum: 1 } } },
        { $project: { name: '$_id', posts_count: 1, _id: 0 } },
        { $limit: 10 }
      ]);
    }
    
    console.log(`🔎 Search term: "${searchTerm}" | Users: ${results.users.length} | Posts: ${results.posts.length}`);
    
    res.json({ success: true, ...results, query: searchTerm });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= ADDITIONAL ROUTES =============
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username full_name').sort({ created_at: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hashtags/trending', async (req, res) => {
  try {
    const trending = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', posts_count: { $sum: 1 } } },
      { $sort: { posts_count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, hashtags: trending.map(t => ({ name: t._id, posts_count: t.posts_count })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= ERROR HANDLING =============
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ============= START SERVER =============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌱 POST http://localhost:${PORT}/api/seed to reset database`);
});