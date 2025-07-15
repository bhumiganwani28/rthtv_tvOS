import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrendingVideo {
    _id: string;
    banner: string;
    // Add other fields based on your API response
}

interface TrendingVideosState {
    data: TrendingVideo[];
}

const initialState: TrendingVideosState = {
    data: [],
};

const trendingVideosSlice = createSlice({
    name: 'trendingVideos',
    initialState,
    reducers: {
        setTrendingVideosData: (state, action: PayloadAction<TrendingVideo[]>) => {
            state.data = action.payload;
        },
        appendTrendingVideosData: (state, action: PayloadAction<TrendingVideo[]>) => {
            state.data = [...state.data, ...action.payload];
        },
        resetTrendingVideosData: (state) => {
            state.data = [];
        },
    },
});

export const { setTrendingVideosData, appendTrendingVideosData, resetTrendingVideosData } = trendingVideosSlice.actions;

export default trendingVideosSlice.reducer;
