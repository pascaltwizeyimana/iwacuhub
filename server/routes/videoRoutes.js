const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../middleware/upload'); // assume exists or multer config

// TikTok-style short videos (Reels)
router.post('/', upload.array('videos', 5), videoController.createReel);
router.get('/', videoController.getReels);
router.get('/:id', videoController.getReel);
router.delete('/:id', videoController.deleteReel);

module.exports = router;

