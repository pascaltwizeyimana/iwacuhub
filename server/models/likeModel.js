const db = require("../config/db");

// Add like
exports.addLike = (data, callback) => {
  const query = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
  db.query(query, data, callback);
};

// Remove like
exports.removeLike = (user_id, post_id, callback) => {
  const query = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
  db.query(query, [user_id, post_id], callback);
};

// Count likes for a post
exports.countLikes = (post_id, callback) => {
  const query = "SELECT COUNT(*) as total FROM likes WHERE post_id = ?";
  db.query(query, [post_id], callback);
};