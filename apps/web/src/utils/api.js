import axios from 'axios';


// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor will be set up in authStore.js to avoid conflicts

export default api;