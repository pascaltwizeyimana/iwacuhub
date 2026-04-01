const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models
const User = require('./models/userModel');
const Post = require('./models/postModel');
const Video = require('./models/videoModel');

// MongoDB Connection
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('\n✅ Connected to MongoDB Atlas');
  console.log(`📡 Database: ${mongoose.connection.name}`);
  console.log(`📍 Host: ${mongoose.connection.host}\n`);
})
.catch((err) => {
  console.error('\n❌ MongoDB connection error:');
  console.error(err.message);
  console.error('\n💡 Troubleshooting:');
  console.error('1. Check your MONGODB_URI in .env file');
  console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
  console.error('3. Check username and password are correct');
  console.error('4. Make sure the cluster is available (green status)');
  console.error('\n⚠️  Server will continue running but database features will not work.\n');
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'ok' : 'degraded',
    mongodb: isConnected ? 'connected' : 'disconnected',
    database: mongoose.connection.name || 'Not connected',
    timestamp: new Date().toISOString(),
    models: {
      user: !!User,
      post: !!Post,
      video: !!Video
    }
  });
});

// ============= SEED DATABASE ROUTE =============
app.post('/api/seed', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        error: 'MongoDB is not connected. Check your database connection.' 
      });
    }

    await User.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    
    const users = await User.insertMany([
      {
        username: "pac",
        email: "pac@gmail.com",
        password: await bcrypt.hash("Pac*123#", salt),
        full_name: "Pascal",
        bio: "Welcome to IwacuHub! 🇷🇼 Passionate about tech and community building.",
        role: "user",
        created_at: new Date()
      },
      {
        username: "john",
        email: "john@gmail.com",
        password: await bcrypt.hash("John*123#", salt),
        full_name: "John Doe",
        bio: "Tech enthusiast from Kigali 🇷🇼 Exploring the digital world.",
        role: "user",
        created_at: new Date()
      },
      {
        username: "alice",
        email: "alice@gmail.com",
        password: await bcrypt.hash("Alice*123#", salt),
        full_name: "Alice Smith",
        bio: "Travel lover exploring Rwanda 🌍 Sharing amazing experiences.",
        role: "user",
        created_at: new Date()
      },
      {
        username: "admin",
        email: "admin@iwacuhub.com",
        password: await bcrypt.hash("Admin*123#", salt),
        full_name: "Administrator",
        bio: "IwacuHub Platform Administrator",
        role: "admin",
        created_at: new Date()
      }
    ]);

    console.log(`✅ Seeded ${users.length} users to database`);
    
    res.json({
      success: true,
      message: `Created ${users.length} users successfully`,
      users: users.map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        full_name: u.full_name,
        role: u.role
      }))
    });

  } catch (err) {
    console.error('❌ Seed error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ============= AUTH ROUTES =============
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ============= USER ROUTES =============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ created_at: -1 })
      .limit(20);
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's posts
app.get('/api/users/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username full_name')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's videos
app.get('/api/users/:userId/videos', async (req, res) => {
  try {
    const videos = await Video.find({ user: req.params.userId })
      .populate('user', 'username full_name')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      videos: videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= POST ROUTES =============

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username full_name')
      .sort({ created_at: -1 })
      .limit(20);
    
    res.json({
      success: true,
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username full_name bio');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({
      success: true,
      post: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= VIDEO ROUTES =============

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const videos = await Video.find({ visibility: 'public' })
      .populate('user', 'username full_name')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Video.countDocuments({ visibility: 'public' });
    
    res.json({
      success: true,
      videos: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ADMIN ROUTES =============
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// ============= STATS ROUTES =============
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const videoCount = await Video.countDocuments();
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        posts: postCount,
        videos: videoCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SEARCH ROUTES =============

// Search users, posts, hashtags
app.get('/api/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        users: [],
        posts: [],
        hashtags: []
      });
    }
    
    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    
    let results = {
      users: [],
      posts: [],
      hashtags: []
    };
    
    // Search users
    if (!type || type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { full_name: searchRegex },
          { bio: searchRegex }
        ]
      })
      .select('-password')
      .limit(parseInt(limit))
      .sort({ followers_count: -1, created_at: -1 });
    }
    
    // Search posts
    if (!type || type === 'posts' || type === 'all') {
      results.posts = await Post.find({
        $or: [
          { content: searchRegex },
          { hashtags: searchRegex },
          { location: searchRegex }
        ]
      })
      .populate('user', 'username full_name')
      .limit(parseInt(limit))
      .sort({ created_at: -1, likes_count: -1 });
    }
    
    // Search hashtags from posts
    if (!type || type === 'hashtags' || type === 'all') {
      const hashtagResults = await Post.aggregate([
        { $unwind: '$hashtags' },
        { $match: { hashtags: searchRegex } },
        { $group: {
            _id: '$hashtags',
            count: { $sum: 1 },
            posts_count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) },
        { $project: {
            name: '$_id',
            posts_count: '$count',
            _id: 0
          }
        }
      ]);
      
      results.hashtags = hashtagResults;
    }
    
    res.json({
      success: true,
      ...results,
      query: searchTerm
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending hashtags
app.get('/api/hashtags/trending', async (req, res) => {
  try {
    const trending = await Post.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          posts_count: { $sum: 1 }
        }
      },
      { $sort: { posts_count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      hashtags: trending.map(tag => ({
        name: tag._id,
        posts_count: tag.posts_count
      }))
    });

  } catch (error) {
    console.error('Trending hashtags error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get posts by hashtag
app.get('/api/hashtags/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find({ hashtags: tag })
      .populate('user', 'username full_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments({ hashtags: tag });
    
    res.json({
      success: true,
      tag,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Hashtag posts error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/stats',
      'GET /api/users',
      'GET /api/users/:id',
      'GET /api/users/:userId/posts',
      'GET /api/users/:userId/videos',
      'GET /api/posts',
      'GET /api/posts/:id',
      'GET /api/videos',
      'GET /api/videos/trending',
      'GET /api/videos/:id',
      'POST /api/seed',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/admin-login',
      'GET /api/auth/verify',
      'GET /api/search',
      'GET /api/hashtags/trending',
      'GET /api/hashtags/:tag',
      'GET /api/admin/stats',
      'GET /api/admin/users',
      'GET /api/admin/posts'
    ]
  });
});

// ============= ERROR HANDLING MIDDLEWARE =============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============= START SERVER =============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Seed database: POST http://localhost:${PORT}/api/seed`);
  console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/auth/admin-login`);
  console.log(`\n📋 Available endpoints:\n`);
  console.log(`   HEALTH:`);
  console.log(`   GET  /api/health           - Server status`);
  console.log(`   GET  /api/stats            - Platform statistics`);
  console.log(`   POST /api/seed             - Seed database with users\n`);
  console.log(`   AUTH:`);
  console.log(`   POST /api/auth/register    - Register new user`);
  console.log(`   POST /api/auth/login       - User login`);
  console.log(`   POST /api/auth/admin-login - Admin login`);
  console.log(`   GET  /api/auth/verify      - Verify token\n`);
  console.log(`   USERS:`);
  console.log(`   GET  /api/users            - List all users`);
  console.log(`   GET  /api/users/:id        - Get user by ID`);
  console.log(`   GET  /api/users/:userId/posts - Get user's posts`);
  console.log(`   GET  /api/users/:userId/videos - Get user's videos\n`);
  console.log(`   POSTS:`);
  console.log(`   GET  /api/posts            - List all posts`);
  console.log(`   GET  /api/posts/:id        - Get post by ID\n`);
  console.log(`   VIDEOS:`);
  console.log(`   GET  /api/videos           - Video feed\n`);
  console.log(`   SEARCH:`);
  console.log(`   GET  /api/search           - Search users, posts, hashtags`);
  console.log(`   GET  /api/hashtags/trending - Trending hashtags`);
  console.log(`   GET  /api/hashtags/:tag    - Get posts by hashtag\n`);
  console.log(`   ADMIN:`);
  console.log(`   GET  /api/admin/stats      - Admin dashboard stats`);
  console.log(`   GET  /api/admin/users      - Manage users`);
  console.log(`   GET  /api/admin/posts      - Manage posts\n`);
});