import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  BackHandler,
  useTVEventHandler,
} from 'react-native';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import CAlertModal from '../../components/CAlertModal';
import { COLORS } from '../../theme/colors';
import { IMAGES } from '../../theme/images';
import { validateEmail } from '../../utils/validation';
import { FORGOT_PASSWORD } from '../../config/apiEndpoints';
import apiHelper from '../../config/apiHelper';
import styles from './styles';

const isTV = Platform.isTV;

const ForgotPasswordTV = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [focusedField, setFocusedField] = useState<'email' | 'submit' | 'back'>('email');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const validateInputs = (): boolean => {
    let valid = true;
    const emailTrimmed = email.trim().toLowerCase().replace(/\s+/g, '');
    setEmail(emailTrimmed);
    setEmailError('');

    if (!emailTrimmed) {
      setEmailError('Please enter your email');
      valid = false;
    } else if (!validateEmail(emailTrimmed)) {
      setEmailError('Please enter a valid email');
      valid = false;
    }
    return valid;
  };

  const handleForgotPassword = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const response = await apiHelper.post(FORGOT_PASSWORD, {
        email: email.trim(),
      });
      if (response?.status === 200) {
        setModalMessage(response?.data?.message || 'Link sent successfully!');
        setModalType('success');
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('LoginTV');
        }, 2000);
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (error: any) {
      console.log('Forgot password error:', error);
      setModalMessage(error.message || 'Something went wrong.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (showKeyboard) {
        setShowKeyboard(false);
        return true;
      }
      return false;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [showKeyboard]);

  useTVEventHandler(evt => {
    if (showKeyboard) return;
    if (evt?.eventType === 'down') {
      if (focusedField === 'email') setFocusedField('submit');
      else if (focusedField === 'submit') setFocusedField('back');
    } else if (evt.eventType === 'up') {
      if (focusedField === 'back') setFocusedField('submit');
      else if (focusedField === 'submit') setFocusedField('email');
    } else if (evt.eventType === 'select') {
      if (focusedField === 'submit') {
        handleForgotPassword();
      } else if (focusedField === 'back') {
        navigation.navigate('LoginTV');
      } else if (focusedField === 'email') {
        setShowKeyboard(true);
      }
    }
  });

  const handleKeyboardVisibility = (visible: boolean) => {
    setShowKeyboard(visible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={IMAGES.splash} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            {isTV && (
              <View style={styles.logoContainer}>
                <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
              </View>
            )}
            <View style={styles.loginBox}>
              <Text style={styles.heading}>Forgot Password</Text>
              <Text style={styles.signupText}>
                Please enter your registered email to receive a reset link.
              </Text>
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

              <CButton
                text="Send Reset Link"
                onPress={handleForgotPassword}
                style={styles.signInButton}
                textStyle={styles.signInButtonText}
                hasTVPreferredFocus={focusedField === 'submit'}
                focusable
                loading={loading}
              />

              <View style={styles.signupContainer}>
                {/* <Text style={styles.signupText}>Remember password?</Text> */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('LoginTV')}
                  hasTVPreferredFocus={focusedField === 'back'}
                  focusable>
                  <Text style={styles.signupLink}>Back to Login</Text>
                </TouchableOpacity>
              </View>
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

export default ForgotPasswordTV;
