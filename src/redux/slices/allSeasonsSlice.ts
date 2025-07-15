import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Season {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  webBanner: string;
  // Add other fields based on your API response
}

interface AllSeasonsState {
  data: Season[];
}

const initialState: AllSeasonsState = {
  data: [],
};

const allSeasonsSlice = createSlice({
  name: 'allSeasons',
  initialState,
  reducers: {
    setSeasonsData: (state, action: PayloadAction<Season[]>) => {
      state.data = action.payload;
    },
    appendSeasonsData: (state, action: PayloadAction<Season[]>) => {
      state.data = [...state.data, ...action.payload];
    },
    resetSeasonsData: (state) => {
      state.data = [];
    },
  },
});

export const { setSeasonsData, appendSeasonsData, resetSeasonsData } = allSeasonsSlice.actions;

export default allSeasonsSlice.reducer;
