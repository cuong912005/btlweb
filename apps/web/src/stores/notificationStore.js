import { create } from 'zustand';
import api from '../utils/api';
import { io } from 'socket.io-client';

let socket = null;

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isConnected: false,
  pushSubscription: null,
  
  // Socket.IO connection
  connectSocket: (userId) => {
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Notification socket connected:', socket.id);
      set({ isConnected: true });
      
      // Join user's personal notification room
      socket.emit('join-user-notifications', userId);
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
      set({ isConnected: false });
    });

    // Listen for new notifications
    socket.on('new-notification', (notification) => {
      console.log('New notification received:', notification);
      get().addNotification(notification);
    });

    socket.on('notification-read', (notificationId) => {
      get().markAsReadLocally(notificationId);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
    });
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      set({ isConnected: false });
    }
  },

  // Fetch notification history
  fetchNotifications: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/notifications/history', {
        params: { page, limit }
      });
      
      set({ 
        notifications: response.data.notifications,
        isLoading: false 
      });
      
      // Calculate unread count
      const unread = response.data.notifications.filter(n => !n.isRead).length;
      set({ unreadCount: unread });
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi tải thông báo';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Add notification from Socket.IO
  addNotification: (notification) => {
    set(state => {
      // Check if notification already exists
      const exists = state.notifications.some(n => n.id === notification.id);
      if (exists) return state;
      
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi đánh dấu đã đọc';
      return { success: false, error: errorMsg };
    }
  },

  // Mark as read locally (from Socket.IO)
  markAsReadLocally: (notificationId) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.isRead) return state;
      
      return {
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    });
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi đánh dấu tất cả đã đọc';
      return { success: false, error: errorMsg };
    }
  },

  // Web Push subscription
  subscribeToPush: async (subscription) => {
    try {
      const response = await api.post('/notifications/subscribe', subscription);
      set({ pushSubscription: subscription });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi đăng ký thông báo push';
      return { success: false, error: errorMsg };
    }
  },

  unsubscribeFromPush: async (endpoint) => {
    try {
      await api.delete('/notifications/unsubscribe', { data: { endpoint } });
      set({ pushSubscription: null });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi khi hủy đăng ký thông báo push';
      return { success: false, error: errorMsg };
    }
  },

  getVapidPublicKey: async () => {
    try {
      const response = await api.get('/notifications/vapid-public-key');
      return { success: true, publicKey: response.data.publicKey };
    } catch (error) {
      return { success: false, error: 'Lỗi khi lấy VAPID key' };
    }
  },

  checkSubscriptionStatus: async () => {
    try {
      const response = await api.get('/notifications/subscription-status');
      return { success: true, hasSubscriptions: response.data.hasValidSubscriptions };
    } catch (error) {
      return { success: false, error: 'Lỗi khi kiểm tra trạng thái đăng ký' };
    }
  },

  clearError: () => set({ error: null }),
  
  reset: () => {
    get().disconnectSocket();
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      isConnected: false,
      pushSubscription: null
    });
  }
}));
