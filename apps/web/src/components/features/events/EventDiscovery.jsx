import React, { useEffect, useState } from 'react';
import { useEvents } from '../../../stores/eventStore';
import { useAuthStore } from '../../../stores/authStore';
import EventCard from './EventCard';
import EventFilters from './EventFilters';

// Loading Skeleton Component
const EventCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ title, description }) => (
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
  </div>
);

// Registration Confirmation Modal
const RegistrationModal = ({ isOpen, event, onConfirm, onCancel }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <svg 
              className="h-6 w-6 text-indigo-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
            Xác nhận đăng ký
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Bạn có muốn đăng ký tham gia sự kiện <strong>"{event.title}"</strong> không?
            </p>
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p>📍 {event.location}</p>
              <p>📅 {new Date(event.startDate).toLocaleDateString('vi-VN')}</p>
              <p>👥 {event.registrationCount || 0} / {event.capacity || '∞'} người tham gia</p>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Xác nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDiscovery = () => {
  const { 
    events, 
    categories, 
    filters, 
    isLoading, 
    updateFilters, 
    applyFilters,
    fetchEvents,
    registerForEvent,
    error,
    clearError
  } = useEvents();
  
  const { user } = useAuthStore();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Fetch events on component mount only
  useEffect(() => {
    fetchEvents({ status: 'APPROVED' }); // Load approved events by default
  }, []);

  const handleRegister = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowRegistrationModal(true);
    }
  };

  const confirmRegistration = async () => {
    if (!selectedEvent) return;
    
    setRegistrationLoading(true);
    try {
      await registerForEvent(selectedEvent.id);
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      
      // Show success message
      alert('Đăng ký thành công! Vui lòng chờ phê duyệt từ ban tổ chức.');
      
      // Refresh events to update registration count
      await fetchEvents(filters);
    } catch (error) {
      alert(`Có lỗi xảy ra khi đăng ký: ${error.message}`);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const cancelRegistration = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Khám phá sự kiện tình nguyện
          </h1>
          <p className="mt-2 text-gray-600">
            Tìm kiếm và tham gia các hoạt động tình nguyện có ý nghĩa
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
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <EventFilters
              filters={filters}
              onFilterChange={applyFilters}
              categories={categories}
            />
          </div>
          
          {/* Events Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Sự kiện được tìm thấy
                </h2>
                <p className="text-sm text-gray-500">
                  {isLoading ? 'Đang tải...' : `${events.length} sự kiện`}
                </p>
              </div>
              
              {/* Sort Options (Future enhancement) */}
              <div className="hidden sm:block">
                <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  <option>Mới nhất</option>
                  <option>Sắp diễn ra</option>
                  <option>Nhiều người tham gia</option>
                </select>
              </div>
            </div>
            
            {/* Events Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={user?.role === 'VOLUNTEER' ? handleRegister : null}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Không tìm thấy sự kiện"
                description="Thử thay đổi bộ lọc để tìm kiếm sự kiện phù hợp với bạn"
              />
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        event={selectedEvent}
        onConfirm={confirmRegistration}
        onCancel={cancelRegistration}
      />

      {/* Registration Loading Overlay */}
      {registrationLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-gray-900">Đang đăng ký...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDiscovery;