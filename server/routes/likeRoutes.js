const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { likePost, unlikePost, getLikesCount } = require("../controllers/likeController");

// Like a post
router.post("/", authMiddleware, likePost);

// Unlike a post
router.delete("/", authMiddleware, unlikePost);

// Get likes count
router.get("/:post_id", getLikesCount);

module.exports = router;