const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  caption: {
    type: String,
    maxlength: 500,
    default: ''
  },
  videos: [{
    type: String,
    required: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes_count: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0,
    index: true
  },
  location: {
    type: String,
    default: 'Kigali, Rwanda'
  },
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast feeds
VideoSchema.index({ created_at: -1 });
VideoSchema.index({ user: 1, created_at: -1 });
VideoSchema.index({ views: -1 });
VideoSchema.index({ hashtags: 1 });

// Update likes_count before saving
VideoSchema.pre('save', function(next) {
  this.likes_count = this.likes.length;
  this.updated_at = Date.now();
  next();
});

// Method to increment views
VideoSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Method to toggle like
VideoSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  this.likes_count = this.likes.length;
  return await this.save();
};

module.exports = mongoose.model('Video', VideoSchema);