import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUserMinus, FiLoader } from 'react-icons/fi';

export default function FollowButton({ userId, initialFollowing, onFollowChange }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      alert('Please login to follow users');
      return;
    }
    
    const targetUserId = parseInt(userId);
    const currentUserId = parseInt(user.id);
    
    if (targetUserId === currentUserId) {
      alert('You cannot follow yourself');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/users/${targetUserId}/follow`);
      console.log('Follow response:', response.data);
      
      if (response.data.success) {
        const newFollowingState = response.data.following;
        setFollowing(newFollowingState);
        
        // Notify parent component with updated counts
        if (onFollowChange) {
          onFollowChange(
            newFollowingState, 
            response.data.followerCount, 
            response.data.targetFollowersCount
          );
        }
        
        // Show toast notification
        const message = newFollowingState 
          ? `You are now following this user! 🎉` 
          : `You have unfollowed this user.`;
        console.log(message);
      } else {
        alert(response.data.message || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert(error.response?.data?.message || 'Failed to follow user');
    }
    setLoading(false);
  };

  if (!user || parseInt(userId) === parseInt(user.id)) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
        following
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
      } disabled:opacity-50`}
    >
      {loading ? (
        <FiLoader className="w-4 h-4 animate-spin" />
      ) : following ? (
        <>
          <FiUserMinus className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <FiUserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </motion.button>
  );
}