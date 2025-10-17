import { create } from 'zustand';
import axios from 'axios';

// API instance with proper configuration
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  loading: false,
  error: null,

  // Check authentication status
  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/auth/me');
      set({ user: response.data.user, loading: false });
      return response.data.user;
    } catch (error) {
      console.log('Auth check failed:', error.response?.status);
      set({ user: null, loading: false });
      return null;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', credentials);
      set({ user: response.data.user, loading: false });
      return { success: true, user: response.data.user };
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
      console.log('Registration data being sent:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      set({ user: response.data.user, loading: false });
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Registration error details:', error);
      
      let errorMessage;
      if (error.response?.status === 429) {
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      } else {
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.message ||
                      'Đăng ký thất bại';
      }
      
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, loading: false, error: null });
      // Redirect to login page after logout
      window.location.href = '/login';
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      await api.post('/auth/refresh');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout(); // Auto logout on refresh failure
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({ user: null, loading: false, error: null })
}));

// Configure axios interceptors for token refresh
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshResult = await useAuthStore.getState().refreshToken();
        isRefreshing = false;
        
        if (refreshResult) {
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export { useAuthStore, api };