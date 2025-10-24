import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    initializeTheme: (state) => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      state.theme = savedTheme;
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { initializeTheme, toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
