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
  ScrollView,
} from 'react-native';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import styles from './styles'; 
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import apiHelper from '../../config/apiHelper';
import { SIGNUP_URL } from '../../config/apiEndpoints';
import CAlertModal from '../../components/CAlertModal';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import { scale } from 'react-native-size-matters';
import { validateEmail, validatePassword } from '../../utils/validation';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Focus management for TV
  type FocusField =
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'mobileFlag'
    | 'mobile'
    | 'password'
    | 'passwordEye'
    | 'signup'
    | 'login';

  const [focusedField, setFocusedField] = useState<FocusField>('firstName');

  // Error and loading state
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal for success/error messages
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  // Country picker state
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '');
    setCountryPickerVisible(false);
    setFocusedField('mobile'); // Return focus to mobile input after selecting country
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((v) => !v);
  };

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

    if (!mobile.trim()) {
      setMobileError('Mobile number is required');
      isValid = false;
    } else if (!/^\d{6,15}$/.test(mobile.trim())) {
      setMobileError('Enter a valid mobile number (6-15 digits)');
      isValid = false;
    } else {
      setMobileError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password.trim())) {
      setPasswordError(
        'Password must be at least 6 characters with uppercase, lowercase, number, and special character',
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
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', firstName.trim());
      formDataToSend.append('last_name', lastName.trim());
      formDataToSend.append('email', email.trim());
      formDataToSend.append('password', password.trim());
      formDataToSend.append('phoneNumber', callingCode + mobile.trim());

      const response = await apiHelper.post(SIGNUP_URL, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
    } catch (error: any) {
      setModalType('error');
      let message = 'Signup failed. Please try again.';
      if (error?.response?.data?.message) message = error.response.data.message;
      else if (error?.message) message = error.message;
      setModalMessage(message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Controlled TV remote navigation with smooth focus transitions
  useTVEventHandler((evt) => {
    if (!evt?.eventType) return;
    switch (evt.eventType) {
      case 'down':
        if (focusedField === 'firstName') setFocusedField('lastName');
        else if (focusedField === 'lastName') setFocusedField('email');
        else if (focusedField === 'email') setFocusedField('mobileFlag');
        else if (focusedField === 'mobileFlag') setFocusedField('mobile');
        else if (focusedField === 'mobile') setFocusedField('password');
        else if (focusedField === 'password') setFocusedField('passwordEye');
        else if (focusedField === 'passwordEye') setFocusedField('signup');
        else if (focusedField === 'signup') setFocusedField('login');
        break;

      case 'up':
        if (focusedField === 'login') setFocusedField('signup');
        else if (focusedField === 'signup') setFocusedField('passwordEye');
        else if (focusedField === 'passwordEye') setFocusedField('password');
        else if (focusedField === 'password') setFocusedField('mobile');
        else if (focusedField === 'mobile') setFocusedField('mobileFlag');
        else if (focusedField === 'mobileFlag') setFocusedField('email');
        else if (focusedField === 'email') setFocusedField('lastName');
        else if (focusedField === 'lastName') setFocusedField('firstName');
        break;

      case 'right':
        if (focusedField === 'mobileFlag') setFocusedField('mobile');
        else if (focusedField === 'password') setFocusedField('passwordEye');
        break;

      case 'left':
        if (focusedField === 'mobile') setFocusedField('mobileFlag');
        else if (focusedField === 'passwordEye') setFocusedField('password');
        break;

      case 'select':
        if (focusedField === 'signup') {
          handleSignUp();
        } else if (focusedField === 'login') {
          navigation.navigate('LoginTV');
        } else if (focusedField === 'passwordEye') {
          togglePasswordVisibility();
        } else if (focusedField === 'mobileFlag') {
          setCountryPickerVisible(true);
        }
        break;
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
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.heading}>Create Your Account</Text>
                <View style={styles.formContainer}>
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

                  <View style={styles.singleInputWrapper}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={styles.contryInContainer}>
                      <TouchableOpacity
                        style={styles.contrycodeContainer}
                        onPress={() => setCountryPickerVisible(true)}
                        hasTVPreferredFocus={focusedField === 'mobileFlag'}
                        focusable
                      >
                        <CountryPicker
                          countryCode={countryCode as any}
                          withCallingCode
                          withFlag
                          withFilter
                          onSelect={onSelectCountry}
                          visible={countryPickerVisible}
                          onOpen={() => setCountryPickerVisible(true)}
                          onClose={() => setCountryPickerVisible(false)}
                        />
                        <Text style={styles.callingCode}>+{callingCode}</Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          width: 1,
                          height: '60%',
                          backgroundColor: COLORS.borderColor,
                          marginRight: scale(6),
                        }}
                      />
                      <CInput
                        placeholder="Type your phone number"
                        value={mobile}
                        onChangeText={(text) => {
                          setMobile(text.replace(/\D/g, ''));
                          if (mobileError) validateInputs();
                        }}
                        keyboardType="phone-pad" // Better numeric input on TV
                        onPress={() => setFocusedField('mobile')}
                        hasTVPreferredFocus={focusedField === 'mobile'}
                        focusable
                        containerStyle={{
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                          flex: 1,
                          height: scale(22),
                          marginBottom: 0,
                          paddingHorizontal: 0,
                        }}
                        errorShow={false}
                        maxLength={15}
                      />
                    </View>
                    {!!mobileError && <Text style={styles.errorText}>{mobileError}</Text>}
                  </View>

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
                      eyeIconFocused={focusedField === 'passwordEye'}
                    />
                  </View>

                  <CButton
                    text="Sign Up"
                    onPress={handleSignUp}
                    style={styles.button}
                    textStyle={styles.buttonText}
                    hasTVPreferredFocus={focusedField === 'signup'}
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
              </ScrollView>
            </View>
          </View>
        </View>
      </ImageBackground>

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

export default SignUpScreen;
