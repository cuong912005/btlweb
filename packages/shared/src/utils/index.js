// Shared utilities for VolunteerHub

// Date formatting utilities for Vietnamese locale
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateVietnamesePhone = (phone) => {
  // Vietnamese phone number patterns
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// API response helpers
export const createSuccessResponse = (data = null, message = '') => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

export const createErrorResponse = (message = '', details = null) => {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  };
};

// Text utilities for Vietnamese
export const capitalizeVietnamese = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Event utilities
export const isEventUpcoming = (eventDate) => {
  return new Date(eventDate) > new Date();
};

export const isEventToday = (eventDate) => {
  const today = new Date();
  const event = new Date(eventDate);
  return today.toDateString() === event.toDateString();
};

export const getEventStatus = (eventDate, status) => {
  if (status === 'COMPLETED') return 'COMPLETED';
  if (new Date(eventDate) < new Date()) return 'PAST';
  return status;
};

// Debounce utility for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};