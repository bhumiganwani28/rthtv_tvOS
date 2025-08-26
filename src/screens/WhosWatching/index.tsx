import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import KeyEvent from 'react-native-keyevent';
import CAlertModal from '../../components/CAlertModal';
import Header from '../../components/Header';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import { scale } from 'react-native-size-matters';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import {
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PROFILE_LIST,
} from '../../config/apiEndpoints';
import styles from './styles';
import CButton from '../../components/CButton';
import { Profile } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';

const MAX_PROFILES = 6;

const WhosWatchingTVOS: React.FC = () => {
  type WhosWatchingNavigationProp = StackNavigationProp<
    {
      Home: undefined;
      AddProfile: {
        profileId?: string;
        name?: string;
        avatar?: any;
        defaultProfile?: any;
        isKidsProfile?: boolean;
      };
    },
    'Home'
  >;

  const navigation = useNavigation<WhosWatchingNavigationProp>();
  const [profilesData, setProfilesData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  
  // 🎯 TV Navigation State
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isAddFocused, setIsAddFocused] = useState<boolean>(false);
  const [isEditButtonFocused, setIsEditButtonFocused] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'profiles' | 'buttons'>('profiles');
  
  // 🔧 Focus Management
  const lastKeyPressTime = useRef<number>(0);
  const keyPressDebounceTime = 150;
  const isKeyEventEnabled = useRef<boolean>(false);

  const dataFetchedRef = useRef(false);
  const PROFILE_IMAGE_SIZE = scale(55);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfiles();
      
      // 🎯 Reset focus when screen comes into focus
      if (Platform.isTV) {
        console.log('WhosWatching screen focused - resetting navigation state');
        setFocusedIndex(0);
        setIsAddFocused(false);
        setIsEditButtonFocused(false);
        setCurrentSection('profiles');
        lastKeyPressTime.current = 0;
        
        // Add a small delay to ensure proper focus
        setTimeout(() => {
          console.log('WhosWatching - Focus reset completed');
        }, 100);
      }
    }, [])
  );

  const handleBackPress = () => {
    if (isEditMode) {
      toggleEditMode();
      return true;
    }
    BackHandler.exitApp();
    return true;
  };

  const fetchProfiles = async () => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    setLoading(true);
    try {
      const response = await apiHelper.get(PROFILE_LIST);
      setProfilesData(response?.data);
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setModalMessage(errorMessage);
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profileId: string) => {
    console.log('Profile selected:', profileId);
    const selectedProfile = profilesData.find(profile => profile.id === profileId);
    
    if (!selectedProfile) {
      console.error('Selected profile not found');
      return;
    }
    
    if (isEditMode) {
      navigation.navigate('AddProfile', {
        profileId: selectedProfile?.id,
        name: selectedProfile?.name,
        avatar: selectedProfile?.avatar,
        isKidsProfile: selectedProfile?.isKids,
      });
    } else {
      try {
        await AsyncStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
        await AsyncStorage.setItem('selectedProfileImage', selectedProfile?.avatar || '');
        await AsyncStorage.setItem('selectedProfileName', selectedProfile?.name || '');
        console.log('Profile saved to storage, navigating to Home');
        navigation.navigate('Home');
      } catch (error) {
        console.error('Error saving profile:', error);
        setModalMessage('Error saving profile. Please try again.');
        setModalType('error');
        setModalVisible(true);
      }
    }
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  // 🎯 Android TV Key Event Handler
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      console.log('WhosWatching - Setting up Android TV KeyEvent listener');
      
      const handleKeyDown = (keyEvent: any) => {
        console.log('WhosWatching - Android TV Key:', keyEvent.keyCode);
        handleAndroidTVKey(keyEvent.keyCode);
      };

      KeyEvent.onKeyDownListener(handleKeyDown);
      isKeyEventEnabled.current = true;

      return () => {
        console.log('WhosWatching - Removing Android TV KeyEvent listener');
        if (isKeyEventEnabled.current) {
          KeyEvent.removeKeyDownListener();
          isKeyEventEnabled.current = false;
        }
      };
    }
  }, []);

  // 🔁 Android TV Key Handler
  const handleAndroidTVKey = useCallback((keyCode: number) => {
    const currentTime = Date.now();
    if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
      console.log('WhosWatching - Debouncing key press:', keyCode);
      return;
    }
    lastKeyPressTime.current = currentTime;
    
    console.log('WhosWatching - Android TV Key Pressed:', keyCode, 'Section:', currentSection, 'Focus Index:', focusedIndex);
    
    const totalProfiles = profilesData.length;
    const hasAddButton = totalProfiles < MAX_PROFILES;
    
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        console.log('⬆️ WhosWatching - UP pressed');
        if (currentSection === 'buttons') {
          setCurrentSection('profiles');
          setFocusedIndex(0);
          setIsAddFocused(false);
          setIsEditButtonFocused(false);
        }
        break;
        
      case 20: // KEYCODE_DPAD_DOWN
        console.log('⬇️ WhosWatching - DOWN pressed');
        if (currentSection === 'profiles') {
          setCurrentSection('buttons');
          setIsEditButtonFocused(true);
          setFocusedIndex(-1);
          setIsAddFocused(false);
        }
        break;
        
      case 21: // KEYCODE_DPAD_LEFT
        console.log('⬅️ WhosWatching - LEFT pressed');
        if (currentSection === 'profiles') {
          if (isAddFocused) {
            // Move from add button to last profile
            setFocusedIndex(Math.max(0, totalProfiles - 1));
            setIsAddFocused(false);
          } else if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1);
          }
        }
        break;
        
      case 22: // KEYCODE_DPAD_RIGHT
        console.log('➡️ WhosWatching - RIGHT pressed');
        if (currentSection === 'profiles') {
          if (isAddFocused) {
            // Already on add button, do nothing
          } else if (focusedIndex < totalProfiles - 1) {
            setFocusedIndex(focusedIndex + 1);
          } else if (hasAddButton) {
            // Move to add button
            setIsAddFocused(true);
            setFocusedIndex(-1);
          }
        }
        break;
        
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        console.log('✅ WhosWatching - SELECT pressed');
        if (currentSection === 'profiles') {
          if (isAddFocused) {
            navigation.navigate('AddProfile');
          } else if (focusedIndex >= 0 && focusedIndex < totalProfiles) {
            const profile = profilesData[focusedIndex];
            if (profile) {
              handleProfileSelect(profile.id);
            }
          }
        } else if (currentSection === 'buttons' && isEditButtonFocused) {
          toggleEditMode();
        }
        break;
        
      case 4: // KEYCODE_BACK
        console.log('🔙 WhosWatching - BACK pressed');
        handleBackPress();
        break;
        
      default:
        console.log('WhosWatching - Unknown Android TV key:', keyCode);
        break;
    }
  }, [currentSection, focusedIndex, isAddFocused, isEditButtonFocused, profilesData, handleProfileSelect, navigation, toggleEditMode]);

  const renderProfile = (profile: Profile, index: number) => {
    const isFocused = focusedIndex === index && currentSection === 'profiles' && !isAddFocused;

    return (
      <View key={profile.id} style={styles.profileWrapper}>
        <TouchableOpacity
          style={[styles.profileCard, isFocused && styles.focusedProfileCard]}
          onFocus={() => {
            if (Platform.isTV) {
              const currentTime = Date.now();
              if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
                return;
              }
              lastKeyPressTime.current = currentTime;
              
              console.log('Profile focused:', index, profile.name);
              setFocusedIndex(index);
              setIsAddFocused(false);
              setCurrentSection('profiles');
            }
          }}
          onPress={() => handleProfileSelect(profile.id)}
          hasTVPreferredFocus={index === 0 && currentSection === 'profiles'}
          focusable={Platform.isTV}
          accessible={Platform.isTV}
          accessibilityRole="button"
          accessibilityLabel={`Profile ${profile.name}`}
        >
          <View>
            <Image
              source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${profile.avatar}` }}
              style={[
                styles.profileImage,
                { width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE },
              ]}
              resizeMode="cover"
            />
            {isEditMode && (
              <View
                style={[
                  styles.editOverlay,
                  { width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE },
                ]}
              >
                <MIcon name="pencil-outline" size={scale(15)} color={COLORS.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {profile.name}
        </Text>
      </View>
    );
  };

  const renderAddProfile = () => (
    <View style={styles.profileWrapper}>
      <TouchableOpacity
        style={[styles.addProfileBox, isAddFocused && styles.focusedAddProfileBox]}
        onFocus={() => {
          if (Platform.isTV) {
            const currentTime = Date.now();
            if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
              return;
            }
            lastKeyPressTime.current = currentTime;
            
            console.log('Add profile focused');
            setIsAddFocused(true);
            setFocusedIndex(-1);
            setCurrentSection('profiles');
          }
        }}
        onBlur={() => setIsAddFocused(false)}
        onPress={() => navigation.navigate('AddProfile')}
        hasTVPreferredFocus={profilesData.length === 0 && currentSection === 'profiles'}
        focusable={Platform.isTV}
        accessible={Platform.isTV}
        accessibilityRole="button"
        accessibilityLabel="Add new profile"
      >
        <View>
          <AIcon name="plus" size={28} color={COLORS.white} />
        </View>
      </TouchableOpacity>
      <Text style={styles.profileName}>
        Add
      </Text>
    </View>
  );

  return (
    <View style={styles.centerWrapper}>
      <BackHandlerComponent
        onBackPress={handleBackPress}
      />
      <Header logoSource={IMAGES.logo} editIconPress={toggleEditMode} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Who's watching?</Text>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.profilesScroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            focusable={false}
          >
            {profilesData.map(renderProfile)}
            {profilesData.length < MAX_PROFILES && renderAddProfile()}
          </ScrollView>
          <View style={styles.editButtonsRow}>
            {!isEditMode ? (
              <CButton
                text="Edit Profiles"
                onPress={toggleEditMode}
                style={[
                  styles.editProfilesButton,
                  isEditButtonFocused && styles.focusedEditButton
                ]}
                icon={<MIcon name="pencil-outline" size={22} color={COLORS.white} />}
                focusable={Platform.isTV}
                accessible={Platform.isTV}
                onFocus={() => {
                  if (Platform.isTV) {
                    setIsEditButtonFocused(true);
                    setCurrentSection('buttons');
                  }
                }}
                onBlur={() => setIsEditButtonFocused(false)}
                hasTVPreferredFocus={currentSection === 'buttons'}
              />
            ) : (
              <CButton
                text="Cancel"
                onPress={toggleEditMode}
                style={[
                  styles.cancelEditButton,
                  isEditButtonFocused && styles.focusedEditButton
                ]}
                outline
                focusable={Platform.isTV}
                accessible={Platform.isTV}
                onFocus={() => {
                  if (Platform.isTV) {
                    setIsEditButtonFocused(true);
                    setCurrentSection('buttons');
                  }
                }}
                onBlur={() => setIsEditButtonFocused(false)}
                hasTVPreferredFocus={currentSection === 'buttons'}
              />
            )}
          </View>
        </>
      )}
      <CAlertModal
        visible={modalVisible}
        message={modalMessage}
        type={modalType}
        btnTitle="OK"
        onOkPress={() => setModalVisible(false)}
      />
    </View>
  );
};

export default WhosWatchingTVOS;