import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import CStatusBar from '../CStatusBar';
import FIcon from 'react-native-vector-icons/Feather';
import store from '../../redux/store';
import { Dimensions } from 'react-native';


// Define the types for the props
interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  logoSource?: ImageSourcePropType; // For the logo image
  editIconPress?: () => void; // For the edit icon
  showSearchIcon?: boolean;
  onSearchPress?: () => void;
  rightButtons?: {
    label: string;
    color?: string;
    onPress: () => void;
  }[];
  bgCOlor?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  logoSource,
  editIconPress,
  showSearchIcon = false,
  onSearchPress,
  rightButtons = [],
  bgCOlor = false,
}) => {
  const { auth: { isTablet } } = store.getState();
  // console.log("ISTab>",isTablet);
  
  const { width: screenWidth } = Dimensions.get('window');

  return (
    <>
      <CStatusBar translucent={true} statusBarColor={bgCOlor ? COLORS.greyBorder : "transparent"} />
      <View style={[styles.container, {
         backgroundColor: bgCOlor ? COLORS.greyBorder : COLORS.black,
         paddingHorizontal: isTablet ? scale(10) : scale(15),
         height:isTablet ? scale(28) : Platform.OS === 'ios' ? scale(60) : scale(50)
         }]}>
        {/* Left Section: Logo Only (No Back Button or Title if logo is passed) */}
        <View style={styles.left}>
          {logoSource && <Image source={logoSource} style={[styles.logo,{  
            width: isTablet ? scale(40) : scale(80),
            height:isTablet ?  scale(40) : scale(80),}]} />}
          {!logoSource && showBackButton && (
            <TouchableOpacity
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            onPress={onBackPress} style={styles.iconWrapper}>
              <AIcon name="arrowleft" size={isTablet ? 24 : 20} color={COLORS.white} /> 
            </TouchableOpacity>
          )}
          {!logoSource && title && (
            <Text numberOfLines={1} style={[styles.title,{
              fontSize:isTablet ? scale(8) : scale(14),
            }]}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Section: Edit Icon, Search Icon, and Other Buttons */}
        <View style={styles.right}>
          {showSearchIcon && (
            <TouchableOpacity
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            onPress={onSearchPress} style={styles.iconWrapper}>
               <FIcon name="search" size={isTablet ?  scale(10) : scale(15)} color={COLORS.textColor} />
              {/* <Icon name="search" size={scale(15)} color={COLORS.textColor} /> */}
            </TouchableOpacity>
          )}
          {editIconPress && (
            <TouchableOpacity 
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            onPress={editIconPress} style={styles.iconWrapper}>
              <MIcon name="pencil-outline" size={isTablet ?  scale(12) : scale(18)} color={COLORS.textColor} />
            </TouchableOpacity>
          )}
          {rightButtons.map((btn, index) => (
            <TouchableOpacity key={index} onPress={btn.onPress} style={styles.textButton}>
              <Text style={[styles.textButtonLabel, { color: btn.color || COLORS.textColor, fontSize:isTablet ? scale(10) : scale(14), }]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // height:isTablet ?  Platform.OS === 'ios' ? scale(60) : scale(50),
    width:'100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
    
    // marginTop: Platform.OS === 'ios' ? scale(10) : scale(0),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
   
    fontFamily: FONTS.montMedium,
    color: COLORS.textColor,
    marginLeft: scale(10),
  },
  logo: {
    // width: scale(80),
    // height: scale(80),
    resizeMode: 'contain',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {

  },
  textButton: {
    marginHorizontal: scale(5),
  },
  textButtonLabel: {
    fontFamily: FONTS.montSemiBold,
    color: COLORS.textColor,
  },
});

export default Header;
