// client/src/components/DashboardStats.jsx
import React from 'react';
import { Users, UserCheck, UserPlus, Image, Heart, MessageCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                ) : (
                    <p className="text-2xl font-bold mt-2">{value || 0}</p>
                )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="text-white" size={24} />
            </div>
        </div>
    </div>
);

const DashboardStats = ({ stats, loading }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Users"
                value={stats?.users?.totalUsers}
                icon={Users}
                color="bg-blue-500"
                loading={loading}
            />
            <StatCard
                title="Verified Users"
                value={stats?.users?.verifiedUsers}
                icon={UserCheck}
                color="bg-green-500"
                loading={loading}
            />
            <StatCard
                title="Creators"
                value={stats?.users?.creatorUsers}
                icon={UserPlus}
                color="bg-purple-500"
                loading={loading}
            />
            <StatCard
                title="New Today"
                value={stats?.users?.newToday}
                icon={UserPlus}
                color="bg-orange-500"
                loading={loading}
            />
            <StatCard
                title="Total Posts"
                value={stats?.posts?.totalPosts}
                icon={Image}
                color="bg-pink-500"
                loading={loading}
            />
            <StatCard
                title="Total Likes"
                value={stats?.posts?.totalLikes}
                icon={Heart}
                color="bg-red-500"
                loading={loading}
            />
            <StatCard
                title="Total Comments"
                value={stats?.posts?.totalComments}
                icon={MessageCircle}
                color="bg-yellow-500"
                loading={loading}
            />
        </div>
    );
};

export default DashboardStats;