import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {scale, verticalScale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {COLORS} from '../../theme/colors';
import Header from '../../components/Header';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
// import ToggleSwitch from "toggle-switch-react-native";
import CAlertModal from '../../components/CAlertModal';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {loginSuccess} from '../../redux/slices/authSlice'; // Assuming you're using Redux for state management
import {IMAGES} from '../../theme/images';
import AIcon from 'react-native-vector-icons/AntDesign';
import {FONTS} from '../../utils/fonts';
import styles from './styles';
import {
  ADD_PROFILE_URL,
  EDIT_PROFILE_URL,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
} from '../../config/apiEndpoints';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import apiHelper from '../../config/apiHelper';
// import ToggleSwitch from "toggle-switch-react-native";

interface AddProfileProps {
  navigation: any;
  route: any;
}

const AddProfile: React.FC<AddProfileProps> = ({navigation, route}) => {
  const isTV = Platform.isTV;

      const {
         profileId, name:
          initialName, avatar:
           initialAvatar, isKidsProfile: 
           initialKidsProfile, defaultProfile: 
           defaultProfile } = route?.params || {};
console.log("profileId.",profileId);

  const [name, setName] = useState<string>(initialName || '');
  const [isKidsProfile, setIsKidsProfile] = useState<boolean>(
    initialKidsProfile || false,
  );
  const [nameError, setNameError] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [originalProfileData, setOriginalProfileData] = useState<any>(null);
  // delete modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteAlertObject, setDeleteAlertObject] = useState({
    message: '',
    type: 'error',
  });

  useEffect(() => {
    // Set default avatar URL when no avatar is provided
    if (initialAvatar) {
      const avatarUrl = `${NEXT_PUBLIC_API_CDN_ENDPOINT}${initialAvatar}`;
      setOriginalProfileData(avatarUrl);
    }
  }, [initialAvatar]);

  // delete modal
  const showDeleteModal = () => {
    setDeleteAlertObject({
      message: 'Are you sure you want to delete this watch profile?',
      type: 'success',
    });
    setIsDeleteModalVisible(true);
  };

  // Function to validate name
  const validateName = (): boolean => {
    if (!name.trim()) {
      setNameError('Please enter a name');
      return false;
    }
    setNameError('');
    return true;
  };

   // Function to check if avatar is selected
    const validateAvatar = (): boolean => {
        if (!originalProfileData) {
            setAvatarError('Please select an avatar before proceeding!');
            return false;
        }
        return true;
    };


  // Add Profile (Save)
    const handleAddProfile = async () => {
        const isNameValid = validateName();
        const isAvatarValid = validateAvatar();
        if (!isNameValid || !isAvatarValid) {
            return; // Exit if validation fails
        }
        const payload = {
            name: name.trim(),
            isKidsProfile,
            avatar: initialAvatar,
        };
        try {
            // setLoading(true);
            // Determine if it's an edit or add operation
            const response = profileId
                ? await apiHelper.put(`${EDIT_PROFILE_URL}/${profileId}`, payload)
                : await apiHelper.post(ADD_PROFILE_URL, payload);

            // console.log("API Response:", response);
            console.log("API Response:", response?.data);


            if (response?.status === 200 || response?.status === 201) {
                setModalType('success');
                setModalMessage(response?.data?.message || "Profile saved successfully!");
                setModalVisible(true);

                // Navigate back to profile list after a delay
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.navigate('WhosWatching');
                }, 1000);
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error: any) {
            console.error("Error saving profile:", error);
            setModalMessage(error?.message || 'An error occurred while saving.');
            setModalType('error');
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };



  // DELETE Profile function
  // Handle delete profile API call
   const handleDeleteProfile = async () => {
        setIsDeleteModalVisible(false)
        try {
            const response = await apiHelper.delete(`${EDIT_PROFILE_URL}/${profileId}`);
            if (response?.status === 200) {
                setIsDeleteModalVisible(false)
                setModalType('success');
                setModalMessage('Profile deleted successfully!');
                setModalVisible(true);
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.replace('WhosWatching');
                }, 1000);
            } else {
                throw new Error('Failed to delete profile');
            }
        } catch (error: any) {
            setIsDeleteModalVisible(false)
            setModalMessage(error?.message || 'An error occurred while deleting the profile.');
            setModalType('error');
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };
    const redirectToProfileImageSelector = () => {
        // navigation.navigate("SelectAvtar");
        navigation.navigate('SelectAvtar', {
            profileId: profileId,
            name: name,
            avatar: initialAvatar,
            isKidsProfile: isKidsProfile,
            defaultProfile: defaultProfile

        });
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
          </View>

                 <View style={styles.loginBox}>
              <Text style={styles.heading}>Add Profile</Text>
                <View style={styles.formContainer}>
                      <View style={styles.avatarWrapper}>
                    <TouchableOpacity 
                     onPress={() => redirectToProfileImageSelector()}
                    style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                          //  source={{
                          //           uri: originalProfileData
                          //       }}
                            source={originalProfileData ? { uri: originalProfileData } : IMAGES.profile}
                            style={styles.profileImage}
                        />
                        <View style={styles.editIcon}>
                            <MIcon name="pencil-outline" size={scale(18)} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                  <Text style={styles.inputLabel}>Profile Name</Text>
                  <View style={styles.inputView}>
                    <CInput
                    placeholder="Type here..."
                    value={name}
                    onChangeText={setName}
                    errorShow={!!nameError}
                    errorText={nameError}
                    containerStyle={styles.input}
                    focusable={true}
                    hasTVPreferredFocus={true} // Use true if this input should get initial focus on modal/screen load
/>

                    </View>
                </View>
                <CButton
                  text="Save"
                  onPress={()=>{
                    handleAddProfile();
                  }}
                  style={styles.saveButton}
                  textStyle={styles.saveButtonText}
                //   hasTVPreferredFocus={focusedField === 'submit'}
                  focusable
                  backgroundColor={COLORS.primary}
                  loading={loading}
                />
               { profileId && !defaultProfile === true && (  <CButton
                  text="Delete"
                  onPress={()=>{
                    showDeleteModal();
                  }}
                  style={[styles.DeletButton,{marginTop:scale(10)}]}
                  textStyle={styles.saveButtonText}
                //   hasTVPreferredFocus={focusedField === 'submit'}
                  focusable
                  outline
                  backgroundColor={COLORS.primary}
                  loading={loading}
                />)}
              </View>
              </View>
        </View>

        {/* Alert Modal */}
                <CAlertModal
            visible={modalVisible}
            btnTitle="OK"
            type={modalType}
            message={modalMessage}
            onOkPress={() => setModalVisible(false)}
        />
        <CAlertModal
            visible={isDeleteModalVisible}
            btnTitle="Yes, Delete"
            btnTitle2="Cancel"
            type={deleteAlertObject?.type}
            message={deleteAlertObject?.message}
            onOkPress={handleDeleteProfile}
            onCancelPress={() => setIsDeleteModalVisible(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default AddProfile;
