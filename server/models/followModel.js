const db = require("../config/db");

// Follow user
exports.followUser = (data, callback) => {
  const query = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";
  db.query(query, data, callback);
};

// Unfollow
exports.unfollowUser = (data, callback) => {
  const query = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";
  db.query(query, data, callback);
};

// Count followers
exports.getFollowersCount = (userId, callback) => {
  const query = "SELECT COUNT(*) as count FROM follows WHERE following_id = ?";
  db.query(query, [userId], callback);
};

// Count following
exports.getFollowingCount = (userId, callback) => {
  const query = "SELECT COUNT(*) as count FROM follows WHERE follower_id = ?";
  db.query(query, [userId], callback);
};