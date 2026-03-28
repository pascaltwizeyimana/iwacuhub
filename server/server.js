const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models - ALL models should be imported at the top
const User = require('./models/userModel');
const Post = require('./models/postModel');
const Video = require('./models/videoModel'); // Now properly imported before use
// const Like = require('./models/likeModel');
// const Follow = require('./models/followModel');
// const Comment = require('./models/commentModel');
// const SystemLog = require('./models/SystemLog');

// MongoDB Connection
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
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
  console.error('4. Make sure the cluster is available (green status)\n');
  process.exit(1);
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: mongoose.connection.name || 'Not connected',
    timestamp: new Date().toISOString(),
    models: {
      user: !!User,
      post: !!Post,
      video: !!Video
    }
  });
});

// ============= USER ROUTES =============

// Create test user
app.post('/api/test/user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Test user already exists',
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          full_name: existingUser.full_name
        }
      });
    }

    const testUser = new User({
      username: 'testuser',
      email: 'test@iwacuhub.com',
      password: 'testpassword123',
      full_name: 'Test User',
      bio: 'This is a test user for IwacuHub'
    });
    
    await testUser.save();
    
    res.json({ 
      success: true, 
      message: '✅ Test user created successfully',
      user: {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        full_name: testUser.full_name
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message
    });
  }
});

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
      .populate('user', 'username full_name avatar')
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
      .populate('user', 'username full_name avatar')
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

// Create test post
app.post('/api/test/post', async (req, res) => {
  try {
    // Find a user to associate the post with
    let user = await User.findOne();
    
    if (!user) {
      // Create a test user if none exists
      user = new User({
        username: 'testuser',
        email: 'test@iwacuhub.com',
        password: 'testpassword123',
        full_name: 'Test User'
      });
      await user.save();
      console.log('📝 Created test user for post');
    }
    
    const testPost = new Post({
      user: user._id,
      content: 'Welcome to IwacuHub! 🇷🇼 This is a test post. Share your amazing moments with the community!',
      hashtags: ['iwacuhub', 'rwanda', 'test', 'welcome'],
      visibility: 'public',
      location: 'Kigali, Rwanda'
    });
    
    await testPost.save();
    
    // Update user's post count
    user.posts_count += 1;
    await user.save();
    
    res.json({
      success: true,
      message: '✅ Test post created successfully',
      post: {
        id: testPost._id,
        content: testPost.content,
        hashtags: testPost.hashtags,
        user: {
          username: user.username,
          full_name: user.full_name
        }
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username full_name avatar')
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
      .populate('user', 'username full_name avatar bio');
    
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

// Create a short video (TikTok/Reels style)
app.post('/api/videos', async (req, res) => {
  try {
    const { caption, videos, location, hashtags, visibility } = req.body;
    
    // Validate required fields
    if (!videos || videos.length === 0) {
      return res.status(400).json({ error: 'At least one video is required' });
    }
    
    // Get user (for now, use test user or first user)
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ error: 'No user found. Create a user first.' });
    }
    
    const video = new Video({
      user: user._id,
      caption: caption || '',
      videos: videos,
      location: location || 'Kigali, Rwanda',
      hashtags: hashtags || [],
      visibility: visibility || 'public'
    });
    
    await video.save();
    
    res.json({
      success: true,
      message: 'Video created successfully',
      video: video
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all videos (feed)
app.get('/api/videos', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const videos = await Video.find({ visibility: 'public' })
      .populate('user', 'username full_name avatar')
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

// Get trending videos (most viewed)
app.get('/api/videos/trending', async (req, res) => {
  try {
    const videos = await Video.find({ visibility: 'public' })
      .populate('user', 'username full_name avatar')
      .sort({ views: -1, created_at: -1 })
      .limit(20);
    
    res.json({
      success: true,
      videos: videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get video by ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username full_name avatar bio');
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Increment views (don't await to not block response)
    video.incrementViews().catch(err => console.error('Error incrementing views:', err));
    
    res.json({
      success: true,
      video: video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike video
app.post('/api/videos/:id/like', async (req, res) => {
  try {
    // Get user (for now, use test user or first user)
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ error: 'No user found' });
    }
    
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const updatedVideo = await video.toggleLike(user._id);
    
    res.json({
      success: true,
      liked: updatedVideo.likes.includes(user._id),
      likes_count: updatedVideo.likes_count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete video
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= STATS ROUTES =============

// Get platform statistics
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const videoCount = await Video.countDocuments();
    const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        posts: postCount,
        videos: videoCount,
        total_views: totalViews[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({ 
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
      'POST /api/test/user',
      'POST /api/test/post',
      'POST /api/videos',
      'POST /api/videos/:id/like',
      'DELETE /api/videos/:id'
    ]
  });
});

// ============= ERROR HANDLING MIDDLEWARE =============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============= START SERVER =============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`\n   HEALTH:`);
  console.log(`   GET  /api/health           - Server status`);
  console.log(`   GET  /api/stats            - Platform statistics`);
  console.log(`\n   USERS:`);
  console.log(`   GET  /api/users            - List all users`);
  console.log(`   GET  /api/users/:id        - Get user by ID`);
  console.log(`   GET  /api/users/:userId/posts - Get user's posts`);
  console.log(`   GET  /api/users/:userId/videos - Get user's videos`);
  console.log(`   POST /api/test/user        - Create test user`);
  console.log(`\n   POSTS:`);
  console.log(`   GET  /api/posts            - List all posts`);
  console.log(`   GET  /api/posts/:id        - Get post by ID`);
  console.log(`   POST /api/test/post        - Create test post`);
  console.log(`\n   VIDEOS (TikTok/Reels):`);
  console.log(`   GET  /api/videos           - Video feed`);
  console.log(`   GET  /api/videos/trending  - Trending videos`);
  console.log(`   GET  /api/videos/:id       - Get video by ID`);
  console.log(`   POST /api/videos           - Create video`);
  console.log(`   POST /api/videos/:id/like  - Like/unlike video`);
  console.log(`   DELETE /api/videos/:id     - Delete video\n`);
});