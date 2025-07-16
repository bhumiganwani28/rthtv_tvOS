import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  useTVEventHandler,
  Platform,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import { IMAGES } from '../../theme/images';
import styles from './styles';
import { COLORS } from '../../theme/colors';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

const LoginTV = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'submit' | 'signup' | 'forgot'>('email');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleLogin = () => {
    console.log('Login clicked', email, password);
    // Navigate to Home screen
    navigation.navigate('Home');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Handle back button to close keyboard if open
  useEffect(() => {
    const backAction = () => {
      if (showKeyboard) {
        setShowKeyboard(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [showKeyboard]);

  // Improved TV event handling for better focus management
  useTVEventHandler((evt) => {
    if (showKeyboard) {
      // Don't handle TV navigation events when keyboard is open
      return;
    }

    if (evt && evt.eventType) {
      switch (evt.eventType) {
        case 'down':
          if (focusedField === 'email') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('forgot');
          else if (focusedField === 'forgot') setFocusedField('submit');
          else if (focusedField === 'submit') setFocusedField('signup');
          break;
        case 'up':
          if (focusedField === 'signup') setFocusedField('submit');
          else if (focusedField === 'submit') setFocusedField('forgot');
          else if (focusedField === 'forgot') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('email');
          break;
        case 'select':
          if (focusedField === 'submit') handleLogin();
          else if (focusedField === 'signup') navigation.navigate('SignUp');
          else if (focusedField === 'forgot') {
            // Handle forgot password
            console.log('Forgot password clicked');
          } else if (focusedField === 'email' || focusedField === 'password') {
            setShowKeyboard(true);
          }
          break;
      }
    }
  });

  // Function to handle keyboard open/close state
  const handleKeyboardVisibility = (visible: boolean) => {
    setShowKeyboard(visible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground 
        source={IMAGES.splash} 
        resizeMode="cover" 
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            {isTV && (
              <View style={styles.logoContainer}>
                <Image 
                  source={IMAGES.logo} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            )}
            
            <View style={styles.loginBox}>
              <Text style={styles.heading}>Sign In</Text>
              
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <CInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  onPress={() => setFocusedField('email')}
                  hasTVPreferredFocus={focusedField === 'email'}
                  focusable
                  containerStyle={styles.input}
                  textStyle={styles.inputText}
                  onKeyboardShow={() => handleKeyboardVisibility(true)}
                  onKeyboardHide={() => handleKeyboardVisibility(false)}
                />
                
                <Text style={styles.inputLabel}>Password</Text>
                <CInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  isPasswordVisible={isPasswordVisible}
                  togglePassword={togglePasswordVisibility}
                  onPress={() => setFocusedField('password')}
                  hasTVPreferredFocus={focusedField === 'password'}
                  focusable
                  containerStyle={styles.input}
                  textStyle={styles.inputText}
                  onKeyboardShow={() => handleKeyboardVisibility(true)}
                  onKeyboardHide={() => handleKeyboardVisibility(false)}
                />

                <TouchableOpacity 
                  style={styles.forgotContainer}
                  onPress={() => console.log('Forgot password')}
                  focusable={isTV}
                  hasTVPreferredFocus={focusedField === 'forgot'}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <CButton
                  text="Sign in"
                  onPress={handleLogin}
                  style={styles.signInButton}
                  textStyle={styles.signInButtonText}
                  hasTVPreferredFocus={focusedField === 'submit'}
                  focusable
                  backgroundColor={COLORS.primary}
                  size="small"
                />

                <View style={styles.bottom}>
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>New to RTH.TV?</Text>
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('SignUp')}
                      focusable={isTV}
                      hasTVPreferredFocus={focusedField === 'signup'}
                    >
                      <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginTV;
