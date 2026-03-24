const { addLike, removeLike, countLikes } = require("../models/likeModel");

// Add like
exports.likePost = (req, res) => {
  const user_id = req.userId;
  const post_id = req.body.post_id;

  addLike([user_id, post_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Post liked" });
  });
};

// Remove like
exports.unlikePost = (req, res) => {
  const user_id = req.userId;
  const post_id = req.body.post_id;

  removeLike(user_id, post_id, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Like removed" });
  });
};

// Get likes count
exports.getLikesCount = (req, res) => {
  const post_id = req.params.post_id;

  countLikes(post_id, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ likes: result[0].total });
  });
};