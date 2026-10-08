import axios from 'axios';

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (
    trimmed.includes('your-render-backend') ||
    trimmed.includes('your-backend') ||
    trimmed.includes('example.com') ||
    trimmed.includes('placeholder') ||
    trimmed === ''
  ) {
    return null;
  }
  return trimmed;
}

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLocalNetwork = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
    const envUrl = sanitizeUrl(process.env.NEXT_PUBLIC_API_URL);

    if (isLocalhost) {
      // If user explicitly forced remote API in dev
      if (process.env.NEXT_PUBLIC_FORCE_REMOTE_API === 'true' && envUrl) {
        const clean = envUrl.replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      // If NEXT_PUBLIC_API_URL is specifically pointing to localhost/127.0.0.1
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        const clean = envUrl.replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      return 'http://localhost:5000/api';
    }

    if (isLocalNetwork) {
      // If mobile connected to local dev server
      if (process.env.NEXT_PUBLIC_FORCE_REMOTE_API === 'true' && envUrl) {
        const clean = envUrl.replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        const clean = envUrl.replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      return `http://${hostname}:5000/api`;
    }

    if (envUrl && !envUrl.includes('localhost')) {
      const clean = envUrl.replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    return 'https://creatorlens-hydg.onrender.com/api';
  }
  
  const envUrl = sanitizeUrl(process.env.NEXT_PUBLIC_API_URL);
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'https://creatorlens-hydg.onrender.com/api';
};

export const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLocalNetwork = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);

    if (isLocalhost && process.env.NEXT_PUBLIC_FORCE_REMOTE_API !== 'true') {
      return 'http://localhost:5000';
    }
    if (isLocalNetwork && process.env.NEXT_PUBLIC_FORCE_REMOTE_API !== 'true') {
      return `http://${hostname}:5000`;
    }
  }
  const envSocket = sanitizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
  return envSocket || 'https://creatorlens-hydg.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000 // 60s timeout for cold-starts
});

// Add token to requests from active session storage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let token = null;
    try {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    } catch {}
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic retry config for Render free-tier cold starts
const MAX_RETRIES = 3;

// Handle 401 errors and auto-retry cold-start / wake-up network failures
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const url = config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password');
    
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    const isNetworkOrTimeout = !error.response && (
      error.code === 'ECONNABORTED' || 
      error.message?.includes('Network Error') || 
      error.message?.includes('timeout')
    );
    const isColdStartHttpError = error.response && [502, 503, 504].includes(error.response.status);

    // Auto-retry if backend is waking up
    if (config && (isNetworkOrTimeout || isColdStartHttpError)) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const delay = Math.min(2000 * config.__retryCount, 6000);
        console.warn(`[CreatorLens API] Backend warming up... Retrying (${config.__retryCount}/${MAX_RETRIES}) in ${delay}ms for: ${url}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
      error.message = 'Backend server is waking up (takes ~20-30s on Render free tier). Please wait a moment and try again.';
    }

    return Promise.reject(error);
  }
);

// Non-blocking pre-warm ping to spin up Render free-tier instance on page load with background retry
export const prewarmBackend = async () => {
  if (typeof window === 'undefined') return;
  
  const base = getBaseUrl().replace(/\/api\/?$/, '');
  const warmUrl = `${base}/health`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(warmUrl, { mode: 'cors', cache: 'no-store' });
      if (res.ok) {
        console.log(`[CreatorLens API] Backend is awake and healthy!`);
        break;
      }
    } catch {
      // Backend still booting, retry in background
      await new Promise(r => setTimeout(r, 4000));
    }
  }
};

export default api;

