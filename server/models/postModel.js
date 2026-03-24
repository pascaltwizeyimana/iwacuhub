const db = require("../config/db");

// Create post
exports.createPost = (data, callback) => {
  const query = "INSERT INTO posts (user_id, content, media) VALUES (?, ?, ?)";
  db.query(query, data, callback);
};

// Get all posts
exports.getPosts = (callback) => {
  const query = `
    SELECT posts.*, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;
  db.query(query, callback);
};