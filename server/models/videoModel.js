// MySQL table creation for short videos (TikTok Reels)
// Run: mysql iwacuhub_db < this file

CREATE TABLE IF NOT EXISTS short_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  caption VARCHAR(500),
  videos JSON, -- array of video paths
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  location VARCHAR(100) DEFAULT 'Kigali, Rwanda', -- Rwanda only
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fast feeds
CREATE INDEX idx_short_videos_created ON short_videos(created_at);
CREATE INDEX idx_short_videos_user ON short_videos(user_id);

