import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

const safeStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, val) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(key, val); } catch {}
    try { localStorage.setItem(key, val); } catch {}
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  }
};

const sanitizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const user = { ...rawUser };
  
  if (user._id && !user.id) user.id = user._id;
  if (user.id && !user._id) user._id = user.id;

  if (typeof user.creatorProfile === 'string') {
    try {
      user.creatorProfile = JSON.parse(user.creatorProfile);
    } catch {
      user.creatorProfile = {};
    }
  }
  if (!user.creatorProfile || typeof user.creatorProfile !== 'object') {
    user.creatorProfile = {};
  }
  if (!Array.isArray(user.creatorProfile.niche)) {
    user.creatorProfile.niche = typeof user.creatorProfile.niche === 'string' ? [user.creatorProfile.niche] : [];
  }
  if (!user.creatorProfile.rateCard || typeof user.creatorProfile.rateCard !== 'object') {
    user.creatorProfile.rateCard = { postRate: 0, storyRate: 0, videoRate: 0 };
  }
  if (!user.creatorProfile.socialLinks || typeof user.creatorProfile.socialLinks !== 'object') {
    user.creatorProfile.socialLinks = {};
  }

  if (typeof user.brandProfile === 'string') {
    try {
      user.brandProfile = JSON.parse(user.brandProfile);
    } catch {
      user.brandProfile = {};
    }
  }
  if (!user.brandProfile || typeof user.brandProfile !== 'object') {
    user.brandProfile = {};
  }

  return user;
};

const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  const raw = err.response?.data?.error || err.message || fallback;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.message || JSON.stringify(raw);
  return String(raw);
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (data?.token && data?.user) {
      const cleanUser = sanitizeUser(data.user);
      safeStorage.setItem('token', data.token);
      safeStorage.setItem('user', JSON.stringify(cleanUser));
      return { ...data, user: cleanUser };
    }
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Login failed'));
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    if (data?.token && data?.user) {
      const cleanUser = sanitizeUser(data.user);
      safeStorage.setItem('token', data.token);
      safeStorage.setItem('user', JSON.stringify(cleanUser));
      return { ...data, user: cleanUser };
    }
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Registration failed'));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    if (data?.user) {
      const cleanUser = sanitizeUser(data.user);
      safeStorage.setItem('user', JSON.stringify(cleanUser));
      return { ...data, user: cleanUser };
    }
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Update failed'));
  }
});

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true;
      safeStorage.removeItem('token');
      safeStorage.removeItem('user');
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      const cleanUser = sanitizeUser(action.payload);
      state.user = cleanUser;
      if (cleanUser) {
        safeStorage.setItem('user', JSON.stringify(cleanUser));
      }
    },
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const userStr = safeStorage.getItem('user');
          const tokenStr = safeStorage.getItem('token');
          if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            state.user = sanitizeUser(JSON.parse(userStr));
          } else {
            state.user = null;
          }
          state.token = tokenStr || null;
        } catch {
          state.user = null;
          state.token = null;
        }
      }
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = sanitizeUser(action.payload?.user);
        state.token = action.payload?.token || null;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = sanitizeUser(action.payload?.user);
        state.token = action.payload?.token || null;
        state.isInitialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = sanitizeUser(action.payload?.user);
      });
  }
});

export const { logout, clearError, setUser, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
