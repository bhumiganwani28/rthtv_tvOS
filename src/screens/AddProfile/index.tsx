import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../theme/colors';
import Header from '../../components/Header';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import ToggleSwitch from "toggle-switch-react-native";
import CAlertModal from '../../components/CAlertModal';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { loginSuccess } from '../../redux/slices/authSlice'; // Assuming you're using Redux for state management
import { IMAGES } from '../../theme/images';
import AIcon from 'react-native-vector-icons/AntDesign';
import { FONTS } from '../../utils/fonts';
import styles from './styles';
import { ADD_PROFILE_URL, EDIT_PROFILE_URL, NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import apiHelper from '../../config/apiHelper';
import { isTablet } from 'react-native-device-info';

interface AddProfileProps {
    navigation: any;
    route: any;
}

const AddProfile: React.FC<AddProfileProps> = ({ navigation, route }) => {
    // const route = useRoute();
    const { profileId, name: initialName, avatar: initialAvatar, isKidsProfile: initialKidsProfile, defaultProfile: defaultProfile } = route?.params || {};
    const [name, setName] = useState<string>(initialName || '');
    const [isKidsProfile, setIsKidsProfile] = useState<boolean>(initialKidsProfile || false);
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
        message: "",
        type: "error",
    });
    const isTablet = useSelector((state: RootState) => state.auth.isTablet);

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
            message: "Are you sure you want to delete this watch profile?",
            type: "success",
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
            // console.log("API Response:", response?.data);


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
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: modalVisible && isDeleteModalVisible ? COLORS.greyBorder : COLORS.black }}
        >
            <ScrollView
               showsVerticalScrollIndicator={false}
                style={[styles.container, { backgroundColor: modalVisible && isDeleteModalVisible ? COLORS.greyBorder : COLORS.black }]}
                onScrollBeginDrag={() => Keyboard?.dismiss()}
                contentContainerStyle={{ flexGrow: 1, backgroundColor: modalVisible && isDeleteModalVisible ? COLORS.greyBorder : COLORS.black }}
                keyboardShouldPersistTaps="handled">
                <Header
                    title={profileId ? "Edit Profile" : "Add Profile"}
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                    showSearchIcon={false}
                    rightButtons={
                        profileId && !defaultProfile === true
                            ? [
                                { label: 'Delete', onPress: () => showDeleteModal(), color: COLORS.primary },
                                { label: 'Save', onPress: () => handleAddProfile(), color: COLORS.primary },
                            ]
                            : [
                                { label: 'Save', onPress: () => handleAddProfile(), color: COLORS.primary },
                            ]
                    }
                    bgCOlor={modalVisible && isDeleteModalVisible ? true : false}

                />

                <View style={styles.formContainer}>
                    {/* Profile Image Section */}
                    {originalProfileData ? (
                        < TouchableOpacity
                            style={styles.profileCard}
                            onPress={() => redirectToProfileImageSelector()}>
                            <Image
                                source={{
                                    uri: originalProfileData
                                }}
                                style={[styles.profileImage,{
                                    width: isTablet ? scale(45) : scale(70),
                                    height: isTablet ? scale(45) : scale(70),
                                }]}
                            />
                            <View style={[styles.editIcon,{
                                  width:isTablet ? scale(17) : scale(25), // Set width for the icon
                                  height: isTablet ? scale(17) :scale(25), 
                                  bottom:isTablet ? -scale(6) : -scale(10),  // Move it slightly above the top of the image
                                 left:isTablet ? scale(35) : scale(50), 
                            }]}>
                                <MIcon name="pencil-outline" size={isTablet ? scale(7) : scale(14)} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.profileCard}
                            onPress={() => redirectToProfileImageSelector()}
                        >
                            <View style={styles.addProfileContainer}>
                                <AIcon name="plus" size={40} color={COLORS.white} />
                            </View>
                            {avatarError ? <Text style={styles.errTrxtStyl}>{avatarError}</Text> : null}
                        </TouchableOpacity>
                    )}


                    {/* Profile Name Input */}
                    <Text style={[styles.label,{fontSize:isTablet ? scale(8) : scale(12)}]}>Profile Name</Text>
                    <CInput
                        placeholder="Type here..."
                        value={name}
                        onChangeText={setName}
                        errorShow={!!nameError}
                        errorText={nameError}
                        bgCOlor={modalVisible && isDeleteModalVisible ? true : false}
                    />

                    {/* Kids Profile Toggle */}
                    <View style={styles.toggleWrapper}>
                        <View style={styles.textView}>
                            <Text style={[styles.kidsProfileText,{
                                 fontSize:isTablet ? scale(9) : scale(14),
                                         marginBottom:isTablet ? scale(5) : scale(8)
                            }]}>Children Profile</Text>
                            <Text style={[styles.desText,{fontSize:isTablet ? scale(8) : scale(13),
                                        marginBottom:isTablet ? scale(5) : scale(8)

                            }]}>Made for children 12 and under, but parents have all the control.</Text>
                        </View>
                        <ToggleSwitch
                            isOn={isKidsProfile}
                            onColor="#06A633"
                            offColor="#444"
                            thumbOnStyle={{ backgroundColor: "#FFFFFF" }}
                            thumbOffStyle={{ backgroundColor: "#181818" }}
                            trackOnStyle={{ backgroundColor: "#06A633" }}
                            trackOffStyle={{ backgroundColor: "#444444" }}
                            size="medium"
                            onToggle={(isOn) => setIsKidsProfile(isOn)}

                        />
                    </View>
                </View>

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
                    onOkPress={handleDeleteProfile}  // When the user confirms, delete the profile
                    onCancelPress={() => setIsDeleteModalVisible(false)} // Close modal if user cancels
                />

            </ScrollView>
        </KeyboardAvoidingView >
    );
};


export default AddProfile;

