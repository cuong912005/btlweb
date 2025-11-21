import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { useEventStore } from '../../stores/eventStore';
import EventCard from '../../components/features/events/EventCard';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const MyEventsPage = () => {
  const { user } = useAuthStore();
  const { events, myEvents, myRegistrations, isLoading, fetchEvents, fetchMyEvents, fetchMyRegistrations, refreshEvents, error } = useEventStore();
  
  const [activeFilter, setActiveFilter] = useState('all'); // all, upcoming, completed, pending, rejected

  useEffect(() => {
    if (!user?.id) return;
    
    if (user.role === 'VOLUNTEER') {
      fetchMyRegistrations();
    } else if (user.role === 'ORGANIZER') {
      fetchMyEvents();
    }
  }, [user?.id, user?.role, fetchMyEvents, fetchMyRegistrations]);

  // Categorize events for volunteers
  const categorizedEvents = useMemo(() => {
    if (user?.role !== 'VOLUNTEER') return { upcoming: [], completed: [], pending: [], rejected: [] };
    
    const now = new Date();
    const upcoming = [];
    const completed = [];
    const pending = [];
    const rejected = [];

    myRegistrations.forEach(reg => {
      const event = reg.event;
      if (!event) return;

      const eventWithReg = { ...event, registration: reg };

      if (reg.status === 'PENDING') {
        pending.push(eventWithReg);
      } else if (reg.status === 'REJECTED') {
        rejected.push(eventWithReg);
      } else if (reg.status === 'APPROVED') {
        if (reg.completedAt || new Date(event.endDate) < now) {
          completed.push(eventWithReg);
        } else {
          upcoming.push(eventWithReg);
        }
      }
    });

    return { upcoming, completed, pending, rejected };
  }, [myRegistrations, user?.role]);

  // Filter events based on active filter
  const filteredEvents = useMemo(() => {
    if (user?.role === 'ORGANIZER') {
      return myEvents;
    }

    switch (activeFilter) {
      case 'upcoming':
        return categorizedEvents.upcoming;
      case 'completed':
        return categorizedEvents.completed;
      case 'pending':
        return categorizedEvents.pending;
      case 'rejected':
        return categorizedEvents.rejected;
      case 'all':
      default:
        return [
          ...categorizedEvents.upcoming,
          ...categorizedEvents.pending,
          ...categorizedEvents.completed,
          ...categorizedEvents.rejected
        ];
    }
  }, [activeFilter, categorizedEvents, myEvents, user?.role]);

  // Stats for volunteer
  const stats = useMemo(() => {
    if (user?.role !== 'VOLUNTEER') return null;
    return {
      upcoming: categorizedEvents.upcoming.length,
      completed: categorizedEvents.completed.length,
      pending: categorizedEvents.pending.length,
      rejected: categorizedEvents.rejected.length,
      total: myRegistrations.length
    };
  }, [categorizedEvents, myRegistrations, user?.role]);

  const filters = user?.role === 'VOLUNTEER' ? [
    { id: 'all', name: 'Tất cả', count: stats?.total || 0, icon: CalendarIcon },
    { id: 'upcoming', name: 'Sắp diễn ra', count: stats?.upcoming || 0, icon: ClockIcon, color: 'teal' },
    { id: 'completed', name: 'Đã hoàn thành', count: stats?.completed || 0, icon: CheckCircleIcon, color: 'emerald' },
    { id: 'pending', name: 'Chờ duyệt', count: stats?.pending || 0, icon: ClockIcon, color: 'amber' },
    { id: 'rejected', name: 'Bị từ chối', count: stats?.rejected || 0, icon: XCircleIcon, color: 'red' }
  ] : [];

  const EmptyState = ({ title, description, actionText, actionLink, icon: Icon }) => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 mb-6">
        {Icon ? (
          <Icon className="w-10 h-10 text-teal-600" />
        ) : (
          <CalendarIcon className="w-10 h-10 text-teal-600" />
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {actionText}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      )}
    </div>
  );

    const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-56 bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
              <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 p-8 shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          </div>
          <div className="relative">
            <h1 className="text-4xl font-black text-white mb-3">
              {user?.role === 'VOLUNTEER' ? '📅 Sự kiện của tôi' : '🎯 Quản lý sự kiện'}
            </h1>
            <p className="text-white/90 text-lg">
              {user?.role === 'VOLUNTEER' 
                ? 'Theo dõi các sự kiện bạn đã đăng ký và tham gia'
                : 'Quản lý các sự kiện bạn đã tổ chức'
              }
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-red-800">Có lỗi xảy ra</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters for Volunteer */}
        {user?.role === 'VOLUNTEER' && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                const colorClasses = {
                  teal: isActive ? 'from-teal-600 to-cyan-600 text-white shadow-xl shadow-teal-200' : 'bg-white text-teal-700 hover:bg-teal-50 border-2 border-teal-200',
                  emerald: isActive ? 'from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-emerald-200',
                  amber: isActive ? 'from-amber-600 to-orange-600 text-white shadow-xl shadow-amber-200' : 'bg-white text-amber-700 hover:bg-amber-50 border-2 border-amber-200',
                  red: isActive ? 'from-red-600 to-rose-600 text-white shadow-xl shadow-red-200' : 'bg-white text-red-700 hover:bg-red-50 border-2 border-red-200'
                };
                const buttonClass = filter.color ? colorClasses[filter.color] : (isActive ? 'from-gray-600 to-gray-700 text-white shadow-xl' : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200');
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      isActive ? `bg-gradient-to-r ${buttonClass}` : buttonClass
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span>{filter.name}</span>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {activeFilter === 'upcoming' && '🔜 Sắp diễn ra'}
              {activeFilter === 'completed' && '✅ Đã hoàn thành'}
              {activeFilter === 'pending' && '⏳ Chờ phê duyệt'}
              {activeFilter === 'rejected' && '❌ Bị từ chối'}
              {activeFilter === 'all' && '📋 Tất cả sự kiện'}
              {user?.role === 'ORGANIZER' && '🎯 Sự kiện của bạn'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLoading ? 'Đang tải...' : `${filteredEvents.length} sự kiện`}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                if (user?.role === 'VOLUNTEER') {
                  await fetchMyRegistrations();
                } else if (user?.role === 'ORGANIZER') {
                  await fetchMyEvents();
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-white border-2 border-teal-200 text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
            
            {user?.role === 'ORGANIZER' && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tạo sự kiện mới
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              // Ensure event has all required fields
              const eventData = {
                ...event,
                participantCount: event.participantCount || event._count?.participants || 0,
                organizer: event.organizer || {
                  firstName: 'Unknown',
                  lastName: 'Organizer'
                }
              };

              return (
                <EventCard
                  key={event.id}
                  event={eventData}
                  showActions={true}
                  hideRegistration={true}
                  variant={user?.role === 'ORGANIZER' ? 'organizer' : 'participant'}
                />
              );
            })}
          </div>
        ) : (
          user?.role === 'VOLUNTEER' ? (
            <EmptyState
              title={
                activeFilter === 'upcoming' ? 'Chưa có sự kiện sắp diễn ra' :
                activeFilter === 'completed' ? 'Chưa có sự kiện đã hoàn thành' :
                activeFilter === 'pending' ? 'Chưa có sự kiện đang chờ duyệt' :
                activeFilter === 'rejected' ? 'Không có sự kiện bị từ chối' :
                'Chưa đăng ký sự kiện nào'
              }
              description="Khám phá và đăng ký tham gia các hoạt động tình nguyện thú vị"
              actionText="Khám phá sự kiện"
              actionLink="/events"
              icon={CalendarIcon}
            />
          ) : (
            <EmptyState
              title="Chưa tạo sự kiện nào"
              description="Bắt đầu tạo sự kiện đầu tiên để kêu gọi sự tham gia từ cộng đồng"
              actionText="Tạo sự kiện mới"
              actionLink="/events/create"
              icon={CalendarIcon}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;