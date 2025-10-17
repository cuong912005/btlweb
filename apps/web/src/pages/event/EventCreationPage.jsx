import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';
import EventCreationForm from '../../components/features/events/EventCreationForm';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo sự kiện tình nguyện mới
            </h1>
            <p className="mt-2 text-gray-600">
              Tạo một hoạt động tình nguyện để kêu gọi sự tham gia từ cộng đồng.
              Hãy cung cấp thông tin chi tiết để thu hút nhiều tình nguyện viên.
            </p>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Mẹo tạo sự kiện thu hút
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Viết tiêu đề rõ ràng, súc tích</li>
                    <li>Mô tả chi tiết mục đích và ý nghĩa của hoạt động</li>
                    <li>Chọn thời gian phù hợp với đối tượng tham gia</li>
                    <li>Cung cấp địa điểm cụ thể và cách thức di chuyển</li>
                    <li>Nêu rõ yêu cầu về kỹ năng (nếu có)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Creation Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-8">
            <EventCreationForm />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cần hỗ trợ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Hướng dẫn tạo sự kiện
              </h4>
              <p className="text-sm text-gray-600">
                Xem video hướng dẫn chi tiết về cách tạo và quản lý sự kiện hiệu quả.
              </p>
              <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-500">
                Xem hướng dẫn 
              </button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Liên hệ hỗ trợ
              </h4>
              <p className="text-sm text-gray-600">
                Gặp khó khăn trong quá trình tạo sự kiện? Hãy liên hệ với chúng tôi.
              </p>
              <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-500">
                Liên hệ hỗ trợ 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationPage;