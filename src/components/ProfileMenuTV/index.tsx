import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  // Modal,
  // FlatList,
  // useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '../../types';
import { NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import { COLORS } from '../../theme/colors';

interface ProfileMenuTVProps {
  onProfileChange?: (profile: Profile) => void;
}

// Commented out menu items for now
// const MENU_ITEMS = [
//   { key: 'manage', label: 'Manage Watch Profile', icon: '👤', action: 'manageProfile' },
//   // { key: 'editProfile', label: 'Edit Profile', icon: '✏️', action: 'editProfile' },
//   // { key: 'settings', label: 'Account & Settings', icon: '⚙️', action: 'settings' },
//   // { key: 'devices', label: 'Manage Access & Devices', icon: '🖥️', action: 'devices' },
//   // { key: 'subscription', label: 'Subscription', icon: '💳', action: 'subscription' },
//   // { key: 'password', label: 'Change Password', icon: '🔒', action: 'changePassword' },
//   { key: 'signout', label: 'Sign Out', icon: '⏏️', action: 'signout' },
// ];

const ProfileMenuTV: React.FC<ProfileMenuTVProps> = ({ onProfileChange }) => {
  const navigation = useNavigation<any>();
  // const [showDropdown, setShowDropdown] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  // const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
  const [isProfileButtonFocused, setIsProfileButtonFocused] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const selectedProfile = await AsyncStorage.getItem('selectedProfile');
      setCurrentProfile(selectedProfile ? JSON.parse(selectedProfile) : null);
    };
    loadProfile();
  }, []);

  // Commented out TV remote menu navigation
  // useTVEventHandler((evt) => {
  //   if (!showDropdown) return;
  //   switch (evt.eventType) {
  //     case 'down':
  //       setFocusedMenuIndex((i) => (i < MENU_ITEMS.length - 1 ? i + 1 : i));
  //       break;
  //     case 'up':
  //       setFocusedMenuIndex((i) => (i > 0 ? i - 1 : i));
  //       break;
  //     case 'select':
  //       handleMenuAction(MENU_ITEMS[focusedMenuIndex].action);
  //       break;
  //     case 'back':
  //       setShowDropdown(false);
  //       break;
  //     case 'left':
  //       setShowDropdown(false);
  //       break;
  //     case 'right':
  //       // Allow right navigation if needed
  //       break;
  //   }
  // });

  // Commented out menu action handler
  // const handleMenuAction = async (action: string) => {
  //   setShowDropdown(false);
  //   switch (action) {
  //     case 'manageProfile':
  //       navigation.navigate('WhosWatching');
  //       break;
  //     case 'editProfile':
  //       navigation.navigate('EditProfile');
  //       break;
  //     // case 'settings':
  //     //   // navigation.navigate('Settings'); // adjust as per your navigation
  //     //   break;
  //     // case 'devices':
  //     //   // navigation.navigate('ManageDevices');
  //     //   break;
  //     // case 'subscription':
  //     //   // navigation.navigate('SubscriptionScreen');
  //     //   break;
  //     case 'changePassword':
  //       navigation.navigate('ChangePasswordTV');
  //       break;
  //     case 'signout':
  //       await AsyncStorage.removeItem('accessToken');
  //       await AsyncStorage.removeItem('user');
  //       // await AsyncStorage.removeItem('selectedProfile'); // clear profile
  //       navigation.navigate('LoginTV'); // or your login/landing
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // Simple handler to navigate to WhosWatching screen
  const handleProfileClick = () => {
    navigation.navigate('WhosWatching');
  };

  if (!currentProfile) return null;

  return (
    <View style={styles.profileMenuContainer}>
      <TouchableOpacity
        style={[
          styles.profileAvatarBtn,
          isProfileButtonFocused && styles.profileAvatarBtnFocused,
        ]}
        onPress={handleProfileClick}
        focusable={true}
        hasTVPreferredFocus={false}
        onFocus={() => {
          setIsProfileButtonFocused(true);
        }}
        onBlur={() => {
          setIsProfileButtonFocused(false);
        }}
      >
        <Image
          source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${currentProfile.avatar}` }}
          style={styles.profileAvatar}
        />
      </TouchableOpacity>
      
      {/* Commented out Modal and dropdown functionality
      <Modal
        visible={showDropdown}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDropdown(false)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownMenuBlock}>
            <View style={styles.menuProfileRow}>
              <Image
                source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${currentProfile.avatar}` }}
                style={styles.menuProfileAvatar}
              />
              <Text style={styles.menuProfileName}>{currentProfile.name}</Text>
            </View>

            <View style={styles.menuDivider} />

            <FlatList
              data={MENU_ITEMS}
              keyExtractor={item => item.key}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    focusedMenuIndex === index && styles.menuItemFocused,
                  ]}
                  onFocus={() => setFocusedMenuIndex(index)}
                  onPress={() => handleMenuAction(item.action)}
                  focusable={true}
                  hasTVPreferredFocus={index === 0 && showDropdown}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.menuItemLabel,
                    focusedMenuIndex === index && styles.menuItemLabelFocused,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
      */}
    </View>
  );
};

// Simple styles for the profile button
const styles = {
  profileMenuContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  profileAvatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileAvatarBtnFocused: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
};

export default ProfileMenuTV;
