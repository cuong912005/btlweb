// dashboardStore.js - Zustand Dashboard Store
import { create } from 'zustand';
import api from '../utils/api';

const useDashboardStore = create((set, get) => ({
  // State
  dashboardData: null,
  isLoading: false,
  error: null,

  // Actions
  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get('/dashboard');
      
      set({ 
        dashboardData: response.data,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      set({ 
        error: error.response?.data?.error || 'Không thể tải dữ liệu dashboard',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear dashboard data
  clearDashboard: () => {
    set({ 
      dashboardData: null,
      error: null 
    });
  }
}));

export { useDashboardStore };
