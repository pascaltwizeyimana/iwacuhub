// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = async (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "iwacuhub_secret_key_2024");
        
        // Check if session exists
        const [sessions] = await db.query(
            "SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()",
            [token]
        );
        
        if (sessions.length === 0) {
            return res.status(401).json({ message: "Session expired" });
        }
        
        // Get user data
        const [users] = await db.query(
            "SELECT id, username, email, full_name, role, is_verified, is_creator FROM users WHERE id = ?",
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }
        
        req.user = users[0];
        req.userId = users[0].id;
        req.token = token;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        console.error("Auth error:", err);
        return res.status(500).json({ message: "Authentication error" });
    }
};

const requireAdmin = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

module.exports = { authMiddleware, requireAdmin };