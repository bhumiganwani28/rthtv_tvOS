import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import { Profile } from '../../types';
import { NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import { COLORS } from '../../theme/colors';

interface ProfileMenuTVProps {
  onProfileChange?: (profile: Profile) => void;
}

const MENU_ITEMS = [
  { key: 'manage', label: 'Manage Watch Profile', icon: '👤', action: 'manageProfile' },
  { key: 'settings', label: 'Account & Settings', icon: '⚙️', action: 'settings' },
  { key: 'devices', label: 'Manage Access & Devices', icon: '🖥️', action: 'devices' },
  { key: 'subscription', label: 'Subscription', icon: '💳', action: 'subscription' },
  { key: 'password', label: 'Change Password', icon: '🔒', action: 'changePassword' },
  { key: 'signout', label: 'Sign Out', icon: '⏏️', action: 'signout' },
];

const ProfileMenuTV: React.FC<ProfileMenuTVProps> = ({ onProfileChange }) => {
  const navigation = useNavigation<any>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const selectedProfile = await AsyncStorage.getItem('selectedProfile');
      setCurrentProfile(selectedProfile ? JSON.parse(selectedProfile) : null);
    };
    loadProfile();
  }, []);

  // TV remote menu navigation
  useTVEventHandler((evt) => {
    if (!showDropdown) return;
    switch (evt.eventType) {
      case 'down':
        setFocusedMenuIndex((i) => (i < MENU_ITEMS.length - 1 ? i + 1 : i));
        break;
      case 'up':
        setFocusedMenuIndex((i) => (i > 0 ? i - 1 : i));
        break;
      case 'select':
        handleMenuAction(MENU_ITEMS[focusedMenuIndex].action);
        break;
      case 'back':
        setShowDropdown(false);
        break;
    }
  });

  const handleMenuAction = async (action: string) => {
    setShowDropdown(false);
    switch (action) {
      case 'manageProfile':
  navigation.replace('WhosWatching');
  break;

      // case 'manageProfile':
      //   navigation.navigate('WhosWatching');
      //   break;
      case 'settings':
        // navigation.navigate('Settings'); // adjust as per your navigation
        break;
      case 'devices':
        // navigation.navigate('ManageDevices');
        break;
      case 'subscription':
        // navigation.navigate('SubscriptionScreen');
        break;
      case 'changePassword':
        // navigation.navigate('ChangePassword');
        break;
      case 'signout':
        await AsyncStorage.removeItem('selectedProfile'); // clear profile
        // navigation.navigate('SignIn'); // or your login/landing
        break;
      default:
        break;
    }
  };

  if (!currentProfile) return null;

  return (
    <View style={styles.profileMenuContainer}>
      <TouchableOpacity
        style={styles.profileAvatarBtn}
        onPress={() => { setShowDropdown(true); setFocusedMenuIndex(0); }}
        focusable
      >
        <Image
          source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${currentProfile.avatar}` }}
          style={styles.profileAvatar}
        />
      </TouchableOpacity>
      <Modal
        visible={showDropdown}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenuBlock}>
            {/* Profile row at the top */}
            <View style={styles.menuProfileRow}>
              <Image
                source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${currentProfile.avatar}` }}
                style={styles.menuProfileAvatar}
              />
              <Text style={styles.menuProfileName}>{currentProfile.name}</Text>
            </View>

            {/* Divider */}
            <View style={styles.menuDivider} />

            {/* Menu items */}
            <FlatList
              data={MENU_ITEMS}
              keyExtractor={item => item.key}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    focusedMenuIndex === index && styles.menuItemFocused,
                    // item.color === COLORS.primary && styles.menuItemDanger,
                  ]}
                  onFocus={() => setFocusedMenuIndex(index)}
                  onPress={() => handleMenuAction(item.action)}
                  focusable
                  hasTVPreferredFocus={index === 0}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.menuItemLabel,
                    focusedMenuIndex === index && styles.menuItemLabelFocused,
                    // item.color === 'red' && styles.menuItemLabelDanger,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProfileMenuTV;
