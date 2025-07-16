import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGES } from '../../theme/images';
import styles from './styles';
import { Profile } from '../../types';
import { NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';

const isTV = Platform.isTV;

interface ProfileSelectorProps {
  onProfileChange?: (profile: Profile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileChange }) => {
  const navigation = useNavigation<any>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [focusedProfileIndex, setFocusedProfileIndex] = useState(0);

  // Load profiles and current profile on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // TV navigation for dropdown menu
  useTVEventHandler((evt) => {
    if (!showDropdown) return;

    if (evt && evt.eventType) {
      switch (evt.eventType) {
        case 'down':
          if (focusedProfileIndex < profiles.length - 1) {
            setFocusedProfileIndex(focusedProfileIndex + 1);
          }
          break;
        case 'up':
          if (focusedProfileIndex > 0) {
            setFocusedProfileIndex(focusedProfileIndex - 1);
          }
          break;
        case 'select':
          handleProfileSelect(profiles[focusedProfileIndex]);
          break;
        case 'back':
          setShowDropdown(false);
          break;
      }
    }
  });

  const loadProfiles = async () => {
    try {
      // Load all profiles
      const storedProfiles = await AsyncStorage.getItem('userProfiles');
      const parsedProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];
      
      // Load selected profile
      const selectedProfile = await AsyncStorage.getItem('selectedProfile');
      const parsedSelectedProfile = selectedProfile ? JSON.parse(selectedProfile) : null;
      
      if (parsedProfiles.length > 0) {
        setProfiles(parsedProfiles.filter((p: Profile) => !p.isAddProfile));
      }
      
      if (parsedSelectedProfile) {
        setCurrentProfile(parsedSelectedProfile);
      } else if (parsedProfiles.length > 0) {
        // If no selected profile, default to first profile
        setCurrentProfile(parsedProfiles[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setFocusedProfileIndex(0);
  };

  const handleProfileSelect = async (profile: Profile) => {
    try {
      await AsyncStorage.setItem('selectedProfile', JSON.stringify(profile));
      setCurrentProfile(profile);
      setShowDropdown(false);
      
      // Call the onProfileChange callback if provided
      if (onProfileChange) {
        onProfileChange(profile);
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const navigateToProfiles = () => {
    navigation.navigate('WhosWatching');
  };

  // If no profile is selected, render nothing
  if (!currentProfile) {
    return null;
  }

  const renderProfileItem = ({ item, index }: { item: Profile; index: number }) => {
    const isFocused = focusedProfileIndex === index;
    const isCurrentProfile = currentProfile && item.id === currentProfile.id;

    return (
      <TouchableOpacity
        style={[
          styles.profileItem,
          isFocused && styles.focusedProfileItem,
          isCurrentProfile && styles.selectedProfileItem,
        ]}
        onPress={() => handleProfileSelect(item)}
        onFocus={() => setFocusedProfileIndex(index)}
        hasTVPreferredFocus={index === 0}
        focusable={isTV}
      >
      <Image
       source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.avatar}` }}
        style={styles.profileImage}
      resizeMode="cover"
    />

        <Text style={[
          styles.profileItemName,
          isFocused && styles.focusedProfileItemName,
          isCurrentProfile && styles.selectedProfileItemName,
        ]}>
          {item?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={toggleDropdown}
        focusable={isTV}
      >
       <Image
        // source={currentProfile.avatar}
        source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${currentProfile?.avatar}` }}
        style={styles.profileImage}
        resizeMode="cover"
      />

        <Text style={styles.profileName}>{currentProfile.name}</Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={profiles}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity
              style={styles.manageProfilesButton}
              onPress={navigateToProfiles}
              focusable={isTV}
            >
              <Text style={styles.manageProfilesText}>
                Manage Profiles
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProfileSelector; 