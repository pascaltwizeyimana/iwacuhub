import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiSend, 
  FiMoreHorizontal, FiVolume2, FiVolumeX, FiMusic,
  FiMapPin, FiClock, FiEye, FiAward
} from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaLink } from 'react-icons/fa';
import SaveCollectionModal from './SaveCollectionModal';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load comments
  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }
    
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.liked);
        setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
    setLoading(false);
  };

  // Handle comment
  const handleComment = async () => {
    if (!user) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      const response = await api.post(`/posts/${post.id}/comments`, { 
        comment: commentText 
      });
      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!user) {
      alert('Please login to save posts');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveToCollection = (collectionId) => {
    setIsSaved(true);
    console.log(`Saved to collection ${collectionId}`);
  };

  // Share to social media
  const shareToSocial = (platform) => {
    const url = window.location.href;
    const text = post.caption || 'Check out this post on IwacuHub!';
    
    let shareUrl = '';
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="text-xl">{post.user?.avatar || '👤'}</span>
            </div>
            {post.user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                <FiAward className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-800 dark:text-white">
                {post.user?.full_name || post.user?.username}
              </span>
              {post.user?.is_verified && <span className="text-blue-500 text-xs">✓</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiClock className="w-3 h-3" />
              <span>{timeAgo(post.created_at)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <FiMapPin className="w-3 h-3" />
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Media Content */}
      <div className="relative bg-black group">
        {post.media_type === 'video' ? (
          <div className="relative">
            <video 
              src={post.media_url} 
              className="w-full max-h-[500px] object-contain"
              muted={muted}
              loop
              autoPlay
              playsInline
            />
            <button
              onClick={() => setMuted(!muted)}
              className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              {muted ? <FiVolume2 className="text-white" /> : <FiVolumeX className="text-white" />}
            </button>
          </div>
        ) : (
          <img 
            src={post.media_url} 
            alt={post.caption} 
            className="w-full max-h-[500px] object-contain cursor-pointer hover:scale-105 transition-transform duration-500"
          />
        )}
        {post.views_count > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <FiEye className="w-3 h-3" />
            <span>{formatNumber(post.views_count)} views</span>
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            disabled={loading}
            className="flex items-center gap-1 group"
          >
            {isLiked ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-red-500"
              >
                <FiHeart className="w-6 h-6 fill-red-500" />
              </motion.div>
            ) : (
              <FiHeart className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
            )}
            <span className="text-sm font-medium">{formatNumber(likesCount)}</span>
          </motion.button>
          
          <button 
            onClick={loadComments}
            className="flex items-center gap-1 group"
          >
            <FiMessageCircle className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
            <span className="text-sm">{formatNumber(post.comments_count || comments.length)}</span>
          </button>
          
          <button 
            onClick={() => setShowShareMenu(true)}
            className="flex items-center gap-1 group"
          >
            <FiShare2 className="w-6 h-6 text-gray-500 group-hover:text-green-500 transition-colors" />
            <span className="text-sm">{formatNumber(post.shares_count || 0)}</span>
          </button>
        </div>
        
        {/* Save Button with Modal */}
        <button onClick={handleSave} className="group">
          {isSaved ? (
            <FiBookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          ) : (
            <FiBookmark className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 dark:text-gray-200 text-sm">
          <span className="font-semibold mr-2">{post.user?.full_name || post.user?.username}</span>
          {post.caption}
        </p>
        {post.hashtags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.hashtags.split(',').map(tag => (
              <button key={tag} className="text-blue-500 text-sm hover:underline">
                #{tag}
              </button>
            ))}
          </div>
        )}
        {post.music && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <FiMusic className="w-3 h-3" />
            <span>{post.music}</span>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 dark:border-gray-700"
          >
            <div className="p-4 max-h-64 overflow-y-auto space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-sm flex-shrink-0">
                    {comment.avatar || comment.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold mr-2">{comment.full_name || comment.username}</span>
                      {comment.comment}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(comment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? "Add a comment..." : "Login to comment..."}
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            disabled={!user}
          />
          <button 
            onClick={handleComment}
            disabled={!user || !commentText.trim()}
            className="text-green-500 hover:text-green-600 transition-transform hover:scale-110 disabled:opacity-50"
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Share this post</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                >
                  <FaWhatsapp className="w-8 h-8 text-green-500" />
                  <span className="text-xs">WhatsApp</span>
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <FaTwitter className="w-8 h-8 text-blue-400" />
                  <span className="text-xs">Twitter</span>
                </button>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <FaFacebook className="w-8 h-8 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </button>
                <button
                  onClick={() => shareToSocial('copy')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FaLink className="w-8 h-8 text-gray-500" />
                  <span className="text-xs">Copy Link</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Collection Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveCollectionModal
            post={post}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveToCollection}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}