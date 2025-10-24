import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import TweetComposer from '../components/TweetComposer';
import TweetCard from '../components/TweetCard';
import api from '../lib/axios';
import { Sparkles } from 'lucide-react';

const Home = () => {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchTweets();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchTweets(page + 1);
    }
  }, [inView]);

  const fetchTweets = async (pageNum = 1) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { data } = await api.get(`/tweets/feed?page=${pageNum}&limit=20`);
      
      if (pageNum === 1) {
        setTweets(data.tweets);
      } else {
        setTweets(prev => [...prev, ...data.tweets]);
      }
      
      setPage(pageNum);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweetCreated = (newTweet) => {
    setTweets(prev => [newTweet, ...prev]);
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Home</h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tweet Composer */}
      <TweetComposer onTweetCreated={handleTweetCreated} />

      {/* Feed */}
      <div>
        {tweets.map((tweet) => (
          <TweetCard key={tweet._id} tweet={tweet} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && <div ref={ref} className="h-20" />}

        {/* End of feed */}
        {!hasMore && tweets.length > 0 && (
          <div className="text-center p-8 text-gray-500">
            You're all caught up!
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tweets.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">No tweets yet</p>
            <p className="text-sm text-gray-400">Follow some users to see their tweets here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
