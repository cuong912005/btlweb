import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import AuthGuard from '../../components/features/auth/AuthGuard';
import DashboardEventCard from '../../components/features/dashboard/DashboardEventCard';
import DashboardPostCard from '../../components/features/dashboard/DashboardPostCard';
import { 
  SparklesIcon,
  FireIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Error state
  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex justify-center items-center p-4">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const { widgets, roleSpecific } = dashboardData || {};

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Hero Section with Welcome */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center">
                  <SparklesIcon className="w-10 h-10 mr-3 animate-pulse" />
                  Xin chào, {user?.firstName}!
                </h1>
                <p className="text-xl text-teal-100">
                  Chào mừng trở lại với cộng đồng tình nguyện ❤️
                </p>
              </div>
              
              {/* Quick Stats */}
              {roleSpecific && (
                <div className="flex gap-4 flex-wrap">
                  {roleSpecific.participationStats && (
                    <>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[140px]">
                        <div className="text-3xl font-bold">{roleSpecific.participationStats.totalEvents}</div>
                        <div className="text-sm text-teal-100">Sự kiện tham gia</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[140px]">
                        <div className="text-3xl font-bold">{roleSpecific.participationStats.upcomingEvents}</div>
                        <div className="text-sm text-teal-100">Sắp diễn ra</div>
                      </div>
                    </>
                  )}
                  {roleSpecific.eventStats && (
                    <>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[140px]">
                        <div className="text-3xl font-bold">{roleSpecific.eventStats.totalEvents}</div>
                        <div className="text-sm text-teal-100">Sự kiện đã tạo</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[140px]">
                        <div className="text-3xl font-bold">{roleSpecific.eventStats.activeEvents}</div>
                        <div className="text-sm text-teal-100">Đang hoạt động</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-10">
            {/* Sự kiện mới công bố - Hero layout */}
            {widgets?.newlyPublishedEvents?.length > 0 && (
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-2 border-teal-200">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl p-3 shadow-lg">
                    <SparklesIcon className="h-7 w-7" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Sự kiện mới công bố ✨
                    </h2>
                    <p className="text-gray-600 mt-1">Những cơ hội tình nguyện mới nhất</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Featured - Large */}
                  {widgets.newlyPublishedEvents[0] && (
                    <div className="lg:col-span-2 transform hover:scale-[1.02] transition-transform duration-300">
                      <DashboardEventCard event={widgets.newlyPublishedEvents[0]} variant="new" />
                    </div>
                  )}
                  {/* Side events */}
                  <div className="space-y-6">
                    {widgets.newlyPublishedEvents.slice(1, 3).map((event) => (
                      <div key={event.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                        <DashboardEventCard event={event} variant="new" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Grid 2 columns cho sections tiếp theo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trending Posts */}
              {widgets?.trendingPosts?.length > 0 && (
                <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-amber-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-3 shadow-lg">
                      <FireIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Bài viết hot 🔥
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {widgets.trendingPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                        <DashboardPostCard post={post} variant="trending" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {widgets?.upcomingEvents?.length > 0 && (
                <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-cyan-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-3 shadow-lg">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        Sự kiện của bạn 📅
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {widgets.upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                        <DashboardEventCard event={event} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Trending Events - Full width */}
            {widgets?.trendingEvents?.length > 0 && (
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-200">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-3 shadow-lg">
                    <FireIcon className="h-7 w-7" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Sự kiện thu hút nhất 🌟
                    </h2>
                    <p className="text-gray-600 mt-1">Hoạt động sôi nổi trong tuần qua</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {widgets.trendingEvents.slice(0, 4).map((event) => (
                    <div key={event.id} className="transform hover:scale-[1.05] transition-transform duration-300">
                      <DashboardEventCard event={event} variant="trending" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Posts - Full width */}
            {widgets?.recentPosts?.length > 0 && (
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-2 border-emerald-200">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-3 shadow-lg">
                    <ChatBubbleLeftIcon className="h-7 w-7" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Hoạt động cộng đồng 💬
                    </h2>
                    <p className="text-gray-600 mt-1">Chia sẻ mới nhất từ các tình nguyện viên</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {widgets.recentPosts.slice(0, 4).map((post) => (
                    <div key={post.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                      <DashboardPostCard post={post} variant="recent" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {(!widgets?.newlyPublishedEvents?.length && 
              !widgets?.trendingPosts?.length && 
              !widgets?.trendingEvents?.length &&
              !widgets?.recentPosts?.length &&
              !widgets?.upcomingEvents?.length) && (
              <div className="text-center py-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md mx-auto border-2 border-teal-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <SparklesIcon className="h-12 w-12 text-teal-600 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Chào mừng đến VolunteerHub!
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    Hãy bắt đầu hành trình tình nguyện của bạn
                  </p>
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Khám phá sự kiện
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;