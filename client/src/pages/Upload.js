import { useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Upload() {
  const { t } = useTranslation();
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('post'); // post, reel, video
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('caption', caption);
    files.forEach(file => formData.append('media', file));
    formData.append('type', type);

    try {
      if (type === 'reel') {
        await api.post('/api/videos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert(`🇷🇼 ${t('upload')} ${type} successful!`);
      setCaption('');
      setFiles([]);
    } catch (error) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rwandaBlue via-indigo-500 to-rwandaGreen pt-16">
      <Navbar />
      
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-black text-white text-center mb-8 drop-shadow-2xl">
          🇷🇼 {t('upload').toUpperCase()}
        </h1>

        <form onSubmit={handleUpload} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType('post')}
              className={`p-4 rounded-2xl font-bold transition-all ${type === 'post' ? 'bg-white/50 shadow-lg' : 'bg-white/10'}`}
            >
              📸 Photo
            </button>
            <button
              type="button"
              onClick={() => setType('reel')}
              className={`p-4 rounded-2xl font-bold transition-all ${type === 'reel' ? 'bg-white/50 shadow-lg' : 'bg-white/10'}`}
            >
              🎬 Reel
            </button>
            <button
              type="button"
              onClick={() => setType('video')}
              className={`p-4 rounded-2xl font-bold transition-all ${type === 'video' ? 'bg-white/50 shadow-lg' : 'bg-white/10'}`}
            >
              ▶️ Video
            </button>
          </div>

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What's happening in Rwanda? 🇷🇼`}
            className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:ring-2 focus:ring-white mb-4 min-h-[100px]"
            maxLength={500}
          />

          {/* File upload */}
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rwandaBlue file:text-white hover:file:bg-rwandaBlue/90 mb-6"
          />

          {/* Preview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6 max-h-48 overflow-y-auto p-2 bg-black/30 rounded-xl">
            {files.map((file, i) => (
              <video key={i} src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded-lg" muted />
            ))}
          </div>

          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="w-full bg-white text-rwandaBlue font-black py-4 px-8 rounded-3xl text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : `Share ${type.toUpperCase()} 🇷🇼`}
          </button>
        </form>
      </div>
    </div>
  );
}