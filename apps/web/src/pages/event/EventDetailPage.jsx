import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import EventRating from '../../components/features/events/EventRating';
import api from '../../utils/api';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registerForEvent, fetchEventDetail, rateEvent, isLoading, error } = useEventStore();
  const { user, token } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [eventRatings, setEventRatings] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Fetch event ratings and feedback
  const fetchEventRatings = async () => {
    if (!user || user.role !== 'ORGANIZER') return;
    
    setIsLoadingRatings(true);
    try {
      const response = await api.get(`/events/${id}/feedback`);
      if (response.data.success) {
        setEventRatings(response.data);
      }
    } catch (error) {
      console.error('Error loading event ratings:', error);
      // Don't show error for ratings, as this is not critical
    } finally {
      setIsLoadingRatings(false);
    }
  };

  useEffect(() => {
    const loadEventDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const eventData = await fetchEventDetail(id);
        setEvent(eventData);
        
        // Load ratings for everyone (not just organizers)
        // We'll fetch ratings for all users to show public feedback
        await loadEventRatings();
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    
    loadEventDetail();
  }, [id, fetchEventDetail]);

  // Function to load ratings for all users (public feedback)
  const loadEventRatings = async () => {
    setIsLoadingRatings(true);
    try {
      const response = await api.get(`/events/${id}/public-feedback`);
      if (response.data.success) {
        setEventRatings(response.data);
      }
    } catch (error) {
      console.error('Error loading event ratings:', error);
      // Ratings are not critical, continue without them
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const handleRegister = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setShowRegistrationModal(true);
  };

  const handleConfirmRegistration = async () => {
    setIsRegistering(true);
    setRegistrationResult(null);
    
    try {
      const result = await registerForEvent(event.id);
      
      if (result.success) {
        setRegistrationResult({
          success: true,
          message: 'Đăng ký thành công! Vui lòng chờ phê duyệt từ người tổ chức.'
        });
        setShowSuccessMessage(true);
        
        // Refresh event detail to update participant count
        const updatedEvent = await fetchEventDetail(id);
        setEvent(updatedEvent);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } else {
        setRegistrationResult({
          success: false,
          message: result.error || 'Có lỗi xảy ra khi đăng ký'
        });
      }
    } catch (error) {
      console.error('Lỗi đăng ký sự kiện:', error);
      setRegistrationResult({
        success: false,
        message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.'
      });
    } finally {
      setIsRegistering(false);
      setShowRegistrationModal(false);
    }
  };

  const handleEdit = () => {
    navigate(`/events/edit/${id}`);
  };

  const handleGoBack = () => {
    navigate('/events');
  };

  const handleRatingSuccess = async (eventId, rating, feedback) => {
    try {
      const result = await rateEvent(eventId, rating, feedback);
      setShowRatingModal(false);
      
      if (result.success) {
        // Refresh event detail to show updated rating
        const updatedEvent = await fetchEventDetail(id);
        setEvent(updatedEvent);
        
        // Show success message
        setRegistrationResult({
          success: true,
          message: 'Cảm ơn bạn đã đánh giá sự kiện!'
        });
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setRegistrationResult(null);
        }, 3000);
      } else {
        setRegistrationResult({
          success: false,
          message: result.error || 'Có lỗi khi đánh giá sự kiện'
        });
      }
    } catch (err) {
      console.error('Error handling rating success:', err);
      setRegistrationResult({
        success: false,
        message: 'Có lỗi khi đánh giá sự kiện'
      });
    }
  };

  if (isLoading || isLoadingDetail) {
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

  const userParticipation = event.participants?.find(p => p.volunteer.id === user?.id);
  const isRegistered = !!userParticipation;
  const isApproved = userParticipation?.status === 'APPROVED';
  const isRejected = userParticipation?.status === 'REJECTED';
  const isOrganizer = event.organizer?.id === user?.id || event.organizerId === user?.id;
  const canRegister = !isRegistered && !isOrganizer && event.status === 'APPROVED';
  const canAccessChannel = (isOrganizer || isApproved) && event.status === 'APPROVED';
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
                event.status === 'APPROVED' ? 'bg-green-500 text-white' :
                event.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                event.status === 'REJECTED' ? 'bg-red-500 text-white' :
                event.status === 'COMPLETED' ? 'bg-gray-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {event.status === 'APPROVED' ? 'Đã phê duyệt' : 
                 event.status === 'PENDING' ? 'Chờ phê duyệt' :
                 event.status === 'REJECTED' ? 'Đã từ chối' :
                 event.status === 'COMPLETED' ? 'Đã kết thúc' : 'Không xác định'}
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

              {/* Event Ratings Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">Đánh giá từ tình nguyện viên</h2>
                {isLoadingRatings ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : eventRatings && eventRatings.feedback && eventRatings.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {/* Rating Summary */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.round(eventRatings.averageRating) 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {eventRatings.averageRating.toFixed(1)}/5
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({eventRatings.totalRatings} đánh giá)
                        </span>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-1">
                        {eventRatings.ratingDistribution.map((dist) => (
                          <div key={dist.stars} className="flex items-center space-x-2 text-sm">
                            <span className="w-8">{dist.stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ 
                                  width: `${eventRatings.totalRatings > 0 ? (dist.count / eventRatings.totalRatings) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="w-8 text-right">{dist.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      {eventRatings.feedback.map((review, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIconSolid
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.volunteer}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.ratedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {review.feedback && (
                            <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                              "{review.feedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có đánh giá nào
                    </h3>
                    <p className="text-gray-600">
                      Sự kiện này chưa có đánh giá từ tình nguyện viên hoặc chưa kết thúc.
                    </p>
                  </div>
                )}
              </div>
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
                {canAccessChannel && (
                  <button
                    onClick={() => navigate(`/events/${id}/channel`)}
                    className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Vào kênh trao đổi
                  </button>
                )}
                
                {isOrganizer && (
                  <div className="space-y-2">
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                    >
                      Chỉnh sửa sự kiện
                    </button>
                    <button
                      onClick={() => navigate(`/events/${id}/participants`)}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Quản lý người tham gia
                    </button>
                  </div>
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
                
                {isRegistered && !isOrganizer && !isRejected && (
                  <div className="space-y-2">
                    <div className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                      ✓ Đã đăng ký tham gia
                    </div>
                    {/* Show rating button if participation is completed and not rated yet */}
                    {isApproved && userParticipation?.status === 'COMPLETED' && !userParticipation?.rating && (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium flex items-center justify-center"
                      >
                        <StarIcon className="w-5 h-5 mr-2" />
                        Đánh giá sự kiện
                      </button>
                    )}

                    {/* Show rating if already rated */}
                    {isApproved && userParticipation?.rating && (
                      <div className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Đánh giá của bạn:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= userParticipation.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({userParticipation.rating}/5)</span>
                        </div>
                        {userParticipation.feedback && (
                          <p className="text-sm text-gray-600 text-center italic">
                            "{userParticipation.feedback}"
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Show completion status for approved participants */}
                    {isApproved && new Date(event.endDate) < new Date() && !userParticipation?.completedAt && (
                      <div className="w-full px-4 py-3 bg-orange-100 text-orange-800 rounded-lg text-center font-medium">
                        ⏳ Chờ người tổ chức xác nhận hoàn thành
                      </div>
                    )}
                  </div>
                )}
                
                {isRejected && !isOrganizer && (
                  <div className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg text-center font-medium">
                    ✗ Đăng ký bị từ chối
                    {userParticipation?.rejectionReason && (
                      <div className="text-sm text-red-600 mt-1">
                        Lý do: {userParticipation.rejectionReason}
                      </div>
                    )}
                  </div>
                )}
                
                {event.status !== 'APPROVED' && (
                  <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                    {event.status === 'PENDING' ? 'Sự kiện đang chờ phê duyệt' :
                     event.status === 'REJECTED' ? 'Sự kiện đã bị từ chối' :
                     event.status === 'COMPLETED' ? 'Sự kiện đã kết thúc' :
                     'Sự kiện không còn mở đăng ký'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Xác nhận đăng ký
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có muốn đăng ký tham gia sự kiện <strong>"{event?.title}"</strong> không?
                </p>
                <div className="mt-4 text-xs text-gray-400 space-y-1 text-left">
                  <p>📍 <strong>Địa điểm:</strong> {event?.location}</p>
                  <p>📅 <strong>Thời gian:</strong> {new Date(event?.startDate).toLocaleDateString('vi-VN')}</p>
                  <p>👥 <strong>Người tham gia:</strong> {participantCount} / {event?.capacity || '∞'}</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-xs text-blue-800">
                    <p><strong>Lưu ý:</strong></p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Đăng ký sẽ được xem xét bởi người tổ chức</li>
                      <li>Bạn sẽ nhận thông báo về kết quả phê duyệt</li>
                      <li>Có thể hủy đăng ký trước khi sự kiện bắt đầu</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    disabled={isRegistering}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirmRegistration}
                    disabled={isRegistering}
                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                  >
                    {isRegistering ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification */}
      {registrationResult && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          registrationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border rounded-lg shadow-lg`}>
          <div className="p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {registrationResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${
                  registrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {registrationResult.success ? 
                    (registrationResult.message.includes('đánh giá') ? 'Đánh giá thành công!' : 'Đăng ký thành công!') : 
                    'Thao tác thất bại'
                  }
                </h3>
                <p className={`mt-1 text-sm ${
                  registrationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {registrationResult.message}
                </p>
                {registrationResult.success && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/events/my')}
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Xem đăng ký của tôi
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => setRegistrationResult(null)}
                  className={`rounded-md inline-flex ${
                    registrationResult.success ? 'text-green-400 hover:text-green-500' : 'text-red-400 hover:text-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    registrationResult.success ? 'focus:ring-green-500' : 'focus:ring-red-500'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Rating Modal */}
      {showRatingModal && (
        <EventRating 
          eventId={id}
          eventTitle={event.title}
          onClose={() => setShowRatingModal(false)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}

export default EventDetailPage;