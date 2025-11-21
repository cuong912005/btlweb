import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { 
  CalendarIcon, 
  ClockIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
  FireIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../../utils/api';

// Individual Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor, trend, trendValue }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`${bgColor} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {trend && (
        <div className={`text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trendValue}
        </div>
      )}
    </div>
  </div>
);

// Category Stats Component
const CategoryStats = ({ categories }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động theo danh mục</h3>
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-medium text-indigo-600">
                {category.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(category.count / Math.max(...categories.map(c => c.count))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {category.count}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Monthly Activity Chart Component
const MonthlyActivity = ({ monthlyData }) => {
  const maxValue = Math.max(...monthlyData.map(d => d.count));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động 12 tháng gần đây</h3>
      <div className="flex items-end justify-between space-x-1 h-32">
        {monthlyData.map((month, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-indigo-200 rounded-t-sm hover:bg-indigo-300 transition-colors cursor-pointer"
              style={{ 
                height: `${maxValue > 0 ? (month.count / maxValue) * 100 : 0}%`,
                minHeight: month.count > 0 ? '4px' : '0px'
              }}
              title={`${month.name}: ${month.count} sự kiện`}
            ></div>
            <span className="text-xs text-gray-500 mt-2 text-center">
              {month.name.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Achievements Component
const Achievements = ({ achievements, milestones }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành tích & Cột mốc</h3>
    
    {/* Current Achievements */}
    {achievements && achievements.length > 0 && (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Thành tích đã đạt được</h4>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">{achievement}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {/* Upcoming Milestones */}
    {milestones && milestones.length > 0 && (
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cột mốc sắp tới</h4>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">{milestone.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {milestone.current}/{milestone.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Main VolunteerStats Component
const VolunteerStats = () => {
  const { user } = useAuthStore();
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, year, month

  // Fetch volunteer statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || user.role !== 'VOLUNTEER') return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/events/volunteers/participation-history?stats=true&range=${timeRange}`);
        setStatsData(response.data);
      } catch (err) {
        console.error('Error fetching volunteer stats:', err);
        setError(err.response?.data?.error || 'Lỗi khi tải thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, timeRange]);

  // Redirect if not volunteer
  if (user && user.role !== 'VOLUNTEER') {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Không có quyền truy cập</h3>
        <p className="mt-2 text-sm text-gray-500">
          Trang thống kê chỉ dành cho tình nguyện viên.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có dữ liệu thống kê</h3>
        <p className="mt-2 text-sm text-gray-500">
          Hãy tham gia các sự kiện để xem thống kê của bạn!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê tình nguyện</h1>
            <p className="mt-2 text-gray-600">
              Cái nhìn tổng quan về hoạt động tình nguyện của bạn
            </p>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'year', label: 'Năm này' },
              { id: 'month', label: 'Tháng này' }
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={CalendarIcon}
            title="Tổng sự kiện"
            value={statsData.totalEvents || 0}
            subtitle={`${statsData.completedEvents || 0} đã hoàn thành`}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={ClockIcon}
            title="Giờ tình nguyện"
            value={`${statsData.totalHours || 0}h`}
            subtitle={`Trung bình ${statsData.avgHoursPerEvent || 0}h/sự kiện`}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            icon={StarIcon}
            title="Đánh giá trung bình"
            value={statsData.averageRating ? `${statsData.averageRating}/5` : 'Chưa có'}
            subtitle={`${statsData.totalRatings || 0} đánh giá`}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
          <StatCard
            icon={TrophyIcon}
            title="Tỷ lệ hoàn thành"
            value={`${statsData.completionRate || 0}%`}
            subtitle={`${statsData.participationStreak || 0} sự kiện liên tiếp`}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Impact Stats */}
        {statsData.impactStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={UserGroupIcon}
              title="Người được giúp đỡ"
              value={statsData.impactStats.peopleHelped || 0}
              subtitle="Ước tính"
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
            <StatCard
              icon={HeartIcon}
              title="Cộng đồng phục vụ"
              value={statsData.impactStats.communitiesServed || 0}
              subtitle="Khu vực"
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <StatCard
              icon={FireIcon}
              title="Streak hiện tại"
              value={`${statsData.participationStreak || 0} tháng`}
              subtitle="Hoạt động liên tục"
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
          </div>
        )}

        {/* Charts and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Statistics */}
          {statsData.categoryStats && (
            <CategoryStats categories={statsData.categoryStats} />
          )}
          
          {/* Monthly Activity */}
          {statsData.monthlyActivity && (
            <MonthlyActivity monthlyData={statsData.monthlyActivity} />
          )}
        </div>

        {/* Achievements Section */}
        {(statsData.achievements || statsData.upcomingMilestones) && (
          <Achievements 
            achievements={statsData.achievements}
            milestones={statsData.upcomingMilestones}
          />
        )}

        {/* Favorite Category */}
        {statsData.favoriteCategory && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sự thích thú</h3>
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 rounded-lg p-4">
                <HeartIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Danh mục yêu thích nhất của bạn</p>
                <p className="text-xl font-bold text-gray-900">{statsData.favoriteCategory}</p>
                <p className="text-sm text-gray-500">
                  {statsData.favoriteCategoryCount} sự kiện tham gia
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerStats;