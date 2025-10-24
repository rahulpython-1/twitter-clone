import { createSlice } from '@reduxjs/toolkit';
import api from '../../lib/axios';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.isLoading = false;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    }
  }
});

export const { 
  setLoading, 
  setError, 
  setNotifications, 
  addNotification, 
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = notificationSlice.actions;

// Thunk actions
export const fetchNotifications = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.get('/notifications');
    dispatch(setNotifications({
      notifications: data.notifications,
      unreadCount: data.unreadCount
    }));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch notifications'));
  }
};

export const markAsRead = (notificationId) => async (dispatch) => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
    dispatch(markNotificationAsRead(notificationId));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to mark as read'));
  }
};

export const markAllAsRead = () => async (dispatch) => {
  try {
    await api.put('/notifications/read-all');
    dispatch(markAllNotificationsAsRead());
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to mark all as read'));
  }
};

export default notificationSlice.reducer;
