import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token from localStorage if present (for cross-domain production)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ignite_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid tokens
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    if ((status === 401 || status === 403) &&
        !currentPath.includes('/login') &&
        !currentPath.includes('/signup')) {
      localStorage.removeItem('ignite_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;