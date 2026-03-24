const { createPost, getPosts } = require("../models/postModel");

// CREATE POST
exports.create = (req, res) => {
  const user_id = req.userId;
  const content = req.body.content;
  const media = req.file ? req.file.filename : null;

  createPost([user_id, content, media], (err, result) => {
    if (err) return res.status(500).json(err);

    res.status(201).json({ message: "Post created" });
  });
};

// GET ALL POSTS
exports.getAll = (req, res) => {
  getPosts((err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
};