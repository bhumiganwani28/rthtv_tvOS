// WhosWatchingTVOS.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CAlertModal from '../../components/CAlertModal';
import Header from '../../components/Header';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import { scale, verticalScale } from 'react-native-size-matters';
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
  // Define navigation prop type for WhosWatching
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [isAddFocused, setIsAddFocused] = useState(false);
  const dataFetchedRef = useRef(false);
  const PROFILE_IMAGE_SIZE = scale(55); // small and neat

  useFocusEffect(
    React.useCallback(() => {
      fetchProfiles();
    }, []),
  );


  const fetchProfiles = async () => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    setLoading(true);

    try {
      const response = await apiHelper.get(PROFILE_LIST); // Fetch profiles from API
      setProfilesData(response?.data);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'An error occurred. Please try again.';
      // Set error modal
      setModalMessage(errorMessage);
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profileId: string) => {
    const selectedProfile = profilesData.find(profile => profile.id === profileId);
    if (isEditMode) {
      // Navigate to AddProfile screen with pre-filled data for editing
      navigation.navigate('AddProfile', {
        profileId: selectedProfile?.id,
        name: selectedProfile?.name,
        avatar: selectedProfile?.avatar,
        isKidsProfile: selectedProfile?.isKids,
      });
    } else {
      // Store the selected profile's image URL in AsyncStorage
      await AsyncStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
      await AsyncStorage.setItem('selectedProfileImage', selectedProfile?.avatar || '');
      await AsyncStorage.setItem('selectedProfileName', selectedProfile?.name || '');
      // Navigate to home screen (or the appropriate screen)
      navigation.navigate('Home');
    }
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const renderProfile = (profile: Profile, index: number) => {
    const isFocused = focusedIndex === index;

    return (
      <View key={profile.id} style={styles.profileWrapper}>
        <TouchableOpacity
          style={[styles.profileCard, isFocused && styles.focusedProfileCard]}
          onFocus={() => setFocusedIndex(index)}
          // onPress={() => handleProfileSelect(profile)}
          onPress={() => handleProfileSelect(profile.id)}
          hasTVPreferredFocus={index === 0}
          focusable={true}>
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
              <MIcon name="pencil-outline" size={22} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.profileName}>{profile.name}</Text>
      </View>
    );
  };

  const renderAddProfile = () => (
    <View style={styles.profileWrapper}>
      <TouchableOpacity
        style={[
          styles.addProfileBox,
          isAddFocused && styles.focusedAddProfileBox,
        ]}
        onFocus={() => setIsAddFocused(true)}
        onBlur={() => setIsAddFocused(false)}
        onPress={() => navigation.navigate('AddProfile')}
        hasTVPreferredFocus={profilesData.length === 0}
        focusable={true}>
        <AIcon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.profileName}>Add</Text>
    </View>
  );

  return (
    <View style={styles.centerWrapper}>
      <BackHandlerComponent
        onBackPress={() => {
          BackHandler.exitApp();
          return true;
        }}
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
            showsHorizontalScrollIndicator={false}>
            {profilesData.map(renderProfile)}
            {profilesData.length < MAX_PROFILES && renderAddProfile()}
          </ScrollView>
          {/* Edit/Cancel Buttons Row under profiles */}
          <View style={styles.editButtonsRow}>
            {!isEditMode && (
              <CButton
                text="Edit Profiles"
                onPress={toggleEditMode}
                style={styles.editProfilesButton}
                icon={<MIcon name="pencil-outline" size={22} color={COLORS.white} />}
                focusable={true}
              />
            )}
            {isEditMode && (
              <CButton
                text="Cancel"
                onPress={toggleEditMode}
                style={styles.cancelEditButton}
                outline
                focusable={true}
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