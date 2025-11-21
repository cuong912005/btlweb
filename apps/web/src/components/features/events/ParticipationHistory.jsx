import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useEventStore } from '../../../stores/eventStore';
import { 
  CalendarIcon, 
  ClockIcon,
  StarIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  TagIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import EventRating from './EventRating';
import { canRateParticipation } from '../../../utils/canRate';

// Category Image Mapping
const getCategoryImage = (category) => {
  const categoryImages = {
    'Môi trường': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80&auto=format&fit=crop',
    'Giáo dục': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop',
    'Y tế': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop',
    'Cộng đồng': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80&auto=format&fit=crop',
    'Từ thiện': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop',
    'Cứu trợ thiên tai': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80&auto=format&fit=crop',
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80&auto=format&fit=crop';
};

// Statistics Summary Component
const StatsSummary = ({ stats }) => {
  const statItems = [
    {
      label: 'Tổng sự kiện',
      value: stats.totalEvents,
      icon: CalendarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Giờ tình nguyện',
      value: `${stats.totalHours}h`,
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Tỷ lệ hoàn thành',
      value: `${stats.completionRate}%`,
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Đánh giá TB',
      value: stats.averageRating > 0 ? `${stats.averageRating}/5` : 'Chưa có',
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className={`${item.bgColor} rounded-md p-3`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-600">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Event History Item Component
const HistoryItem = ({ event, onRate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  // Use shared helper which prefers backend `canRate` flag and falls back to null-safe checks
  const canRate = canRateParticipation(event);
  const isUpcoming = new Date(event.event.startDate) > new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative md:w-48 h-40 md:h-auto flex-shrink-0">
          <img 
            src={getCategoryImage(event.event.category)} 
            alt={event.event.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg">
              <TagIcon className="h-3 w-3 mr-1" />
              {event.event.category}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.event.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(event.event.startDate).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(event.event.startDate).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {event.event.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="truncate max-w-[200px]">{event.event.location}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {event.event.description}
              </p>
            </div>
          </div>

          {/* Rating Display */}
          {event.rating != null && (
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Đánh giá của bạn:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-4 w-4 ${
                        star <= event.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({event.rating}/5)</span>
              </div>
              {event.feedback && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  "{event.feedback}"
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Đăng ký: {new Date(event.registeredAt).toLocaleDateString('vi-VN')}
          {event.completedAt && (
            <span className="ml-4">
              Hoàn thành: {new Date(event.completedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {canRate && (
            <button
              onClick={() => onRate(event)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <StarIcon className="h-3 w-3 mr-1 text-white" />
              Đánh giá
            </button>
          )}
          {!isUpcoming && (
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
              Xem chi tiết
            </button>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ParticipationHistory Component
const ParticipationHistory = ({ onClose }) => {
  const { user } = useAuthStore();
  const { myRegistrations, fetchMyRegistrations, isLoading, error } = useEventStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch participation history on mount
  useEffect(() => {
    if (user && user.role === 'VOLUNTEER') {
      fetchMyRegistrations();
    }
  }, [user, fetchMyRegistrations]);

  // Calculate statistics from registrations
  const calculateStats = () => {
    if (!myRegistrations || myRegistrations.length === 0) {
      return {
        totalEvents: 0,
        totalHours: 0,
        completionRate: 0,
        averageRating: 0,
        achievements: []
      };
    }

    const completed = myRegistrations.filter(reg => 
      reg.status === 'COMPLETED'
    );
    
    const totalHours = completed.reduce((sum, reg) => {
      const start = new Date(reg.event.startDate);
      const end = new Date(reg.event.endDate);
      const hours = Math.round((end - start) / (1000 * 60 * 60));
      return sum + Math.max(hours, 1); // At least 1 hour per event
    }, 0);

    const rated = completed.filter(reg => reg.rating);
    const averageRating = rated.length > 0 
      ? rated.reduce((sum, reg) => sum + reg.rating, 0) / rated.length 
      : 0;

    const completionRate = myRegistrations.length > 0 
      ? Math.round((completed.length / myRegistrations.length) * 100)
      : 0;

    // Generate achievements
    const achievements = [];
    if (completed.length >= 5) achievements.push('🏆 Tình nguyện viên tích cực');
    if (totalHours >= 50) achievements.push('⏰ Cống hiến thời gian');
    if (averageRating >= 4.5) achievements.push('⭐ Đánh giá xuất sắc');
    if (completed.length >= 10) achievements.push('🎯 Chuyên gia tình nguyện');

    return {
      totalEvents: completed.length,
      totalHours,
      completionRate,
      averageRating: Math.round(averageRating * 10) / 10,
      achievements
    };
  };

  const stats = calculateStats();

  // Handle rating submission
  const handleRateEvent = (registration) => {
    setSelectedEvent(registration);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    // Refresh registrations to get updated data
    fetchMyRegistrations();
  };

  // Filter events by status
  const filteredEvents = myRegistrations?.filter(registration => {
    if (filterStatus === 'all') return true;
    return registration.status === filterStatus;
  }) || [];

  // Redirect if not volunteer
  if (user && user.role !== 'VOLUNTEER') {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Không có quyền truy cập</h3>
        <p className="mt-2 text-sm text-gray-500">
          Trang này chỉ dành cho tình nguyện viên.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 p-6 rounded-lg">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 p-6 rounded-lg">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lỗi</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => fetchMyRegistrations()}
                    className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử tham gia</h1>
            <p className="mt-1 text-gray-600">
              Theo dõi hành trình tình nguyện của bạn
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

          {/* Statistics Summary */}
          <StatsSummary stats={stats} />

          {/* Achievements */}
          {stats.achievements && stats.achievements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thành tích</h2>
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                  >
                    <TrophyIcon className="h-4 w-4 mr-1" />
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'COMPLETED', label: 'Đã hoàn thành' },
            { id: 'APPROVED', label: 'Đã phê duyệt' },
            { id: 'PENDING', label: 'Chờ duyệt' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events History */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <HistoryItem
                key={event.id}
                event={event}
                onRate={handleRateEvent}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filterStatus === 'all' ? 'Chưa có lịch sử tham gia' : 'Không có sự kiện phù hợp'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filterStatus === 'all' 
                ? 'Hãy đăng ký tham gia các sự kiện tình nguyện để xây dựng hồ sơ của bạn!'
                : 'Thử thay đổi bộ lọc để xem các sự kiện khác.'
              }
            </p>
          </div>
        )}
        </div>

        {/* Rating Modal */}
        {showRatingModal && selectedEvent && (
          <EventRating
            eventId={selectedEvent.event.id}
            eventTitle={selectedEvent.event.title}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedEvent(null);
            }}
            onSuccess={handleRatingSuccess}
          />
        )}


      </div>
    </div>
  );
};

export default ParticipationHistory;