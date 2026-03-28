// client/src/components/PostManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/admin/posts?page=${page}&search=${search}`, {
                headers: { Authorization: token }
            });
            setPosts(response.data.posts || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
                    headers: { Authorization: token }
                });
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {post.media_url ? (
                                                <img src={post.media_url} alt="post" className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                    <Image size={20} className="text-gray-500" />
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {post.caption || 'No caption'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{post.username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{post.likes_count || 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{post.comments_count || 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostManagement;