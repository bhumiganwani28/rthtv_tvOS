// src/redux/slices/upcomingShowsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UpcomingShow {
  _id: string;
  coverImage: string;
  // Add other fields as needed
}

interface UpcomingShowsState {
  data: UpcomingShow[];
}

const initialState: UpcomingShowsState = {
  data: [],
};

const upcomingShowsSlice = createSlice({
  name: 'upcomingShows',
  initialState,
  reducers: {
    setUpcomingShowsData: (state, action: PayloadAction<UpcomingShow[]>) => {
      state.data = action.payload;
    },
    appendUpcomingShowsData: (state, action: PayloadAction<UpcomingShow[]>) => {
      state.data = [...state.data, ...action.payload];
    },
    resetUpcomingShowsData: (state) => {
      state.data = [];
    },
  },
});

export const {
  setUpcomingShowsData,
  appendUpcomingShowsData,
  resetUpcomingShowsData,
} = upcomingShowsSlice.actions;

export default upcomingShowsSlice.reducer;
