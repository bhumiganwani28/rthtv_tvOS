import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import FIcon from 'react-native-vector-icons/Feather';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

interface CInputProps {
  icon?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  maxLength?: number;
  onChangeText: (text: string) => void;
  togglePassword?: () => void;
  leftComponent?: React.ReactNode;
  isPasswordVisible?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  errorShow?: boolean;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  bgColor?: string;
  focusable?: boolean;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  eyeIconFocused?: boolean;
}

const CInput: React.FC<CInputProps> = ({
  icon,
  placeholder,
  secureTextEntry,
  value,
  maxLength,
  onChangeText,
  togglePassword,
  leftComponent = null,
  isPasswordVisible,
  keyboardType = 'default',
  errorShow = true,
  errorText = '',
  containerStyle,
  textStyle,
  bgColor,
  focusable = true,
  hasTVPreferredFocus = false,
  onPress,
  style,
  eyeIconFocused = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    if (onPress) {
      onPress();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          containerStyle,
          isFocused && styles.focusedContainer,
          {
            backgroundColor: bgColor || COLORS.black,
            borderColor: isFocused ? COLORS.primary : COLORS.borderColor,
          },
        ]}
        focusable={focusable}
        hasTVPreferredFocus={hasTVPreferredFocus}
      >
        {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            textStyle,
            { color: COLORS.white },
          ]}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          placeholderTextColor={COLORS.greyText}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          editable={true}
          selectionColor={COLORS.primary}
          focusable={focusable}
          hasTVPreferredFocus={hasTVPreferredFocus && !eyeIconFocused}
        />
        {secureTextEntry && togglePassword && (
          <TouchableOpacity
            style={[styles.eyeIcon, eyeIconFocused && styles.eyeIconFocused]}
            onPress={togglePassword}
            focusable={true}
            hasTVPreferredFocus={eyeIconFocused}
          >
            <FIcon
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={scale(14)}
              color={eyeIconFocused ? COLORS.primary : COLORS.greyText}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorShow && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.black,
  },
  inputContainer: {
    borderWidth: 1, // No border by default
    flexDirection: 'row',
    alignItems: 'center',
    // borderRadius: 4,
    paddingHorizontal: scale(0), // No extra horizontal padding
    height: scale(22),
    width: '100%',
    backgroundColor: COLORS.lightBlack, // Always dark background
  },
  focusedContainer: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlack, // or '#232323' or any dark color you want
  },
  leftComponent: {
    marginRight: scale(8),
  },
  textInput: {
    flex: 1,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    padding: 0,
    margin: 0,
    height: '100%',
    color: COLORS.white,
    backgroundColor: 'transparent', // No extra background
  },
  eyeIcon: {
    padding: scale(4),
  },
  eyeIconFocused: {
    backgroundColor: COLORS.borderColor,
    borderRadius: 12,
  },
  errorText: {
    color: COLORS.red,
    fontSize: scale(10),
    marginTop: scale(2),
    fontFamily: FONTS.montRegular,
  },
});

export default CInput;





