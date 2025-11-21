import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../../components/features/auth/AuthGuard';
import EventRating from '../../components/features/events/EventRating';
import api from '../../utils/api';
import { canRateParticipation } from '../../utils/canRate';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  UserIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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

const VolunteerHistoryPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [participationData, setParticipationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Fetch participation history data
  const fetchParticipationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/events/volunteers/participation-history');
      setParticipationData(response.data);
    } catch (err) {
      console.error('Error fetching participation data:', err);
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu lịch sử tham gia');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'VOLUNTEER') {
      navigate('/dashboard');
      return;
    }
    fetchParticipationData();
  }, [user, navigate]);

  // Handle event rating
  const handleRateEvent = (event) => {
    setSelectedEvent(event);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    // Refresh data to get updated ratings
    fetchParticipationData();
  };

  // Filter events based on active filter
  const getFilteredEvents = () => {
    if (!participationData?.events) return [];
    
    const allEvents = [
      ...participationData.events.upcoming.map(e => ({ ...e, category: 'upcoming' })),
      ...participationData.events.completed.map(e => ({ ...e, category: 'completed' })),
      ...participationData.events.pending.map(e => ({ ...e, category: 'pending' })),
      ...participationData.events.rejected.map(e => ({ ...e, category: 'rejected' }))
    ];

    if (activeFilter === 'all') return allEvents;
    return allEvents.filter(event => event.category === activeFilter);
  };

  // Statistics Summary Component
  const StatsSummary = () => {
    if (!participationData?.stats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <CalendarIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng sự kiện</p>
              <p className="text-3xl font-bold text-gray-900">{participationData.stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-lg p-3">
              <ClockIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Giờ tình nguyện</p>
              <p className="text-3xl font-bold text-gray-900">{participationData.stats.totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <TrophyIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
              <p className="text-3xl font-bold text-gray-900">{participationData.stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 rounded-lg p-3">
              <StarIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Đánh giá TB</p>
              <p className="text-3xl font-bold text-gray-900">
                {participationData.stats.averageRating > 0 
                  ? `${participationData.stats.averageRating}/5` 
                  : '--'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Event Item Component
  const EventItem = ({ event }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'COMPLETED':
          return 'bg-blue-100 text-blue-800';
        case 'APPROVED':
          return 'bg-green-100 text-green-800';
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

    // Prefer backend-provided `canRate` if available (formatParticipation sets this).
    // Fallback to checking rating/ratedAt/hasRated for backward-compatibility.
    const canRate = canRateParticipation(event);
    const isUpcoming = new Date(event.event.startDate) > new Date();

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
        {/* Image & Status Badge */}
        <div className="relative h-48">
          <img 
            src={getCategoryImage(event.event.category)} 
            alt={event.event.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg">
              <TagIcon className="h-4 w-4 mr-1" />
              {event.event.category}
            </span>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {event.event.title}
            </h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-5 w-5 text-teal-600" />
              <span className="font-medium">{new Date(event.event.startDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-5 w-5 text-cyan-600" />
              <span>{new Date(event.event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {event.event.duration && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                {event.event.duration}h
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">{event.event.location || 'Chưa xác định'}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.event.description}
          </p>

          {/* Rating Display */}
          {event.rating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">Đánh giá của bạn:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-5 w-5 ${star <= event.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">({event.rating}/5)</span>
              </div>
              {event.feedback && (
                <p className="text-sm text-gray-600 italic mt-2">
                  "{event.feedback}"
                </p>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {event.status === 'REJECTED' && event.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>❌ Lý do từ chối:</strong> {event.rejectionReason}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Đăng ký: {new Date(event.registeredAt).toLocaleDateString('vi-VN')}
              {event.completedAt && (
                <span className="ml-3">
                  • Hoàn thành: {new Date(event.completedAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
            {canRate && (
              <button
                onClick={() => handleRateEvent(event)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
              >
                <StarIcon className="h-4 w-4" />
                Đánh giá
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
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
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchParticipationData}
                    className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/volunteer/profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại hồ sơ</span>
            </button>
            
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 shadow-lg">
              <h1 className="text-3xl font-bold text-white mb-2">📜 Lịch sử tham gia</h1>
              <p className="text-white/90 text-lg">
                Theo dõi hành trình tình nguyện của bạn
              </p>
            </div>
          </div>

          {/* Statistics Summary */}
          <StatsSummary />

          {/* Achievements */}
          {participationData?.achievements && participationData.achievements.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
                Thành tích
              </h2>
              <div className="flex flex-wrap gap-3">
                {participationData.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                  >
                    <TrophyIcon className="h-5 w-5" />
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 mb-6 inline-flex gap-2">
            {[
              { id: 'all', label: 'Tất cả', icon: '📋', count: getFilteredEvents().length },
              { id: 'completed', label: 'Hoàn thành', icon: '✅', count: participationData?.events?.completed?.length || 0 },
              { id: 'upcoming', label: 'Sắp tới', icon: '🔜', count: participationData?.events?.upcoming?.length || 0 },
              { id: 'pending', label: 'Chờ duyệt', icon: '⏳', count: participationData?.events?.pending?.length || 0 },
              { id: 'rejected', label: 'Từ chối', icon: '❌', count: participationData?.events?.rejected?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Events List */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event, index) => (
                <EventItem key={`${event.id}-${index}`} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <CalendarIcon className="mx-auto h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {activeFilter === 'all' ? 'Chưa có lịch sử tham gia' : 'Không có sự kiện phù hợp'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter === 'all' 
                  ? 'Hãy đăng ký tham gia các sự kiện tình nguyện để xây dựng hồ sơ của bạn!'
                  : 'Thử thay đổi bộ lọc để xem các sự kiện khác.'
                }
              </p>
              {activeFilter === 'all' && (
                <button
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md"
                >
                  Khám phá sự kiện
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

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
    </AuthGuard>
  );
};

export default VolunteerHistoryPage;