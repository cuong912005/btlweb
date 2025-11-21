import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Send } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import NotificationItem from '../../components/features/notifications/NotificationItem';
import PushNotificationToggle from '../../components/features/notifications/PushNotificationToggle';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, isLoading, fetchNotifications, markAllAsRead, unreadCount } = useNotificationStore();
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchNotifications();
  }, [user, navigate, fetchNotifications]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = (notification) => {
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      await api.post('/notifications/test', {
        title: 'Thông báo thử nghiệm',
        body: 'Đây là một thông báo thử nghiệm từ VolunteerHub!'
      });
      showSuccess('Thông báo thử nghiệm đã được gửi!');
    } catch (error) {
      showError('Lỗi khi gửi thông báo: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
            <p className="mt-2 text-sm text-gray-600">
              {unreadCount > 0 
                ? `Bạn có ${unreadCount} thông báo chưa đọc` 
                : 'Bạn đã đọc tất cả thông báo'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Push Notification Toggle */}
      <div className="mb-6">
        <PushNotificationToggle />
      </div>

      {/* Test Notification Button (for development/testing) */}
      <div className="mb-6">
        <button
          onClick={handleSendTestNotification}
          disabled={isSendingTest}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSendingTest ? 'Đang gửi...' : 'Gửi thông báo thử nghiệm'}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-sm text-gray-500">Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
            <p className="text-gray-500">Bạn sẽ nhận được thông báo về các hoạt động liên quan tại đây.</p>
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
    </div>
  );
};

export default NotificationsPage;
