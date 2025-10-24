import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { formatNumber } from '../lib/utils';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const { data } = await api.get('/lists');
      setLists(data.lists);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
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
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Lists</h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lists */}
      <div>
        {lists.length > 0 ? (
          lists.map((list) => (
            <Link
              key={list._id}
              to={`/lists/${list._id}`}
              className="block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{list.name}</h3>
                  {list.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{list.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(list.stats?.membersCount || 0)} members
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center p-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-bold mb-2">You haven't created any Lists yet</p>
            <p className="text-gray-500 mb-4">
              When you do, it'll show up here.
            </p>
            <button className="btn-primary">Create a List</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lists;
