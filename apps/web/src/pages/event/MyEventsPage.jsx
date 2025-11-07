import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate, Link } from 'react-router-dom';
import { useEventStore } from '../../stores/eventStore';
import EventCard from '../../components/features/events/EventCard';
import RegistrationCard from '../../components/features/events/RegistrationCard';

const MyEventsPage = () => {
  const { user } = useAuthStore();
  const { events, myEvents, myRegistrations, isLoading, fetchEvents, fetchMyEvents, fetchMyRegistrations, refreshEvents, error } = useEventStore();
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;
  
  // Set default tab based on user role - use useState with function to avoid re-calculation
  const [activeTab, setActiveTab] = useState(() => {
    // This will be called only once when component mounts
    return 'created'; // Default to 'created' for initial load
  });

  // Update activeTab when user data is available
  useEffect(() => {
    if (user?.role) {
      const defaultTab = user.role === 'VOLUNTEER' ? 'registered' : 'created';
      setActiveTab(defaultTab);
    }
  }, [user?.role]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // Only fetch if user is available and authenticated
    if (!user?.id || !isAuthenticated) {
      return;
    }
    
    console.log('MyEventsPage - Fetching events with activeTab:', activeTab, 'User ID:', user.id, 'Role:', user.role);
    
    // For volunteers viewing registrations
    if (user.role === 'VOLUNTEER' && activeTab === 'registered') {
      fetchMyRegistrations();
    }
    // For organizers, use fetchMyEvents for 'created' and 'approved' tabs
    else if (user.role === 'ORGANIZER' && (activeTab === 'created' || activeTab === 'approved')) {
      fetchMyEvents();
    } else {
      // Fallback to fetchEvents with filters
      const filters = {};
      if (activeTab === 'registered') {
        filters.participantId = user.id;
      } else if (activeTab === 'created') {
        filters.organizerId = user.id;
      } else if (activeTab === 'approved') {
        filters.organizerId = user.id;
        filters.status = 'APPROVED';
      }
      
      console.log('MyEventsPage - Fetching events with filters:', filters);
      fetchEvents(filters);
    }
  }, [activeTab, user?.id, isAuthenticated, fetchEvents, fetchMyEvents, fetchMyRegistrations, user?.role]);

  // Debug events state changes (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentEvents = getCurrentEvents();
      console.log('MyEventsPage - Events state:', { 
        count: currentEvents.length, 
        activeTab,
        events: events.length,
        myEvents: myEvents.length 
      });
    }
  }, [events, myEvents, activeTab]);

  // Get the correct events array based on active tab and user role
  const getCurrentEvents = () => {
    if (user?.role === 'VOLUNTEER' && activeTab === 'registered') {
      // For volunteers viewing their registrations, extract events from myRegistrations
      return myRegistrations.map(registration => registration.event).filter(Boolean);
    }
    else if (user?.role === 'ORGANIZER' && (activeTab === 'created' || activeTab === 'approved')) {
      // For organizers viewing their events, use myEvents
      if (activeTab === 'approved') {
        return myEvents.filter(e => e.status === 'APPROVED');
      }
      return myEvents;
    }
    // For other cases, use events
    return events;
  };

  const tabs = [
    {
      id: 'registered',
      name: 'Sự kiện đã đăng ký',
      count: user?.role === 'VOLUNTEER' ? events.length : 0,
      available: user?.role === 'VOLUNTEER'
    },
    {
      id: 'created',
      name: 'Tất cả sự kiện',
      count: user?.role === 'ORGANIZER' ? myEvents.length : 0,
      available: user?.role === 'ORGANIZER'
    },
    {
      id: 'approved',
      name: 'Sự kiện đã duyệt',
      count: user?.role === 'ORGANIZER' ? myEvents.filter(e => e.status === 'APPROVED').length : 0,
      available: user?.role === 'ORGANIZER'
    }
  ].filter(tab => tab.available);

  const EmptyState = ({ title, description, actionText, actionLink }) => (
    <div className="text-center py-12">
      <svg 
        className="mx-auto h-12 w-12 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v6m0 6a9 9 0 110-18 9 9 0 010 18z" 
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {actionText && actionLink && (
        <div className="mt-6">
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Sự kiện của tôi
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý và theo dõi các sự kiện bạn đã tham gia hoặc tổ chức
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'registered' 
                ? 'Sự kiện đã đăng ký' 
                : activeTab === 'created' 
                  ? 'Tất cả sự kiện đã tạo'
                  : 'Sự kiện đã được duyệt'
              }
            </h2>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Đang tải...' : `${getCurrentEvents().length} sự kiện`}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* Refresh Button */}
            <button
              onClick={async () => {
                console.log('Refreshing events for activeTab:', activeTab);
                
                // For organizers, use fetchMyEvents for 'created' and 'approved' tabs
                if (user?.role === 'ORGANIZER' && (activeTab === 'created' || activeTab === 'approved')) {
                  await fetchMyEvents();
                } else {
                  // For volunteers or specific filters, use refreshEvents with filters
                  const filters = {};
                  if (activeTab === 'registered') {
                    filters.participantId = user.id;
                  } else if (activeTab === 'created') {
                    filters.organizerId = user.id;
                  } else if (activeTab === 'approved') {
                    filters.organizerId = user.id;
                    filters.status = 'APPROVED';
                  }
                  
                  await refreshEvents(filters);
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
            
            {user?.role === 'ORGANIZER' && (activeTab === 'created' || activeTab === 'approved') && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        ) : activeTab === 'registered' && user?.role === 'VOLUNTEER' ? (
          // Use RegistrationCard for volunteer's registrations
          myRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa đăng ký sự kiện nào"
              description="Khám phá và đăng ký tham gia các hoạt động tình nguyện thú vị"
              actionText="Khám phá sự kiện"
              actionLink="/events"
            />
          )
        ) : getCurrentEvents().length > 0 ? (
          // Use EventCard for organizer's events
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentEvents().map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showActions={true}
                variant={activeTab === 'created' || activeTab === 'approved' ? 'organizer' : 'participant'}
              />
            ))}
          </div>
        ) : (
          activeTab === 'registered' ? (
            <EmptyState
              title="Chưa đăng ký sự kiện nào"
              description="Khám phá và đăng ký tham gia các hoạt động tình nguyện thú vị"
              actionText="Khám phá sự kiện"
              actionLink="/events"
            />
          ) : (
            <EmptyState
              title="Chưa tạo sự kiện nào"
              description="Bắt đầu tạo sự kiện đầu tiên để kêu gọi sự tham gia từ cộng đồng"
              actionText="Tạo sự kiện mới"
              actionLink="/events/create"
            />
          )
        )}        {/* User Stats */}
        <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Thống kê hoạt động
            </h3>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {user?.role === 'VOLUNTEER' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {user?.stats?.eventsRegistered || 0}
                    </div>
                    <div className="text-sm text-gray-500">Sự kiện đã đăng ký</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user?.stats?.eventsCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-500">Sự kiện đã hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {user?.stats?.hoursVolunteered || 0}
                    </div>
                    <div className="text-sm text-gray-500">Giờ tình nguyện</div>
                  </div>
                </>
              )}
              
              {user?.role === 'ORGANIZER' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user?.stats?.eventsCreated || 0}
                    </div>
                    <div className="text-sm text-gray-500">Sự kiện đã tạo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {user?.stats?.totalParticipants || 0}
                    </div>
                    <div className="text-sm text-gray-500">Tình nguyện viên thu hút</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {user?.stats?.successfulEvents || 0}
                    </div>
                    <div className="text-sm text-gray-500">Sự kiện thành công</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEventsPage;