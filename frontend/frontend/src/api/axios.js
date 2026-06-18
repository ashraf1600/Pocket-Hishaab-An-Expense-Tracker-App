import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 Interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 Token found?', token ? '✅ YES' : '❌ NO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found – request will be unauthorized');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;