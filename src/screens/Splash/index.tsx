import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import styles from './styles';
import { IMAGES } from '../../theme/images';

interface SplashProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const logoSize = width * 0.5;
  const dispatch = useDispatch();

  // Check authentication status and navigate accordingly
  const checkAuthStatus = async () => {
    try {
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
        
        // Check if the user has selected a profile before
        const selectedProfile = await AsyncStorage.getItem('selectedProfile');
        
        // if (selectedProfile) {
        //   // User has selected a profile before, go directly to Home
        //   navigation.replace('Home');
        // } else {
          // User is logged in but hasn't selected a profile, go to WhosWatching
          navigation.replace('WhosWatching');
        // }
      } else {
        // User is not logged in, show onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        if (hasSeenOnboarding === 'true') {
          // User has seen onboarding before, go directly to login
          navigation.replace('Login');
        } else {
          // First time user, show onboarding
          navigation.replace('OnBoarding');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Default to onboarding in case of error
      navigation.replace('OnBoarding');
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        checkAuthStatus();
      }, 1500);
    });
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <Image source={IMAGES.splash} style={styles.backgroundImage} />
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
