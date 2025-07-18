import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Platform,
  useTVEventHandler,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import styles from './styles';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateEmail, validatePassword } from '../../utils/validation';
import apiHelper from '../../config/apiHelper';
import { SIGNUP_URL } from '../../config/apiEndpoints';
import CAlertModal from '../../components/CAlertModal';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'email' | 'password' | 'signup' | 'login'>('firstName');
  const [loading, setLoading] = useState<boolean>(false);
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');
    // New country picker state
  const [countryCode, setCountryCode] = useState('IN'); // Default India
  const [callingCode, setCallingCode] = useState('91');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '');
    setCountryPickerVisible(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Validate inputs before submitting
  const validateInputs = () => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password.trim())) {
      setPasswordError(
        'Password must be at least 6 characters with at least one lowercase, one uppercase, one number, and one special character',
      );
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const fcmToken = (await AsyncStorage.getItem('fcmToken')) || '';

      const response = await apiHelper.post(SIGNUP_URL, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        fcmToken,
      });

      if (response?.status === 200 || response?.status === 201) {
        setModalType('success');
        setModalMessage('Account created successfully! Please login.');
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('LoginTV');
        }, 1500);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setModalType('error');
      setModalMessage(error instanceof Error ? error.message : 'Signup failed. Please try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useTVEventHandler((evt) => {
    if (evt && evt.eventType) {
      switch (evt.eventType) {
        case 'down':
          if (focusedField === 'firstName') setFocusedField('lastName');
          else if (focusedField === 'lastName') setFocusedField('email');
          else if (focusedField === 'email') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('signup');
          else if (focusedField === 'signup') setFocusedField('login');
          break;
        case 'up':
          if (focusedField === 'login') setFocusedField('signup');
          else if (focusedField === 'signup') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('email');
          else if (focusedField === 'email') setFocusedField('lastName');
          else if (focusedField === 'lastName') setFocusedField('firstName');
          break;
        case 'select':
          if (focusedField === 'signup') handleSignUp();
          else if (focusedField === 'login') navigation.navigate('LoginTV');
          break;
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={IMAGES.splash} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            {Platform.isTV && (
              <View style={styles.logoContainer}>
                <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
              </View>
            )}

            <View style={styles.formWrapper}>
              <Text style={styles.heading}>Create Your Account</Text>

              <View style={styles.formContainer}>
                {/* First and Last Name row */}
                <View style={styles.row}>
                  <View style={styles.halfInputWrapper}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <CInput
                      placeholder="First Name"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (firstNameError) validateInputs();
                      }}
                      onPress={() => setFocusedField('firstName')}
                      hasTVPreferredFocus={focusedField === 'firstName'}
                      focusable
                      containerStyle={styles.input}
                      errorShow={!!firstNameError}
                      errorText={firstNameError}
                    />
                  </View>

                  <View style={styles.halfInputWrapper}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <CInput
                      placeholder="Last Name"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (lastNameError) validateInputs();
                      }}
                      onPress={() => setFocusedField('lastName')}
                      hasTVPreferredFocus={focusedField === 'lastName'}
                      focusable
                      containerStyle={styles.input}
                      errorShow={!!lastNameError}
                      errorText={lastNameError}
                    />
                  </View>
                </View>

                {/* Email */}

                <View style={styles.singleInputWrapper}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <CInput
                    placeholder="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text.replace(/\s/g, '').toLowerCase());
                      if (emailError) validateInputs();
                    }}
                    keyboardType="email-address"
                    onPress={() => setFocusedField('email')}
                    hasTVPreferredFocus={focusedField === 'email'}
                    focusable
                    containerStyle={styles.input}
                    errorShow={!!emailError}
                    errorText={emailError}
                  />
                </View>

                {/* Password */}
                <View style={styles.singleInputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <CInput
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
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
                    errorShow={!!passwordError}
                    errorText={passwordError}
                  />
                </View>

                <CButton
                  text="Sign Up"
                  onPress={() => handleSignUp()}
                  style={styles.button}
                  textStyle={styles.buttonText}
                  hasTVPreferredFocus={focusedField === 'submit'}
                  focusable
                  backgroundColor={COLORS.primary}
                  loading={loading}
                />

                <View style={styles.footerContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('LoginTV')}
                    style={{ flexDirection: 'row' }}
                    hasTVPreferredFocus={focusedField === 'login'}
                    focusable
                  >
                    <Text style={styles.footerText}>Already a member?</Text>
                    <Text style={styles.linkText}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Alert Modal */}
      <CAlertModal visible={modalVisible} btnTitle="OK" type={modalType} message={modalMessage} onOkPress={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

export default SignUpScreen;
