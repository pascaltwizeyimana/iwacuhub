import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiSend, FiSearch, FiArrowLeft, FiPhone, FiVideo, FiInfo,
  FiCheck, FiUsers, FiMessageCircle, FiLoader,
  FiPaperclip, FiImage, FiSmile
} from 'react-icons/fi';

export default function Chat() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Demo chats data
  const demoChats = [
    {
      id: 1,
      user: {
        id: 2,
        username: 'kigali_life',
        full_name: 'Kigali Life',
        avatar: '🏙️',
        is_verified: true,
        online: true,
        last_seen: 'Online'
      },
      last_message: 'Great content! When are you posting next?',
      last_message_time: new Date(Date.now() - 5 * 60000).toISOString(),
      unread_count: 2,
      pinned: true
    },
    {
      id: 2,
      user: {
        id: 3,
        username: 'gorilla_trek',
        full_name: 'Gorilla Trekking',
        avatar: '🦍',
        is_verified: true,
        online: false,
        last_seen: '2 hours ago'
      },
      last_message: 'Thanks for sharing! The gorillas are amazing!',
      last_message_time: new Date(Date.now() - 2 * 3600000).toISOString(),
      unread_count: 0,
      pinned: false
    },
    {
      id: 3,
      user: {
        id: 4,
        username: 'rwanda_coffee',
        full_name: 'Rwandan Coffee',
        avatar: '☕',
        is_verified: false,
        online: true,
        last_seen: 'Online'
      },
      last_message: 'Have you tried our new blend?',
      last_message_time: new Date(Date.now() - 30 * 60000).toISOString(),
      unread_count: 1,
      pinned: false
    },
    {
      id: 4,
      user: {
        id: 5,
        username: 'rwanda_tourism',
        full_name: 'Rwanda Tourism',
        avatar: '🇷🇼',
        is_verified: true,
        online: false,
        last_seen: '1 hour ago'
      },
      last_message: 'Welcome to Rwanda! 🇷🇼',
      last_message_time: new Date(Date.now() - 3 * 3600000).toISOString(),
      unread_count: 0,
      pinned: true
    }
  ];

  // Demo messages
  const demoMessages = {
    1: [
      {
        id: 1,
        sender_id: 2,
        message: 'Hey! Loved your recent post about Rwanda! 🇷🇼',
        time: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'read',
        is_own: false
      },
      {
        id: 2,
        sender_id: 1,
        message: 'Thank you! Rwanda is truly amazing!',
        time: new Date(Date.now() - 1.5 * 3600000).toISOString(),
        status: 'read',
        is_own: true
      },
      {
        id: 3,
        sender_id: 2,
        message: 'When are you posting next? I love your content!',
        time: new Date(Date.now() - 1 * 3600000).toISOString(),
        status: 'read',
        is_own: false
      },
      {
        id: 4,
        sender_id: 1,
        message: 'Planning to post tomorrow about Lake Kivu! 🌊',
        time: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'delivered',
        is_own: true
      },
      {
        id: 5,
        sender_id: 2,
        message: 'Can\'t wait! 📸',
        time: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'delivered',
        is_own: false
      }
    ],
    2: [],
    3: [
      {
        id: 1,
        sender_id: 4,
        message: 'Have you tried our new coffee blend? ☕',
        time: new Date(Date.now() - 1 * 3600000).toISOString(),
        status: 'read',
        is_own: false
      }
    ],
    4: []
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setChats(demoChats);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeChat) {
      setMessages(demoMessages[activeChat.id] || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender_id: user?.id || 1,
      message: message,
      time: new Date().toISOString(),
      status: 'sent',
      is_own: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChat?.id 
        ? { ...chat, last_message: message, last_message_time: new Date().toISOString() }
        : chat
    ));
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  const getMessageStatusIcon = (status) => {
    switch(status) {
      case 'sent':
        return <FiCheck className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <FiCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <FiCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <FiLoader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      <Navbar />
      
      <div className="pt-16 h-screen flex">
        {/* Chat List Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`w-full md:w-96 border-r ${currentTheme.card} shadow-lg flex flex-col transition-all duration-300`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${currentTheme.text} flex items-center gap-2`}>
                <FiMessageCircle className="text-green-500" />
                Messages
              </h1>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <FiUsers className="text-gray-500" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredChats.map((chat, index) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
                    activeChat?.id === chat.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-2xl">
                        {chat.user.avatar}
                      </div>
                      {chat.user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${currentTheme.text} truncate`}>
                            {chat.user.full_name}
                          </span>
                          {chat.user.is_verified && (
                            <span className="text-blue-500 text-xs">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {chat.last_message}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Chat Area */}
        {activeChat ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900"
          >
            {/* Chat Header */}
            <div className={`p-4 ${currentTheme.card} border-b border-gray-200 dark:border-gray-700 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                >
                  <FiArrowLeft className="text-gray-600 dark:text-gray-400" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-xl">
                    {activeChat.user.avatar}
                  </div>
                  {activeChat.user.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className={`font-semibold ${currentTheme.text}`}>
                      {activeChat.user.full_name}
                    </h2>
                    {activeChat.user.is_verified && (
                      <span className="text-blue-500 text-xs">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {activeChat.user.online ? 'Online' : `Last seen ${activeChat.user.last_seen}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiPhone className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiVideo className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiInfo className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.is_own && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                        {activeChat.user.avatar}
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md ${
                      msg.is_own 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                        : `${currentTheme.card} text-gray-800 dark:text-white`
                    } rounded-2xl p-3 shadow-lg`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(msg.time)}
                        </span>
                        {msg.is_own && getMessageStatusIcon(msg.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 ${currentTheme.card} border-t border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiPaperclip className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiImage className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                  <FiSmile className="text-gray-500" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                <FiMessageCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>
                Select a chat
              </h3>
              <p className="text-gray-500">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}