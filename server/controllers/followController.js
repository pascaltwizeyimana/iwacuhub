const {
  followUser,
  unfollowUser,
  getFollowersCount,
  getFollowingCount,
} = require("../models/followModel");

// FOLLOW
exports.follow = (req, res) => {
  const follower_id = req.userId;
  const { following_id } = req.body;

  followUser([follower_id, following_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Followed" });
  });
};

// UNFOLLOW
exports.unfollow = (req, res) => {
  const follower_id = req.userId;
  const { following_id } = req.body;

  unfollowUser([follower_id, following_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Unfollowed" });
  });
};

// GET COUNTS
exports.getStats = (req, res) => {
  const userId = req.params.userId;

  getFollowersCount(userId, (err, followers) => {
    if (err) return res.status(500).json(err);

    getFollowingCount(userId, (err, following) => {
      if (err) return res.status(500).json(err);

      res.json({
        followers: followers[0].count,
        following: following[0].count,
      });
    });
  });
};