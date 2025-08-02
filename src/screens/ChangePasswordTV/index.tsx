import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  useTVEventHandler,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  Image,
} from 'react-native';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import CAlertModal from '../../components/CAlertModal';
import apiHelper from '../../config/apiHelper';
import { CHANGE_PASSWORD } from '../../config/apiEndpoints';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';
import styles from './styles';

const isTV = Platform.isTV;

const ChangePasswordTV = ({ navigation }: { navigation: any }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  // Password visibility states
  const [isCurrentVisible, setCurrentVisible] = useState(false);
  const [isNewVisible, setNewVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);

  // Focused field for TV remote navigation (includes eye icon focus)
  const [focusedField, setFocusedField] = useState<
    | 'current'
    | 'current_eye'
    | 'new'
    | 'new_eye'
    | 'confirm'
    | 'confirm_eye'
    | 'submit'
    | 'back'
  >('current');

  // Password validation regex
  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  // Validate inputs and show errors
  const validateInputs = () => {
    let isValid = true;
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword) {
      setCurrentPasswordError('Current Password required');
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError('New Password required');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      setNewPasswordError(
        'Min 6 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char',
      );
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password required');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  // Handle password update submission
  const handleUpdatePassword = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await apiHelper.post(CHANGE_PASSWORD, {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (response?.status === 200) {
        setModalMessage('Password updated successfully!');
        setModalType('success');
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (error: any) {
      setModalType('error');
      setModalMessage(error?.message || 'Error while changing password. Try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // TV Remote Event Handler for focus and selection
  useTVEventHandler(({ eventType }) => {
    if (!isTV) return;

    switch (eventType) {
      case 'up':
        if (focusedField === 'new') setFocusedField('current');
        else if (focusedField === 'new_eye') setFocusedField('current_eye');
        else if (focusedField === 'confirm') setFocusedField('new');
        else if (focusedField === 'confirm_eye') setFocusedField('new_eye');
        else if (focusedField === 'submit') setFocusedField('confirm');
        else if (focusedField === 'back') setFocusedField('submit');
        break;
      case 'down':
        if (focusedField === 'current') setFocusedField('new');
        else if (focusedField === 'current_eye') setFocusedField('new_eye');
        else if (focusedField === 'new') setFocusedField('confirm');
        else if (focusedField === 'new_eye') setFocusedField('confirm_eye');
        else if (focusedField === 'confirm') setFocusedField('submit');
        else if (focusedField === 'confirm_eye') setFocusedField('submit');
        else if (focusedField === 'submit') setFocusedField('back');
        break;
      case 'right':
        if (focusedField === 'current') setFocusedField('current_eye');
        else if (focusedField === 'new') setFocusedField('new_eye');
        else if (focusedField === 'confirm') setFocusedField('confirm_eye');
        break;
      case 'left':
        if (focusedField === 'current_eye') setFocusedField('current');
        else if (focusedField === 'new_eye') setFocusedField('new');
        else if (focusedField === 'confirm_eye') setFocusedField('confirm');
        break;
      case 'select':
        if (focusedField === 'current_eye') setCurrentVisible(prev => !prev);
        else if (focusedField === 'new_eye') setNewVisible(prev => !prev);
        else if (focusedField === 'confirm_eye') setConfirmVisible(prev => !prev);
        else if (focusedField === 'submit') handleUpdatePassword();
        else if (focusedField === 'back') navigation.goBack();
        break;
    }
  });

  // Android hardware back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <ImageBackground
        source={IMAGES.splash}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.loginBox}>
              <Text style={styles.heading}>Change Password</Text>
              <View style={styles.formContainer}>
                {/* Current Password */}
                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <CInput
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={t => {
                      setCurrentPassword(t.replace(/\s/g, ''));
                      if (currentPasswordError) validateInputs();
                    }}
                    errorShow={!!currentPasswordError}
                    errorText={currentPasswordError}
                    secureTextEntry={!isCurrentVisible}
                    isPasswordVisible={isCurrentVisible}
                    togglePassword={() => setCurrentVisible(prev => !prev)}
                    focusable={isTV}
                    onPress={() => setFocusedField('current')}
                    hasTVPreferredFocus={focusedField === 'current'}
                    eyeIconFocused={focusedField === 'current_eye'}
                  />
                </View>

                {/* New Password */}
                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <CInput
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={t => {
                      setNewPassword(t.replace(/\s/g, ''));
                      if (newPasswordError) validateInputs();
                    }}
                    errorShow={!!newPasswordError}
                    errorText={newPasswordError}
                    secureTextEntry={!isNewVisible}
                    isPasswordVisible={isNewVisible}
                    togglePassword={() => setNewVisible(prev => !prev)}
                    focusable={isTV}
                    onPress={() => setFocusedField('new')}
                    hasTVPreferredFocus={focusedField === 'new'}
                    eyeIconFocused={focusedField === 'new_eye'}
                  />
                </View>

                {/* Confirm Password */}
                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <CInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={t => {
                      setConfirmPassword(t.replace(/\s/g, ''));
                      if (confirmPasswordError) validateInputs();
                    }}
                    errorShow={!!confirmPasswordError}
                    errorText={confirmPasswordError}
                    secureTextEntry={!isConfirmVisible}
                    isPasswordVisible={isConfirmVisible}
                    togglePassword={() => setConfirmVisible(prev => !prev)}
                    focusable={isTV}
                    onPress={() => setFocusedField('confirm')}
                    hasTVPreferredFocus={focusedField === 'confirm'}
                    eyeIconFocused={focusedField === 'confirm_eye'}
                  />
                </View>

                {/* Submit Button */}
                <CButton
                  text="Update Password"
                  onPress={handleUpdatePassword}
                  style={styles.signInButton}
                  textStyle={styles.signInButtonText}
                  loading={loading}
                  hasTVPreferredFocus={focusedField === 'submit'}
                />

                {/* Back Link */}
                <TouchableOpacity
                  style={{ marginTop: scale(20) }}
                  onPress={() => navigation.goBack()}
                  focusable={isTV}
                  hasTVPreferredFocus={focusedField === 'back'}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: scale(10),
                      fontFamily: 'Montserrat-Regular',
                      textAlign: 'center',
                    }}
                  >
                    ← Back to Profile
                  </Text>
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

export default ChangePasswordTV;
