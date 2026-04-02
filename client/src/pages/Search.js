import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiSearch, FiUser, FiImage, FiLoader, FiX, 
  FiHeart, FiMessageCircle, FiMapPin, FiTrendingUp
} from 'react-icons/fi';
import { FaHashtag } from 'react-icons/fa';

export default function Search() {
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
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const loadRecentSearches = useCallback(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 10);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [], hashtags: [] });
      return;
    }
    
    setSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults({
          users: data.users || [],
          posts: data.posts || [],
          hashtags: data.hashtags || []
        });
        saveRecentSearch(query);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to server');
    } finally {
      setSearching(false);
    }
  }, [saveRecentSearch]);

  const loadTrending = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/hashtags/trending`);
      const data = await response.json();
      if (data.success) {
        setTrending(data.hashtags);
      }
    } catch (err) {
      console.error('Failed to load trending:', err);
    }
  }, []);

  useEffect(() => {
    loadTrending();
    loadRecentSearches();
  }, [loadTrending, loadRecentSearches]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, [location.search, performSearch]);

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
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const timeAgo = (date) => {
    if (!date) return 'recent';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes/60)}h ago`;
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>Search</h1>
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
              <button type="button" onClick={clearSearch} className="absolute right-24 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={searching}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-linear-to-r from-yellow-400 to-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {searching ? <FiLoader className="animate-spin" /> : 'Search'}
            </button>
          </form>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
        </motion.div>

        {searchQuery && hasResults && (
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {searching ? (
          <div className="flex justify-center py-12"><FiLoader className="w-8 h-8 animate-spin text-green-500" /></div>
        ) : searchQuery && hasResults ? (
          <div className="space-y-8">
            {(activeTab === 'all' || activeTab === 'users') && searchResults.users.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>Users</h2>
                {searchResults.users.map(userResult => (
                  <div key={userResult._id} onClick={() => navigate(`/profile/${userResult._id}`)} className={`${currentTheme.card} p-4 rounded-2xl mb-2 flex items-center justify-between cursor-pointer shadow-sm`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-r from-yellow-400 to-green-500 flex items-center justify-center text-white font-bold text-xl">
                        {userResult.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold ${currentTheme.text}`}>{userResult.full_name || userResult.username}</p>
                        <p className="text-sm text-gray-500">@{userResult.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'posts') && searchResults.posts.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>Posts</h2>
                {searchResults.posts.map(post => (
                  <div key={post._id} onClick={() => navigate(`/post/${post._id}`)} className={`${currentTheme.card} p-4 rounded-2xl mb-4 shadow-sm`}>
                     <p className={currentTheme.text}>{post.content}</p>
                     <div className="flex gap-2 mt-2">
                        {post.hashtags?.map(tag => <span key={tag} className="text-blue-500 text-sm">#{tag}</span>)}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>Recent Searches</h2>
              {recentSearches.map((s, i) => (
                <div key={i} className="flex justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer" onClick={() => performSearch(s)}>
                  <span className={currentTheme.text}>{s}</span>
                  <FiX onClick={(e) => { e.stopPropagation(); removeRecentSearch(s); }} />
                </div>
              ))}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>Trending</h2>
              {trending.map((t, i) => (
                <div key={i} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer" onClick={() => { setSearchQuery(t.name); performSearch(t.name); }}>
                   <p className="font-bold text-green-600">#{t.name}</p>
                   <p className="text-xs text-gray-500">{formatNumber(t.posts_count)} posts</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}