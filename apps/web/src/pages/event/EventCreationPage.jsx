import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';
import EventCreationForm from '../../components/features/events/EventCreationForm';
import { SparklesIcon, LightBulbIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline';

const EventCreationPage = () => {
  const { user } = useAuthStore();
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if not an organizer
  if (user?.role !== 'ORGANIZER') {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mb-6 shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Tạo sự kiện tình nguyện mới
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kêu gọi cộng đồng tham gia hoạt động ý nghĩa. Hãy chia sẻ đam mê và tạo nên sự thay đổi tích cực!
          </p>
        </div>

        {/* Quick Tips Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 mb-4">
              <LightBulbIcon className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tiêu đề hấp dẫn</h3>
            <p className="text-sm text-gray-600">
              Tạo tiêu đề rõ ràng, súc tích để thu hút sự chú ý của tình nguyện viên
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 mb-4">
              <UserGroupIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mô tả chi tiết</h3>
            <p className="text-sm text-gray-600">
              Chia sẻ mục đích, hoạt động và lợi ích khi tham gia sự kiện của bạn
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
              <HeartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tạo tác động</h3>
            <p className="text-sm text-gray-600">
              Truyền cảm hứng và thể hiện giá trị mà sự kiện mang lại cho cộng đồng
            </p>
          </div>
        </div>

        {/* Event Creation Form */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Thông tin sự kiện</h2>
            <p className="text-teal-50 mt-1">Điền đầy đủ thông tin bên dưới để tạo sự kiện</p>
          </div>
          <div className="px-8 py-10">
            <EventCreationForm />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-10 bg-gradient-to-br from-white/60 to-teal-50/60 backdrop-blur-sm border-2 border-teal-100 rounded-3xl p-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mr-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Cần hỗ trợ?
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 rounded-2xl p-6">
              <h4 className="text-base font-bold text-gray-900 mb-2">
                📚 Hướng dẫn tạo sự kiện
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Xem video hướng dẫn chi tiết về cách tạo và quản lý sự kiện hiệu quả.
              </p>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                Xem hướng dẫn →
              </button>
            </div>
            <div className="bg-white/70 rounded-2xl p-6">
              <h4 className="text-base font-bold text-gray-900 mb-2">
                💬 Liên hệ hỗ trợ
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Gặp khó khăn trong quá trình tạo sự kiện? Hãy liên hệ với chúng tôi.
              </p>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                Liên hệ ngay →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationPage;