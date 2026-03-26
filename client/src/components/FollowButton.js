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
    
    setLoading(true);
    try {
      const response = await api.post(`/users/${userId}/follow`);
      if (response.data.success) {
        setFollowing(response.data.following);
        if (onFollowChange) onFollowChange(response.data.following);
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Failed to follow user');
    }
    setLoading(false);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        following
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
      } disabled:opacity-50`}
    >
      {loading ? (
        <FiLoader className="w-4 h-4 animate-spin mx-auto" />
      ) : following ? (
        <span className="flex items-center gap-1">
          <FiUserMinus /> Following
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <FiUserPlus /> Follow
        </span>
      )}
    </motion.button>
  );
}