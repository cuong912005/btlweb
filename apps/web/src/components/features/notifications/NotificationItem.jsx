import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Users, 
  MessageSquare,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';

const NotificationItem = ({ notification, onClick }) => {
  const { markAsRead } = useNotificationStore();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (onClick) {
      onClick();
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'EVENT_APPROVAL_REQUIRED':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'EVENT_STATUS_CHANGE':
        return notification.data?.status === 'APPROVED' 
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <XCircle className="h-5 w-5 text-red-500" />;
      case 'NEW_REGISTRATION':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'REGISTRATION_STATUS_CHANGE':
        return notification.data?.status === 'APPROVED'
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get background color based on read status
  const getBgColor = () => {
    return notification.isRead ? 'bg-white' : 'bg-blue-50';
  };

  const timeAgo = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })
    : 'Vừa xong';

  return (
    <div
      onClick={handleClick}
      className={`${getBgColor()} p-4 hover:bg-gray-50 cursor-pointer transition-colors`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'font-normal' : 'font-semibold'} text-gray-900`}>
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.body}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {timeAgo}
          </p>
        </div>

        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
