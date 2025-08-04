// AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import Splash from '../screens/Splash';
import OnBoarding from '../screens/OnBoarding';
import LoginTV from '../screens/Login';
import SignUpScreen from '../screens/Signup';
import Home from '../screens/Home';
import WhosWatchingScreen from '../screens/WhosWatching';
import { COLORS } from '../theme/colors';
import PremiumVideos from '../screens/PremiumVideos';
import UpcomingShows from '../screens/UpcomingShows';
import TrendingVideos from '../screens/TrendingVideos';
import LatestSeason from '../screens/LatestSeason';
import IntroSlider from '../screens/IntroScreen';
import ForgotPasswordTV from '../screens/ForgotPasswordTV';
import ChangePasswordTV from '../screens/ChangePasswordTV';
import ChannelDetailsTV from '../screens/ChannelDetailsTV';
import ChannelDetails from '../screens/ChannelDetailsTV';
import AllSeasons from '../screens/AllSeasons';
import Channels from '../screens/Channels';
import SearchVideosTV from '../screens/SearchVideosTV';
import SearchScreenTV from '../screens/SearchScreenTV';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import VODScreen from '../screens/VODScreenTV';
import SelectAvatar from '../screens/SelectAvtar';
import AddProfile from '../screens/AddProfile';
import Details from '../screens/Details';
import AllVideos from '../screens/AllVideos';
import EditProfile from '../screens/EditProfile';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: Platform.isTV ? 'none' : 'default',
        contentStyle: { backgroundColor: 'transparent' },
        fullScreenGestureEnabled: false,
        gestureEnabled: !Platform.isTV,
        // TV-specific transition settings for smooth navigation
        animationDuration: Platform.isTV ? 0 : undefined,
        animationTypeForReplace: Platform.isTV ? 'push' : 'pop',
        // Better back navigation handling
        presentation: Platform.isTV ? 'card' : 'modal',
        // Custom transition for TV - no animation to prevent blinking
        ...(Platform.isTV && {
          animation: 'none',
          animationDuration: 0,
        }),
      }}
    >
      {/* Auth Flow */}
      <Stack.Screen 
        name="Splash" 
        component={Splash}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="OnBoarding" 
        component={OnBoarding}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="LoginTV" 
        component={LoginTV}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="ForgotPasswordTV" 
        component={ForgotPasswordTV}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="ChangePasswordTV" 
        component={ChangePasswordTV}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* Profile Management */}
      <Stack.Screen 
        name="WhosWatching" 
        component={WhosWatchingScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="AddProfile" 
        component={AddProfile}
        options={{
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="SelectAvtar" 
        component={SelectAvatar}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* Main App Flow */}
      
      <Stack.Screen 
        name="Home" 
        component={Home}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Channels" 
        component={Channels}
        options={{
          gestureEnabled: false,
        }}
      />
         <Stack.Screen 
        name="EditProfile" 
        component={EditProfile}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="ChannelDetailsTV" 
        component={ChannelDetailsTV}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="PremiumVideos" 
        component={PremiumVideos}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="UpcomingShows" 
        component={UpcomingShows}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="TrendingVideos" 
        component={TrendingVideos}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="LatestSeason" 
        component={LatestSeason}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Intro" 
        component={IntroSlider}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* Video and Content Screens */}
      <Stack.Screen 
        name="VODScreen" 
        component={VODScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="AllSeasons" 
        component={AllSeasons}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="SearchVideosTV" 
        component={SearchVideosTV}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="SearchScreenTV" 
        component={SearchScreenTV}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="VideoPlayerScreen" 
        component={VideoPlayerScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Details" 
        component={Details}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="AllVideos" 
        component={AllVideos}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;