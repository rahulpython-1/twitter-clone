import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TweetCard from '../components/TweetCard';
import TweetComposer from '../components/TweetComposer';
import api from '../lib/axios';

const TweetDetail = () => {
  const { id } = useParams();
  const [tweet, setTweet] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTweet();
    fetchReplies();
  }, [id]);

  const fetchTweet = async () => {
    try {
      const { data } = await api.get(`/tweets/${id}`);
      setTweet(data.tweet);
    } catch (error) {
      console.error('Failed to fetch tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data } = await api.get(`/tweets/${id}/replies`);
      setReplies(data.replies);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    }
  };

  const handleReplyCreated = (newReply) => {
    setReplies(prev => [newReply, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="text-center p-8">
        <p className="text-xl font-bold">Tweet not found</p>
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
          <h1 className="text-xl font-bold">Tweet</h1>
        </div>
      </div>

      {/* Tweet */}
      <TweetCard tweet={tweet} />

      {/* Reply Composer */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <TweetComposer replyTo={tweet._id} onTweetCreated={handleReplyCreated} />
      </div>

      {/* Replies */}
      <div>
        {replies.length > 0 ? (
          replies.map((reply) => <TweetCard key={reply._id} tweet={reply} />)
        ) : (
          <div className="text-center p-8 text-gray-500">
            No replies yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetDetail;
