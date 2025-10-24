import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal } from 'lucide-react';
import { formatDate, formatNumber, linkifyText } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';
import { useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const TweetCard = ({ tweet, onUpdate }) => {
  const navigate = useNavigate();
  
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted || false);
  const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(tweet.stats?.likesCount || 0);
  const [retweetsCount, setRetweetsCount] = useState(tweet.stats?.retweetsCount || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      if (isLiked) {
        await api.delete(`/tweets/${tweet._id}/like`);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await api.post(`/tweets/${tweet._id}/like`);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to like tweet');
    }
  };

  const handleRetweet = async (e) => {
    e.preventDefault();
    try {
      if (isRetweeted) {
        await api.delete(`/tweets/${tweet._id}/retweet`);
        setIsRetweeted(false);
        setRetweetsCount(prev => prev - 1);
      } else {
        await api.post(`/tweets/${tweet._id}/retweet`);
        setIsRetweeted(true);
        setRetweetsCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to retweet');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    try {
      if (isBookmarked) {
        // Would need bookmark ID to delete
        toast.success('Removed from bookmarks');
        setIsBookmarked(false);
      } else {
        await api.post('/bookmarks', { tweetId: tweet._id });
        toast.success('Added to bookmarks');
        setIsBookmarked(true);
      }
    } catch (error) {
      toast.error('Failed to bookmark');
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    navigate(`/tweet/${tweet._id}`);
  };

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/${tweet.author?.username}`}>
          <img
            src={tweet.author?.avatar?.url || DEFAULT_AVATAR}
            alt={tweet.author?.displayName}
            className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <Link to={`/${tweet.author?.username}`} className="flex items-center gap-1 hover:underline">
              <span className="font-bold">{tweet.author?.displayName}</span>
              {tweet.author?.isVerified && (
                <span className="text-primary-500">✓</span>
              )}
              <span className="text-gray-500 ml-1">@{tweet.author?.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{formatDate(tweet.createdAt)}</span>
            </Link>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <Link to={`/tweet/${tweet._id}`} className="block">
            {tweet.content && (
              <p
                className="mb-3 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: linkifyText(tweet.content) }}
              />
            )}

            {/* Media */}
            {tweet.media && tweet.media.length > 0 && (
              <div className={`grid gap-2 mb-3 rounded-2xl overflow-hidden ${
                tweet.media.length === 1 ? 'grid-cols-1' : 
                tweet.media.length === 2 ? 'grid-cols-2' : 
                tweet.media.length === 3 ? 'grid-cols-2' : 
                'grid-cols-2'
              }`}>
                {tweet.media.map((media, index) => (
                  <div key={index} className={tweet.media.length === 3 && index === 0 ? 'col-span-2' : ''}>
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt="Tweet media"
                        className="w-full h-full object-cover max-h-96"
                      />
                    ) : media.type === 'video' ? (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-full object-cover max-h-96"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Poll */}
            {tweet.poll && (
              <div className="mb-3 space-y-2">
                {tweet.poll.options.map((option, index) => {
                  const percentage = tweet.poll.totalVotes > 0
                    ? Math.round((option.votes.length / tweet.poll.totalVotes) * 100)
                    : 0;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="flex justify-between items-center relative z-10">
                          <span>{option.text}</span>
                          <span className="font-bold">{percentage}%</span>
                        </div>
                        <div
                          className="absolute inset-0 bg-primary-500/20 rounded-lg"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-sm text-gray-500">
                  {formatNumber(tweet.poll.totalVotes)} votes · {formatDate(tweet.poll.endsAt)}
                </p>
              </div>
            )}

            {/* Quoted Tweet */}
            {tweet.quotedTweet && (
              <div className="border border-gray-300 dark:border-gray-700 rounded-2xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={tweet.quotedTweet.author?.avatar?.url || DEFAULT_AVATAR}
                    alt={tweet.quotedTweet.author?.displayName}
                    className="w-5 h-5 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="font-bold text-sm">{tweet.quotedTweet.author?.displayName}</span>
                  <span className="text-gray-500 text-sm">@{tweet.quotedTweet.author?.username}</span>
                </div>
                <p className="text-sm">{tweet.quotedTweet.content}</p>
              </div>
            )}
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            <button 
              onClick={handleComment}
              className="flex items-center gap-2 text-gray-500 hover:text-primary-500 group"
            >
              <div className="p-2 rounded-full group-hover:bg-primary-500/10">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">{formatNumber(tweet.stats?.repliesCount || 0)}</span>
            </button>

            <button
              onClick={handleRetweet}
              className={`flex items-center gap-2 group ${
                isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-sm">{formatNumber(retweetsCount)}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-sm">{formatNumber(likesCount)}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 group ${
                isBookmarked ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-primary-500/10">
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>

            <button className="flex items-center gap-2 text-gray-500 hover:text-primary-500 group">
              <div className="p-2 rounded-full group-hover:bg-primary-500/10">
                <Share className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TweetCard;
