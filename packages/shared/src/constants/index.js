// Shared constants for VolunteerHub

// User roles
export const USER_ROLES = {
  VOLUNTEER: 'VOLUNTEER',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN'
};

// Event status values
export const EVENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

// Participation status values
export const PARTICIPATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

// Event categories
export const EVENT_CATEGORIES = {
  ENVIRONMENT: 'ENVIRONMENT', // Môi trường
  EDUCATION: 'EDUCATION', // Giáo dục
  HEALTHCARE: 'HEALTHCARE', // Y tế
  COMMUNITY: 'COMMUNITY', // Cộng đồng
  CHARITY: 'CHARITY', // Từ thiện
  DISASTER_RELIEF: 'DISASTER_RELIEF' // Cứu trợ thiên tai
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  EVENTS: '/api/events',
  USERS: '/api/users',
  CHANNELS: '/api/channels'
};

// Vietnamese translations for status
export const STATUS_LABELS_VI = {
  PENDING: 'Đang chờ',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Đã từ chối',
  COMPLETED: 'Đã hoàn thành'
};

// Vietnamese translations for roles
export const ROLE_LABELS_VI = {
  VOLUNTEER: 'Tình nguyện viên',
  ORGANIZER: 'Quản lý sự kiện',
  ADMIN: 'Quản trị viên'
};

// Vietnamese translations for categories
export const CATEGORY_LABELS_VI = {
  ENVIRONMENT: 'Môi trường',
  EDUCATION: 'Giáo dục',
  HEALTHCARE: 'Y tế',
  COMMUNITY: 'Cộng đồng',
  CHARITY: 'Từ thiện',
  DISASTER_RELIEF: 'Cứu trợ thiên tai'
};