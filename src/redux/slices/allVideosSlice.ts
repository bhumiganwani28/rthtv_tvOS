import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of the nested 'rtmp' object
interface Rtmp {
    primary: string;
    backup: string;
}

// Define the structure of each video item
interface AllVideos {
    _id: string;
    banner: string;
    description: string;
    id: string;
    name: string;
    rtmp: Rtmp;
    slug: string;
}

// Define the state structure
interface AllVideossState {
    data: AllVideos[];
}

const initialState: AllVideossState = {
    data: [],
};

const allVideosSlice = createSlice({
    name: 'allVideos',
    initialState,
    reducers: {
        setAllVideossData: (state, action: PayloadAction<AllVideos[]>) => {
            state.data = action.payload;
        },
        appendAllVideossData: (state, action: PayloadAction<AllVideos[]>) => {
            state.data = [...state.data, ...action.payload];
        },
        resetAllVideossData: (state) => {
            state.data = [];
        },
    },
});

export const { setAllVideossData, appendAllVideossData, resetAllVideossData } = allVideosSlice.actions;

export default allVideosSlice.reducer;
