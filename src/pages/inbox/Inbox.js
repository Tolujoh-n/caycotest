import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiCheck, FiRefreshCcw } from 'react-icons/fi';

const Inbox = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications', { params: { limit: 50 } });
      setNotifications(response.data.data || []);
    } catch (e) {
      toast.error('Failed to load inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      toast.success('Marked all as read');
      fetchNotifications();
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600 mt-1">All notifications for your account.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2" onClick={fetchNotifications}>
            <FiRefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={markAllRead}>
            <FiCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div key={n._id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${n.isRead ? 'bg-gray-300' : 'bg-primary-600'}`} />
                    <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                    <span className="text-xs text-gray-500">{n.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

