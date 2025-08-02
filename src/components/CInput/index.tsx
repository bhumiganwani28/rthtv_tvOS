import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
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
  keyboardType?: any;
  errorShow?: boolean;
  errorText?: string;
  containerStyle?: any;
  textStyle?: any;
  bgColor?: string;
  focusable?: boolean;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
  style?: any;
  eyeIconFocused?: boolean;
  onSubmitEditing?: () => void;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
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
  onSubmitEditing,
  onKeyboardShow,
  onKeyboardHide,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isTV = Platform.isTV;

  // Keyboard events (if you need to fire any custom events)
  const handleFocus = () => {
    setIsFocused(true);
    onKeyboardShow?.();
    onPress?.(); // TV: opens or highlights input as needed
  };

  const handleBlur = () => {
    setIsFocused(false);
    onKeyboardHide?.();
  };

  const handleContainerPress = () => {
    // On TV, make sure TextInput gets focused when Touchable is pressed with remote
    if (Platform.isTV && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleContainerPress}
        focusable={focusable}
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <View
          style={[
            styles.inputContainer,
            containerStyle,
            isFocused && styles.focusedContainer,
            { backgroundColor: bgColor || COLORS.black,
              borderColor: isFocused ? COLORS.primary : COLORS.borderColor,
            },
          ]}
        >
          {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
          <TextInput
            ref={inputRef}
            style={[styles.textInput, textStyle, { color: COLORS.white }]}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            placeholderTextColor={COLORS.greyText}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            editable={true}
            selectionColor={COLORS.primary}
            focusable={focusable}
            hasTVPreferredFocus={hasTVPreferredFocus && !eyeIconFocused}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
          {secureTextEntry && togglePassword && (
            <TouchableOpacity
              style={[styles.eyeIcon, eyeIconFocused && styles.eyeIconFocused]}
              onPress={togglePassword}
              focusable={Platform.isTV}
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
      </TouchableOpacity>
      {errorShow && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: COLORS.black },
  inputContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(0),
    height: scale(22),
    width: '100%',
    backgroundColor: COLORS.lightBlack,
  },
  focusedContainer: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlack,
  },
  leftComponent: { marginRight: scale(8) },
  textInput: {
    flex: 1,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    padding: 0,
    margin: 0,
    height: '100%',
    color: COLORS.white,
    backgroundColor: 'transparent',
  },
  eyeIcon: { padding: scale(4) },
  eyeIconFocused: { backgroundColor: COLORS.white, borderRadius: 12 },
  errorText: {
    color: COLORS.red,
    fontSize: scale(10),
    marginTop: scale(2),
    fontFamily: FONTS.montRegular,
  },
});

export default CInput;
