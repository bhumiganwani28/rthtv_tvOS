import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
// import Orientation from 'react-native-orientation-locker';
import store, { RootState, AppDispatch } from './redux/store';
import StackNavigator from './navigation/AppNavigator';
// import DeviceInfo from 'react-native-device-info';
import { setIsTablet } from './redux/slices/authSlice';
import { Platform, useTVEventHandler } from 'react-native';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: ['rth://tv', 'https://yourdomain.com'],
  config: {
    screens: {
      BannerDetail: 'banner/:id',
    },
  },
};

const AppInner: React.FC = () => {
 useTVEventHandler((evt) => {
    // if (evt.eventType === 'menu') {
    // }
  });

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={<></>}
    >
      <StackNavigator />
    </NavigationContainer>
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
