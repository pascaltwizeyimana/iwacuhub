import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LoadingSpinner() {
  const [factIndex, setFactIndex] = useState(0);
  
  const rwandaFacts = [
    "🦍 Home to over 1,000 mountain gorillas - half the world's population!",
    "🌋 Known as the 'Land of a Thousand Hills' with over 1,000 hills",
    "☕ Produces some of the world's finest Arabica coffee",
    "🏙️ Kigali is consistently ranked Africa's cleanest city",
    "🦩 Lake Kivu is one of Africa's Great Lakes with stunning scenery",
    "🌿 Nyungwe Forest is home to chimpanzees and a canopy walkway",
    "🎨 Traditional Imigongo art uses cow dung to create beautiful patterns",
    "🎵 Intore dance performances showcase Rwanda's rich cultural heritage",
    "🦅 Akagera National Park has the 'Big Five' wildlife",
    "🏔️ Mount Karisimbi is Rwanda's highest volcano at 4,507m"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % rwandaFacts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rwandaFacts.length]); // Added dependency

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-green-500 to-blue-600 flex items-center justify-center z-50">
      <div className="text-center px-4">
        {/* Animated Rwanda Flag Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-28 h-28 mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-75 animate-ping"></div>
          <div className="absolute inset-0 bg-green-500 rounded-full opacity-75 animate-ping delay-300"></div>
          <div className="absolute inset-0 bg-blue-600 rounded-full opacity-75 animate-ping delay-600"></div>
          <div className="relative w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-5xl animate-bounce">🇷🇼</span>
          </div>
        </motion.div>

        {/* App Name */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          IwacuHub
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-sm mb-6"
        >
          Rwanda's Premier Social Platform
        </motion.p>

        {/* Loading Message */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mb-6"
        >
          <p className="text-white/90 text-base">Loading amazing content...</p>
        </motion.div>

        {/* Rwanda Fact Card */}
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-sm mx-auto border border-white/20"
        >
          <div className="flex items-start gap-2">
            <span className="text-2xl">🇷🇼</span>
            <p className="text-white text-sm leading-relaxed">
              {rwandaFacts[factIndex]}
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-48 mx-auto mt-8">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-full w-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 rounded-full"
              style={{ transform: "translateX(-100%)" }}
            />
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2 justify-center mt-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}