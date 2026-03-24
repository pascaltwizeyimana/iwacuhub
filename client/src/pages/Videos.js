import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef(null);

  const fetchVideos = async () => {
    try {
      const res = await api.get('/api/posts?type=video'); // Assume video posts
      setVideos(res.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Call fetchVideos when component mounts
  useEffect(() => {
    fetchVideos();
  }, []);

  const playVideo = (video) => {
    setSelectedVideo(video);
    videoRef.current?.load();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="pt-16">
        <h1 className="text-3xl font-bold text-center p-8 bg-gradient-to-r from-rwandaBlue to-rwandaGreen">
          🇷🇼 Rwanda Videos
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all">
              <video
                src={video.media}
                className="w-full h-48 object-cover"
                onClick={() => playVideo(video)}
              />
              <div className="p-4">
                <h3 className="font-bold">{video.caption}</h3>
                <p className="text-gray-400">{video.username} • {video.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ×
          </button>
          <video
            ref={videoRef}
            src={selectedVideo.media}
            className="max-w-2xl max-h-[80vh] mx-auto"
            controls
            autoPlay
          />
          <div className="absolute bottom-20 left-4 text-white">
            <h2 className="text-2xl font-bold">{selectedVideo.caption}</h2>
            <p>{selectedVideo.username} • 🇷🇼 Made in Rwanda</p>
          </div>
        </div>
      )}
    </div>
  );
}