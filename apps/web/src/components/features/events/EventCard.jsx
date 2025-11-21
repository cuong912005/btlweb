import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useEventStore } from '../../../stores/eventStore';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TagIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { showSuccess, showError } from '../../../utils/toast';

// Registration Modal Component
const RegistrationModal = ({ event, isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đăng ký</h3>
          <p className="text-gray-600 mb-6">Bạn muốn tham gia sự kiện này?</p>
          
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">{event?.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-teal-600" />
                {new Date(event?.startDate).toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-teal-600" />
                {event?.location}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Format Date Helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('vi-VN', { month: 'short' }),
    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
};

// Category Image and Color Mapping
const getCategoryStyle = (category) => {
  const styles = {
    'Môi trường': {
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    'Giáo dục': {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      gradient: 'from-cyan-500 to-teal-600',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    'Y tế': {
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    'Cộng đồng': {
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
      gradient: 'from-teal-500 to-cyan-600',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    'Từ thiện': {
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    'Cứu trợ thiên tai': {
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      gradient: 'from-rose-500 to-red-600',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600'
    }
  };
  
  return styles[category] || {
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    gradient: 'from-gray-500 to-slate-600',
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-600'
  };
};

const EventCard = ({ 
  event, 
  showActions = true,
  onRegister,
  variant = 'default',
  hideRegistration = false // New prop to hide registration buttons
}) => {
  const { user } = useAuthStore();
  const { registerForEvent } = useEventStore();
  const navigate = useNavigate();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  if (!event) return null;
  
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isAlreadyRegistered = event.participants?.some(p => p.id === user?.id) || 
                             event.registrations?.some(r => r.userId === user?.id);
  
  const participantCount = event.participantCount || event.registrationCount || event.approvedParticipants || 0;
  const capacity = event.capacity;
  
  // Check if event has expired
  const now = new Date();
  const eventEndDate = new Date(event.endDate);
  const isExpired = eventEndDate < now;
  
  const canRegister = (!capacity || participantCount < capacity) && !isAlreadyRegistered && !isExpired;
  const categoryStyle = getCategoryStyle(event.category);
  const dateInfo = formatDate(event.startDate);
  
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
        showSuccess('Đăng ký thành công! Chờ phê duyệt.');
      } else {
        showError(result.error || 'Đăng ký thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra');
    } finally {
      setIsRegistering(false);
    }
  };

  // Grid View (Default)
  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-500 ${
      isExpired 
        ? 'opacity-70 hover:shadow-lg' 
        : 'hover:shadow-2xl transform hover:-translate-y-2'
    }`}>
      {/* Expired Badge Overlay */}
      {isExpired && (
        <div className="absolute top-20 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-2xl shadow-2xl transform -rotate-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg">ĐÃ KẾT THÚC</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Section with Overlay */}
      <div className={`relative h-56 overflow-hidden ${isExpired ? 'filter grayscale' : ''}`}>
        <img 
          src={categoryStyle.image} 
          alt={event.category}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${categoryStyle.gradient} opacity-60`}></div>
        
        {/* Date Badge - Floating */}
        <div className="absolute top-4 left-4">
          <div className="bg-white rounded-2xl shadow-xl p-3 text-center min-w-[4rem]">
            <div className="text-3xl font-bold text-gray-900">{dateInfo.day}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">{dateInfo.month}</div>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg">
            <TagIcon className="h-3 w-3 mr-1.5" />
            {event.category}
          </span>
        </div>
        
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute bottom-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          {isLiked ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 
          onClick={handleViewDetails}
          className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors leading-tight"
        >
          {event.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        
        {/* Info Grid */}
        <div className="space-y-3 mb-5">
          {/* Location */}
          <div className="flex items-center text-sm">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${categoryStyle.iconBg} mr-3`}>
              <MapPinIcon className={`h-4 w-4 ${categoryStyle.iconColor}`} />
            </div>
            <span className="text-gray-700 font-medium truncate">{event.location}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center text-sm">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${categoryStyle.iconBg} mr-3`}>
              <ClockIcon className={`h-4 w-4 ${categoryStyle.iconColor}`} />
            </div>
            <span className="text-gray-700 font-medium">{dateInfo.time}</span>
          </div>
          
          {/* Participants */}
          <div className="flex items-center text-sm">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${categoryStyle.iconBg} mr-3`}>
              <UsersIcon className={`h-4 w-4 ${categoryStyle.iconColor}`} />
            </div>
            <div className="flex items-center flex-1">
              <span className="text-gray-700 font-medium">
                {participantCount} / {capacity || '∞'}
              </span>
              {capacity && (
                <div className="ml-auto">
                  {participantCount >= capacity ? (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg font-semibold">
                      Đầy
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg font-semibold">
                      {capacity - participantCount} chỗ
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center mb-5 pb-5 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {event.organizer.firstName?.charAt(0)}{event.organizer.lastName?.charAt(0)}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {event.organizer.firstName} {event.organizer.lastName}
            </span>
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Chi tiết
            </button>
            
            {/* Only show registration buttons if not in "my events" view */}
            {!hideRegistration && (
              <>
                {/* Show expired button if event has ended */}
                {isExpired && (
                  <button
                    disabled
                    className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Đã kết thúc
                  </button>
                )}
                
                {/* Show registered button if already registered */}
                {!isExpired && isVolunteer && isAlreadyRegistered && (
                  <button
                    disabled
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đã đăng ký
                  </button>
                )}

                {/* Show register button if can register */}
                {!isExpired && isVolunteer && canRegister && (
                  <button
                    onClick={handleRegister}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r ${categoryStyle.gradient} text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105`}
                  >
                    Đăng ký
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
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