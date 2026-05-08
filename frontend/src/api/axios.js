import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Response interceptor — handle expired/invalid tokens
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // If 401 or 403 and not already on login/signup page
    if ((status === 401 || status === 403) &&
        !currentPath.includes('/login') &&
        !currentPath.includes('/signup')) {

      // Clear any stale state and redirect to login
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;