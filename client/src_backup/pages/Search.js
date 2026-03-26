import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiHash, FiImage, FiX } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

export default function Search() {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState([]);

  const tabs = [
    { id: 'all', label: 'All', icon: <FiSearch /> },
    { id: 'users', label: 'Users', icon: <FiUser /> },
    { id: 'posts', label: 'Posts', icon: <FiImage /> },
    { id: 'hashtags', label: 'Hashtags', icon: <FiHash /> },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate search results
    const mockResults = [
      { id: 1, type: 'user', name: 'Rwanda Tourism', username: '@visitrwanda', avatar: '🇷🇼', followers: '125K' },
      { id: 2, type: 'user', name: 'Kigali Life', username: '@kigalilife', avatar: '🏙️', followers: '89K' },
      { id: 3, type: 'hashtag', name: '#VisitRwanda', posts: '12.5K' },
      { id: 4, type: 'hashtag', name: '#KigaliCity', posts: '8.2K' },
      { id: 5, type: 'post', title: 'Beautiful Rwanda', user: '@visitrwanda', image: 'https://images.unsplash.com/photo-1584277261846-c6a3b6d3c9c3?w=200' },
    ];
    setResults(mockResults.filter(r => 
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg}`}>
      <Navbar />
      
      <div className="pt-20 max-w-4xl mx-auto px-4">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>
            {t('search')}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchUsers')}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </form>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noResults')}</p>
            </div>
          )}
          
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 ${currentTheme.card} rounded-2xl shadow-lg hover:shadow-xl transition`}
            >
              {result.type === 'user' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-2xl">
                      {result.avatar}
                    </div>
                    <div>
                      <p className={`font-semibold ${currentTheme.text}`}>{result.name}</p>
                      <p className="text-sm text-gray-500">{result.username}</p>
                      <p className="text-xs text-gray-400">{result.followers} followers</p>
                    </div>
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition">
                    {t('follow')}
                  </button>
                </div>
              )}
              
              {result.type === 'hashtag' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${currentTheme.text}`}>{result.name}</p>
                    <p className="text-sm text-gray-500">{result.posts} posts</p>
                  </div>
                  <button className="text-blue-500 text-sm font-semibold">Follow</button>
                </div>
              )}
              
              {result.type === 'post' && (
                <div className="flex gap-3">
                  <img src={result.image} alt={result.title} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className={`font-semibold ${currentTheme.text}`}>{result.title}</p>
                    <p className="text-sm text-gray-500">{result.user}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}