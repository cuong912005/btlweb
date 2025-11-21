import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, X, Bell } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { notifications, isLoading, markAllAsRead, unreadCount } = useNotificationStore();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = (notification) => {
    // Navigate to relevant page based on notification type
    if (notification.url) {
      navigate(notification.url);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Đọc tất cả</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-500">Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Không có thông báo mới</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
