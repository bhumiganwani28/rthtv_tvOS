import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef, DefaultTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState, AppDispatch } from './redux/store';
import StackNavigator from './navigation/AppNavigator';
import { setIsTablet } from './redux/slices/authSlice';
import { Platform, useTVEventHandler, StatusBar, LogBox, Dimensions } from 'react-native';
import { COLORS } from './theme/colors';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export const navigationRef = createNavigationContainerRef();

// Custom theme for navigation
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
    border: 'transparent',
    text: COLORS.white,
    primary: COLORS.tvFocus,
  },
};

const linking = {
  prefixes: ['rth://tv', 'https://yourdomain.com'],
  config: {
    screens: {
      BannerDetail: 'banner/:id',
    },
  },
};

const AppInner: React.FC = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check if device is a tablet or TV
    const { width, height } = Dimensions.get('window');
    const isTablet = Platform.isTV || (width >= 768 && height >= 768);
    dispatch(setIsTablet(isTablet));
  }, [dispatch]);

  // Add global TV focus handling
  useTVEventHandler((evt) => {
    // Handle TV-specific events
    if (evt && evt.eventType === 'menu') {
      // Handle menu button press
      console.log('TV menu button pressed');
    }
  });

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        fallback={<></>}
        theme={AppTheme}
      >
        <StackNavigator />
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
