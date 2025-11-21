import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../../components/features/auth/AuthGuard';
import ParticipationHistory from '../../components/features/events/ParticipationHistory';
import api from '../../utils/api';
import { 
  UserIcon, 
  ClockIcon, 
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const VolunteerProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showParticipationHistory, setShowParticipationHistory] = useState(false);
  const [participationData, setParticipationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch participation data
  const fetchParticipationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/events/volunteers/participation-history');
      setParticipationData(response.data);
    } catch (err) {
      console.error('Error fetching participation data:', err);
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu lịch sử tham gia');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'VOLUNTEER') {
      navigate('/dashboard');
      return;
    }
    if (user && user.role === 'VOLUNTEER') {
      fetchParticipationData();
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg overflow-hidden mb-6">
      <div className="px-6 py-8 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <UserIcon className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
              <TrophyIcon className="h-5 w-5 text-teal-600" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {user.fullName || user.email}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 text-white/90">
              {user.phone && (
                <span className="text-sm">📞 {user.phone}</span>
              )}
              {user.email && (
                <span className="text-sm">✉️ {user.email}</span>
              )}
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                🌟 Tình nguyện viên
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <ProfileHeader />

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-teal-500">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {participationData?.stats?.totalEvents || 0}
              </div>
              <div className="text-sm text-gray-600">Tổng sự kiện</div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {participationData?.stats?.totalHours || 0}h
              </div>
              <div className="text-sm text-gray-600">Giờ tình nguyện</div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {typeof participationData?.stats?.completionRate === 'number' 
                  ? `${Number(participationData.stats.completionRate).toFixed(0)}%` 
                  : '0%'}
              </div>
              <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {participationData?.stats?.averageRating > 0 
                  ? `${Number(participationData.stats.averageRating).toFixed(1)}/5` 
                  : '--'}
              </div>
              <div className="text-sm text-gray-600">Đánh giá TB</div>
            </div>
          </div>

          {/* Event Status Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md p-6 border border-yellow-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-700 mb-1">
                  {participationData?.events?.upcoming?.length || 0}
                </div>
                <div className="text-sm font-medium text-yellow-800">🔜 Sắp tới</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md p-6 border border-blue-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-700 mb-1">
                  {participationData?.events?.completed?.length || 0}
                </div>
                <div className="text-sm font-medium text-blue-800">✅ Hoàn thành</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-md p-6 border border-orange-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-700 mb-1">
                  {participationData?.events?.pending?.length || 0}
                </div>
                <div className="text-sm font-medium text-orange-800">⏳ Chờ duyệt</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-md p-6 border border-red-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-700 mb-1">
                  {participationData?.events?.rejected?.length || 0}
                </div>
                <div className="text-sm font-medium text-red-800">❌ Từ chối</div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">📋 Sự kiện gần đây</h3>
              <button
                onClick={() => setShowParticipationHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-colors border border-white/30"
              >
                Xem tất cả
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : participationData?.events && [...(participationData.events.completed || []), ...(participationData.events.upcoming || [])].length > 0 ? (
                <div className="space-y-3">
                  {[...(participationData.events.completed || []), ...(participationData.events.upcoming || [])]
                    .slice(0, 5)
                    .map((entry, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {entry.event.title}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(entry.event.startDate).toLocaleDateString('vi-VN')}
                            </span>
                            {entry.event.category && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {entry.event.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                            entry.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            entry.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {entry.status === 'COMPLETED' ? '✅ Hoàn thành' : 
                             entry.status === 'APPROVED' ? '✔️ Đã duyệt' : 
                             entry.status === 'PENDING' ? '⏳ Chờ duyệt' : 
                             '❌ Từ chối'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử tham gia</h3>
                  <p className="text-gray-600 mb-6">
                    Hãy đăng ký tham gia các sự kiện tình nguyện để xây dựng hồ sơ của bạn!
                  </p>
                  <button
                    onClick={() => navigate('/events')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md"
                  >
                    Khám phá sự kiện
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {showParticipationHistory && (
            <ParticipationHistory 
              data={participationData} 
              onClose={() => setShowParticipationHistory(false)} 
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default VolunteerProfilePage;