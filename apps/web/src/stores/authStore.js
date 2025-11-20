import { create } from 'zustand';
import apiClient from '../utils/api';



const useAuthStore = create((set, get) => ({
  // State
  user: null,
  loading: false,
  error: null,
  refreshInterval: null,

  // Start periodic token refresh (every 10 minutes)
  startTokenRefresh: () => {
    const interval = setInterval(async () => {
      const { user, refreshToken } = get();
      if (user) {
        console.log('Performing periodic token refresh...');
        await refreshToken();
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    set({ refreshInterval: interval });
  },

  // Stop periodic token refresh
  stopTokenRefresh: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.user, loading: false });
      return response.data.user;
    } catch (error) {
      // If 401 (Unauthorized), try to refresh token
      if (error.response?.status === 401) {
        console.log('Access token expired, attempting refresh...');
        try {
          await apiClient.post('/auth/refresh');
          // Retry getting user info after refresh
          const retryResponse = await apiClient.get('/auth/me');
          set({ user: retryResponse.data.user, loading: false });
          return retryResponse.data.user;
        } catch (refreshError) {
          console.log('Token refresh failed, user needs to login');
          set({ user: null, loading: false });
          return null;
        }
      }
      
      console.log('Auth check failed:', error.response?.status);
      set({ user: null, loading: false });
      return null;
    }
  },

  // Initialize auth (called on app startup)
  initAuth: async () => {
    const user = await get().checkAuth();
    if (user) {
      // Start periodic token refresh if user is authenticated
      get().startTokenRefresh();
    }
    return user;
  },

  // Login
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.post('/auth/login', credentials);
      set({ user: response.data.user, loading: false });
      
      // Start periodic token refresh after successful login
      get().startTokenRefresh();
      
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || errorData?.error || 'Đăng nhập thất bại';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      console.log('Registration data being sent:', userData);
      const response = await apiClient.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      set({ user: response.data.user, loading: false });
      
      // Start periodic token refresh after successful registration
      get().startTokenRefresh();
      
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
      // Stop token refresh
      get().stopTokenRefresh();
      
      await apiClient.post('/auth/logout');
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
      await apiClient.post('/auth/refresh');
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
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Setup interceptor on the api client
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if it's a refresh endpoint or already retried
    if (error.config?.url?.includes('/auth/refresh') || 
        error.config?.url?.includes('/auth/me') ||
        originalRequest._retry) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await apiClient.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null, true);
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Only logout if refresh failed
        useAuthStore.getState().reset();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export { useAuthStore };
export const api = apiClient;