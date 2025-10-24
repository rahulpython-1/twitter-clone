import { useState, useRef } from 'react';
import { Image, BarChart3, Calendar, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { DEFAULT_AVATAR } from '../lib/constants';

const TweetComposer = ({ onTweetCreated, replyTo, quoteTweet }) => {
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && media.length === 0) {
      toast.error('Tweet cannot be empty');
      return;
    }

    if (content.length > maxLength) {
      toast.error('Tweet is too long');
      return;
    }

    setIsLoading(true);

    try {
      const tweetData = {
        content: content.trim(),
        media: media.map(m => ({ data: m.data, type: m.type })),
      };

      if (replyTo) {
        tweetData.replyTo = replyTo;
      }

      if (quoteTweet) {
        tweetData.quotedTweet = quoteTweet;
      }

      const { data } = await api.post('/tweets', tweetData);
      
      toast.success(replyTo ? 'Reply posted!' : 'Tweet posted!');
      setContent('');
      setMedia([]);
      
      if (onTweetCreated) {
        onTweetCreated(data.tweet);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post tweet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (media.length + files.length > 4) {
      toast.error('Maximum 4 media files allowed');
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setMedia(prev => [...prev, {
          data: e.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          file
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <div className="flex gap-3">
        <img
          src={user?.avatar?.url || DEFAULT_AVATAR}
          alt={user?.displayName}
          className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_AVATAR;
          }}
        />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? 'Tweet your reply' : "What's happening?"}
            className="w-full bg-transparent text-xl resize-none focus:outline-none min-h-[100px]"
            maxLength={maxLength + 50}
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className={`grid gap-2 mb-3 ${
              media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {media.map((item, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.data} alt="Upload" className="w-full h-48 object-cover" />
                  ) : (
                    <video src={item.data} className="w-full h-48 object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-primary-500/10 text-primary-500 rounded-full"
                disabled={media.length >= 4}
              >
                <Image className="w-5 h-5" />
              </button>

              <button className="p-2 hover:bg-primary-500/10 text-primary-500 rounded-full">
                <BarChart3 className="w-5 h-5" />
              </button>

              <button className="p-2 hover:bg-primary-500/10 text-primary-500 rounded-full">
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className={`text-sm ${
                    remainingChars < 0 ? 'text-red-500' : 
                    remainingChars < 20 ? 'text-yellow-500' : 
                    'text-gray-500'
                  }`}>
                    {remainingChars < 20 && remainingChars}
                  </div>
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-300 dark:text-gray-700"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - content.length / maxLength)}`}
                      className={
                        remainingChars < 0 ? 'text-red-500' : 
                        remainingChars < 20 ? 'text-yellow-500' : 
                        'text-primary-500'
                      }
                    />
                  </svg>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || (!content.trim() && media.length === 0) || remainingChars < 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Posting...' : replyTo ? 'Reply' : 'Tweet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
