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
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [isAddFocused, setIsAddFocused] = useState(false);
  const dataFetchedRef = useRef(false);
  const PROFILE_IMAGE_SIZE = scale(55);

  // Refs for TV Focus
  const profileRefs = useRef<{ [key: number]: any }>({});
  const addProfileRef = useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfiles();
    }, [])
  );

   // Auto-focus on profile or Add profile on screen load
  // React.useEffect(() => {
  //   if (!loading) {
  //     if (profilesData?.length > 0) {
  //       setTimeout(() => {
  //         profileRefs?.current[0]?.focus && profileRefs?.current[0]?.focus();
  //       }, 100); // slight delay for TV reliability
  //       setFocusedIndex(0);
  //       setIsAddFocused(false);
  //     } else {
  //       setTimeout(() => {
  //         addProfileRef.current?.focus && addProfileRef.current.focus();
  //       }, 100);
  //       setIsAddFocused(true);
  //       setFocusedIndex(-1);
  //     }
  //   }
  // }, [loading, profilesData.length]);

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
    const selectedProfile = profilesData.find(profile => profile.id === profileId);
    if (isEditMode) {
      navigation.navigate('AddProfile', {
        profileId: selectedProfile?.id,
        name: selectedProfile?.name,
        avatar: selectedProfile?.avatar,
        isKidsProfile: selectedProfile?.isKids,
      });
    } else {
      await AsyncStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
      await AsyncStorage.setItem('selectedProfileImage', selectedProfile?.avatar || '');
      await AsyncStorage.setItem('selectedProfileName', selectedProfile?.name || '');
      navigation.navigate('Home');
    }
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const renderProfile = (profile: Profile, index: number) => {
    const isFocused = focusedIndex === index;
    return (
      <View key={profile.id} style={styles.profileWrapper}>
        <TouchableOpacity
          ref={el => {
            if (el) profileRefs.current[index] = el;
          }}
          style={[styles.profileCard, isFocused && styles.focusedProfileCard]}
          onFocus={() => setFocusedIndex(index)}
          onPress={() => handleProfileSelect(profile.id)}
          hasTVPreferredFocus={index === 0 && !isAddFocused}
          focusable={true}
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
        <Text style={styles.profileName}>{profile.name}</Text>
      </View>
    );
  };

  const renderAddProfile = () => (
    <View style={styles.profileWrapper}>
      <TouchableOpacity
        ref={addProfileRef}
        style={[
          styles.addProfileBox,
          isAddFocused && styles.focusedAddProfileBox,
        ]}
        onFocus={() => {
          setIsAddFocused(true);
          setFocusedIndex(-1); // Reset profile focus when Add button is focused
        }}
        onBlur={() => setIsAddFocused(false)}
        onPress={() => navigation.navigate('AddProfile')}
        hasTVPreferredFocus={profilesData.length === 0}
        focusable={true}
      >
        <View>
          <AIcon name="plus" size={28} color={COLORS.white} />
        </View>
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
            showsHorizontalScrollIndicator={false}
          >
            {profilesData.map(renderProfile)}
            {profilesData.length < MAX_PROFILES && renderAddProfile()}
          </ScrollView>
          <View style={styles.editButtonsRow}>
            {!isEditMode ? (
              <CButton
                text="Edit Profiles"
                onPress={toggleEditMode}
                style={styles.editProfilesButton}
                icon={<MIcon name="pencil-outline" size={22} color={COLORS.white} />}
                focusable={true}
              />
            ) : (
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