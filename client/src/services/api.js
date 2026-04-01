import axios from 'axios';

// ✅ Correct backend URL (matches your server)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ✅ Attach token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Token error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle responses safely (NO app crash)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API ERROR:', error?.response || error.message);

    // 🔐 Handle unauthorized (optional)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Avoid redirect loop crash
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // ⚠️ IMPORTANT: Always return error safely
    return Promise.reject(error);
  }
);

export { api };