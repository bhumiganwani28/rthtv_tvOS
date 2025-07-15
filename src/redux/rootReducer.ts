import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import channelsReducer from './slices/channelsSlice'; // Import the new channels slice
import trendingVideosReducer from './slices/TrendingSlice'; // Import the new channels slice
import allVideosReducer from './slices/allVideosSlice';
import allSeasonsReducer from './slices/allSeasonsSlice';
import premiumVideosReducer from './slices/premiumSlice'; 
import latestSeasonReducer from './slices/latestSeasonSlice';
import upcomingShowsReducer from './slices/upComingShowsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  channels: channelsReducer, // Add channels reducer here
  trendingVideos: trendingVideosReducer, // Add trendingVideos reducer here
  allVideos: allVideosReducer, 
  allSeasons: allSeasonsReducer,
  premiumVideos: premiumVideosReducer,
  latestSeason: latestSeasonReducer,
  upcomingShows: upcomingShowsReducer,

});

export default rootReducer;
