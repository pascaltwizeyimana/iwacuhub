import { useEffect, useState } from "react";
import { api } from "../services/api";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import Stories from "../components/Stories";

export default function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await api.get("/posts");
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
  <Navbar />

  <div className="pt-16 w-full max-w-md mx-auto px-2 sm:px-4">
    {posts.map((post) => (
      <PostCard key={post.id} post={post} refresh={fetchPosts} />
    ))}
  </div>
</div>
  );
}