import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StatusBar,
  Platform,
  Dimensions,
  useTVEventHandler,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import styles from './styles';
import CButton from '../../components/CButton';
import TVFocusGuide from '../../components/TVFocusGuide';

const { width } = Dimensions.get('window');
const isTV = Platform.isTV;

interface OnBoardingProps {
  navigation: any;
}

const OnBoarding: React.FC<OnBoardingProps> = ({ navigation }) => {
  const [focusedButton, setFocusedButton] = useState<'signup' | 'signin'>('signup');

  // Mark that the user has seen onboarding
  useEffect(() => {
    const markOnboardingSeen = async () => {
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      } catch (error) {
        console.error('Error saving onboarding flag:', error);
      }
    };
    
    markOnboardingSeen();
  }, []);

  // Handle navigation to signup
  const handleSignUp = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('SignUp');
  };

  // Handle navigation to signin
  const handleSignIn = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Login');
  };

  // Handle TV remote events
  useTVEventHandler((evt) => {
    if (evt && evt.eventType) {
      if (evt.eventType === 'left' || evt.eventType === 'right') {
        setFocusedButton(focusedButton === 'signup' ? 'signin' : 'signup');
      } else if (evt.eventType === 'select') {
        if (focusedButton === 'signup') {
          handleSignUp();
        } else if (focusedButton === 'signin') {
          handleSignIn();
        }
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={IMAGES.splash}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Logo */}
          <View style={styles.contentWrapper}>
            <Image
              source={IMAGES.logo}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Main content */}
            <View style={styles.mainContent}>
              <Text style={styles.title}>Unlimited TV Shows, Movies & More</Text>
              <Text style={styles.subtitle}>Watch anywhere. Cancel anytime.</Text>
            </View>

            {/* Buttons in a row for TV */}
            <View style={styles.buttonGroup}>
              <CButton
                text="Sign Up"
                onPress={handleSignUp}
                style={styles.signupButton}
                textStyle={styles.buttonText}
                hasTVPreferredFocus={focusedButton === 'signup'}
                focusable={true}
                // size={isTV ? "medium" : "small"}
              />

              <CButton
                text="Sign In"
                onPress={handleSignIn}
                style={styles.signinButton}
                textStyle={styles.buttonText}
                hasTVPreferredFocus={focusedButton === 'signin'}
                focusable={true}
                // size={isTV ? "medium" : "small"}
                outline
              />
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to RTH.TV{' '}
                <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default OnBoarding;
