// WhosWatchingTVOS.tsx
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CAlertModal from '../../components/CAlertModal';
import Header from '../../components/Header';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import {scale, verticalScale} from 'react-native-size-matters';
import {IMAGES} from '../../theme/images';
import {COLORS} from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import {
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PROFILE_LIST,
} from '../../config/apiEndpoints';
import styles from './styles';

const MAX_PROFILES = 6;
const isTV = Platform.isTV;

const WhosWatchingTVOS: React.FC = () => {
  const navigation = useNavigation();
  const [profilesData, setProfilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('error');

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

    try {
      const response = await apiHelper.get(PROFILE_LIST);
      const profiles = response?.data || [];

      setProfilesData(profiles);

      // 🔁 Save all profiles
      await AsyncStorage.setItem('userProfiles', JSON.stringify(profiles));
    } catch (error) {
      setModalMessage(error?.message || 'Failed to load profiles.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile: any) => {
    if (isEditMode) {
      navigation.navigate('AddProfile', profile);
    } else {
      console.log('Selected Profile:', profile);

      await AsyncStorage.setItem('selectedProfile', JSON.stringify(profile));
      await new Promise(resolve => setTimeout(resolve, 100)); // optional delay

      navigation.replace('Home');
    }
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const renderProfile = (profile: any, index: number) => {
    const isFocused = focusedIndex === index;

    return (
      <View key={profile.id} style={styles.profileWrapper}>
        <TouchableOpacity
          style={[styles.profileCard, isFocused && styles.focusedProfileCard]}
          onFocus={() => setFocusedIndex(index)}
          onPress={() => handleProfileSelect(profile)}
          hasTVPreferredFocus={index === 0}
          focusable={true}>
          <Image
            source={{uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${profile.avatar}`}}
            style={[
              styles.profileImage,
              {width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE},
            ]}
            resizeMode="cover"
          />
          {isEditMode && (
            <View
              style={[
                styles.editOverlay,
                {width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE},
              ]}>
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
        style={styles.addProfileCard}
        onPress={() => navigation.navigate('AddProfile')}
        hasTVPreferredFocus={profilesData.length === 0}
        focusable={true}>
        <View
          style={[
            styles.addProfileContainer,
            {width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE},
          ]}>
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
        <ScrollView
          contentContainerStyle={styles.profilesScroll}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {profilesData.map(renderProfile)}
          {profilesData.length < MAX_PROFILES && renderAddProfile()}
        </ScrollView>
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
