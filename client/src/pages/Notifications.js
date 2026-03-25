import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiUserPlus, FiClock, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
// Remove: import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: 'Rwanda Tourism', message: 'liked your post', time: '2 minutes ago', read: false, avatar: '🇷🇼' },
    { id: 2, type: 'comment', user: 'Kigali Life', message: 'commented on your post', time: '1 hour ago', read: false, avatar: '🏙️' },
    { id: 3, type: 'follow', user: 'Gorilla Trekking', message: 'started following you', time: '3 hours ago', read: true, avatar: '🦍' },
    { id: 4, type: 'like', user: 'Rwandan Coffee', message: 'liked your reel', time: '1 day ago', read: true, avatar: '☕' },
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <FiHeart className="text-red-500" />;
      case 'comment': return <FiMessageCircle className="text-blue-500" />;
      case 'follow': return <FiUserPlus className="text-green-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg}`}>
      <Navbar />
      
      <div className="pt-20 max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-between items-center"
        >
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
            {t('notifications')}
          </h1>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-blue-500 text-sm font-semibold flex items-center gap-1"
            >
              <FiCheck /> {t('markAllRead')}
            </button>
          )}
        </motion.div>

        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 ${currentTheme.card} rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer ${
                !notification.read ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center text-xl">
                  {notification.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getIcon(notification.type)}
                    <p className={`${currentTheme.text}`}>
                      <span className="font-semibold">{notification.user}</span>{' '}
                      <span className="text-gray-500">{notification.message}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}