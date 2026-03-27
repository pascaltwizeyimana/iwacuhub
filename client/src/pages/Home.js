import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import { api } from '../services/api';
import { 
  FiTrendingUp, FiUsers, FiVideo, FiRadio, FiPlus, FiMusic, 
  FiMapPin, FiSearch, FiBell, FiUser, FiHome, FiLoader
} from 'react-icons/fi';
import { FaFire, FaHashtag } from 'react-icons/fa';

export default function Home() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  // State Management
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStory, setActiveStory] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], hashtags: [] });
  const [searching, setSearching] = useState(false);
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: <FiTrendingUp />, color: 'from-blue-500 to-cyan-500' },
    { id: 'music', name: 'Music', icon: <FiMusic />, color: 'from-purple-500 to-pink-500' },
    { id: 'reels', name: 'Reels', icon: <FiVideo />, color: 'from-red-500 to-orange-500' },
    { id: 'live', name: 'Live', icon: <FiRadio />, color: 'from-red-600 to-red-800' },
    { id: 'trending', name: 'Trending', icon: <FaFire />, color: 'from-orange-500 to-red-500' },
    { id: 'travel', name: 'Travel', icon: <FiMapPin />, color: 'from-green-500 to-emerald-500' }
  ];

  // Sample data
  const sampleStories = [
    { id: 1, user: { id: 1, username: 'your_story', full_name: 'Your Story', avatar: user?.avatar || '👤', hasStory: true, isUser: true, timestamp: 'Just now' } },
    { id: 2, user: { id: 2, username: 'rwanda_tourism', full_name: 'Rwanda Tourism', avatar: '🇷🇼', hasStory: true, timestamp: '2h ago' } },
    { id: 3, user: { id: 3, username: 'kigali_life', full_name: 'Kigali Life', avatar: '🏙️', hasStory: true, timestamp: '3h ago' } },
    { id: 4, user: { id: 4, username: 'gorilla_trek', full_name: 'Gorilla Trekking', avatar: '🦍', hasStory: true, timestamp: '5h ago' } },
    { id: 5, user: { id: 5, username: 'rwanda_coffee', full_name: 'Rwandan Coffee', avatar: '☕', hasStory: false, timestamp: '1d ago' } },
    { id: 6, user: { id: 6, username: 'lake_kivu', full_name: 'Lake Kivu', avatar: '🌊', hasStory: true, timestamp: '8h ago' } }
  ];

  const sampleSuggestedUsers = [
    { id: 2, username: 'rwanda_tourism', full_name: 'Rwanda Tourism', avatar: '🇷🇼', followers: 125000, verified: true },
    { id: 3, username: 'kigali_life', full_name: 'Kigali Life', avatar: '🏙️', followers: 89000, verified: true },
    { id: 4, username: 'gorilla_trek', full_name: 'Gorilla Trekking', avatar: '🦍', followers: 234000, verified: true },
    { id: 5, username: 'rwanda_coffee', full_name: 'Rwandan Coffee', avatar: '☕', followers: 45000, verified: false }
  ];

  // Search function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [], hashtags: [] });
      return;
    }
    
    setSearching(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults({
          users: response.data.users || [],
          posts: response.data.posts || [],
          hashtags: response.data.hashtags || []
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setSearching(false);
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load feed posts
        const feedResponse = await api.get('/posts/feed');
        if (feedResponse.data.success) {
          setPosts(feedResponse.data.posts);
        }
        
        // Load trending hashtags
        const hashtagResponse = await api.get('/posts/hashtags/trending');
        if (hashtagResponse.data.success) {
          setTrendingHashtags(hashtagResponse.data.hashtags);
        }
        
        // Set sample data
        setStories(sampleStories);
        setSuggestedUsers(sampleSuggestedUsers);
      } catch (error) {
        console.error('Failed to load data:', error);
        setPosts([]);
        setTrendingHashtags([
          { name: 'VisitRwanda', posts_count: 12500 },
          { name: 'KigaliCity', posts_count: 8200 },
          { name: 'GorillaTrekking', posts_count: 5800 },
          { name: 'RwandanCoffee', posts_count: 3900 },
          { name: 'Umuganda', posts_count: 4200 }
        ]);
        setStories(sampleStories);
        setSuggestedUsers(sampleSuggestedUsers);
      }
      setLoading(false);
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (action) => {
    if (!user) {
      setActionType(action);
      setShowLoginModal(true);
    }
  };

  const handleLogin = () => {
    navigate('/login');
    setShowLoginModal(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setShowLoginModal(false);
  };

  const handleFollowChange = (userId, isFollowing, followerCount, targetFollowersCount) => {
    setSuggestedUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            is_following: isFollowing, 
            followers: targetFollowersCount || (isFollowing ? user.followers + 1 : user.followers - 1)
          }
        : user
    ));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Rwanda facts for loading screen
  const rwandaFacts = [
    "🦍 Home to over 1,000 mountain gorillas - half the world's population!",
    "🌋 Known as the 'Land of a Thousand Hills' with over 1,000 hills",
    "☕ Produces some of the world's finest Arabica coffee",
    "🏙️ Kigali is consistently ranked Africa's cleanest city",
    "🦩 Lake Kivu is one of Africa's Great Lakes with stunning scenery",
    "🌿 Nyungwe Forest is home to chimpanzees and a canopy walkway"
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-green-500 to-blue-600 flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-75 animate-ping"></div>
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-75 animate-ping delay-300"></div>
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-75 animate-ping delay-600"></div>
            <div className="relative w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-6xl animate-bounce">🇷🇼</span>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            IwacuHub
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 mb-6"
          >
            Loading Rwanda's digital home...
          </motion.p>
          
          <div className="w-64 mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 rounded-full"
              />
            </div>
          </div>
          
          <div className="mt-8 max-w-sm mx-auto">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <p className="text-white text-sm">{rwandaFacts[Math.floor(Date.now() / 3000) % rwandaFacts.length]}</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 mx-4 mt-4 rounded-3xl mb-6"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-4xl animate-pulse">🇷🇼</span>
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Welcome to IwacuHub
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white/90 text-sm md:text-base"
          >
            Discover the best of Rwanda's digital community
          </motion.p>
        </div>
      </motion.div>

      <div className="pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block lg:col-span-3 space-y-6">
            {/* User Profile Card */}
            {user && (
              <div className="sticky top-24">
                <div className={`${currentTheme.card} rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                        <span className="text-2xl">{user.avatar || user.username?.[0]?.toUpperCase() || '👤'}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${currentTheme.text}`}>{user.full_name || user.username}</h3>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center cursor-pointer" onClick={() => navigate('/profile')}>
                      <div className="font-bold text-gray-800 dark:text-white">{user.posts_count || 0}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800 dark:text-white">{user.followers_count || 0}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800 dark:text-white">{user.following_count || 0}</div>
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
                {trendingHashtags.slice(0, 5).map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction('hashtag')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-gray-400 text-sm" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm group-hover:text-green-500 transition">#{tag.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatNumber(tag.posts_count)} posts</span>
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
            <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl">
              <div className="overflow-x-auto scrollbar-hide p-4">
                <div className="flex gap-4">
                  {stories.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => setActiveStory(story)}
                      className="flex flex-col items-center gap-1 flex-shrink-0 group"
                    >
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full p-0.5 ${story.user.hasStory ? 'bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600' : 'bg-gray-300'}`}>
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-2xl">{story.user.avatar}</span>
                          </div>
                        </div>
                        {story.user.isUser && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                            <FiPlus className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {story.user.hasStory && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[64px]">
                        {story.user.full_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-sm sm:text-base">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                  <span className="text-4xl">🇷🇼</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to share something amazing!</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={() => {}} />
                ))}
              </AnimatePresence>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Search Bar */}
              <div className={`${currentTheme.card} rounded-2xl shadow-lg p-4`}>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, posts, hashtags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {searching && (
                    <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                </div>
                
                {/* Search Results */}
                {searchQuery && (
                  <div className="mt-4">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">Search Results</h3>
                    
                    {searchResults.users.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Users</p>
                        {searchResults.users.slice(0, 3).map((userResult) => (
                          <div key={userResult.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                                <span className="text-sm">{userResult.avatar || userResult.username?.[0]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{userResult.full_name || userResult.username}</p>
                                <p className="text-xs text-gray-500">@{userResult.username}</p>
                              </div>
                            </div>
                            <button onClick={() => navigate(`/profile/${userResult.id}`)} className="text-blue-500 text-xs">
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.posts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Posts</p>
                        {searchResults.posts.slice(0, 3).map((postResult) => (
                          <div key={postResult.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                            <img src={postResult.media_url} alt="post" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="text-xs line-clamp-1">{postResult.caption || 'No caption'}</p>
                              <p className="text-xs text-gray-500">by {postResult.username}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.hashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Hashtags</p>
                        {searchResults.hashtags.slice(0, 3).map((tag) => (
                          <button key={tag.name} className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                            <span className="text-blue-500 text-sm">#{tag.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{tag.posts_count} posts</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.users.length === 0 && searchResults.posts.length === 0 && searchResults.hashtags.length === 0 && (
                      <p className="text-center text-gray-500 text-sm py-4">No results found for "{searchQuery}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Suggested Users */}
              <div className={`${currentTheme.card} rounded-2xl shadow-lg p-5`}>
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiUsers className="text-green-500" /> Suggested for you
                </h3>
                <div className="space-y-4">
                  {suggestedUsers.map((creator) => (
                    <div key={creator.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-xl">{creator.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-gray-800 dark:text-white text-sm">{creator.full_name}</p>
                            {creator.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-gray-500">@{creator.username}</p>
                          <p className="text-xs text-gray-400">{formatNumber(creator.followers)} followers</p>
                        </div>
                      </div>
                      <FollowButton 
                        userId={creator.id} 
                        initialFollowing={creator.is_following || false}
                        onFollowChange={(following, followerCount, targetFollowersCount) => 
                          handleFollowChange(creator.id, following, followerCount, targetFollowersCount)
                        }
                      />
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

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={() => setActiveStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                  <span className="text-xl">{activeStory.user.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{activeStory.user.full_name}</p>
                  <p className="text-white/60 text-xs">{activeStory.timestamp}</p>
                </div>
                <button 
                  onClick={() => setActiveStory(null)}
                  className="text-white/80 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 flex items-center justify-center animate-pulse">
                  <span className="text-8xl animate-bounce">{activeStory.user.avatar}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
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
                  {!actionType && 'Create an account to interact'}
                </p>
              </div>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
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

      {/* Floating Action Button */}
      {user && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/upload')}
          className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 bg-gradient-to-r from-yellow-400 to-green-500 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all z-50"
        >
          <FiPlus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 block lg:hidden">
        <div className="flex justify-around py-2">
          <button className="text-green-600 p-2">
            <FiHome className="w-6 h-6" />
          </button>
          <button className="text-gray-500 p-2">
            <FiSearch className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('/upload')} className="text-gray-500 p-2 relative">
            <FiPlus className="w-6 h-6" />
          </button>
          <button className="text-gray-500 p-2 relative">
            <FiBell className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('/profile')} className="text-gray-500 p-2">
            <FiUser className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}