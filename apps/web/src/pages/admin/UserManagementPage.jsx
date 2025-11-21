import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Lock, Unlock, RefreshCw, UserX, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import useAdminStore from '../../stores/adminStore';
import { showSuccess, showError } from '../../utils/toast';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    users, 
    userPagination, 
    isLoading, 
    error,
    fetchUsers,
    toggleUserStatus,
    clearError 
  } = useAdminStore();

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch users on mount
  useEffect(() => {
    if (user?.role === 'ADMIN' && fetchUsers) {
      fetchUsers(1, 20, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Fetch when role or status filters change
  useEffect(() => {
    if (user?.role === 'ADMIN' && (filters.role || filters.status !== '')) {
      fetchUsers(1, 20, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role, filters.status]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, 20, filters);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, 20, filters);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    const result = await toggleUserStatus(selectedUser.id);
    if (result.success) {
      showSuccess(result.message);
      setShowConfirmDialog(false);
      setSelectedUser(null);
    } else {
      showError(result.error || 'Có lỗi xảy ra');
    }
  };

  const openConfirmDialog = (user) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const getRoleBadge = (role) => {
    const styles = {
      VOLUNTEER: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border border-teal-200',
      ORGANIZER: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200',
      ADMIN: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-200'
    };
    const labels = {
      VOLUNTEER: 'Tình nguyện viên',
      ORGANIZER: 'Quản lý sự kiện',
      ADMIN: 'Quản trị viên'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  👥 Quản lý người dùng
                </h1>
                <p className="text-white/90 text-lg">
                  Xem và quản lý tài khoản người dùng
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchUsers(userPagination.currentPage, 20, filters)}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-teal-100 mb-6">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3 shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">🔍 Bộ lọc</h2>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Tìm theo tên, email..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="VOLUNTEER">Tình nguyện viên</option>
                <option value="ORGANIZER">Quản lý sự kiện</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-teal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Đang tải...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <UserX className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.location || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'Chưa cập nhật'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>TC: {user.eventsOrganized}</div>
                        <div>TG: {user.eventsParticipated}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200 shadow-sm">
                            <UserX className="h-3 w-3 mr-1" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => openConfirmDialog(user)}
                          className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-sm ${
                            user.isActive 
                              ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:from-red-200 hover:to-pink-200 border border-red-200' 
                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border border-green-200'
                          }`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.isActive ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Mở khóa
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userPagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(userPagination.currentPage - 1)}
                  disabled={!userPagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(userPagination.currentPage + 1)}
                  disabled={!userPagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(userPagination.currentPage - 1) * 20 + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(userPagination.currentPage * 20, userPagination.totalCount)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{userPagination.totalCount}</span> người dùng
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(userPagination.currentPage - 1)}
                      disabled={!userPagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {[...Array(Math.min(userPagination.totalPages, 5))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition-all ${
                            page === userPagination.currentPage
                              ? 'z-10 bg-gradient-to-r from-teal-500 to-cyan-600 border-teal-500 text-white shadow-lg'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-teal-50 hover:border-teal-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(userPagination.currentPage + 1)}
                      disabled={!userPagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        {showConfirmDialog && selectedUser && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 border-2 border-teal-100">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                {selectedUser.isActive ? '🔒 Khóa tài khoản' : '🔓 Mở khóa tài khoản'}
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn {selectedUser.isActive ? 'khóa' : 'mở khóa'} tài khoản của{' '}
                <span className="font-semibold">{selectedUser.name}</span>?
                {selectedUser.isActive && (
                  <span className="block mt-2 text-sm text-red-600">
                    Người dùng sẽ không thể đăng nhập sau khi bị khóa.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isLoading}
                  className={`px-6 py-2.5 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transform hover:scale-105 ${
                    selectedUser.isActive
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {isLoading ? 'Đang xử lý...' : selectedUser.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;