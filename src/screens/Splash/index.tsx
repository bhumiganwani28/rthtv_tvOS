import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';

import styles from './styles';
import { IMAGES } from '../../theme/images';

interface SplashProps {
  navigation: {
    replace: (screen: string) => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const { width } = Dimensions.get('window');
  const logoSize = width * 0.5;

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      const isFirstTime = await AsyncStorage.getItem('isFirstTime');

      if (token && user) {
        dispatch(loginSuccess({ accessToken: token, user: JSON.parse(user) }));
        navigation.replace('WhosWatching');
      } else {
        if (isFirstTime === null) {
          await AsyncStorage.setItem('isFirstTime', 'false');
          navigation.replace('Intro'); // Show Intro on first launch
        } else {
          navigation.replace('OnBoarding'); // Show onboarding for subsequent launches
        }
      }
    } catch (error) {
      console.error('Error during login check:', error);
      navigation.replace('Intro'); // Default fallback
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(checkLoginStatus, 1500);
    });
  }, [fadeAnim, dispatch, navigation]);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <Image
          source={IMAGES.splash}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
          <Image
            source={IMAGES.logo}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </>
  );
};

export default Splash;
