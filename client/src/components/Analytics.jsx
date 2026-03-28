// client/src/components/Analytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Image, MessageCircle } from 'lucide-react';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/analytics', {
                headers: { Authorization: token }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Users</p>
                            <p className="text-2xl font-bold mt-2">{analytics?.userGrowth?.[0]?.new_users || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Posts</p>
                            <p className="text-2xl font-bold mt-2">{analytics?.contentDistribution?.reduce((sum, item) => sum + item.count, 0) || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <Image className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Engagement</p>
                            <p className="text-2xl font-bold mt-2">Coming Soon</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Comments</p>
                            <p className="text-2xl font-bold mt-2">Coming Soon</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100">
                            <MessageCircle className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Creators</h3>
                <div className="space-y-3">
                    {analytics?.topCreators?.map((creator, index) => (
                        <div key={creator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-500 mr-3">#{index + 1}</span>
                                <div>
                                    <p className="font-medium">{creator.full_name || creator.username}</p>
                                    <p className="text-sm text-gray-500">@{creator.username}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{creator.total_posts} posts</p>
                                <p className="text-sm text-gray-500">{creator.total_likes} likes</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;