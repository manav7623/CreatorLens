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

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (data?.token && data?.user) {
      safeStorage.setItem('token', data.token);
      safeStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    if (data?.token && data?.user) {
      safeStorage.setItem('token', data.token);
      safeStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Registration failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    if (data?.user) {
      safeStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Update failed');
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
      state.user = action.payload;
      if (action.payload) {
        safeStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const userStr = safeStorage.getItem('user');
          const tokenStr = safeStorage.getItem('token');
          if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            state.user = JSON.parse(userStr);
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
        state.user = action.payload.user;
        state.token = action.payload.token;
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout, clearError, setUser, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
