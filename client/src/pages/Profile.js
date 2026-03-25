import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCamera, FiEdit2, FiHeart, FiShare2, FiUsers, FiSettings } from "react-icons/fi";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const stats = [
    { label: "Posts", value: "24", icon: <FiCamera /> },
    { label: "Followers", value: "1,234", icon: <FiUsers /> },
    { label: "Following", value: "567", icon: <FiUsers /> },
    { label: "Likes", value: "8.5K", icon: <FiHeart /> },
  ];

  const posts = [
    { id: 1, image: "https://images.unsplash.com/photo-1584277261846-c6a3b6d3c9c3?w=400", likes: 234 },
    { id: 2, image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400", likes: 567 },
    { id: 3, image: "https://images.unsplash.com/photo-1543157144-f78c636d023d?w=400", likes: 890 },
    { id: 4, image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400", likes: 123 },
    { id: 5, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400", likes: 456 },
    { id: 6, image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", likes: 789 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-40 bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 relative">
            <button className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition">
              <FiCamera className="text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex justify-between items-start">
              <div className="relative -mt-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full">
                  <FiEdit2 className="w-3 h-3" />
                </button>
              </div>
              
              <button className="mt-2 bg-gradient-to-r from-yellow-400 to-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:shadow-lg transition flex items-center gap-2">
                <FiSettings /> Edit Profile
              </button>
            </div>
            
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.username}</h2>
              <p className="text-gray-500 text-sm mt-1">🇷🇼 Rwandan Creator</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sharing the beauty of Rwanda with the world 🌍
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center text-blue-500 mb-1">{stat.icon}</div>
                  <div className="font-bold text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Posts</h3>
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group relative"
              >
                <img 
                  src={post.image} 
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <FiHeart className="fill-white" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiShare2 />
                      <span className="text-sm">Share</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}