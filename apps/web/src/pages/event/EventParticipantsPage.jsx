import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import ParticipantCompletionManager from '../../components/features/events/ParticipantCompletionManager';
import ParticipantsList from '../../components/features/events/ParticipantsList';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const EventParticipantsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('participants');

  // Fetch event participants data
  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/events/${eventId}/participants`);
      setEventData(response.data);
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu sự kiện');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ORGANIZER' || user.role === 'ADMIN')) {
      fetchEventData();
    } else {
      navigate('/dashboard');
    }
  }, [eventId, user, navigate]);

  // Handle participant status update
  const handleParticipantUpdate = (participantId, newStatus, reason = null) => {
    setEventData(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId 
          ? { ...p, status: newStatus, rejectionReason: reason }
          : p
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchEventData}
                  className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData || !eventData.event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy sự kiện</h1>
            <button
              onClick={() => navigate('/events/my')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Quay lại danh sách sự kiện
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEventEnded = new Date(eventData.event.endDate) < new Date();
  const tabs = [
    {
      id: 'participants',
      name: 'Danh sách tham gia',
      icon: UserGroupIcon,
      count: eventData.participants.length
    }
  ];

  // Add completion tab only if event has ended
  if (isEventEnded) {
    tabs.push({
      id: 'completion',
      name: 'Quản lý hoàn thành',
      icon: CalendarIcon,
      count: eventData.participants.filter(p => 
        p.status === 'APPROVED' || p.status === 'COMPLETED'
      ).length
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {eventData.event.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(eventData.event.startDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {eventData.event.startDate && new Date(eventData.event.startDate).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {eventData.summary.approved}/{eventData.event.capacity || '∞'} người tham gia
                  </div>
                </div>
                
                {isEventEnded && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Sự kiện đã kết thúc
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{eventData.summary.pending}</div>
                    <div className="text-xs text-gray-500">Chờ duyệt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{eventData.summary.approved}</div>
                    <div className="text-xs text-gray-500">Đã duyệt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{eventData.summary.completed || 0}</div>
                    <div className="text-xs text-gray-500">Hoàn thành</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{eventData.summary.rejected}</div>
                    <div className="text-xs text-gray-500">Từ chối</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'participants' && (
            <ParticipantsList
              participants={eventData.participants}
              eventId={eventId}
              onUpdate={fetchEventData}
            />
          )}
          
          {activeTab === 'completion' && isEventEnded && (
            <ParticipantCompletionManager
              participants={eventData.participants}
              eventId={eventId}
              onUpdate={fetchEventData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventParticipantsPage;