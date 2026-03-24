const { addComment, getComments } = require("../models/commentModel");

// Add comment
exports.commentPost = (req, res) => {
  const user_id = req.userId;
  const { post_id, comment } = req.body;

  addComment([user_id, post_id, comment], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Comment added" });
  });
};

// Get comments
exports.getComments = (req, res) => {
  const post_id = req.params.post_id;

  getComments(post_id, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};