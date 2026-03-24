const db = require('../config/db');

exports.createReel = async (req, res) => {
  try {
    const { caption } = req.body;
    const videos = req.files.map(f => f.path);
    const userId = req.user.id; // from authMiddleware

    const query = 'INSERT INTO short_videos (user_id, caption, videos, created_at) VALUES (?, ?, JSON_ARRAY(?), NOW())';
    await db.execute(query, [userId, caption, JSON.stringify(videos)]);
    
    res.status(201).json({ message: 'Reel created', videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReels = async (req, res) => {
  try {
    const query = 'SELECT * FROM short_videos ORDER BY created_at DESC LIMIT 50';
    const [reels] = await db.execute(query);
    res.json(reels);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getReel = async (req, res) => {
  try {
    const [reel] = await db.execute('SELECT * FROM short_videos WHERE id = ?', [req.params.id]);
    res.json(reel[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    await db.execute('DELETE FROM short_videos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Reel deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

