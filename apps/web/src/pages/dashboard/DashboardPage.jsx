import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import AuthGuard from '../../components/features/auth/AuthGuard';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'VOLUNTEER':
        return 'Tình nguyện viên';
      case 'ORGANIZER':
        return 'Người tổ chức';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return role;
    }
  };

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'VOLUNTEER':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sự kiện đã tham gia
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Add more volunteer-specific cards */}
          </div>
        );
      case 'ORGANIZER':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sự kiện đã tạo
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Add more organizer-specific cards */}
          </div>
        );
      case 'ADMIN':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tổng số sự kiện
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Add more admin-specific cards */}
          </div>
        );
      default:
        return (
          <div className="text-center">
            <p className="text-gray-500">Chưa có nội dung dashboard cho vai trò này.</p>
          </div>
        );
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Tổng quan hoạt động của bạn trên VolunteerHub
              </p>
            </div>
            
            {getDashboardContent()}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;