import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { 
  FiSearch, FiUser, FiImage, FiLoader, FiX, 
  FiHeart, FiMessageCircle, FiMapPin, FiTrendingUp
} from 'react-icons/fi';
import { FaHashtag } from 'react-icons/fa';

export default function Search() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    hashtags: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);

  // Load trending hashtags on mount
  useEffect(() => {
    loadTrending();
    loadRecentSearches();
  }, []);

  // Check URL params for search query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const loadTrending = async () => {
    try {
      const response = await api.get('/search/trending');
      if (response.data.success) {
        setTrending(response.data.hashtags);
      }
    } catch (error) {
      console.error('Failed to load trending:', error);
      setTrending([
        { name: 'VisitRwanda', posts_count: 12500 },
        { name: 'KigaliCity', posts_count: 8200 },
        { name: 'GorillaTrekking', posts_count: 5800 },
        { name: 'RwandanCoffee', posts_count: 3900 },
        { name: 'Umuganda', posts_count: 4200 }
      ]);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    
    if (user) {
      api.post('/search/recent', { query, userId: user.id }).catch(console.error);
    }
  };

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [], hashtags: [] });
      return;
    }
    
    setSearching(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults({
          users: response.data.users || [],
          posts: response.data.posts || [],
          hashtags: response.data.hashtags || []
        });
        saveRecentSearch(query);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ users: [], posts: [], hashtags: [] });
    navigate('/search', { replace: true });
  };

  const removeRecentSearch = (query) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
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

  const tabs = [
    { id: 'all', label: 'All', icon: <FiSearch />, count: () => searchResults.users.length + searchResults.posts.length + searchResults.hashtags.length },
    { id: 'users', label: 'Users', icon: <FiUser />, count: () => searchResults.users.length },
    { id: 'posts', label: 'Posts', icon: <FiImage />, count: () => searchResults.posts.length },
    { id: 'hashtags', label: 'Hashtags', icon: <FaHashtag />, count: () => searchResults.hashtags.length },
  ];

  const hasResults = searchResults.users.length > 0 || searchResults.posts.length > 0 || searchResults.hashtags.length > 0;

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      <Navbar />
      
      <div className="pt-20 max-w-4xl mx-auto px-4">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>
            Search
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, posts, hashtags..."
              className="w-full pl-12 pr-32 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-24 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={searching}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </motion.div>

        {/* Tabs */}
        {searchQuery && hasResults && (
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
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
                {tab.count() > 0 && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {tab.count()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searching ? (
          <div className="flex justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : searchQuery && hasResults ? (
          <AnimatePresence>
            {/* Users Results */}
            {(activeTab === 'all' || activeTab === 'users') && searchResults.users.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                  <FiUser className="text-green-500" /> Users
                </h2>
                <div className="space-y-3">
                  {searchResults.users.map((userResult, index) => (
                    <motion.div
                      key={userResult.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${currentTheme.card} rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer`}
                      onClick={() => navigate(`/profile/${userResult.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                            <span className="text-xl">{userResult.avatar || userResult.username?.[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold ${currentTheme.text} text-lg`}>
                                {userResult.full_name || userResult.username}
                              </p>
                              {userResult.is_verified && (
                                <span className="text-blue-500 text-xs">✓</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">@{userResult.username}</p>
                            <p className="text-xs text-gray-400">{formatNumber(userResult.followers_count)} followers</p>
                          </div>
                        </div>
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all">
                          View Profile
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && searchResults.posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                  <FiImage className="text-green-500" /> Posts
                </h2>
                <div className="space-y-4">
                  {searchResults.posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${currentTheme.card} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer`}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <div className="flex p-4 gap-4">
                        <img 
                          src={post.media_url} 
                          alt={post.caption} 
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                              <span className="text-sm">{post.avatar || post.username?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className={`font-semibold ${currentTheme.text} text-sm`}>
                                {post.full_name || post.username}
                              </p>
                              <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
                            </div>
                          </div>
                          <p className={`${currentTheme.text} text-sm line-clamp-2 mb-2`}>
                            {post.caption || 'No caption'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiHeart className="w-3 h-3" />
                              <span>{formatNumber(post.likes_count)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMessageCircle className="w-3 h-3" />
                              <span>{formatNumber(post.comments_count)}</span>
                            </div>
                            {post.location && (
                              <div className="flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" />
                                <span>{post.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hashtag Results */}
            {(activeTab === 'all' || activeTab === 'hashtags') && searchResults.hashtags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                  <FaHashtag className="text-green-500" /> Hashtags
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.hashtags.map((tag, index) => (
                    <motion.button
                      key={tag.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSearchQuery(`#${tag.name}`);
                        performSearch(`#${tag.name}`);
                      }}
                      className={`${currentTheme.card} rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all text-left`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${currentTheme.text} text-lg flex items-center gap-1`}>
                            <FaHashtag className="text-blue-500" /> {tag.name}
                          </p>
                          <p className="text-sm text-gray-500">{formatNumber(tag.posts_count)} posts</p>
                        </div>
                        <button className="text-blue-500 text-sm font-semibold hover:underline">
                          Explore
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : searchQuery && !hasResults ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FiSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500">Try searching for something else</p>
          </div>
        ) : (
          /* Recent Searches & Trending */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center justify-between`}>
                  Recent Searches
                  <button 
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('recent_searches');
                    }}
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
                    Clear All
                  </button>
                </h2>
                <div className="space-y-2">
                  {recentSearches.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(query);
                        performSearch(query);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FiSearch className="text-gray-400" />
                        <span className={currentTheme.text}>{query}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(query);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                <FiTrendingUp className="text-orange-500" /> Trending in Rwanda
              </h2>
              <div className="space-y-3">
                {trending.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(`#${tag.name}`);
                      performSearch(`#${tag.name}`);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div>
                      <p className={`font-semibold ${currentTheme.text} flex items-center gap-1`}>
                        <FaHashtag className="text-blue-500" /> {tag.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatNumber(tag.posts_count)} posts</p>
                    </div>
                    {i < 3 && <span className="text-red-500 text-sm">🔥 Hot</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}