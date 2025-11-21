import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCw, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import useAdminStore from '../../stores/adminStore';
import AdminStats from '../../components/features/admin/AdminStats';
import PendingEventsList from '../../components/features/admin/PendingEventsList';
import EventApprovalActions from '../../components/features/admin/EventApprovalActions';
import DataExportSection from '../../components/features/admin/DataExportSection';
import { showSuccess } from '../../utils/toast';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchPendingEvents, fetchDashboardStats, pendingEvents, dashboardStats, isLoading } = useAdminStore();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadData = async () => {
    await Promise.all([
      fetchPendingEvents(),
      fetchDashboardStats()
    ]);
  };

  // Fetch initial data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const handleRefresh = () => {
    loadData();
  };

  const handleSuccess = (message) => {
    showSuccess(message);
    loadData();
  };

  const handleExportSuccess = (message) => {
    showSuccess(message);
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Gradient */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 p-8 shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 shadow-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  🛡️ Bảng điều khiển Admin
                </h1>
                <p className="text-white/90 text-lg">
                  Quản lý sự kiện và tình nguyện viên
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Statistics */}
        <AdminStats stats={dashboardStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Approval */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-2 border-teal-100 hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                ⏳ Sự kiện chờ phê duyệt
              </h2>
              <PendingEventsList />
            </div>

            {/* Approval Actions */}
            <EventApprovalActions onSuccess={handleSuccess} />
          </div>

          {/* Right Column - Export & Quick Actions */}
          <div className="space-y-6">
            {/* User Management Quick Link */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-teal-100 hover:shadow-2xl transition-all">
              <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                ⚙️ Quản lý hệ thống
              </h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span className="font-semibold">👥 Quản lý người dùng</span>
                </div>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <DataExportSection onExportSuccess={handleExportSuccess} />

            {/* Quick Stats Card */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-teal-100">
              <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                📊 Thông tin nhanh
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
                  <span className="text-gray-700 font-medium">⏳ Sự kiện chờ duyệt</span>
                  <span className="font-bold text-xl text-yellow-600">{dashboardStats.pendingEvents}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500">
                  <span className="text-gray-700 font-medium">🎉 Tổng sự kiện</span>
                  <span className="font-bold text-xl text-teal-600">{dashboardStats.totalEvents}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                  <span className="text-gray-700 font-medium">👥 Tổng tình nguyện viên</span>
                  <span className="font-bold text-xl text-blue-600">{dashboardStats.totalVolunteers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
