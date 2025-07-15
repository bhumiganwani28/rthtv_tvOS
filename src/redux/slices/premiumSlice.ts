import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PremiumVideo {
    _id: string;
    banner: string;
    // Add other fields based on your API response
}

interface PremiumVideosState {
    data: PremiumVideo[];
}

const initialState: PremiumVideosState = {
    data: [],
};

const premiumVideosSlice = createSlice({
    name: 'premiumVideos',
    initialState,
    reducers: {
        setPremiumVideosData: (state, action: PayloadAction<PremiumVideo[]>) => {
            state.data = action.payload;
        },
        appendPremiumVideosData: (state, action: PayloadAction<PremiumVideo[]>) => {
            state.data = [...state.data, ...action.payload];
        },
        resetPremiumVideosData: (state) => {
            state.data = [];
        },
    },
});

export const { setPremiumVideosData, appendPremiumVideosData, resetPremiumVideosData } = premiumVideosSlice.actions;

export default premiumVideosSlice.reducer;
