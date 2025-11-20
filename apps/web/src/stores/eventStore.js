// eventStore.js - Zustand Event Store
import { create } from 'zustand';
import api from '../utils/api';

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
    status: 'APPROVED',
    sortBy: 'date',
    sortOrder: 'asc',
    page: 1,
    limit: 12,
    availability: 'all',
    eventStatus: 'all',
    registrationStatus: 'all'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12
  },
  isLoading: false,
  error: null,
  selectedEvent: null,

  // Actions
  fetchEvents: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      const params = new URLSearchParams();
      
      // Apply filters - only include non-empty values
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          params.append(key, value);
        }
      });

      // Add cache busting timestamp
      params.append('_t', Date.now().toString());

      const response = await api.get(`/events?${params.toString()}`);
      
      // Handle response with pagination data
      const responseData = response.data;
      const eventsData = responseData.events || responseData || [];
      const paginationData = responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: eventsData.length,
        hasNext: false,
        hasPrev: false,
        limit: currentFilters.limit
      };
      
      set({ 
        events: eventsData, 
        pagination: paginationData,
        isLoading: false,
        filters: currentFilters
      });
      
      return { events: eventsData, pagination: paginationData };
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ 
        error: 'Lỗi khi tải danh sách sự kiện',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchEventDetail: async (eventId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/events/${eventId}`);
      const eventData = response.data.event || response.data;
      
      set({ 
        selectedEvent: eventData,
        isLoading: false
      });
      
      return eventData;
    } catch (error) {
      console.error('Error fetching event detail:', error);
      set({ 
        error: 'Lỗi khi tải chi tiết sự kiện',
        isLoading: false 
      });
      throw error;
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
      // Use the richer participation-history endpoint which includes rating, ratedAt and canRate
      // so UI components (ParticipationHistory modal) can correctly determine rating eligibility.
      const response = await api.get('/events/volunteers/participation-history');
      const eventsData = response.data?.events || {};

      // Flatten into a single list while preserving ordering (completed + upcoming + pending + rejected)
      const flattened = [
        ...(eventsData.completed || []),
        ...(eventsData.upcoming || []),
        ...(eventsData.pending || []),
        ...(eventsData.rejected || [])
      ];

      set({ 
        myRegistrations: flattened,
        isLoading: false 
      });

      return flattened;
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
      
      // Refresh event detail if it's the selected event
      if (get().selectedEvent?.id === eventId) {
        try {
          await get().fetchEventDetail(eventId);
        } catch (err) {
          console.error('Error refreshing event detail:', err);
        }
      }
      
      // Refresh events list with current filters
      try {
        await get().fetchEvents(get().filters);
      } catch (err) {
        console.error('Error refreshing events list:', err);
      }
      
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

  rateEvent: async (eventId, rating, feedback) => {
    try {
      const response = await api.post(`/events/${eventId}/rate`, {
        rating,
        feedback: feedback?.trim() || undefined
      });
      
      // Refresh registrations to show updated rating
      await get().fetchMyRegistrations();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error rating event:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi đánh giá sự kiện';
      return { success: false, error: errorMessage };
    }
  },

  updateParticipantStatus: async (participantId, status, reason = null, isCompleted = null) => {
    try {
      const payload = { status };
      if (reason) payload.reason = reason;
      if (isCompleted !== null) payload.isCompleted = isCompleted;

      const response = await api.patch(`/events/participants/${participantId}/status`, payload);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating participant status:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi cập nhật trạng thái';
      return { success: false, error: errorMessage };
    }
  },

  bulkUpdateParticipantStatus: async (participantIds, status, reason = null, isCompleted = null) => {
    try {
      const payload = { participantIds, status };
      if (reason) payload.reason = reason;
      if (isCompleted !== null) payload.isCompleted = isCompleted;

      const response = await api.patch(`/events/participants/bulk-status`, payload);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error bulk updating participant status:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi cập nhật hàng loạt';
      return { success: false, error: errorMessage };
    }
  },

  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  applyFilters: async (newFilters) => {
    // Reset to page 1 when applying new filters
    const filtersWithPage = { ...newFilters, page: 1 };
    set(state => ({
      filters: { ...state.filters, ...filtersWithPage }
    }));
    await get().fetchEvents(filtersWithPage);
  },

  searchEvents: async (query) => {
    await get().fetchEvents({ search: query, page: 1 });
  },

  refreshEvents: async (filters = {}) => {
    await get().fetchEvents({ ...filters, _refresh: Date.now() });
  },

  // Pagination methods
  nextPage: async () => {
    const { filters, pagination } = get();
    if (pagination.hasNext) {
      const newPage = pagination.currentPage + 1;
      await get().fetchEvents({ ...filters, page: newPage });
    }
  },

  prevPage: async () => {
    const { filters, pagination } = get();
    if (pagination.hasPrev) {
      const newPage = pagination.currentPage - 1;
      await get().fetchEvents({ ...filters, page: newPage });
    }
  },

  goToPage: async (page) => {
    const { filters, pagination } = get();
    if (page >= 1 && page <= pagination.totalPages) {
      await get().fetchEvents({ ...filters, page });
    }
  },

  changePageSize: async (limit) => {
    const { filters } = get();
    await get().fetchEvents({ ...filters, limit, page: 1 });
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
      status: 'APPROVED',
      sortBy: 'date',
      sortOrder: 'asc',
      page: 1,
      limit: 12,
      availability: 'all'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrev: false,
      limit: 12
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