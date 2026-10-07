import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Registration failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('user');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || 'Update failed');
  }
});

const getInitialSession = () => {
  if (typeof window !== 'undefined') {
    try {
      const user = sessionStorage.getItem('user');
      const token = sessionStorage.getItem('token');
      if (user && token) {
        return { user: JSON.parse(user), token, isInitialized: true };
      }
    } catch {
      // ignore
    }
  }
  return { user: null, token: null, isInitialized: false };
};

const initialSession = getInitialSession();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialSession.user,
    token: initialSession.token,
    loading: false,
    error: null,
    isInitialized: initialSession.isInitialized,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      if (typeof window !== 'undefined' && action.payload) {
        sessionStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const user = sessionStorage.getItem('user');
          const token = sessionStorage.getItem('token');
          state.user = user ? JSON.parse(user) : null;
          state.token = token || null;
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
