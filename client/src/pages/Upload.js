import { useState } from "react";
import { api } from "../services/api";

export default function Upload({ navigate }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    if (media) formData.append("media", media);

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Post uploaded!");
      setContent("");
      setMedia(null);
      navigate("/"); // redirect to feed
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl font-bold mb-4">Upload Post</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleUpload} className="flex flex-col space-y-2">
        <textarea
          placeholder="Write something..."
          className="border p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setMedia(e.target.files[0])}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Upload
        </button>
      </form>
    </div>
  );
}