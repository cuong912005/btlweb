import { create } from 'zustand';
import apiClient from '../utils/api';

const useAdminStore = create((set, get) => ({
  // State
  pendingEvents: [],
  approvalHistory: [],
  isLoading: false,
  error: null,
  selectedEvents: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  },
  dashboardStats: {
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    totalVolunteers: 0
  },

  // Fetch dashboard statistics
  fetchDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      set({ 
        dashboardStats: response.data.stats
      });
      return { success: true, stats: response.data.stats };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi lấy thống kê';
      console.error('fetchDashboardStats error:', error);
      return { success: false, error: message };
    }
  },

  // Fetch pending events
  fetchPendingEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get('/admin/events/pending');
      set({ 
        pendingEvents: response.data.pendingEvents,
        pagination: {
          ...get().pagination,
          totalCount: response.data.totalCount
        },
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi lấy danh sách sự kiện chờ phê duyệt';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Approve a single event
  approveEvent: async (eventId, reason = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.patch(`/admin/events/${eventId}/approval`, {
        action: 'approve',
        reason
      });
      
      // Remove from pending events
      set(state => ({
        pendingEvents: state.pendingEvents.filter(event => event.id !== eventId),
        isLoading: false
      }));
      
      return { success: true, event: response.data.event };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi phê duyệt sự kiện';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Reject a single event
  rejectEvent: async (eventId, reason) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.patch(`/admin/events/${eventId}/approval`, {
        action: 'reject',
        reason
      });
      
      // Remove from pending events
      set(state => ({
        pendingEvents: state.pendingEvents.filter(event => event.id !== eventId),
        isLoading: false
      }));
      
      return { success: true, event: response.data.event };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi từ chối sự kiện';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Bulk approval/rejection
  bulkApproval: async (eventIds, action, reason = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.patch('/admin/events/bulk-approval', {
        eventIds,
        action,
        reason
      });
      
      // Remove processed events from pending list
      set(state => ({
        pendingEvents: state.pendingEvents.filter(event => 
          !eventIds.includes(event.id)
        ),
        selectedEvents: [], // Clear selection
        isLoading: false
      }));
      
      return { 
        success: true, 
        processedCount: response.data.processedCount,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi xử lý hàng loạt';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Fetch approval history
  fetchApprovalHistory: async (page = 1, limit = 20, status = null) => {
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await apiClient.get(`/admin/events/approval-history?${params}`);
      set({ 
        approvalHistory: response.data.history || response.data.events || [],
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalCount: 0
        },
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi lấy lịch sử phê duyệt';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Export events
  exportEvents: async (format = 'csv') => {
    try {
      const response = await apiClient.get(`/admin/export/events?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `events-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi xuất danh sách sự kiện';
      return { success: false, error: message };
    }
  },

  // Export volunteers
  exportVolunteers: async (format = 'csv') => {
    try {
      const response = await apiClient.get(`/admin/export/volunteers?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `volunteers-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi xuất danh sách tình nguyện viên';
      return { success: false, error: message };
    }
  },

  // Selection management
  toggleEventSelection: (eventId) => {
    set(state => ({
      selectedEvents: state.selectedEvents.includes(eventId)
        ? state.selectedEvents.filter(id => id !== eventId)
        : [...state.selectedEvents, eventId]
    }));
  },

  selectAllEvents: () => {
    set(state => ({
      selectedEvents: state.pendingEvents.map(event => event.id)
    }));
  },

  clearSelection: () => set({ selectedEvents: [] }),

  // Clear error
  clearError: () => set({ error: null }),

  // User Management
  users: [],
  userDetails: null,
  userPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  },

  // Fetch users with filters
  fetchUsers: async (page = 1, limit = 20, filters = {}) => {
    console.log('[AdminStore] fetchUsers called with:', { page, limit, filters });
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams({ page, limit });
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status && filters.status !== '') {
        params.append('status', filters.status);
      }
      if (filters.search) params.append('search', filters.search);
      
      console.log('[AdminStore] Calling API:', `/admin/users?${params}`);
      const response = await apiClient.get(`/admin/users?${params}`);
      console.log('[AdminStore] API response:', response.data);
      set({ 
        users: response.data.users,
        userPagination: response.data.pagination,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      console.error('[AdminStore] fetchUsers error:', error);
      const message = error.response?.data?.error || 'Lỗi khi lấy danh sách người dùng';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Fetch user details
  fetchUserDetails: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get(`/admin/users/${userId}`);
      set({ 
        userDetails: response.data.user,
        isLoading: false 
      });
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi lấy thông tin người dùng';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Toggle user status (lock/unlock)
  toggleUserStatus: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
      
      // Update user in list
      set(state => ({
        users: state.users.map(user => 
          user.id === userId 
            ? { ...user, isActive: response.data.user.isActive }
            : user
        ),
        userDetails: state.userDetails?.id === userId
          ? { ...state.userDetails, isActive: response.data.user.isActive }
          : state.userDetails,
        isLoading: false
      }));
      
      return { 
        success: true, 
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi khi thay đổi trạng thái tài khoản';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }
}));

export default useAdminStore;
