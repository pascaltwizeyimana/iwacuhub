import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    api.get('/api/videos').then(res => {
      setReels(res.data);
      // Auto-play first video
      if (videoRef.current) videoRef.current.play();
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  }, [currentIndex]);

  const nextReel = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  if (reels.length === 0) return <div className="h-screen flex items-center justify-center">No Reels yet! 🇷🇼</div>;

  const currentReel = reels[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" onClick={nextReel}>
      <Navbar />
      <div className="flex items-center justify-center h-[100vh]">
        <button onClick={prevReel} className="absolute left-4 z-10 bg-black/50 text-white p-3 rounded-full">
          ←
        </button>
        
        <div className="w-full h-full max-w-sm flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            src={currentReel.videos[0]} // First video
            className="w-full h-[90vh] object-contain"
            loop
            muted
            playsInline
          />
          
          <div className="text-white absolute bottom-20 left-4 right-4">
            <h3 className="text-xl font-bold">{currentReel.caption || '🇷🇼 Rwanda Reel'}</h3>
            <p className="opacity-75">{currentReel.username}</p>
          </div>
          
          <div className="flex space-x-4 absolute right-4 bottom-24">
            <button className="text-2xl">❤️</button>
            <button className="text-2xl">💬</button>
            <button className="text-2xl">↗️</button>
          </div>
        </div>
        
        <button onClick={nextReel} className="absolute right-4 z-10 bg-black/50 text-white p-3 rounded-full">
          →
        </button>
      </div>
      
      {/* Mini map */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {reels.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-gray-500'}`} />
        ))}
      </div>
    </div>
  );
}

