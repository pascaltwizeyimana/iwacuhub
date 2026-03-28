// client/src/components/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Search, Filter, Award, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ 
    search: '', 
    is_verified: '', 
    is_creator: '' 
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...filters
      });
      const response = await axios.get(`http://localhost:5000/api/admin/users?${params}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, editForm, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: localStorage.getItem('token') }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const getRoleBadge = (user) => {
    if (user.role === 'admin') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Admin</span>;
    }
    if (user.is_creator) {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Creator</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">User</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">Total users: {total}</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.is_verified}
                onChange={(e) => setFilters({ ...filters, is_verified: e.target.value, page: 1 })}
              >
                <option value="">All Users</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.is_creator}
                onChange={(e) => setFilters({ ...filters, is_creator: e.target.value, page: 1 })}
              >
                <option value="">All Users</option>
                <option value="true">Creators Only</option>
                <option value="false">Regular Users</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="rounded-full h-full w-full object-cover" />
                        ) : (
                          <span>{(user.name || user.username)?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || user.full_name || user.username}
                          {user.is_verified && (
                            <CheckCircle size={14} className="inline ml-1 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <select
                        value={editForm.role || user.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      getRoleBadge(user)
                    )}
                   </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.is_verified !== undefined ? editForm.is_verified : user.is_verified}
                            onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Verified</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.is_creator !== undefined ? editForm.is_creator : user.is_creator}
                            onChange={(e) => setEditForm({ ...editForm, is_creator: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Creator</span>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {user.is_verified ? (
                          <span className="flex items-center text-xs text-green-600">
                            <CheckCircle size={12} className="mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-gray-500">
                            <XCircle size={12} className="mr-1" /> Unverified
                          </span>
                        )}
                        {user.is_creator && (
                          <span className="flex items-center text-xs text-purple-600">
                            <Award size={12} className="mr-1" /> Creator
                          </span>
                        )}
                      </div>
                    )}
                   </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>📝 {user.posts_count || 0} posts</div>
                    <div>👥 {user.followers_count || 0} followers</div>
                    <div>❤️ {user.following_count || 0} following</div>
                   </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                   </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateUser(user.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditForm({
                              username: user.username,
                              email: user.email,
                              name: user.name,
                              role: user.role,
                              is_verified: user.is_verified,
                              is_creator: user.is_creator
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <span className="text-sm text-gray-500">
                ({total} total users)
              </span>
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;