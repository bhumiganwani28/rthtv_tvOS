import React, { useState, useRef, useEffect } from 'react';
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
  useTVEventHandler,
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);

  // Handle TV keyboard events - prevent navigation when keyboard is open
  useTVEventHandler((evt) => {
    if (!Platform.isTV || !evt) return;

    // If keyboard is open and input is focused, don't handle navigation events
    if (isKeyboardOpen && isFocused) {
      return;
    }

    switch (evt.eventType) {
      case 'select':
        // Handle select to focus input and show native keyboard
        if (Platform.isTV && inputRef.current && !isFocused) {
          inputRef.current.focus();
          setIsKeyboardOpen(true);
          onKeyboardShow?.();
        }
        break;
    }
  });

  // Handle focus changes
  const handleFocus = () => {
    setIsFocused(true);
    if (Platform.isTV) {
      // On TV, focus should trigger native keyboard
      setIsKeyboardOpen(true);
      onKeyboardShow?.();
      if (onPress) {
        onPress();
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsKeyboardOpen(false);
    if (Platform.isTV) {
      onKeyboardHide?.();
    }
  };

  // Handle text input changes
  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  // Handle TV select button press
  const handleTVSelect = () => {
    if (Platform.isTV) {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsKeyboardOpen(true);
      }
      onKeyboardShow?.();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTVSelect}
        focusable={focusable}
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <View
          ref={containerRef}
          style={[
            styles.inputContainer,
            containerStyle,
            isFocused && styles.focusedContainer,
            {
              backgroundColor: bgColor || COLORS.black,
              borderColor: isFocused ? COLORS.primary : COLORS.borderColor,
            },
          ]}
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
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            editable={true} // Enable native keyboard on TV
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