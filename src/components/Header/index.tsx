import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { IMAGES } from '../../theme/images';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showProfile?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showLogo = true,
  showSearch = false,
  showProfile = false,
  onBackPress,
  onSearchPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            focusable
          >
            <Icon name="arrow-back" size={isTV ? scale(16) : scale(18)} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {showLogo && (
          <Image
            source={IMAGES.logo}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      
      <View style={styles.rightContainer}>
        {showSearch && (
          <TouchableOpacity
            onPress={onSearchPress}
            style={styles.iconButton}
            focusable
          >
            <Icon name="search" size={isTV ? scale(16) : scale(18)} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.profileButton}
            focusable
          >
            <Image
              source={IMAGES.profile}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    paddingVertical: isTV ? scale(10) : scale(8),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    zIndex: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: scale(12),
    padding: scale(4),
  },
  logo: {
    height: isTV ? scale(22) : scale(20),
    width: isTV ? scale(70) : scale(65),
  },
  title: {
    color: COLORS.white,
    fontSize: isTV ? scale(14) : scale(13),
    fontFamily: FONTS.montSemiBold,
    marginLeft: scale(8),
  },
  iconButton: {
    marginLeft: scale(15),
    padding: scale(4),
  },
  profileButton: {
    marginLeft: scale(15),
    borderRadius: scale(15),
    overflow: 'hidden',
  },
  profileImage: {
    width: isTV ? scale(26) : scale(24),
    height: isTV ? scale(26) : scale(24),
    borderRadius: isTV ? scale(13) : scale(12),
  },
});

export default Header;
