import axios from 'axios';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost')) {
      const clean = envUrl.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    return 'https://creatorlens-hydg.onrender.com/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://creatorlens-hydg.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000 // 90s timeout to allow Render free-tier cold boot
});

// Add token to requests from active session storage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors and enrich timeout/network errors for cold-starts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password');
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }

    if (!error.response && (error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || error.message?.includes('timeout'))) {
      error.message = 'Backend server is waking up (takes ~20-30s). Please wait a moment and try again.';
    }

    return Promise.reject(error);
  }
);

// Non-blocking pre-warm ping to start spinning up Render free-tier instance on page load
export const prewarmBackend = () => {
  if (typeof window !== 'undefined') {
    try {
      const base = getBaseUrl().replace(/\/api\/?$/, '');
      fetch(`${base}/health`, { mode: 'cors' }).catch(() => {});
    } catch {
      // ignore pre-warm error
    }
  }
};

export default api;

