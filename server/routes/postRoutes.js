const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { create, getAll } = require("../controllers/postController");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Create post (with image/video)
router.post("/", authMiddleware, upload.single("media"), create);

// Get all posts
router.get("/", getAll);

module.exports = router;