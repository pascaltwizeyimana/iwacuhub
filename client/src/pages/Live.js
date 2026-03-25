import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUsers, FiHeart, FiSend, FiX } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Rest of the component remains the same...

export default function Live() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [likes, setLikes] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewers(prev => prev + Math.floor(Math.random() * 10));
        setLikes(prev => prev + Math.floor(Math.random() * 50));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const startLive = () => {
    setIsLive(true);
    setViewers(1);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Error accessing camera:', err));
  };

  const stopLive = () => {
    setIsLive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setChat([...chat, { user: user?.username || 'Guest', message, time: new Date().toLocaleTimeString() }]);
    setMessage('');
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg}`}>
      <Navbar />
      
      <div className="pt-16">
        {!isLive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4 py-20 text-center"
          >
            <div className="text-6xl mb-6 animate-bounce">🎥</div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-4`}>
              {t('startLive')}
            </h1>
            <p className="text-gray-500 mb-8">
              Share your moment with Rwanda's community in real-time
            </p>
            <button
              onClick={startLive}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition"
            >
              🔴 {t('startLive')}
            </button>
          </motion.div>
        ) : (
          <div className="relative h-screen bg-black">
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              muted={!micOn}
              className="w-full h-full object-cover"
            />
            
            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔴 LIVE
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                <FiUsers className="inline mr-1" /> {viewers} {t('viewers')}
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={() => setMicOn(!micOn)}
                className="bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition"
              >
                {micOn ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className="bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition"
              >
                {cameraOn ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
              </button>
              <button
                onClick={stopLive}
                className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600 transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Chat */}
            <div className="absolute bottom-20 right-4 w-80 bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="h-96 overflow-y-auto p-3 space-y-2">
                {chat.map((msg, i) => (
                  <div key={i} className="text-white text-sm">
                    <span className="font-semibold">{msg.user}:</span> {msg.message}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/20 flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t('typeMessage')}
                  className="flex-1 bg-white/20 text-white rounded-full px-4 py-2 text-sm focus:outline-none"
                />
                <button onClick={sendMessage} className="text-white">
                  <FiSend />
                </button>
              </div>
            </div>
            
            {/* Likes Counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              <FiHeart className="inline mr-1 text-red-500" /> {likes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}