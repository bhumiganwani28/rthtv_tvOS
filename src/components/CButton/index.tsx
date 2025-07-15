import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableHighlight,
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
  focusable?: boolean;
  accessible?: boolean;
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
        {
          backgroundColor: backgroundColor || (outline ? 'transparent' : COLORS.primary),
        },
        outline && styles.outlineButton,
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
                outline && styles.outlineText,
                {
                  color: textColor || (outline ? COLORS.white : COLORS.black),
                },
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
    height: scale(40),
    paddingHorizontal: scale(40),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderColor: 'transparent',
    borderWidth: 2,
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
