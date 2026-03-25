import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiMessageCircle, FiShare2, FiMusic, FiVolume2, FiVolumeX } from "react-icons/fi";

export default function Reels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState({});

  const reels = [
    {
      id: 1,
      user: { name: "Rwanda Tourism", avatar: "🇷🇼", username: "@visitrwanda" },
      video: "https://images.unsplash.com/photo-1584277261846-c6a3b6d3c9c3?w=400",
      likes: "125K",
      comments: "2.3K",
      caption: "Explore the beauty of Rwanda! 🇷🇼",
      music: "Rwandan Traditional Music",
    },
    {
      id: 2,
      user: { name: "Kigali Life", avatar: "🏙️", username: "@kigalilife" },
      video: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400",
      likes: "89K",
      comments: "1.8K",
      caption: "Modern Kigali at sunset 🌆",
      music: "African Beats",
    },
  ];

  const handleLike = (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {reels.map((reel, index) => (
        <motion.div
          key={reel.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[calc(100vh-64px)] snap-start"
        >
          <img
            src={reel.video}
            alt={reel.caption}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Content */}
          <div className="absolute bottom-20 left-4 right-20 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                <span className="text-xl">{reel.user.avatar}</span>
              </div>
              <div>
                <p className="font-bold">{reel.user.name}</p>
                <p className="text-sm text-white/80">{reel.user.username}</p>
              </div>
            </div>
            <p className="mb-2">{reel.caption}</p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <FiMusic className="inline" />
              <span>{reel.music}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-20 right-4 space-y-6">
            <button onClick={() => handleLike(reel.id)} className="flex flex-col items-center">
              {liked[reel.id] ? (
                <FiHeart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
              ) : (
                <FiHeart className="w-8 h-8 text-white" />
              )}
              <span className="text-xs text-white mt-1">{reel.likes}</span>
            </button>
            <button className="flex flex-col items-center">
              <FiMessageCircle className="w-8 h-8 text-white" />
              <span className="text-xs text-white mt-1">{reel.comments}</span>
            </button>
            <button className="flex flex-col items-center">
              <FiShare2 className="w-8 h-8 text-white" />
              <span className="text-xs text-white mt-1">Share</span>
            </button>
            <button onClick={() => setMuted(!muted)} className="flex flex-col items-center">
              {muted ? <FiVolumeX className="w-8 h-8 text-white" /> : <FiVolume2 className="w-8 h-8 text-white" />}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}