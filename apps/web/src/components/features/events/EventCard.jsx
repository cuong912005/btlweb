import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useEventStore } from '../../../stores/eventStore';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TagIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

// Registration Modal Component
const RegistrationModal = ({ event, isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Xác nhận đăng ký</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900">{event?.title}</h4>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {new Date(event?.startDate).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {event?.location}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="text-sm text-blue-800">
            <h5 className="font-medium mb-1">Lưu ý:</h5>
            <ul className="text-xs space-y-1">
              <li>• Đăng ký sẽ được xem xét và phê duyệt bởi người tổ chức</li>
              <li>• Bạn sẽ nhận được thông báo về kết quả đăng ký</li>
              <li>• Có thể hủy đăng ký trước khi sự kiện bắt đầu</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' };
      case 'REJECTED':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Format Date Helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EventCard = ({ 
  event, 
  showActions = true,
  onRegister,
  variant = 'default'
}) => {
  const { user } = useAuthStore();
  const { registerForEvent } = useEventStore();
  const navigate = useNavigate();
  
  // Modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Check if user is already registered for this event
  const isAlreadyRegistered = event.participants?.some(p => p.id === user?.id) || 
                             event.registrations?.some(r => r.userId === user?.id);
  
  // Safe guard cho event object
  if (!event) {
    return null;
  }
  
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isOrganizer = user?.role === 'ORGANIZER';
  const participantCount = event.participantCount || event.registrationCount || event.approvedParticipants || 0;
  const capacity = event.capacity;
  const canRegister = event.status === 'APPROVED' && 
                     (!capacity || participantCount < capacity) &&
                     !isAlreadyRegistered;
  
  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };
  
  const handleRegister = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (onRegister) {
      onRegister(event.id);
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleConfirmRegistration = async () => {
    setIsRegistering(true);
    try {
      const result = await registerForEvent(event.id);
      if (result.success) {
        setShowRegistrationModal(false);
        // Show success message - you can add a toast notification here
        alert('Đăng ký thành công! Chờ phê duyệt từ người tổ chức.');
      } else {
        alert(result.error || 'Đăng ký thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
            {event.title}
          </h3>
          <StatusBadge status={event.status} />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-xs">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
          
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {participantCount} / {capacity || '∞'} người tham gia
            </span>
          </div>
          
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{event.category}</span>
          </div>
        </div>
        
        {event.organizer && (
          <div className="mt-4 text-xs text-gray-400">
            Tổ chức bởi: {event.organizer.firstName} {event.organizer.lastName}
          </div>
        )}
      </div>
      
      {showActions && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={handleViewDetails}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Xem chi tiết
            </button>
            
            {/* Action buttons based on variant and user role */}
                        {/* Show already registered state */}
            {variant === 'participant' && isVolunteer && isAlreadyRegistered && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
                ✓ Đã đăng ký
              </div>
            )}

            {/* Registration button for participants */}
            {variant === 'participant' && isVolunteer && canRegister && (
              <button
                onClick={handleRegister}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Đăng ký tham gia
              </button>
            )}
            
            {variant === 'organizer' && isOrganizer && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/events/${event.id}/participants`)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                >
                  Quản lý
                </button>
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                >
                  Chỉnh sửa
                </button>
              </div>
            )}
            
            {/* Show already registered state for default view */}
            {variant === 'default' && isVolunteer && isAlreadyRegistered && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
                ✓ Đã đăng ký
              </div>
            )}

            {/* Default action for general browsing */}
            {variant === 'default' && isVolunteer && canRegister && (
              <button
                onClick={handleRegister}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Đăng ký tham gia
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Registration Modal */}
      <RegistrationModal
        event={event}
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onConfirm={handleConfirmRegistration}
        isLoading={isRegistering}
      />
    </div>
  );
};

export default EventCard;