import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ChatBubbleLeftIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const DashboardEventCard = ({ event, variant = 'default' }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Môi trường': 'bg-green-100 text-green-800',
      'Giáo dục': 'bg-blue-100 text-blue-800',
      'Y tế': 'bg-red-100 text-red-800',
      'Cộng đồng': 'bg-purple-100 text-purple-800',
      'Từ thiện': 'bg-yellow-100 text-yellow-800',
      'Cứu trợ thiên tai': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  // For newly published events
  if (variant === 'new') {
    return (
      <div 
        onClick={handleClick}
        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-teal-300 group transform hover:-translate-y-1"
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
        
        <div className="p-5">
          {/* Header with badge */}
          <div className="flex items-start justify-between mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            <div className="flex items-center text-xs text-white bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-1 rounded-full shadow-md">
              <SparklesIcon className="h-3 w-3 mr-1 animate-pulse" />
              Mới
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Event info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-teal-500" />
              <span className="font-medium">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-cyan-500" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm font-semibold text-gray-700">
                <UserGroupIcon className="h-4 w-4 mr-1.5 text-teal-500" />
                <span>{event.participantCount}</span>
              </div>
              <div className="flex items-center text-sm font-semibold text-gray-700">
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1.5 text-cyan-500" />
                <span>{event.postCount}</span>
              </div>
            </div>
            {event.organizer && (
              <div className="flex items-center">
                {event.organizer.avatar ? (
                  <img 
                    src={event.organizer.avatar} 
                    alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                    className="h-7 w-7 rounded-full ring-2 ring-teal-200"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center ring-2 ring-teal-200">
                    <span className="text-xs font-bold text-teal-600">
                      {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For trending events
  if (variant === 'trending') {
    return (
      <div 
        onClick={handleClick}
        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-orange-300 group transform hover:-translate-y-1"
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600"></div>
        
        <div className="p-5">
          {/* Header with trending badge */}
          <div className="flex items-start justify-between mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            <div className="flex items-center text-xs text-white bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-1 rounded-full shadow-md animate-pulse">
              <FireIcon className="h-3 w-3 mr-1" />
              Hot
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {event.description}
          </p>

          {/* Event info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
              <span className="font-medium">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-amber-500" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Recent Activity Stats */}
          {event.recentActivity && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 mb-3 border border-orange-100">
              <div className="text-xs font-bold text-orange-900 mb-2">
                📊 Hoạt động (7 ngày)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <span className="text-gray-600">Thành viên:</span>
                  <span className="font-bold text-orange-700 ml-1">
                    +{event.recentActivity.newMembers}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">Bài đăng:</span>
                  <span className="font-bold text-orange-700 ml-1">
                    +{event.recentActivity.newPosts}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">Likes:</span>
                  <span className="font-bold text-orange-700 ml-1">
                    {event.recentActivity.likes}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-bold text-orange-700 ml-1">
                    {event.recentActivity.comments}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Score */}
          {event.engagementScore !== undefined && (
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
              <div className="text-sm font-semibold">
                <span className="text-gray-600">Score: </span>
                <span className="text-orange-600 text-lg">
                  {event.engagementScore}
                </span>
              </div>
              {event.organizer && (
                <div className="flex items-center">
                  {event.organizer.avatar ? (
                    <img 
                      src={event.organizer.avatar} 
                      alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                      className="h-7 w-7 rounded-full ring-2 ring-orange-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center ring-2 ring-orange-200">
                      <span className="text-xs font-bold text-orange-600">
                        {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)} mb-3`}>
          {event.category}
        </span>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {event.location}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEventCard;
