import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../../../stores/eventStore';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TagIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { showSuccess, showError } from '../../../utils/toast';

// Category Image Mapping - Get relevant images for each category
const getCategoryImage = (category) => {
  const categoryImages = {
    'Môi trường': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80&auto=format&fit=crop', // Tree planting
    'Giáo dục': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop', // Teaching/education
    'Y tế': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop', // Medical/healthcare
    'Cộng đồng': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80&auto=format&fit=crop', // Community gathering
    'Từ thiện': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop', // Charity/helping
    'Cứu trợ thiên tai': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80&auto=format&fit=crop', // Disaster relief
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80&auto=format&fit=crop'; // Default volunteer image
};

// Cancel Registration Modal Component
const CancelRegistrationModal = ({ registration, isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  const event = registration?.event;
  const canCancel = event && new Date(event.startDate) > new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận hủy đăng ký</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900">{event?.title}</h4>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {new Date(event?.startDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {event?.location}
            </div>
          </div>
        </div>

        {canCancel ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="text-sm text-yellow-800">
              <p>Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?</p>
              <p className="mt-2 text-xs">Bạn có thể đăng ký lại sau nếu muốn.</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="text-sm text-red-800">
              <p>Không thể hủy đăng ký vì sự kiện đã bắt đầu hoặc đã kết thúc.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Đóng
          </button>
          {canCancel && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Chờ duyệt'
    },
    APPROVED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Đã duyệt'
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Từ chối'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Main RegistrationCard Component
const RegistrationCard = ({ registration }) => {
  const navigate = useNavigate();
  const { cancelRegistration } = useEventStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const event = registration?.event;
  if (!event) return null;

  const canCancel = registration.status === 'PENDING' && new Date(event.startDate) > new Date();

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setIsCanceling(true);
    
    try {
      const result = await cancelRegistration(registration.id);
      if (result.success) {
        setShowCancelModal(false);
        showSuccess('Đã hủy đăng ký thành công!');
      } else {
        showError(result.error || 'Có lỗi xảy ra khi hủy đăng ký');
      }
    } catch (err) {
      showError('Có lỗi xảy ra khi hủy đăng ký');
    } finally {
      setIsCanceling(false);
    }
  };



  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Event Image with Category */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={getCategoryImage(event.category)} 
            alt={event.category}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={registration.status} />
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg">
              <TagIcon className="h-3 w-3 mr-1" />
              {event.category}
            </span>
          </div>
          
          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Event Meta Information */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {new Date(event.startDate).toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {new Date(event.startDate).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {event.organizer && (
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  Tổ chức bởi: {event.organizer.firstName} {event.organizer.lastName}
                </span>
              </div>
            )}
          </div>

          {/* Registration Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="text-xs text-gray-500">
              Đăng ký lúc: {new Date(registration.registeredAt).toLocaleString('vi-VN')}
            </div>
            {registration.completedAt && (
              <div className="text-xs text-gray-500 mt-1">
                Hoàn thành lúc: {new Date(registration.completedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>

          {/* Rating Display */}
          {registration.rating != null && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Đánh giá của bạn:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-4 w-4 ${
                        star <= registration.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({registration.rating}/5)</span>
              </div>
              {registration.feedback && (
                <p className="text-sm text-gray-600 italic">
                  "{registration.feedback}"
                </p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Đánh giá lúc: {new Date(registration.ratedAt).toLocaleString('vi-VN')}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {registration.status === 'REJECTED' && registration.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Lý do từ chối:</strong> {registration.rejectionReason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handleViewDetails}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Xem chi tiết
            </button>
            
            {canCancel && (
              <button
                onClick={handleCancelClick}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircleIcon className="w-4 h-4 mr-1" />
                Hủy đăng ký
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelRegistrationModal
        registration={registration}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isCanceling}
      />


    </>
  );
};

export default RegistrationCard;