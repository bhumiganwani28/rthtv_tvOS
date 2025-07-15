// src/redux/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isTablet: boolean;
}

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;
  isTablet: boolean;

}

const initialState: AuthState = {
  isLoggedIn: false,
  accessToken: null,
  user: null,
  isTablet: false,

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ accessToken: string; user: User }>) {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.accessToken = null;
      state.user = null;
    },
    setIsTablet(state, action: PayloadAction<boolean>) {
      state.isTablet = action.payload;
      console.log("isTablet set to >", action.payload);
    },
  },
});

export const { loginSuccess, logout ,setIsTablet} = authSlice.actions;
export default authSlice.reducer;
