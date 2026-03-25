import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiImage, FiVideo, FiX, FiCheck } from "react-icons/fi";

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("post");
  const [uploading, setUploading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      alert("🎉 Content uploaded successfully!");
      setCaption("");
      setFiles([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiUpload /> Share Your Moment
            </h1>
            <p className="text-white/80 mt-1">Share your story with Rwanda's community</p>
          </div>

          <form onSubmit={handleUpload} className="p-6 space-y-6">
            {/* Content Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "post", label: "📸 Photo", icon: "📸" },
                  { id: "reel", label: "🎬 Reel", icon: "🎬" },
                  { id: "video", label: "▶️ Video", icon: "▶️" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setType(option.id)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      type === option.id
                        ? "bg-gradient-to-r from-yellow-400 to-green-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Media File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition">
                <input
                  type="file"
                  multiple
                  accept={type === "post" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {files.length > 0 ? (
                    <>
                      <FiCheck className="w-12 h-12 text-green-500" />
                      <p className="text-green-500 font-semibold">
                        {files.length} file(s) selected
                      </p>
                    </>
                  ) : (
                    <>
                      {type === "post" ? (
                        <FiImage className="w-12 h-12 text-gray-400" />
                      ) : (
                        <FiVideo className="w-12 h-12 text-gray-400" />
                      )}
                      <p className="text-gray-500">
                        Click to upload {type === "post" ? "images" : "videos"}
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Preview */}
            {files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preview
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  {files.map((file, i) => (
                    <div key={i} className="relative group">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-24 object-cover rounded-lg"
                          muted
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's happening in Rwanda? 🇷🇼"
                className="w-full p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                rows="4"
                maxLength="500"
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {caption.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <FiUpload className="mr-2" /> Share to IwacuHub
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}