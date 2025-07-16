import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableHighlight,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  Dimensions,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

interface CButtonProps {
  text: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  outline?: boolean;
  icon?: React.ReactNode;
  hasTVPreferredFocus?: boolean;
  focusable?: boolean;
  accessible?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const CButton: React.FC<CButtonProps> = ({
  text,
  onPress,
  backgroundColor,
  textColor,
  style,
  textStyle,
  loading = false,
  outline = false,
  icon,
  hasTVPreferredFocus = false,
  focusable = true,
  accessible = true,
  size = 'medium',
}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      focusable={focusable}
      accessible={accessible}
      underlayColor="rgba(255,255,255,0.2)"
      style={[
        styles.button,
        styles[`${size}Button`],
        {
          backgroundColor: backgroundColor || (outline ? 'transparent' : COLORS.primary),
        },
        outline && styles.outlineButton,
        isTV && styles.tvButton,
        hasTVPreferredFocus && isTV && styles.tvFocusedButton,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.buttonText,
                styles[`${size}Text`],
                outline && styles.outlineText,
                {
                  color: textColor || (outline ? COLORS.white : COLORS.white),
                },
                isTV && styles.tvButtonText,
                textStyle,
              ]}
            >
              {text}
            </Text>
          </>
        )}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  smallButton: {
    height: scale(20),
    paddingHorizontal: scale(10),
  },
  mediumButton: {
    height: scale(36),
    paddingHorizontal: scale(12),
  },
  largeButton: {
    height: scale(40),
    paddingHorizontal: scale(15),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: scale(6),
  },
  buttonText: {
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: scale(12),
  },
  mediumText: {
    fontSize: scale(14),
  },
  largeText: {
    fontSize: scale(16),
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: COLORS.white,
  },
  tvButton: {
 height: scale(25),
    borderRadius: 4,
  },
  tvFocusedButton: {
    transform: [{ scale: 1.02 }],
    borderColor: COLORS.white,
    borderWidth: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tvButtonText: {
    fontSize: scale(12),
  },
});

export default CButton;
