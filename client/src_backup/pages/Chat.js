import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Remove unused t import
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiUser, FiLock, FiBell, FiGlobe, FiEdit2, FiCamera, 
  FiMapPin, FiLink, FiHeart, FiUsers, FiImage, FiVideo,
  FiSettings, FiLogOut, FiX, FiTrendingUp, FiBarChart2,
  FiMessageCircle
} from 'react-icons/fi';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, themes, toggleTheme, currentTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: ''
  });
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true
  });
  const [privacy, setPrivacy] = useState({
    private_account: false,
    show_activity: true,
    allow_tagging: true
  });

  // Demo posts data
  const posts = [
    { id: 1, type: 'image', media: 'https://images.unsplash.com/photo-1584277261846-c6a3b6d3c9c3?w=400', likes: 1234, comments: 56 },
    { id: 2, type: 'video', media: 'https://images.unsplash.com/photo-1543157144-f78c636d023d?w=400', likes: 2345, comments: 89 },
    { id: 3, type: 'image', media: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400', likes: 3456, comments: 123 },
    { id: 4, type: 'reel', media: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400', likes: 4567, comments: 234 },
    { id: 5, type: 'image', media: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400', likes: 5678, comments: 345 },
    { id: 6, type: 'video', media: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', likes: 6789, comments: 456 },
  ];

  const stats = [
    { label: 'Posts', value: '24', icon: <FiImage />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Followers', value: '1,234', icon: <FiUsers />, color: 'from-green-500 to-emerald-500' },
    { label: 'Following', value: '567', icon: <FiUser />, color: 'from-purple-500 to-pink-500' },
    { label: 'Likes', value: '12.5K', icon: <FiHeart />, color: 'from-red-500 to-orange-500' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || 'Sharing the beauty of Rwanda 🇷🇼',
        location: user.location || 'Kigali, Rwanda',
        website: user.website || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
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
              <button className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-all group">
                <FiCamera className="text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-all hover:scale-110">
                    <FiEdit2 className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex gap-3 mt-4 md:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
                  >
                    <FiSettings />
                    Settings
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FiLogOut />
                    Logout
                  </motion.button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
                    {formData.full_name || user.username}
                  </h1>
                  <span className="text-blue-500 text-sm">✓</span>
                </div>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <p className={`mt-2 ${currentTheme.text}`}>{formData.bio}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {formData.location && (
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      <span>{formData.location}</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center gap-1">
                      <FiLink className="w-4 h-4" />
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl cursor-pointer transition-all"
                  >
                    <div className={`inline-flex p-2 rounded-full bg-gradient-to-r ${stat.color} text-white mb-2`}>
                      {stat.icon}
                    </div>
                    <div className="font-bold text-gray-800 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${currentTheme.card} rounded-2xl shadow-xl p-6 mt-6`}
          >
            <h3 className={`font-semibold ${currentTheme.text} mb-4`}>Connect with me</h3>
            <div className="flex gap-4">
              {[
                { icon: <FaTwitter />, color: 'bg-blue-400', link: '#' },
                { icon: <FaInstagram />, color: 'bg-pink-500', link: '#' },
                { icon: <FaFacebook />, color: 'bg-blue-600', link: '#' },
                { icon: <FaYoutube />, color: 'bg-red-600', link: '#' },
                { icon: <FaTiktok />, color: 'bg-black', link: '#' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.link}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`${social.color} text-white p-3 rounded-full hover:shadow-lg transition-all`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'posts', label: 'Posts', icon: <FiImage /> },
              { id: 'reels', label: 'Reels', icon: <FiVideo /> },
              { id: 'likes', label: 'Likes', icon: <FiHeart /> },
              { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 /> },
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
                    src={post.media} 
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <FiHeart className="fill-white" />
                        <span className="text-sm">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageCircle />
                        <span className="text-sm">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                  {post.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      VIDEO
                    </div>
                  )}
                  {post.type === 'reel' && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded">
                      REEL
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className={`${currentTheme.card} rounded-2xl p-6 text-center`}>
                  <FiTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">+245%</div>
                  <div className="text-sm text-gray-500">Engagement Rate</div>
                </div>
                <div className={`${currentTheme.card} rounded-2xl p-6 text-center`}>
                  <FiUsers className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">12.5K</div>
                  <div className="text-sm text-gray-500">Total Reach</div>
                </div>
              </div>
              <div className={`${currentTheme.card} rounded-2xl p-6`}>
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { icon: <FiHeart />, text: 'Your post got 234 likes', time: '2 hours ago', color: 'text-red-500' },
                    { icon: <FiUser />, text: 'New follower: @kigali_life', time: '5 hours ago', color: 'text-green-500' },
                    { icon: <FiMessageCircle />, text: 'New comment on your reel', time: '1 day ago', color: 'text-blue-500' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                      <div className={`${activity.color}`}>{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-white">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Profile Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser /> Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiBell /> Notifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <motion.div
                          animate={{ x: value ? 24 : 0 }}
                          className="w-5 h-5 bg-white rounded-full m-0.5"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiLock /> Privacy
                </h3>
                <div className="space-y-3">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                        className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <motion.div
                          animate={{ x: value ? 24 : 0 }}
                          className="w-5 h-5 bg-white rounded-full m-0.5"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiGlobe /> Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(themes).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => toggleTheme()}
                      className={`p-3 rounded-xl text-center transition-all ${
                        theme === key
                          ? `bg-gradient-to-r ${key === 'light' ? 'from-gray-100 to-gray-200' : key === 'dark' ? 'from-gray-800 to-gray-900' : key === 'blue' ? 'from-blue-100 to-blue-200' : key === 'red' ? 'from-red-100 to-red-200' : 'from-gray-900 to-black'} border-2 border-green-500`
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto rounded-full ${value.bg} border mb-2`}></div>
                      <span className="text-xs capitalize">{value.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button className="w-full text-red-500 text-center py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}