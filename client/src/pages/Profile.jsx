import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, Camera } from 'lucide-react';
import { useSelector } from 'react-redux';
import TweetCard from '../components/TweetCard';
import api from '../lib/axios';
import { formatDate, formatNumber } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('tweets');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchUserProfile();
    fetchUserTweets();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get(`/users/${username}`);
      setUser(data.user);
      // Check if current user is in followers array
      const isUserFollowing = data.user.followers?.some(
        follower => follower.toString() === currentUser?._id || follower._id === currentUser?._id
      );
      setIsFollowing(isUserFollowing || false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTweets = async () => {
    try {
      const { data } = await api.get(`/users/${username}/tweets`);
      setTweets(data.tweets);
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${user._id}/follow`);
        setIsFollowing(false);
        toast.success('Unfollowed');
        // Update follower count
        setUser(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount - 1
          }
        }));
      } else {
        await api.post(`/users/${user._id}/follow`);
        setIsFollowing(true);
        toast.success('Following');
        // Update follower count
        setUser(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount + 1
          }
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-xl font-bold mb-2">This account doesn't exist</p>
        <p className="text-gray-500">Try searching for another.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 p-4">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <p className="text-sm text-gray-500">{formatNumber(user.stats?.tweetsCount || 0)} tweets</p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600">
          {user.banner?.url && (
            <img src={user.banner.url} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full">
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="relative">
            <img
              src={user.avatar?.url || DEFAULT_AVATAR}
              alt={user.displayName}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-gray-200 dark:bg-gray-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-16">
            {isOwnProfile ? (
              <Link to="/settings" className="btn-outline">
                Edit profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={isFollowing ? 'btn-outline' : 'btn-primary'}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user.displayName}
              {user.isVerified && <span className="text-primary-500">✓</span>}
            </h2>
            <p className="text-gray-500">@{user.username}</p>
          </div>

          {user.bio && <p className="whitespace-pre-wrap">{user.bio}</p>}

          <div className="flex flex-wrap gap-4 text-gray-500">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to={`/${username}/following`} className="hover:underline">
              <span className="font-bold">{formatNumber(user.stats?.followingCount || 0)}</span>
              <span className="text-gray-500 ml-1">Following</span>
            </Link>
            <Link to={`/${username}/followers`} className="hover:underline">
              <span className="font-bold">{formatNumber(user.stats?.followersCount || 0)}</span>
              <span className="text-gray-500 ml-1">Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          {['tweets', 'replies', 'media', 'likes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-semibold capitalize hover:bg-gray-100 dark:hover:bg-gray-900 ${
                activeTab === tab
                  ? 'border-b-4 border-primary-500 text-primary-500'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tweets */}
      <div>
        {tweets.length > 0 ? (
          tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
        ) : (
          <div className="text-center p-8 text-gray-500">
            No tweets yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
