import React, {useState, useEffect} from 'react';
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
import {IMAGES} from '../../theme/images';
import styles from './styles';
import {COLORS} from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {validateEmail, validatePassword} from '../../utils/validation';
import apiHelper from '../../config/apiHelper';
import {LOGIN_URL} from '../../config/apiEndpoints';
import CAlertModal from '../../components/CAlertModal';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../../redux/slices/authSlice';

const {width, height} = Dimensions.get('window');
const isTV = Platform.isTV;

const LoginTV = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState<string>(
    __DEV__ ? 'ruhi28@mailinator.com' : '',
  );
  const [password, setPassword] = useState<string>(__DEV__ ? 'Ruhi@2811' : '');
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | 'submit' | 'signup' | 'forgot'
  >('email');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');
  const dispatch = useDispatch();

  // Validate inputs before submitting
  const validateInputs = () => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      // Get FCM token if available
      const fcmToken = (await AsyncStorage.getItem('fcmToken')) || '';

      // Make API call
      const response = await apiHelper.post(LOGIN_URL, {
        email: email.trim(),
        password: password.trim(),
        fcmToken,
      });
      console.log('Login response:', response);

      if (response?.status === 200) {
        // Store user data
        await AsyncStorage.setItem('accessToken', response?.data?.token);
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(response?.data?.user),
        );

        // Dispatch login success action
        dispatch(
          loginSuccess({
            accessToken: response?.data?.token,
            user: response?.data?.user,
          }),
        );

        // Show success message
        setModalType('success');
        setModalMessage('Login successful!');
        setModalVisible(true);

        // Navigate to Home after delay
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('WhosWatching');
        }, 1000);
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Show error message
      setModalType('error');
      setModalMessage(
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.',
      );
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
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
      backAction,
    );

    return () => backHandler.remove();
  }, [showKeyboard]);

  // Improved TV event handling for better focus management
  useTVEventHandler(evt => {
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
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ImageBackground
        source={IMAGES.splash}
        resizeMode="cover"
        style={styles.background}>
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
                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <CInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={text => {
                      setEmail(text.replace(/\s/g, '').toLowerCase());
                      if (emailError) validateInputs();
                    }}
                    onPress={() => setFocusedField('email')}
                    hasTVPreferredFocus={focusedField === 'email'}
                    focusable
                    containerStyle={styles.input}
                    onKeyboardShow={() => handleKeyboardVisibility(true)}
                    onKeyboardHide={() => handleKeyboardVisibility(false)}
                    errorShow={!!emailError}
                    errorText={emailError}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <CInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={text => {
                      setPassword(text.replace(/\s/g, ''));
                      if (passwordError) validateInputs();
                    }}
                    secureTextEntry={!isPasswordVisible}
                    isPasswordVisible={isPasswordVisible}
                    togglePassword={togglePasswordVisibility}
                    onPress={() => setFocusedField('password')}
                    hasTVPreferredFocus={focusedField === 'password'}
                    focusable
                    containerStyle={styles.input}
                    onKeyboardShow={() => handleKeyboardVisibility(true)}
                    onKeyboardHide={() => handleKeyboardVisibility(false)}
                    errorShow={!!passwordError}
                    errorText={passwordError}
                  />
                </View>

                <TouchableOpacity
                  style={styles.forgotContainer}
                  onPress={() => console.log('Forgot password')}
                  focusable={isTV}
                  hasTVPreferredFocus={focusedField === 'forgot'}>
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
                  loading={loading}
                />

                <View style={styles.bottom}>
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>New to RTH.TV?</Text>
                    <TouchableOpacity
                      onPress={() => handleLogin()}
                      // onPress={() => navigation.navigate('SignUp')}
                      focusable={isTV}
                      hasTVPreferredFocus={focusedField === 'signup'}>
                      <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Alert Modal */}
      <CAlertModal
        visible={modalVisible}
        btnTitle="OK"
        type={modalType}
        message={modalMessage}
        onOkPress={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default LoginTV;
