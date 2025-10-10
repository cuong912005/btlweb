import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  // Check authentication status
  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      set({ user: response.data.user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/auth/login', credentials, {
        withCredentials: true
      });
      set({ user: response.data.user, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng nhập thất bại';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/auth/register', userData, {
        withCredentials: true
      });
      set({ user: response.data.user, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng ký thất bại';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, loading: false, error: null });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export { useAuthStore };