// client/src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Image,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  BarChart2
} from 'lucide-react';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import CommentManagement from './CommentManagement';
import Analytics from './Analytics';
import SystemLogs from './SystemLogs';
import axios from 'axios';

const AdminDashboard = ({ initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchAdminInfo();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchAdminInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setAdminInfo(user);
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, color: 'text-purple-500' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-green-500' },
    { id: 'posts', label: 'Posts', icon: Image, color: 'text-pink-500' },
    { id: 'comments', label: 'Comments', icon: MessageCircle, color: 'text-yellow-500' },
    { id: 'logs', label: 'System Logs', icon: Activity, color: 'text-gray-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-red-500' },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} loading={loading} />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
      case 'posts':
        return <PostManagement />;
      case 'comments':
        return <CommentManagement />;
      case 'logs':
        return <SystemLogs />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Settings</h3>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardStats stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-800">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">iWacuHub Admin</h1>
              <p className="text-xs text-gray-400 mt-1">Control Panel</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 mt-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                activeTab === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <item.icon size={20} className={item.color} />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Admin Info */}
        {sidebarOpen && adminInfo && (
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium">{adminInfo.full_name?.[0] || adminInfo.username?.[0]}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{adminInfo.full_name || adminInfo.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;