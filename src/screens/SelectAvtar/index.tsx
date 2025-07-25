import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons'; // or any other icon set you prefer

import { COLORS } from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import Header from '../../components/Header';
import CAlertModal from '../../components/CAlertModal';
import { AVTAR_LIST, NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import styles from './styles';

interface Avatar {
  _id: string;
  imageUrl: string;
}

interface SelectAvatarProps {
  navigation: any;
  route: any;
}

const SelectAvatar: React.FC<SelectAvatarProps> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const dataFetchedRef = useRef(false);
  const [avatarData, setAvatarData] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    route?.params?.avatar || null
  );

  const [focusedAvatar, setFocusedAvatar] = useState<string | null>(null);
  const [isCloseFocused, setIsCloseFocused] = useState(false);
const [initialFocusDone, setInitialFocusDone] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  const isTV = Platform.isTV;

  const fetchAvatars = async () => {
    try {
      const response = await apiHelper.get(AVTAR_LIST);
      setAvatarData(response?.data || []);
    } catch (error) {
      setAlertMessage('Failed to fetch avatars');
      setAlertType('error');
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchAvatars();
  }, []);

  useEffect(() => {
  if (dataFetchedRef.current) return;
  dataFetchedRef.current = true;
  fetchAvatars().then(() => {
    // Delay turning off preferred focus to allow TV to give it to close button
    setTimeout(() => {
      setInitialFocusDone(true);
    }, 1000); // 1 second is usually enough
  });
}, []);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    navigation.navigate('AddProfile', {
      avatar: avatarId,
      name: route.params?.name || '',
      isKidsProfile: route.params?.isKidsProfile || false,
      profileId: route?.params?.profileId,
      defaultProfile: route.params?.defaultProfile,
    });
  };

  const renderItem = ({ item, index }: { item: Avatar; index: number }) => {
    const isSelected = item._id === selectedAvatar;
    const isFocused = item._id === focusedAvatar;

    return (
      <TouchableHighlight
        key={item._id}
        onPress={() => handleAvatarSelect(item._id)}
        onFocus={() => setFocusedAvatar(item._id)}
        onBlur={() => setFocusedAvatar(null)}
        hasTVPreferredFocus={index === 0}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
          isFocused && styles.avatarFocused,
        ]}
        underlayColor={COLORS.background}
      >
        <Image
          source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item._id}` }}
          style={styles.avatarImage}
        />
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="" showLogo />
<View style={styles.closeButtonContainer}>
  <TouchableHighlight
    onPress={() => navigation.goBack()}
    onFocus={() => setIsCloseFocused(true)}
    onBlur={() => setIsCloseFocused(false)}
    hasTVPreferredFocus={true} // ✅ only one in entire screen
    style={[
      styles.closeButton,
      isCloseFocused && styles.closeButtonFocused,
    ]}
    underlayColor={COLORS.background}
    focusable={true}
  >
    <Icon
      name="close"
      size={scale(20)}
      color={isCloseFocused ? COLORS.primary : COLORS.white}
    />
  </TouchableHighlight>
</View>
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={avatarData}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={isTV ? 5 : 3}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CAlertModal
        visible={isModalVisible}
        btnTitle="OK"
        type={alertType}
        message={alertMessage}
        onOkPress={() => setIsModalVisible(false)}
      />
    </View>
  );
};

export default SelectAvatar;