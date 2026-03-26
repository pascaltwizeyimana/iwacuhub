import { useState } from "react";
import { api } from "../services/api";
import { FaHeart, FaRegComment } from "react-icons/fa";

export default function PostCard({ post, refresh }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    await api.post("/likes", { post_id: post.id });
    refresh();
  };

  const fetchComments = async () => {
    const res = await api.get(`/comments/${post.id}`);
    setComments(res.data);
  };

  const handleComment = async () => {
    if (!comment) return;
    await api.post("/comments", { post_id: post.id, comment });
    setComment("");
    fetchComments();
  };

  return (
    <div className="bg-white border mb-6">
      
      {/* Header */}
      <div className="flex items-center p-3">
        <div className="w-8 h-8 rounded-full bg-rwandaBlue text-white flex items-center justify-center font-bold">
          {post.username[0].toUpperCase()}
        </div>
        <span className="ml-3 font-semibold">{post.username}</span>
      </div>

      {/* Image */}
      {post.media && (
        <img
          src={`http://localhost:5000/uploads/${post.media}`}
          alt="post"
          className="w-full max-h-[500px] object-cover"
        />
      )}

      {/* Actions */}
      <div className="p-3">
        <div className="flex space-x-4 text-xl">
          <FaHeart
            onClick={handleLike}
            className="cursor-pointer hover:text-red-500"
          />
          <FaRegComment
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) fetchComments();
            }}
            className="cursor-pointer"
          />
        </div>

        {/* Caption */}
        <p className="mt-2">
          <span className="font-semibold">{post.username}</span>{" "}
          {post.content}
        </p>

        {/* Comments */}
        {showComments && (
          <div className="mt-2">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-semibold">{c.username}</span>{" "}
                {c.comment}
              </div>
            ))}

            <div className="flex mt-2 border-t pt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 outline-none"
              />
              <button
                onClick={handleComment}
                className="text-rwandaBlue font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}