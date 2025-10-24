import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Mail, User } from 'lucide-react';
import { useSelector } from 'react-redux';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const navItems = [
    { icon: Home, path: '/' },
    { icon: Search, path: '/explore' },
    { icon: Bell, path: '/notifications', badge: unreadCount },
    { icon: Mail, path: '/messages' },
    { icon: User, path: `/${user?.username}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center w-full h-full relative ${
                isActive ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute top-2 right-1/4 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
