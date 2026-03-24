const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { commentPost, getComments } = require("../controllers/commentController");

// Add comment
router.post("/", authMiddleware, commentPost);

// Get comments for a post
router.get("/:post_id", getComments);

module.exports = router;