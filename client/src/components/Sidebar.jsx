import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  Bookmark, 
  List, 
  User, 
  Settings,
  LogOut,
  Twitter,
  Shield
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { DEFAULT_AVATAR } from '../lib/constants';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: List, label: 'Lists', path: '/lists' },
    { icon: User, label: 'Profile', path: `/${user?.username}` },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <Link to="/" className="mb-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full w-fit">
        <Twitter className="w-8 h-8 text-primary-500" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-900 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xl">{item.label}</span>
            </Link>
          );
        })}

        <Link
          to="/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <Settings className="w-6 h-6" />
          <span className="hidden lg:block text-xl">Settings</span>
        </Link>
      </nav>

      {/* Tweet Button */}
      <button className="btn-primary w-full mb-4 hidden lg:block">
        Tweet
      </button>
      <button className="btn-primary w-12 h-12 rounded-full lg:hidden flex items-center justify-center">
        <Twitter className="w-6 h-6" />
      </button>

      {/* User Profile */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 w-full transition-colors"
        >
          <img
            src={user?.avatar?.url || DEFAULT_AVATAR}
            alt={user?.displayName}
            className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          <div className="hidden lg:block flex-1 text-left">
            <p className="font-semibold text-sm">{user?.displayName}</p>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
          </div>
          <LogOut className="w-5 h-5 hidden lg:block" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
