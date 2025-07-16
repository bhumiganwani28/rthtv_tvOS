import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef, DefaultTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState, AppDispatch } from './redux/store';
import StackNavigator from './navigation/AppNavigator';
import { setIsTablet, loginSuccess } from './redux/slices/authSlice';
import { Platform, useTVEventHandler, StatusBar, LogBox, Dimensions, ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from './theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    primary: COLORS.primary,
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
  const [isReady, setIsReady] = useState(false);
  
  // Load authentication data on startup
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Check if device is a tablet or TV
        const { width, height } = Dimensions.get('window');
        const isTablet = Platform.isTV || (width >= 768 && height >= 768);
        dispatch(setIsTablet(isTablet));
        
        // Load authentication data
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userData = await AsyncStorage.getItem('user');
        
        if (accessToken && userData) {
          // User is logged in, dispatch login success
          dispatch(
            loginSuccess({
              accessToken,
              user: JSON.parse(userData),
            })
          );
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setIsReady(true);
      }
    };
    
    loadAuthData();
  }, [dispatch]);

  // Add global TV focus handling
  useTVEventHandler((evt) => {
    // Handle TV-specific events
    if (evt && evt.eventType === 'menu') {
      // Handle menu button press
      console.log('TV menu button pressed');
    }
  });

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
