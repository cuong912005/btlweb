import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import EventDiscovery from '../../components/features/events/EventDiscovery';

const EventDiscoveryPage = () => {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Welcome Banner for Volunteers */}
      {user?.role === 'VOLUNTEER' && (
        <div className="bg-indigo-600">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-indigo-800">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
                <p className="ml-3 font-medium text-white truncate">
                  <span className="md:hidden">
                    Chào mừng bạn đến với cộng đồng tình nguyện!
                  </span>
                  <span className="hidden md:inline">
                    Chào mừng {user?.name} đến với cộng đồng tình nguyện! Hãy tìm kiếm những hoạt động phù hợp với bạn.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">150+</div>
              <div className="text-sm text-gray-500">Sự kiện đã tổ chức</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2,500+</div>
              <div className="text-sm text-gray-500">Tình nguyện viên</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">50+</div>
              <div className="text-sm text-gray-500">Tổ chức đối tác</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-500">Tỉnh thành</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Event Discovery Component */}
      <EventDiscovery />

      {/* Call to Action for Organizers */}
      {(!user || user?.role === 'ORGANIZER') && (
        <div className="bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Bạn là tổ chức hoặc cá nhân muốn tổ chức sự kiện?
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-300">
                Tham gia cùng chúng tôi để tạo ra những hoạt động tình nguyện có ý nghĩa cho cộng đồng.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                {!user ? (
                  <>
                    <a
                      href="/register"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                    >
                      Đăng ký tài khoản
                    </a>
                    <a
                      href="/login"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Đăng nhập
                    </a>
                  </>
                ) : user.role === 'ORGANIZER' ? (
                  <a
                    href="/events/create"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                  >
                    Tạo sự kiện mới
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDiscoveryPage;