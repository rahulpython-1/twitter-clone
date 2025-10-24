import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Desktop */}
        <div className="hidden md:block w-20 lg:w-64 sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-h-screen">
          <Outlet />
        </main>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block w-80 sticky top-0 h-screen overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default MainLayout;
