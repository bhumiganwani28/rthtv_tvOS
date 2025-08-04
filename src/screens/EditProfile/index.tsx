import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Keyboard,
  TouchableOpacity,
  Platform,
  useTVEventHandler,
  ImageBackground,
  SafeAreaView,
  Image,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';
import {loginSuccess} from '../../redux/slices/authSlice';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import Header from '../../components/Header';
import apiHelper from '../../config/apiHelper';
import CountryPicker from 'react-native-country-picker-modal';
import CAlertModal from '../../components/CAlertModal';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../utils/fonts';
import {IMAGES} from '../../theme/images';
import {validateEmail} from '../../utils/validation';
import styles from './styles';
import {SIGNUP_URL} from '../../config/apiEndpoints';
import {scale, verticalScale} from 'react-native-size-matters';
import BackHandlerComponent from '../../components/BackHandlerComponent';

const EditProfile: React.FC<{navigation: any}> = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isTablet = useSelector((state: RootState) => state.auth.isTablet);
  const isTV = Platform.isTV;

  // Check if user is available from Redux
  if (!user) {
    return <Text>Loading...</Text>; // Handle user not being available
  }

  // Debug: Log user data to understand the structure
  console.log('EditProfile - User data:', user);
  console.log('EditProfile - User name:', user?.name);
  console.log('EditProfile - User last_name:', user?.last_name);

  // Initialize state with proper values immediately
  const [firstName, setFirstName] = useState<string>(user?.name || '');
  const [lastName, setLastName] = useState<string>(user?.last_name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [mobile, setMobile] = useState<string>(''); //phoneNumber
  const [password, setPassword] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [callingCode, setCallingCode] = useState<string>('1');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');

  const [emailError, setEmailError] = useState<string>('');
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [mobileError, setMobileError] = useState<string>('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  // TV Focus Management - same as Signup
  type FocusField =
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'mobileFlag'
    | 'mobile'
    | 'update'
    | 'back';

  const [focusedField, setFocusedField] = useState<FocusField>('firstName');

  // Debug: Log focus changes
  useEffect(() => {
    console.log('EditProfile - Focus changed to:', focusedField);
  }, [focusedField]);

  // Debug: Log current form values
  useEffect(() => {
    console.log('EditProfile - Current form values:', { firstName, lastName, email });
  }, [firstName, lastName, email]);

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or subscriptions
      console.log('EditProfile - Component unmounting');
    };
  }, []);

  // Update form data when user data changes (backup initialization)
  useEffect(() => {
    if (user) {
      console.log('EditProfile - Updating form with user data:', { 
        name: user.name,
        last_name: user.last_name,
        email: user.email
      });
      
      setFirstName(user.name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const onSelectCountry = (country: any) => {
    setCountryCode(country?.cca2);
    setCallingCode(country?.callingCode?.[0]);
    setCountryPickerVisible(false);
    setFocusedField('mobile'); // Return focus to mobile input after selecting country
  };

  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  // TV Remote Navigation - improved for smoother control
  useTVEventHandler(evt => {
    if (!evt?.eventType) return;

    // Add a small delay to prevent rapid navigation
    const handleNavigation = () => {
      console.log('EditProfile - TV Event:', evt.eventType, 'Current focus:', focusedField);

      switch (evt.eventType) {
        case 'down':
          if (focusedField === 'firstName') {
            setFocusedField('lastName');
            console.log('EditProfile - Moving focus from firstName to lastName');
          }
          else if (focusedField === 'lastName') {
            setFocusedField('email');
            console.log('EditProfile - Moving focus from lastName to email');
          }
          else if (focusedField === 'email') {
            setFocusedField('mobileFlag');
            console.log('EditProfile - Moving focus from email to mobileFlag');
          }
          else if (focusedField === 'mobileFlag') {
            setFocusedField('mobile');
            console.log('EditProfile - Moving focus from mobileFlag to mobile');
          }
          else if (focusedField === 'mobile') {
            setFocusedField('update');
            console.log('EditProfile - Moving focus from mobile to update');
          }
          else if (focusedField === 'update') {
            setFocusedField('back');
            console.log('EditProfile - Moving focus from update to back');
          }
          break;

        case 'up':
          if (focusedField === 'back') {
            setFocusedField('update');
            console.log('EditProfile - Moving focus from back to update');
          }
          else if (focusedField === 'update') {
            setFocusedField('mobile');
            console.log('EditProfile - Moving focus from update to mobile');
          }
          else if (focusedField === 'mobile') {
            setFocusedField('mobileFlag');
            console.log('EditProfile - Moving focus from mobile to mobileFlag');
          }
          else if (focusedField === 'mobileFlag') {
            setFocusedField('email');
            console.log('EditProfile - Moving focus from mobileFlag to email');
          }
          else if (focusedField === 'email') {
            setFocusedField('lastName');
            console.log('EditProfile - Moving focus from email to lastName');
          }
          else if (focusedField === 'lastName') {
            setFocusedField('firstName');
            console.log('EditProfile - Moving focus from lastName to firstName');
          }
          break;

        case 'right':
          if (focusedField === 'firstName') {
            setFocusedField('lastName');
            console.log('EditProfile - Moving focus from firstName to lastName (right)');
          }
          else if (focusedField === 'mobileFlag') {
            setFocusedField('mobile');
            console.log('EditProfile - Moving focus from mobileFlag to mobile (right)');
          }
          break;

        case 'left':
          if (focusedField === 'lastName') {
            setFocusedField('firstName');
            console.log('EditProfile - Moving focus from lastName to firstName (left)');
          }
          else if (focusedField === 'mobile') {
            setFocusedField('mobileFlag');
            console.log('EditProfile - Moving focus from mobile to mobileFlag (left)');
          }
          break;

        case 'select':
          console.log('EditProfile - Select pressed on:', focusedField);
          if (focusedField === 'update') {
            console.log('EditProfile - Executing profile update');
            handleProfileUpdate();
          } else if (focusedField === 'back') {
            console.log('EditProfile - Going back');
            navigation.goBack();
          } else if (focusedField === 'mobileFlag') {
            console.log('EditProfile - Opening country picker');
            setCountryPickerVisible(true);
          }
          break;
      }
    };

    // Execute navigation immediately for smoother response
    handleNavigation();
  });

  // Validate inputs
  const validateInputs = () => {
    setEmailError('');
    setFirstNameError('');
    setLastNameError('');
    setMobileError('');
    let valid = true;

    // First name validation
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      valid = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      valid = false;
    } else if (firstName.trim().length > 50) {
      setFirstNameError('First name must be less than 50 characters');
      valid = false;
    }

    // Last name validation
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      valid = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      valid = false;
    } else if (lastName.trim().length > 50) {
      setLastNameError('Last name must be less than 50 characters');
      valid = false;
    }

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email');
      valid = false;
    }

    // Mobile validation
    if (!mobile.trim()) {
      setMobileError('Mobile number is required');
      valid = false;
    } else if (mobile.trim().length < 10) {
      setMobileError('Mobile number must be at least 10 digits');
      valid = false;
    } else if (mobile.trim().length > 15) {
      setMobileError('Mobile number must be less than 15 digits');
      valid = false;
    }

    return valid;
  };

  const handleProfileUpdate = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', firstName.trim());
      formDataToSend.append('last_name', lastName.trim());
      formDataToSend.append('email', email.trim());
      formDataToSend.append('phone', callingCode + mobile.trim());

      console.log('EditProfile - Sending update with:', { 
        name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim()
      });

      const response = await apiHelper.put(SIGNUP_URL, formDataToSend, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      
      if (response?.status === 200) {
        // Update Redux state with new user data
        const updatedUser = {
          ...user,
          name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        };
        
        dispatch(loginSuccess({
          accessToken: accessToken || '',
          user: updatedUser,
        }));

        setModalMessage(response?.data?.message || 'Profile updated successfully!');
        setModalType('success');
        setModalVisible(true);
        
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('Profile');
        }, 2000);
      }
    } catch (error: any) {
      console.error('EditProfile - Update failed:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setModalMessage(errorMessage);
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

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
                contentContainerStyle={{ 
                  flexGrow: 1, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  paddingVertical: scale(20),
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
              >
                <Text style={styles.heading}>Edit Your Profile</Text>
                <View style={styles.formContainer}>
                  <View style={styles.row}>
                    <View style={styles.halfInputWrapper}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <CInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={(text) => {
                          // Sanitize input - only allow letters, spaces, and hyphens
                          const sanitizedText = text.replace(/[^a-zA-Z\s\-]/g, '');
                          setFirstName(sanitizedText);
                          if (firstNameError) validateInputs();
                        }}
                        onPress={() => setFocusedField('firstName')}
                        hasTVPreferredFocus={focusedField === 'firstName'}
                        focusable={Platform.isTV}
                        containerStyle={[
                          styles.input,
                          focusedField === 'firstName' && { borderColor: COLORS.white, borderWidth: scale(2) }
                        ]}
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
                          // Sanitize input - only allow letters, spaces, and hyphens
                          const sanitizedText = text.replace(/[^a-zA-Z\s\-]/g, '');
                          setLastName(sanitizedText);
                          if (lastNameError) validateInputs();
                        }}
                        onPress={() => setFocusedField('lastName')}
                        hasTVPreferredFocus={focusedField === 'lastName'}
                        focusable={Platform.isTV}
                        containerStyle={[
                          styles.input,
                          focusedField === 'lastName' && { borderColor: COLORS.white, borderWidth: scale(2) }
                        ]}
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
                      focusable={Platform.isTV}
                      containerStyle={[
                        styles.input,
                        focusedField === 'email' && { borderColor: COLORS.white, borderWidth: scale(2) }
                      ]}
                      errorShow={!!emailError}
                      errorText={emailError}
                    />
                  </View>

                  <View style={styles.singleInputWrapper}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={styles.contryInContainer}>
                      <TouchableOpacity
                        style={[
                          styles.contrycodeContainer,
                          focusedField === 'mobileFlag' && { borderColor: COLORS.white, borderWidth: scale(2) }
                        ]}
                        onPress={() => setCountryPickerVisible(true)}
                        hasTVPreferredFocus={focusedField === 'mobileFlag'}
                        focusable={Platform.isTV}
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
                        keyboardType="phone-pad"
                        onPress={() => setFocusedField('mobile')}
                        hasTVPreferredFocus={focusedField === 'mobile'}
                        focusable={Platform.isTV}
                        containerStyle={[
                          {
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            flex: 1,
                            height: scale(22),
                            marginBottom: 0,
                            paddingHorizontal: 0,
                          },
                          focusedField === 'mobile' && { borderColor: COLORS.white, borderWidth: scale(2) }
                        ]}
                        errorShow={false}
                        maxLength={15}
                      />
                    </View>
                    {!!mobileError && <Text style={styles.errorText}>{mobileError}</Text>}
                  </View>

                  <View style={styles.buttonContainer}>
                    <CButton
                      text={loading ? "Updating..." : "Update Profile"}
                      onPress={loading ? () => {} : handleProfileUpdate}
                      style={[
                        styles.button,
                        focusedField === 'update' && { borderColor: COLORS.white, borderWidth: scale(2) },
                        loading && { opacity: 0.7 }
                      ]}
                      textStyle={styles.buttonText}
                      hasTVPreferredFocus={focusedField === 'update'}
                      focusable={Platform.isTV && !loading}
                      backgroundColor={COLORS.primary}
                      loading={loading}
                    />
                  </View>

                  <View style={styles.footerContainer}>
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={[
                        styles.backButton,
                        focusedField === 'back' && { borderColor: COLORS.white, borderWidth: scale(2) }
                      ]}
                      hasTVPreferredFocus={focusedField === 'back'}
                      focusable={Platform.isTV}
                    >
                      <Text style={styles.footerText}>← Back to Profile</Text>
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

export default EditProfile;
