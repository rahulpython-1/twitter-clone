import { useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../redux/slices/themeSlice';
import { updateUserProfile } from '../redux/slices/authSlice';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('account');

  const [accountSettings, setAccountSettings] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const [notificationSettings, setNotificationSettings] = useState(
    user?.settings?.notifications || {}
  );

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(accountSettings));
  };

  const handleNotificationUpdate = async () => {
    try {
      await api.put('/users/settings', {
        settings: { notifications: notificationSettings },
      });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'account' ? 'font-bold border-r-4 border-primary-500' : ''
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'notifications' ? 'font-bold border-r-4 border-primary-500' : ''
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'display' ? 'font-bold border-r-4 border-primary-500' : ''
            }`}
          >
            Display
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 ${
              activeTab === 'privacy' ? 'font-bold border-r-4 border-primary-500' : ''
            }`}
          >
            Privacy & Safety
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Account Information</h2>
              <form onSubmit={handleAccountUpdate} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={accountSettings.displayName}
                    onChange={(e) =>
                      setAccountSettings({ ...accountSettings, displayName: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={accountSettings.bio}
                    onChange={(e) =>
                      setAccountSettings({ ...accountSettings, bio: e.target.value })
                    }
                    className="input-field"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {accountSettings.bio.length}/160
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={accountSettings.location}
                    onChange={(e) =>
                      setAccountSettings({ ...accountSettings, location: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={accountSettings.website}
                    onChange={(e) =>
                      setAccountSettings({ ...accountSettings, website: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        email: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Likes</p>
                    <p className="text-sm text-gray-500">When someone likes your tweet</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.likes}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        likes: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Retweets</p>
                    <p className="text-sm text-gray-500">When someone retweets your tweet</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.retweets}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        retweets: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Follows</p>
                    <p className="text-sm text-gray-500">When someone follows you</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.follows}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        follows: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </div>

                <button onClick={handleNotificationUpdate} className="btn-primary">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Display Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <p className="font-medium mb-4">Theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => dispatch(setTheme('light'))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        theme === 'light'
                          ? 'border-primary-500'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <Sun className="w-8 h-8" />
                      <span>Light</span>
                    </button>

                    <button
                      onClick={() => dispatch(setTheme('dark'))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        theme === 'dark'
                          ? 'border-primary-500'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <Moon className="w-8 h-8" />
                      <span>Dark</span>
                    </button>

                    <button
                      onClick={() => dispatch(setTheme('auto'))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        theme === 'auto'
                          ? 'border-primary-500'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <Monitor className="w-8 h-8" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Privacy & Safety</h2>
              <div className="space-y-4 max-w-lg">
                <div className="py-3 border-b border-gray-200 dark:border-gray-800">
                  <p className="font-medium mb-2">Blocked Accounts</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Manage accounts you've blocked
                  </p>
                  <button className="text-primary-500 hover:underline">
                    View blocked accounts
                  </button>
                </div>

                <div className="py-3 border-b border-gray-200 dark:border-gray-800">
                  <p className="font-medium mb-2">Muted Accounts</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Manage accounts you've muted
                  </p>
                  <button className="text-primary-500 hover:underline">
                    View muted accounts
                  </button>
                </div>

                <div className="py-3 border-b border-gray-200 dark:border-gray-800">
                  <p className="font-medium mb-2">Private Account</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Only approved followers can see your tweets
                  </p>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
