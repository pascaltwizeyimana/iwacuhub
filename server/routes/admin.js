const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Video = require('../models/videoModel');

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwacuhub_super_secret_key_2024');
        
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Dashboard Statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalVideos = await Video.countDocuments();
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newUsersToday = await User.countDocuments({
            created_at: { $gte: today }
        });
        
        const newPostsToday = await Post.countDocuments({
            created_at: { $gte: today }
        });
        
        // Get verified users (if you have is_verified field)
        const verifiedUsers = await User.countDocuments({ is_verified: true });
        
        // Get creator users (if you have is_creator field)
        const creatorUsers = await User.countDocuments({ is_creator: true });
        
        // Get total likes from posts
        const posts = await Post.find();
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    creators: creatorUsers,
                    newToday: newUsersToday
                },
                posts: {
                    total: totalPosts,
                    totalLikes: totalLikes,
                    totalComments: totalComments,
                    newToday: newPostsToday
                },
                videos: {
                    total: totalVideos
                }
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { full_name: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single user
router.get('/users/:userId', verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user
router.put('/users/:userId', verifyAdminToken, async (req, res) => {
    try {
        const { full_name, bio, is_verified, is_creator, role } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { full_name, bio, is_verified, is_creator, role },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete('/users/:userId', verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete user's posts
        await Post.deleteMany({ user: req.params.userId });
        
        // Delete user's videos
        await Video.deleteMany({ user: req.params.userId });
        
        res.json({ 
            success: true, 
            message: 'User and all associated content deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all posts
router.get('/posts', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search } = req.query;

        let query = {};
        if (search) {
            query = {
                content: { $regex: search, $options: 'i' }
            };
        }

        const posts = await Post.find(query)
            .populate('user', 'username full_name email avatar')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(query);

        res.json({
            success: true,
            posts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single post
router.get('/posts/:postId', verifyAdminToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('user', 'username full_name email avatar');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete post
router.delete('/posts/:postId', verifyAdminToken, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get comments (if you have a Comment model)
router.get('/comments', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // If you have a Comment model, import it at the top
        const Comment = require('../models/commentModel');
        
        const comments = await Comment.find()
            .populate('user', 'username full_name avatar')
            .populate('post', 'content')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Comment.countDocuments();
        
        res.json({
            success: true,
            comments,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete comment
router.delete('/comments/:commentId', verifyAdminToken, async (req, res) => {
    try {
        const Comment = require('../models/commentModel');
        const comment = await Comment.findByIdAndDelete(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Analytics
router.get('/analytics', verifyAdminToken, async (req, res) => {
    try {
        // Top creators (users with most posts)
        const topCreators = await Post.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalPosts: { $sum: 1 },
                    totalLikes: { $sum: '$likes_count' }
                }
            },
            { $sort: { totalLikes: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    username: '$user.username',
                    full_name: '$user.full_name',
                    totalPosts: 1,
                    totalLikes: 1
                }
            }
        ]);
        
        // User growth over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const userGrowth = await User.aggregate([
            {
                $match: {
                    created_at: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        day: { $dayOfMonth: '$created_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        // Posts per day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailyPosts = await Post.aggregate([
            {
                $match: {
                    created_at: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        day: { $dayOfMonth: '$created_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({
            success: true,
            analytics: {
                topCreators,
                userGrowth,
                dailyPosts
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: error.message });
    }
});

// System logs (optional - if you have logs collection)
router.get('/logs', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        // If you have a SystemLog model
        const SystemLog = require('../models/SystemLog');
        
        const logs = await SystemLog.find()
            .populate('user', 'username full_name')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await SystemLog.countDocuments();
        
        res.json({
            success: true,
            logs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        // Return empty logs if model doesn't exist
        res.json({
            success: true,
            logs: [],
            total: 0,
            totalPages: 0,
            currentPage: 1
        });
    }
});

module.exports = router;