import { createSlice } from '@reduxjs/toolkit';
import api from '../../lib/axios';
import { initializeSocket, disconnectSocket } from '../../lib/socket';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const { setLoading, setError, clearError, setAuth, clearAuth, updateUser } = authSlice.actions;

// Thunk actions
export const checkAuth = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(setError('No token found'));
      return;
    }

    const { data } = await api.get('/auth/me');
    
    // Initialize socket connection
    initializeSocket(token);
    
    dispatch(setAuth({ user: data.user, token, refreshToken: null }));
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch(setError(error.response?.data?.message || 'Authentication failed'));
  }
};

export const login = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.post('/auth/login', credentials);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Initialize socket connection
    initializeSocket(data.token);
    
    toast.success('Welcome back!');
    
    dispatch(setAuth({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken
    }));
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    dispatch(setError(message));
  }
};

export const register = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.post('/auth/register', userData);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Initialize socket connection
    initializeSocket(data.token);
    
    toast.success('Account created successfully!');
    
    dispatch(setAuth({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken
    }));
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    toast.error(message);
    dispatch(setError(message));
  }
};

export const logout = () => async (dispatch) => {
  try {
    await api.post('/auth/logout');
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    disconnectSocket();
    
    toast.success('Logged out successfully');
    
    dispatch(clearAuth());
  } catch (error) {
    console.error('Logout error:', error);
    dispatch(setError(error.response?.data?.message || 'Logout failed'));
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.put('/users/profile', userData);
    toast.success('Profile updated successfully');
    dispatch(updateUser(data.user));
    dispatch(setLoading(false));
  } catch (error) {
    const message = error.response?.data?.message || 'Update failed';
    toast.error(message);
    dispatch(setError(message));
  }
};

export default authSlice.reducer;
