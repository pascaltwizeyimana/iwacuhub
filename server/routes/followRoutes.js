const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  follow,
  unfollow,
  getStats,
} = require("../controllers/followController");

router.post("/", authMiddleware, follow);
router.delete("/", authMiddleware, unfollow);
router.get("/:userId", getStats);

module.exports = router;