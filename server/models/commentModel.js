const db = require("../config/db");

// Add comment
exports.addComment = (data, callback) => {
  const query = "INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)";
  db.query(query, data, callback);
};

// Get comments for a post
exports.getComments = (post_id, callback) => {
  const query = `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id
    WHERE post_id = ?
    ORDER BY comments.created_at ASC
  `;
  db.query(query, [post_id], callback);
};