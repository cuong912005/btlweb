import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registerForEvent, isLoading, error } = useEventStore();
  const { user, token } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (events.length > 0) {
      const foundEvent = events.find(e => e.id === parseInt(id));
      setEvent(foundEvent);
    }
  }, [id, events]);

  const handleRegister = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    try {
      await registerForEvent(event.id);
      // Refresh event data
      const updatedEvent = events.find(e => e.id === parseInt(id));
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Lỗi đăng ký sự kiện:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEdit = () => {
    navigate(`/events/edit/${id}`);
  };

  const handleGoBack = () => {
    navigate('/events');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Lỗi</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sự kiện</h1>
          <p className="text-gray-600 mb-4">Sự kiện bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    );
  }

  const isRegistered = event.participants?.some(p => p.id === user?.id);
  const isOrganizer = event.organizerId === user?.id;
  const canRegister = !isRegistered && !isOrganizer && event.status === 'ACTIVE';
  const participantCount = event.participants?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách sự kiện
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center text-blue-100">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                event.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {event.status === 'ACTIVE' ? 'Đang mở' : 
                 event.status === 'CANCELLED' ? 'Đã hủy' : 'Đã kết thúc'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.startDate).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {participantCount} người tham gia
            </div>
          </div>
        </div>

        {/* Event content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">Mô tả sự kiện</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>

              {event.requirements && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Yêu cầu</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {event.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin sự kiện</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Danh mục:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {event.category}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Người tổ chức:</span>
                    <div className="mt-1">{event.organizerName || 'Đang cập nhật'}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Thời gian kết thúc:</span>
                    <div className="mt-1">
                      {new Date(event.endDate).toLocaleDateString('vi-VN')} {' '}
                      {new Date(event.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {event.maxParticipants && (
                    <div>
                      <span className="font-medium text-gray-600">Số lượng tối đa:</span>
                      <div className="mt-1">{event.maxParticipants} người</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {isOrganizer && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    Chỉnh sửa sự kiện
                  </button>
                )}
                
                {canRegister && (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
                  >
                    {isRegistering ? 'Đang đăng ký...' : 'Đăng ký tham gia'}
                  </button>
                )}
                
                {isRegistered && !isOrganizer && (
                  <div className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                    ✓ Đã đăng ký tham gia
                  </div>
                )}
                
                {event.status !== 'ACTIVE' && (
                  <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                    Sự kiện không còn mở đăng ký
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;