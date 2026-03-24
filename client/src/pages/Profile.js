import { useEffect, useState, useContext, useCallback } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const fetchUserPosts = useCallback(async () => {
    if (!user) return;
    const res = await api.get("/posts");
    const userPosts = res.data.filter((p) => p.user_id === user.id);
    setPosts(userPosts);
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const res = await api.get(`/follows/${user.id}`);
    setStats(res.data);
  }, [user]);

  const handleFollow = async () => {
    await api.post("/follows", { following_id: user.id });
    fetchStats();
  };

  useEffect(() => {
    fetchUserPosts();
    fetchStats();
  }, [fetchUserPosts, fetchStats]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="pt-16 max-w-md mx-auto">
        <div className="flex items-center p-4 bg-white border mb-4">
          <div className="w-16 h-16 rounded-full bg-rwandaBlue text-white flex items-center justify-center text-2xl">
            {user.username[0].toUpperCase()}
          </div>

          <div className="ml-4">
            <h2 className="font-bold">{user.username}</h2>
            <p className="text-gray-500">
              {posts.length} posts • {stats.followers} followers • {stats.following} following
            </p>

            <button
              onClick={handleFollow}
              className="bg-rwandaBlue text-white px-3 py-1 rounded mt-2"
            >
              Follow
            </button>
          </div>
        </div>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} refresh={fetchUserPosts} />
        ))}
      </div>
    </div>
  );
}