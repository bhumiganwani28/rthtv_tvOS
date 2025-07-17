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
import Channels from '../screens/Channels';
import PremiumVideos from '../screens/PremiumVideos';
import UpcomingShows from '../screens/UpcomingShows';
import TrendingVideos from '../screens/TrendingVideos';
import LatestSeason from '../screens/LatestSeason';
import IntroSlider from '../screens/IntroScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ 
        headerShown: false,
        animation: Platform.isTV ? 'fade' : 'default',
        contentStyle: { backgroundColor: 'transparent' },
        fullScreenGestureEnabled: false,
        gestureEnabled: !Platform.isTV,
        // TV-specific transition settings
        animationDuration: Platform.isTV ? 300 : undefined,
        animationTypeForReplace: Platform.isTV ? 'push' : 'pop',
      }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="Login" component={LoginTV} /> 
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="WhosWatching" component={WhosWatchingScreen} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Channels" component={Channels} />
      <Stack.Screen name="PremiumVideos" component={PremiumVideos} />
      <Stack.Screen name="UpcomingShows" component={UpcomingShows} />
      <Stack.Screen name="TrendingVideos" component={TrendingVideos} />
      <Stack.Screen name="LatestSeason" component={LatestSeason} />
      <Stack.Screen name="Intro" component={IntroSlider} />

    </Stack.Navigator>
  );
};

export default AppNavigator;
