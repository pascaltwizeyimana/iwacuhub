import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import FollowButton from '../components/FollowButton';
import { api } from '../services/api';
import { 
  FiCamera, FiEdit2, FiMapPin, FiLink, FiHeart, 
  FiImage, FiVideo, FiSettings, FiLogOut, 
  FiMessageCircle, FiTwitter, FiInstagram, FiFacebook, FiYoutube
} from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.success) {
        setProfileUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, [userId]);

  const loadPosts = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}/posts`);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
    setLoading(false);
  }, [userId]);

  const loadFollowers = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}/followers`);
      if (response.data.success) {
        setFollowers(response.data.followers);
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
    }
  }, [userId]);

  const loadFollowing = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}/following`);
      if (response.data.success) {
        setFollowing(response.data.following);
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
    loadPosts();
    if (!isOwnProfile) {
      loadFollowers();
      loadFollowing();
    }
  }, [loadProfile, loadPosts, loadFollowers, loadFollowing, isOwnProfile]);

  const handleFollowChange = (isFollowing, followerCount, targetFollowersCount) => {
    setProfileUser(prev => ({
      ...prev,
      is_following: isFollowing,
      followers_count: targetFollowersCount
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-green-500 hover:underline">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${currentTheme.card} rounded-2xl shadow-xl overflow-hidden`}
          >
            {/* Cover Photo */}
            <div className="relative h-48 bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600">
              {isOwnProfile && (
                <button className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-all group">
                  <FiCamera className="text-white group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        {profileUser.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-all hover:scale-110">
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3 mt-4 md:mt-0">
                  {!isOwnProfile && (
                    <FollowButton 
                      userId={profileUser.id} 
                      initialFollowing={profileUser.is_following || false}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                  {isOwnProfile && (
                    <>
                      <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2">
                        <FiSettings /> Edit Profile
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-600 transition flex items-center gap-2">
                        <FiLogOut /> Logout
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
                    {profileUser.full_name || profileUser.username}
                  </h1>
                  {profileUser.is_verified && <span className="text-blue-500 text-xs">✓</span>}
                </div>
                <p className="text-gray-500 text-sm">@{profileUser.username}</p>
                {profileUser.bio && (
                  <p className={`mt-2 ${currentTheme.text}`}>{profileUser.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.website && (
                    <div className="flex items-center gap-1">
                      <FiLink className="w-4 h-4" />
                      <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
                        {profileUser.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => navigate(`/profile/${profileUser.id}/posts`)}
                  className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                >
                  <div className="font-bold text-gray-800 dark:text-white">{posts.length}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </button>
                <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                >
                  <div className="font-bold text-gray-800 dark:text-white">{formatNumber(profileUser.followers_count)}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </button>
                <button 
                  onClick={() => setShowFollowingModal(true)}
                  className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                >
                  <div className="font-bold text-gray-800 dark:text-white">{formatNumber(profileUser.following_count)}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <div className={`${currentTheme.card} rounded-2xl shadow-xl p-6 mt-6`}>
            <h3 className={`font-semibold ${currentTheme.text} mb-4`}>Connect with me</h3>
            <div className="flex gap-4">
              {[
                { icon: <FiTwitter />, color: 'bg-blue-400', link: '#' },
                { icon: <FiInstagram />, color: 'bg-pink-500', link: '#' },
                { icon: <FiFacebook />, color: 'bg-blue-600', link: '#' },
                { icon: <FiYoutube />, color: 'bg-red-600', link: '#' },
                { icon: <FaTiktok />, color: 'bg-black', link: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} text-white p-3 rounded-full hover:shadow-lg transition-all hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'posts', label: 'Posts', icon: <FiImage /> },
              { id: 'reels', label: 'Reels', icon: <FiVideo /> },
              { id: 'likes', label: 'Likes', icon: <FiHeart /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1 mt-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group relative"
                >
                  <img 
                    src={post.media_url} 
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <FiHeart className="fill-white" />
                        <span className="text-sm">{formatNumber(post.likes_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageCircle />
                        <span className="text-sm">{formatNumber(post.comments_count)}</span>
                      </div>
                    </div>
                  </div>
                  {post.media_type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      VIDEO
                    </div>
                  )}
                  {post.media_type === 'reel' && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded">
                      REEL
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Followers</h2>
              <button onClick={() => setShowFollowersModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer" onClick={() => {
                  setShowFollowersModal(false);
                  navigate(`/profile/${follower.id}`);
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                      <span className="text-sm">{follower.avatar || follower.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{follower.full_name || follower.username}</p>
                      <p className="text-xs text-gray-500">@{follower.username}</p>
                      <p className="text-xs text-gray-400">{formatNumber(follower.followers_count)} followers</p>
                    </div>
                  </div>
                </div>
              ))}
              {followers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No followers yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Following</h2>
              <button onClick={() => setShowFollowingModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {following.map((followed) => (
                <div key={followed.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer" onClick={() => {
                  setShowFollowingModal(false);
                  navigate(`/profile/${followed.id}`);
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                      <span className="text-sm">{followed.avatar || followed.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{followed.full_name || followed.username}</p>
                      <p className="text-xs text-gray-500">@{followed.username}</p>
                      <p className="text-xs text-gray-400">{formatNumber(followed.followers_count)} followers</p>
                    </div>
                  </div>
                </div>
              ))}
              {following.length === 0 && (
                <p className="text-center text-gray-500 py-4">Not following anyone yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}