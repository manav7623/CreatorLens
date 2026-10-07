import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      // Clear persistent legacy storage so session ends when browser/tab closes
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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
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
          // Clear any legacy persistent storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Read only active browser session storage
          const user = sessionStorage.getItem('user');
          const token = sessionStorage.getItem('token');
          state.user = user ? JSON.parse(user) : null;
          state.token = token || null;
        } catch {
          state.user = null;
          state.token = null;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout, clearError, setUser, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
