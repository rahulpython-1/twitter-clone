import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Repeat2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../lib/axios';
import { formatDate } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';
import { fetchNotifications, markAsRead, markAllAsRead } from '../redux/slices/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-8 h-8 text-red-500 fill-current" />;
      case 'retweet':
        return <Repeat2 className="w-8 h-8 text-green-500" />;
      case 'reply':
      case 'mention':
        return <MessageCircle className="w-8 h-8 text-primary-500" />;
      case 'follow':
        return <UserPlus className="w-8 h-8 text-primary-500" />;
      default:
        return null;
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
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="text-sm text-primary-500 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Link
              key={notification._id}
              to={notification.link || `/${notification.sender?.username}`}
              onClick={() => !notification.isRead && dispatch(markAsRead(notification._id))}
              className={`block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                !notification.isRead ? 'bg-primary-50 dark:bg-primary-900/10' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={notification.sender?.avatar?.url || DEFAULT_AVATAR}
                      alt={notification.sender?.displayName}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-semibold">
                      {notification.sender?.displayName}
                    </span>
                    {notification.sender?.isVerified && (
                      <span className="text-primary-500">✓</span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {notification.message}
                  </p>

                  {notification.tweet?.content && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {notification.tweet.content}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center p-8">
            <p className="text-xl font-bold mb-2">No notifications yet</p>
            <p className="text-gray-500">When someone likes, retweets, or replies to your tweets, you'll see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
