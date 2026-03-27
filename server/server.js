require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./config/db');

// Import routes - use your existing file names
const authRoutes = require('./routes/authRoutes');  // Changed from auth.js to authRoutes.js
const postRoutes = require('./routes/postRoutes');  // This matches postRoutes.js
const userRoutes = require('./routes/userRoutes');  // This matches userRoutes.js

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 IwacuHub API is working!',
    time: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    success: true,
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});


//Add Search Route to Server


const searchRoutes = require('./routes/search');
app.use('/api/search', searchRoutes);
// Start server
app.listen(PORT, async () => {
  const dbConnected = await testConnection();
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║     🚀 IwacuHub Server Running!                 ║
  ╠══════════════════════════════════════════════════╣
  ║  Port: ${PORT}                                      ║
  ║  URL: http://localhost:${PORT}                     ║
  ║  Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}   ║
  ╚══════════════════════════════════════════════════╝
  `);
});