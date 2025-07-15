
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Channel {
    _id: string;
    coverImage: string;
    // Add other fields based on your API response
}

interface ChannelsState {
    data: Channel[];
}

const initialState: ChannelsState = {
    data: [],
};

const channelsSlice = createSlice({
    name: 'channels',
    initialState,
    reducers: {
        setChannelsData: (state, action: PayloadAction<Channel[]>) => {
            state.data = action.payload;
        },
        appendChannelsData: (state, action: PayloadAction<Channel[]>) => {
            state.data = [...state?.data, ...action.payload];
        },
        resetChannelsData: (state) => {
            state.data = [];
        },
    },
});

export const { setChannelsData, appendChannelsData, resetChannelsData } = channelsSlice.actions;

export default channelsSlice.reducer;
