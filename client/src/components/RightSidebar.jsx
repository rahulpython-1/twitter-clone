import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import api from '../lib/axios';
import { formatNumber } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchTrending();
    fetchSuggestedUsers();
  }, []);

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/trending/topics?limit=5');
      setTrending(data.trending);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const { data } = await api.get('/trending/users?limit=3');
      setSuggestedUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="sticky top-0 bg-white dark:bg-black z-10 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search ChirpX"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </form>

      {/* Trending */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending
        </h2>
        <div className="space-y-4">
          {trending.map((topic, index) => (
            <Link
              key={topic._id}
              to={`/search/hashtag/${topic._id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">#{index + 1} Trending</p>
                  <p className="font-bold">#{topic._id}</p>
                  <p className="text-sm text-gray-500">
                    {formatNumber(topic.count)} tweets
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to="/explore"
          className="block text-primary-500 hover:underline mt-4 text-sm"
        >
          Show more
        </Link>
      </div>

      {/* Who to follow */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between">
              <Link to={`/${user.username}`} className="flex items-center gap-3 flex-1">
                <img
                  src={user.avatar?.url || DEFAULT_AVATAR}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate flex items-center gap-1">
                    {user.displayName}
                    {user.isVerified && <span className="text-primary-500">✓</span>}
                  </p>
                  <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                </div>
              </Link>
              <button className="btn-outline text-sm px-4 py-1">Follow</button>
            </div>
          ))}
        </div>
        <Link
          to="/explore"
          className="block text-primary-500 hover:underline mt-4 text-sm"
        >
          Show more
        </Link>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-2 px-4">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
        </div>
        <p>© 2025 ChirpX, Inc.</p>
      </div>
    </div>
  );
};

export default RightSidebar;
