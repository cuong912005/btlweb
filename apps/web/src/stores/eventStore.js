// eventStore.js - Zustand Event Store
import { create } from 'zustand';
import { api } from './authStore';

const useEventStore = create((set, get) => ({
  // State
  events: [],
  myEvents: [],
  myRegistrations: [],
  categories: [
    'Môi trường',
    'Giáo dục', 
    'Y tế',
    'Cộng đồng',
    'Từ thiện',
    'Cứu trợ thiên tai'
  ],
  filters: {
    search: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'APPROVED'
  },
  isLoading: false,
  error: null,
  selectedEvent: null,

  // Actions
  fetchEvents: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams();
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      // Add cache busting timestamp
      params.append('_t', Date.now().toString());

      const response = await api.get(`/events?${params.toString()}`);
      
      // Handle different response structures
      const eventsData = response.data.events || response.data || [];
      
      set({ 
        events: eventsData, 
        isLoading: false,
        filters: { ...get().filters, ...filters }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ 
        error: 'Lỗi khi tải danh sách sự kiện',
        isLoading: false 
      });
    }
  },

  createEvent: async (eventData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/events', eventData);
      const newEvent = response.data.event;
      
      set(state => ({ 
        events: [newEvent, ...state.events],
        isLoading: false
      }));
      
      // Refresh events list
      setTimeout(() => {
        get().fetchEvents(get().filters);
      }, 100);
      
      return { success: true, event: newEvent };
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi tạo sự kiện';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchMyEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/events/my-events');
      set({ 
        myEvents: response.data.events || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching my events:', error);
      set({ 
        error: 'Lỗi khi tải sự kiện của bạn',
        isLoading: false 
      });
    }
  },

  fetchMyRegistrations: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/events/my-registrations');
      set({ 
        myRegistrations: response.data.registrations || [],
        isLoading: false 
      });
      return response.data.registrations || [];
    } catch (error) {
      console.error('Error fetching my registrations:', error);
      set({ 
        error: 'Lỗi khi tải đăng ký của bạn',
        isLoading: false 
      });
      return [];
    }
  },

  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      
      // Refresh events to update registration count
      await get().fetchEvents();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error registering for event:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi đăng ký sự kiện';
      return { success: false, error: errorMessage };
    }
  },

  cancelRegistration: async (registrationId) => {
    try {
      await api.delete(`/events/registrations/${registrationId}`);
      
      // Refresh registrations and events
      await get().fetchMyRegistrations();
      await get().fetchEvents();
      
      return { success: true };
    } catch (error) {
      console.error('Error canceling registration:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi hủy đăng ký';
      return { success: false, error: errorMessage };
    }
  },

  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  applyFilters: async (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    await get().fetchEvents(newFilters);
  },

  searchEvents: async (query) => {
    await get().fetchEvents({ search: query });
  },

  refreshEvents: async (filters = {}) => {
    await get().fetchEvents({ ...filters, _refresh: Date.now() });
  },

  selectEvent: (event) => set({ selectedEvent: event }),
  
  clearSelection: () => set({ selectedEvent: null }),
  
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    events: [],
    myEvents: [],
    myRegistrations: [],
    filters: {
      search: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'APPROVED'
    },
    isLoading: false,
    error: null,
    selectedEvent: null
  })
}));

export { useEventStore };

// Legacy compatibility wrapper
export const useEvents = () => {
  const store = useEventStore();
  return store;
};