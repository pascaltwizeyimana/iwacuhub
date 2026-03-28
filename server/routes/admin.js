// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwacuhub_secret_key_2024');
        
        const [users] = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Dashboard Statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
    try {
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verifiedUsers,
                SUM(CASE WHEN is_creator = 1 THEN 1 ELSE 0 END) as creatorUsers,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday
            FROM users
        `);

        const [postStats] = await pool.query(`
            SELECT 
                COUNT(*) as totalPosts,
                SUM(likes_count) as totalLikes,
                SUM(comments_count) as totalComments
            FROM posts
            WHERE is_active = 1
        `);

        res.json({
            users: userStats[0],
            posts: postStats[0]
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
        const offset = (page - 1) * limit;
        const { search } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const [users] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                u.full_name as name,
                u.bio,
                u.avatar,
                u.is_verified,
                u.is_creator,
                u.role,
                u.followers_count,
                u.following_count,
                u.posts_count,
                u.created_at as createdAt
            FROM users u
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        const [countResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM users u
            ${whereClause}
        `, queryParams);

        res.json({
            users,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all posts
router.get('/posts', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { search } = req.query;

        let whereConditions = ['p.is_active = 1'];
        let queryParams = [];

        if (search) {
            whereConditions.push('(p.caption LIKE ? OR p.hashtags LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');
        
        const [posts] = await pool.query(`
            SELECT 
                p.id,
                p.caption,
                p.media_url,
                p.media_type,
                p.likes_count,
                p.comments_count,
                p.created_at as createdAt,
                u.username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        const [countResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM posts p
            ${whereClause}
        `, queryParams);

        res.json({
            posts,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete post
router.delete('/posts/:postId', verifyAdminToken, async (req, res) => {
    try {
        const { postId } = req.params;
        await pool.query('UPDATE posts SET is_active = 0 WHERE id = ?', [postId]);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get comments
router.get('/comments', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const [comments] = await pool.query(`
            SELECT 
                c.id,
                c.comment,
                c.created_at as createdAt,
                u.username,
                p.caption as post_caption
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            WHERE c.is_active = 1
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [countResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM comments c
            WHERE is_active = 1
        `);

        res.json({
            comments,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit),
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
        const { commentId } = req.params;
        await pool.query('UPDATE comments SET is_active = 0 WHERE id = ?', [commentId]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get logs
router.get('/logs', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const [logs] = await pool.query(`
            SELECT 
                l.id,
                l.action,
                l.user_id,
                l.details,
                l.ip_address,
                l.created_at as timestamp,
                u.username,
                u.full_name
            FROM system_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [countResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM system_logs
        `);

        res.json({
            logs,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Analytics
router.get('/analytics', verifyAdminToken, async (req, res) => {
    try {
        const [topCreators] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                u.full_name,
                COUNT(p.id) as total_posts,
                SUM(p.likes_count) as total_likes
            FROM users u
            JOIN posts p ON u.id = p.user_id
            WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY u.id
            ORDER BY total_likes DESC
            LIMIT 10
        `);

        res.json({ topCreators });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;