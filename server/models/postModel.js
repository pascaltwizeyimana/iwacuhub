const mongoose = require('mongoose'); // <--- THIS WAS MISSING

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  media_url: {
    type: String,
    default: ''
  },
  media_type: {
    type: String,
    enum: ['image', 'video', 'none'],
    default: 'none'
  },
  hashtags: [{
    type: String
  }],
  location: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// IMPORTANT: Do not use 'text' for hashtags as it causes errors with arrays.
// Use 1 for standard index and 'text' for content only.
postSchema.index({ content: 'text' }); 
postSchema.index({ hashtags: 1 }); 

module.exports = mongoose.model('Post', postSchema);