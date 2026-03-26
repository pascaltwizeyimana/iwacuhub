import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FiPlus, FiCheck, FiLoader } from 'react-icons/fi';

export default function SaveCollectionModal({ post, onClose, onSave }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load user's collections
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts/collections');
      if (response.data.success) {
        setCollections(response.data.collections);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
    setLoading(false);
  };

  const handleSave = async (collectionId) => {
    setSaving(true);
    setSelectedCollection(collectionId);
    try {
      const response = await api.post(`/posts/${post.id}/save`, { collectionId });
      if (response.data.success) {
        setTimeout(() => {
          if (onSave) onSave(collectionId);
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setSaving(true);
    try {
      const response = await api.post('/posts/collections', { 
        name: newCollectionName,
        icon: '📁'
      });
      if (response.data.success) {
        const newCollection = response.data.collection;
        setCollections([...collections, { ...newCollection, posts_count: 0 }]);
        setNewCollectionName('');
        setShowNewCollection(false);
        await handleSave(newCollection.id);
      }
    } catch (error) {
      console.error('Create collection failed:', error);
      alert('Failed to create collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Save to Collection</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <FiLoader className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleSave(collection.id)}
                  disabled={saving}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                    selectedCollection === collection.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{collection.icon || '📁'}</span>
                    <div className="text-left">
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-xs opacity-70">{collection.posts_count || 0} items</p>
                    </div>
                  </div>
                  {selectedCollection === collection.id && saving ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : selectedCollection === collection.id ? (
                    <FiCheck className="w-5 h-5" />
                  ) : null}
                </button>
              ))}
            </div>

            {showNewCollection ? (
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button
                  onClick={createCollection}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewCollection(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-xl hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCollection(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:text-green-500 transition-all group"
              >
                <FiPlus className="group-hover:scale-110 transition-transform" />
                <span>New Collection</span>
              </button>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}