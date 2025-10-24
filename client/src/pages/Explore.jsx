import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import TweetCard from '../components/TweetCard';
import api from '../lib/axios';
import { formatNumber } from '../lib/utils';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [tweets, setTweets] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExploreFeed();
    fetchTrending();
  }, []);

  const fetchExploreFeed = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/trending/explore');
      setTweets(data.tweets);
    } catch (error) {
      console.error('Failed to fetch explore feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/trending/topics?limit=10');
      setTrending(data.trending);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(`/search/tweets?q=${encodeURIComponent(searchQuery)}`);
      setTweets(data.tweets);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search ChirpX"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </form>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex-1 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'for-you'
                ? 'border-b-4 border-primary-500 text-primary-500'
                : 'text-gray-500'
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'trending'
                ? 'border-b-4 border-primary-500 text-primary-500'
                : 'text-gray-500'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'for-you' ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : tweets.length > 0 ? (
            tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
          ) : (
            <div className="text-center p-8 text-gray-500">
              No tweets found
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Trending Topics
          </h2>
          {trending.map((topic, index) => (
            <Link
              key={topic._id}
              to={`/search/hashtag/${topic._id}`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">#{index + 1} Trending</p>
                  <p className="font-bold text-lg">#{topic._id}</p>
                  <p className="text-sm text-gray-500">
                    {formatNumber(topic.count)} tweets · {formatNumber(topic.totalEngagement)} engagements
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
