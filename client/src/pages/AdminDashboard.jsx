import { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, Shield, Ban, Check } from 'lucide-react';
import api from '../lib/axios';
import { formatNumber, formatDate } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users?limit=10');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary-500" />
              <h3 className="font-semibold text-gray-500">Total Users</h3>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats?.users?.total || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatNumber(stats?.users?.active || 0)} active
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-green-500" />
              <h3 className="font-semibold text-gray-500">Total Tweets</h3>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats?.tweets?.total || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatNumber(stats?.tweets?.today || 0)} today
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <h3 className="font-semibold text-gray-500">Verified Users</h3>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats?.users?.verified || 0)}</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar?.url || DEFAULT_AVATAR}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <div>
                          <p className="font-semibold">{user.displayName}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{formatNumber(user.stats?.followersCount || 0)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          user.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="text-sm text-primary-500 hover:underline"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleSuspendUser(user._id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
