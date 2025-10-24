import { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import TweetCard from '../components/TweetCard';
import api from '../lib/axios';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks');
      setBookmarks(data.bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-xl font-bold">Bookmarks</h1>
          <p className="text-sm text-gray-500">@{/* currentUser username */}</p>
        </div>
      </div>

      {/* Bookmarks */}
      <div>
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => (
            <TweetCard key={bookmark._id} tweet={bookmark.tweet} />
          ))
        ) : (
          <div className="text-center p-8">
            <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-bold mb-2">Save Tweets for later</p>
            <p className="text-gray-500">
              Don't let the good ones fly away! Bookmark Tweets to easily find them again in the future.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
