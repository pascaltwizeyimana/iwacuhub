import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiSend, 
  FiMoreHorizontal, FiVolume2, FiVolumeX, FiMusic,
  FiMapPin, FiClock, FiEye, FiTrendingUp,
  FiUsers, FiVideo, FiRadio, FiAward, FiPlus
} from 'react-icons/fi';
import { FaFire, FaHashtag } from 'react-icons/fa';

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mutedVideos, setMutedVideos] = useState({});

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: <FiTrendingUp />, color: 'from-blue-500 to-cyan-500' },
    { id: 'music', name: 'Music', icon: <FiMusic />, color: 'from-purple-500 to-pink-500' },
    { id: 'reels', name: 'Reels', icon: <FiVideo />, color: 'from-red-500 to-orange-500' },
    { id: 'live', name: 'Live', icon: <FiRadio />, color: 'from-red-600 to-red-800' },
    { id: 'trending', name: 'Trending', icon: <FaFire />, color: 'from-orange-500 to-red-500' },
  ];

  // Demo posts data
  const demoPosts = [
    {
      id: 1,
      user: {
        id: 1,
        username: 'rwanda_tourism',
        full_name: 'Rwanda Tourism',
        avatar: '🇷🇼',
        is_verified: true,
        followers: '125K'
      },
      media_url: 'https://images.unsplash.com/photo-1584277261846-c6a3b6d3c9c3?w=800',
      media_type: 'image',
      caption: 'Discover the land of a thousand hills! 🌄 From volcanoes to savannahs, Rwanda has it all. #VisitRwanda #ExploreRwanda',
      location: 'Volcanoes National Park',
      hashtags: ['VisitRwanda', 'ExploreRwanda', 'GorillaTrekking'],
      likes_count: 12500,
      comments_count: 234,
      shares_count: 1200,
      views_count: 45000,
      created_at: new Date().toISOString(),
      is_liked: false
    },
    {
      id: 2,
      user: {
        id: 2,
        username: 'kigali_life',
        full_name: 'Kigali Life',
        avatar: '🏙️',
        is_verified: true,
        followers: '89K'
      },
      media_url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
      media_type: 'image',
      caption: 'Modern Kigali at sunset 🌆 Rwanda is rising! The cleanest city in Africa continues to amaze.',
      location: 'Kigali, Rwanda',
      hashtags: ['KigaliCity', 'RwandaRising', 'AfricaRising'],
      likes_count: 8900,
      comments_count: 1800,
      shares_count: 3200,
      views_count: 89000,
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      is_liked: false
    },
    {
      id: 3,
      user: {
        id: 3,
        username: 'gorilla_trek',
        full_name: 'Gorilla Trekking',
        avatar: '🦍',
        is_verified: true,
        followers: '234K'
      },
      media_url: 'https://images.unsplash.com/photo-1543157144-f78c636d023d?w=800',
      media_type: 'video',
      caption: 'Incredible experience with these majestic creatures in Volcanoes National Park. Conservation efforts are bringing mountain gorillas back!',
      location: 'Volcanoes National Park',
      hashtags: ['GorillaTrekking', 'Conservation', 'Wildlife'],
      likes_count: 23400,
      comments_count: 560,
      shares_count: 12800,
      views_count: 1200000,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      is_liked: false
    },
    {
      id: 4,
      user: {
        id: 4,
        username: 'rwanda_coffee',
        full_name: 'Rwandan Coffee',
        avatar: '☕',
        is_verified: false,
        followers: '45K'
      },
      media_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
      media_type: 'image',
      caption: 'From bean to cup - experience the finest coffee from the hills of Rwanda. 🇷🇼☕ #RwandanCoffee #CoffeeCulture',
      location: 'Nyungwe, Rwanda',
      hashtags: ['RwandanCoffee', 'CoffeeCulture', 'MadeInRwanda'],
      likes_count: 4500,
      comments_count: 892,
      shares_count: 2100,
      views_count: 89000,
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      is_liked: false
    }
  ];

  // Initialize posts with demo data
  useEffect(() => {
    setPosts(demoPosts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLike = (postId) => {
    if (!user) {
      setActionType('like');
      setShowLoginModal(true);
      return;
    }
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, is_liked: !post.is_liked, likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1 }
        : post
    ));
  };

  const handleAction = (action) => {
    if (!user) {
      setActionType(action);
      setShowLoginModal(true);
    }
  };

  const toggleMute = (postId) => {
    setMutedVideos(prev => ({ ...prev, [postId]: !prev[postId] }));
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
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      <Navbar />
      
      {/* Main Container with responsive spacing */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block lg:col-span-3 space-y-6">
            {/* User Profile Card */}
            {user && (
              <div className="sticky top-24">
                <div className={`${currentTheme.card} rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                        <span className="text-2xl">{user.avatar || '👤'}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${currentTheme.text}`}>{user.full_name || user.username}</h3>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <button className="text-blue-500 text-sm font-semibold hover:underline">Switch</button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center group cursor-pointer">
                      <div className="font-bold text-gray-800 dark:text-white group-hover:text-green-500 transition">{posts.length}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center group cursor-pointer">
                      <div className="font-bold text-gray-800 dark:text-white group-hover:text-green-500 transition">1.2K</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center group cursor-pointer">
                      <div className="font-bold text-gray-800 dark:text-white group-hover:text-green-500 transition">568</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            <div className={`${currentTheme.card} rounded-2xl shadow-lg p-5`}>
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Trending in Rwanda
              </h3>
              <div className="space-y-3">
                {[
                  { tag: 'VisitRwanda', posts: '12.5K', trending: true },
                  { tag: 'KigaliCity', posts: '8.2K', trending: true },
                  { tag: 'GorillaTrekking', posts: '5.8K', trending: true },
                  { tag: 'RwandanCoffee', posts: '3.9K', trending: 'rising' },
                  { tag: 'Umuganda', posts: '4.2K', trending: true },
                ].map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction('hashtag')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-gray-400 text-sm" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm group-hover:text-green-500 transition">#{tag.tag}</span>
                      {tag.trending === 'rising' && (
                        <span className="text-xs text-green-500 animate-pulse">📈 Rising</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{tag.posts} posts</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rwanda Facts */}
            <div className="bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl shadow-lg p-5 border border-yellow-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl animate-float">🇷🇼</span> Did You Know?
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 group cursor-pointer hover:bg-white/20 p-2 rounded-xl transition">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🦍</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Rwanda is home to over 1,000 mountain gorillas - half of the world's population!</p>
                </div>
                <div className="flex gap-3 group cursor-pointer hover:bg-white/20 p-2 rounded-xl transition">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌋</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Known as "Land of a Thousand Hills" with over 1,000 hills!</p>
                </div>
                <div className="flex gap-3 group cursor-pointer hover:bg-white/20 p-2 rounded-xl transition">
                  <span className="text-2xl group-hover:scale-110 transition-transform">☕</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Rwandan coffee is among the world's finest, known for its rich flavor.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-6">
            {/* Stories Section */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {/* Your Story */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 group cursor-pointer" onClick={() => handleAction('story')}>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-2xl">{user?.avatar || '👤'}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                      <FiPlus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Your Story</span>
                </div>
                
                {/* Other Stories */}
                {[
                  { emoji: '🇷🇼', name: 'Rwanda Tourism' },
                  { emoji: '🏙️', name: 'Kigali Life' },
                  { emoji: '🦍', name: 'Gorilla Trek' },
                  { emoji: '☕', name: 'Coffee' },
                  { emoji: '🌊', name: 'Lake Kivu' },
                ].map((story, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 group cursor-pointer" onClick={() => handleAction('story')}>
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-yellow-400 to-green-500 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-2xl">{story.emoji}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[64px]">{story.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`${currentTheme.card} rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                             onClick={() => navigate(`/profile/${post.user.id}`)}>
                          <span className="text-xl">{post.user.avatar}</span>
                        </div>
                        {post.user.is_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                            <FiAward className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${currentTheme.text} cursor-pointer hover:underline`}
                            onClick={() => navigate(`/profile/${post.user.id}`)}>
                            {post.user.full_name}
                          </span>
                          {post.user.is_verified && <span className="text-blue-500 text-xs">✓</span>}
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
                          muted={mutedVideos[post.id]}
                          loop
                          autoPlay
                        />
                        <button
                          onClick={() => toggleMute(post.id)}
                          className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          {mutedVideos[post.id] ? <FiVolumeX className="text-white" /> : <FiVolume2 className="text-white" />}
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
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 group"
                      >
                        {post.is_liked ? (
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
                        <span className="text-sm font-medium">{formatNumber(post.likes_count)}</span>
                      </motion.button>
                      
                      <button 
                        onClick={() => handleAction('comment')}
                        className="flex items-center gap-1 group"
                      >
                        <FiMessageCircle className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm">{formatNumber(post.comments_count)}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleAction('share')}
                        className="flex items-center gap-1 group"
                      >
                        <FiShare2 className="w-6 h-6 text-gray-500 group-hover:text-green-500 transition-colors" />
                        <span className="text-sm">{formatNumber(post.shares_count)}</span>
                      </button>
                    </div>
                    <button onClick={() => handleAction('save')} className="group">
                      <FiBookmark className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors" />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="px-4 pb-2">
                    <p className={`${currentTheme.text} text-sm`}>
                      <span className="font-semibold mr-2">{post.user.full_name}</span>
                      {post.caption}
                    </p>
                    {post.hashtags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.hashtags.map(tag => (
                          <button 
                            key={tag} 
                            onClick={() => handleAction('hashtag')}
                            className="text-blue-500 text-sm hover:underline transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={t('addComment') || 'Add a comment...'}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        onClick={() => handleAction('comment')}
                        readOnly={!user}
                      />
                      <button 
                        onClick={() => handleAction('comment')}
                        className="text-green-500 hover:text-green-600 transition-transform hover:scale-110"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Suggested Users */}
              <div className={`${currentTheme.card} rounded-2xl shadow-lg p-5`}>
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiUsers className="text-green-500" /> Suggested for you
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Rwanda Tourism', username: '@visitrwanda', avatar: '🇷🇼', followers: '125K', verified: true },
                    { name: 'Kigali Life', username: '@kigalilife', avatar: '🏙️', followers: '89K', verified: true },
                    { name: 'Gorilla Trekking', username: '@gorillatrek', avatar: '🦍', followers: '234K', verified: true },
                    { name: 'Rwandan Music', username: '@rwandamusic', avatar: '🎵', followers: '67K', verified: false },
                  ].map((creator, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-xl">{creator.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-gray-800 dark:text-white text-sm">{creator.name}</p>
                            {creator.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-gray-500">{creator.username}</p>
                          <p className="text-xs text-gray-400">{creator.followers} followers</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAction('follow')}
                        className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-transform hover:scale-105"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              {!user && (
                <div className="bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white text-center transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3 animate-bounce">🇷🇼</div>
                  <h3 className="font-bold text-lg mb-2">Join the community!</h3>
                  <p className="text-sm opacity-90 mb-4">Be part of Rwanda's digital family</p>
                  <button 
                    onClick={() => navigate('/register')}
                    className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🇷🇼
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Join IwacuHub</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {actionType === 'like' && '❤️ Like this amazing content'}
                  {actionType === 'comment' && '💬 Join the conversation'}
                  {actionType === 'share' && '📤 Share with your friends'}
                  {actionType === 'save' && '🔖 Save for later'}
                  {!actionType && 'Create an account to interact'}
                </p>
              </div>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Create New Account
                </motion.button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full text-gray-500 dark:text-gray-400 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}