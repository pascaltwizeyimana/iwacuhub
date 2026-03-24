require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const videoRoutes = require('./routes/videoRoutes'); // new
const chatRoutes = require('./routes/messageRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.io with enhanced chat rooms
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Enhanced chat with rooms (Messenger-style)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (room) => socket.join(room));
  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/videos', authMiddleware, videoRoutes); // new
app.use('/api/chat', chatRoutes);

// Health
app.get('/', (req, res) => res.send('IwacuHub Rwanda Super App on port 4000!'));

server.listen(PORT, () => {
console.log(`🚀 IwacuHub Server running on port ${PORT}`);
  console.log('MySQL Connected via db.js');
});

