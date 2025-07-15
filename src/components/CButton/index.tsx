import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

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
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor || (outline ? 'transparent' : COLORS.primary),
        },
        outline && styles.outlineButton,
        style,
      ]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.buttonText,
              outline && styles.outlineText,
              {
                color: textColor || (outline ? COLORS.white : COLORS.black),
              },
              textStyle,
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: scale(50), // Comfortable size for remote focus
    paddingHorizontal: scale(40),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: scale(10),
  },
  buttonText: {
    fontSize: scale(18),
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: COLORS.white,
  },
});

export default CButton;
