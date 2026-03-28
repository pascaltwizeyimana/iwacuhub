// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Admin login endpoint
router.post('/admin-login', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { email, password } = req.body;
        
        // Only allow the specific admin email
        if (email !== 'kobscall@gmail.com') {
            return res.status(401).json({ 
                message: 'Access denied. Admin credentials required.' 
            });
        }
        
        // Get user from database
        const [users] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Admin account not found' });
        }
        
        const user = users[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. This account does not have admin privileges.' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'iwacuhub_secret_key_2024',
            { expiresIn: '7d' }
        );
        
        // Store session in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await connection.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );
        
        // Update last login
        await connection.query(
            'UPDATE users SET last_active = NOW() WHERE id = ?',
            [user.id]
        );
        
        // Log the login
        await connection.query(
            'INSERT INTO system_logs (action, user_id, details, ip_address) VALUES (?, ?, ?, ?)',
            ['ADMIN_LOGIN', user.id, JSON.stringify({ email: user.email }), req.ip || req.headers['x-forwarded-for'] || 'unknown']
        );
        
        // Send response without password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_verified: user.is_verified,
                is_creator: user.is_creator,
                avatar: user.avatar
            },
            message: 'Welcome to Admin Dashboard!'
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    } finally {
        connection.release();
    }
});

// Regular login (keep your existing login if you have it)
router.post('/login', async (req, res) => {
    // Your existing login logic here
    // Or redirect to admin login
    res.status(400).json({ message: 'Please use admin-login endpoint' });
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwacuhub_secret_key_2024');
        
        const [users] = await db.query(
            'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        res.json({
            valid: true,
            user: users[0]
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            await db.query('DELETE FROM sessions WHERE token = ?', [token]);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});

module.exports = router;