import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Twitter } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <Twitter className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ChirpX</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect with the world
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
