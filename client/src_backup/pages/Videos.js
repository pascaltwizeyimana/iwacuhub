import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiThumbsUp, FiEye, FiClock } from "react-icons/fi";

export default function Videos() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const videos = [
    {
      id: 1,
      title: "Mountain Gorillas of Rwanda",
      creator: "Wild Rwanda",
      views: "1.2M",
      time: "2 days ago",
      duration: "8:32",
      thumbnail: "https://images.unsplash.com/photo-1543157144-f78c636d023d?w=800",
      likes: "234K",
    },
    {
      id: 2,
      title: "Rwandan Coffee: From Bean to Cup",
      creator: "Rwanda Coffee",
      views: "456K",
      time: "1 week ago",
      duration: "15:23",
      thumbnail: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
      likes: "89K",
    },
  ];

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Videos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{video.creator}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiEye className="w-3 h-3" />
                    <span>{video.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiThumbsUp className="w-3 h-3" />
                    <span>{video.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    <span>{video.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}