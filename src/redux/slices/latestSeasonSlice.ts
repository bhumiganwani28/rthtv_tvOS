import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LatestSeasonItem {
    _id: string;
    banner: string;
    // Add other fields based on your API response
}

interface LatestSeasonState {
    data: LatestSeasonItem[];
}

const initialState: LatestSeasonState = {
    data: [],
};

const latestSeasonSlice = createSlice({
    name: 'latestSeason',
    initialState,
    reducers: {
        setLatestSeasonData: (state, action: PayloadAction<LatestSeasonItem[]>) => {
            state.data = action.payload;
        },
        appendLatestSeasonData: (state, action: PayloadAction<LatestSeasonItem[]>) => {
            state.data = [...state.data, ...action.payload];
        },
        resetLatestSeasonData: (state) => {
            state.data = [];
        },
    },
});

export const { setLatestSeasonData, appendLatestSeasonData, resetLatestSeasonData } = latestSeasonSlice.actions;

export default latestSeasonSlice.reducer;
