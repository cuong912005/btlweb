import React, { useEffect, useState } from 'react';
import { useEvents } from '../../../stores/eventStore';
import { useAuthStore } from '../../../stores/authStore';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import { showSuccess, showError } from '../../../utils/toast';

const EventCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded-xl w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-lg"></div>
      <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
    </div>
  </div>
);

const EmptyState = ({ filters, onClearFilters }) => {
  const hasFilters = filters.search || filters.category || filters.location || 
                     filters.startDate || filters.endDate || 
                     (filters.availability && filters.availability !== 'all') ||
                     (filters.eventStatus && filters.eventStatus !== 'all') ||
                     (filters.registrationStatus && filters.registrationStatus !== 'all');

  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-6">
        <svg className="h-16 w-16 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sự kiện</h3>
      <p className="text-gray-600 text-lg mb-4">
        {hasFilters 
          ? 'Không có sự kiện nào phù hợp với bộ lọc của bạn'
          : 'Hiện tại chưa có sự kiện nào'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

const EventDiscovery = () => {
  const { 
    events, 
    categories, 
    filters, 
    pagination,
    isLoading, 
    applyFilters,
    fetchEvents,
    registerForEvent,
    nextPage,
    prevPage,
    goToPage,
    changePageSize
  } = useEvents();
  
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents({ status: 'APPROVED' });
  }, []);

  const handleRegister = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowModal(true);
    }
  };

  const confirmRegistration = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      await registerForEvent(selectedEvent.id);
      setShowModal(false);
      setSelectedEvent(null);
      showSuccess('Đăng ký thành công!');
      await fetchEvents(filters);
    } catch (error) {
      showError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Separate events into available and unavailable
  const categorizeEvents = (eventList) => {
    // If user has filtered by registrationStatus, don't re-categorize
    // Backend already filtered, so show all in appropriate section
    if (filters.registrationStatus === 'available') {
      return { available: eventList, unavailable: [] };
    } else if (filters.registrationStatus === 'unavailable') {
      return { available: [], unavailable: eventList };
    }

    // Only categorize when showing "all" registration status
    const now = new Date();
    const available = [];
    const unavailable = [];

    eventList.forEach(event => {
      const isExpired = new Date(event.endDate) < now;
      const isFull = event.capacity && event.participantCount >= event.capacity;
      const isAvailable = !isExpired && !isFull;

      if (isAvailable) {
        available.push(event);
      } else {
        unavailable.push(event);
      }
    });

    return { available, unavailable };
  };

  const { available: availableEvents, unavailable: unavailableEvents } = categorizeEvents(events);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <EventFilters
            filters={filters}
            onFilterChange={applyFilters}
            categories={categories}
          />
        </div>
        
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Kết quả tìm kiếm</h2>
              <p className="text-sm text-gray-600">
                {isLoading ? 'Đang tải...' : (
                  <>
                    <span className="text-teal-600 font-semibold">{availableEvents.length} có thể đăng ký</span>
                    {' • '}
                    <span className="text-gray-500">{unavailableEvents.length} đã kết thúc/đầy</span>
                    {' • '}
                    Trang {pagination.currentPage}/{pagination.totalPages}
                  </>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  applyFilters({ sortBy, sortOrder });
                }}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              >
                <option value="date-asc">🗓️ Sắp diễn ra</option>
                <option value="created-desc">✨ Mới nhất</option>
                <option value="popularity-desc">🔥 Hot nhất</option>
              </select>
              
              <select 
                value={filters.limit}
                onChange={(e) => changePageSize(parseInt(e.target.value))}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              >
                <option value={6}>6/trang</option>
                <option value={12}>12/trang</option>
                <option value={24}>24/trang</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-12">
              {/* Available Events Section */}
              {availableEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full mr-3"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">✨ Sự kiện đang mở đăng ký</h3>
                      <p className="text-sm text-teal-600 font-medium">{availableEvents.length} sự kiện có thể tham gia</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableEvents.map((event) => (
                      <div key={event.id} className="relative">
                        {/* Highlight badge */}
                        <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          🎯 Có thể đăng ký
                        </div>
                        <EventCard
                          event={event}
                          onRegister={user?.role === 'VOLUNTEER' ? handleRegister : null}
                          showActions={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Events Section */}
              {unavailableEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 w-2 h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full mr-3"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">📋 Sự kiện đã kết thúc / đầy chỗ</h3>
                      <p className="text-sm text-gray-500 font-medium">{unavailableEvents.length} sự kiện để xem thông tin</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {unavailableEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRegister={user?.role === 'VOLUNTEER' ? handleRegister : null}
                        showActions={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState 
              filters={filters}
              onClearFilters={() => applyFilters({ 
                search: '', 
                category: '', 
                location: '', 
                startDate: '', 
                endDate: '', 
                availability: 'all',
                eventStatus: 'all',
                registrationStatus: 'all'
              })}
            />
          )}
          
          {events.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-12">
              <div className="flex justify-center items-center gap-2">
                <button 
                  onClick={() => pagination.hasPrev && prevPage()}
                  disabled={!pagination.hasPrev}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Trước
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        pageNum === pagination.currentPage
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                          : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => pagination.hasNext && nextPage()}
                  disabled={!pagination.hasNext}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Sau →
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-600 font-medium">
                Hiển thị {Math.min(events.length, pagination.limit)} trong tổng {pagination.totalCount} sự kiện
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đăng ký</h3>
              <p className="text-gray-600 mb-6">Bạn muốn tham gia sự kiện này?</p>
              
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">{selectedEvent.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📍 {selectedEvent.location}</p>
                  <p>📅 {new Date(selectedEvent.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmRegistration}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <span className="text-gray-900 font-semibold text-lg">Đang đăng ký...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDiscovery;
