import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  onSubmitEditing?: (e?: any) => void;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
  autoFocus?: boolean;
  returnKeyType?: any;
  blurOnSubmit?: boolean;
  enablesReturnKeyAutomatically?: boolean;
}

const CInput: React.FC<CInputProps> = React.memo(({
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
  autoFocus = false,
  returnKeyType = 'done',
  blurOnSubmit = true,
  enablesReturnKeyAutomatically = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isTV = Platform.isTV;

  // Memoize TV props to prevent unnecessary re-renders
  const tvProps = useMemo(() => {
    if (!isTV) return {};
    
    return {
      // Basic TV props
      focusable: true,
      hasTVPreferredFocus: hasTVPreferredFocus && !eyeIconFocused,
      
      // Apple TV specific props
      ...(Platform.OS === 'ios' && {
        textContentType: 'none' as const,
        autoComplete: 'off' as const,
        autoFill: 'off' as const,
        keyboardAppearance: 'dark' as const,
        returnKeyLabel: 'done' as const,
        textAlign: 'left' as const,
        textAlignVertical: 'center' as const,
        accessible: true,
        accessibilityRole: 'text' as const,
        accessibilityLabel: placeholder,
        caretHidden: false,
        selectTextOnFocus: false,
        // Critical for Apple TV
        editable: true,
        multiline: false,
        // Ensure proper keyboard handling
        keyboardType: keyboardType,
        returnKeyType: returnKeyType,
        blurOnSubmit: blurOnSubmit,
        enablesReturnKeyAutomatically: enablesReturnKeyAutomatically,
        // Prevent any interference
        contextMenuHidden: true,
        clearButtonMode: 'never' as const,
      }),
    };
  }, [isTV, hasTVPreferredFocus, eyeIconFocused, placeholder, keyboardType, returnKeyType, blurOnSubmit, enablesReturnKeyAutomatically]);

  // Memoize styles to prevent unnecessary re-renders
  const containerStyles = useMemo(() => [
    styles.inputContainer,
    containerStyle,
    isFocused && styles.focusedContainer,
    { 
      backgroundColor: bgColor || COLORS.black,
      borderColor: isFocused ? COLORS.primary : COLORS.borderColor,
    },
  ], [containerStyle, isFocused, bgColor]);

  const textInputStyles = useMemo(() => [
    styles.textInput, 
    textStyle, 
    { 
      color: COLORS.white,
      ...(Platform.isTV && {
        color: COLORS.white,
      })
    }
  ], [textStyle]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleFocus = useCallback(() => {
    console.log('CInput - Input focused');
    setIsFocused(true);
    onKeyboardShow?.();
    onPress?.();
  }, [onKeyboardShow, onPress]);

  const handleBlur = useCallback(() => {
    console.log('CInput - Input blurred');
    setIsFocused(false);
    onKeyboardHide?.();
  }, [onKeyboardHide]);

  const handleTextChange = useCallback((text: string) => {
    console.log('CInput - Text changed:', text);
    onChangeText(text);
  }, [onChangeText]);

  // Auto-focus handling for Apple TV
  // useEffect(() => {
  //   if (isTV && (autoFocus || hasTVPreferredFocus) && inputRef.current) {
  //     const timer = setTimeout(() => {
  //       console.log('CInput - Auto-focusing input for Apple TV');
  //       inputRef.current?.focus();
  //     }, 200);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isTV, autoFocus, hasTVPreferredFocus]);

  return (
    <View style={[styles.container, style]}>
      <View style={containerStyles}>
        {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
        
        <TextInput
          ref={inputRef}
          style={textInputStyles}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          placeholderTextColor={isFocused ? COLORS.white : COLORS.greyText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          // autoFocus={autoFocus || hasTVPreferredFocus}
          selectionColor={COLORS.primary}
          {...tvProps}
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
      
      {errorShow && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these critical props change
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.secureTextEntry === nextProps.secureTextEntry &&
    prevProps.isPasswordVisible === nextProps.isPasswordVisible &&
    prevProps.hasTVPreferredFocus === nextProps.hasTVPreferredFocus &&
    prevProps.eyeIconFocused === nextProps.eyeIconFocused &&
    prevProps.errorText === nextProps.errorText &&
    prevProps.autoFocus === nextProps.autoFocus
  );
});

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    backgroundColor: COLORS.black,
    ...(Platform.OS === 'ios' && Platform.isTV && {
      minHeight: scale(22),
    }),
  },
  inputContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(0),
    height: scale(22),
    width: '100%',
    backgroundColor: COLORS.lightBlack,
    ...(Platform.OS === 'ios' && Platform.isTV && {
      minHeight: scale(22),
      justifyContent: 'center',
    }),
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
    ...(Platform.isTV && {
      color: COLORS.white,
    }),
    ...(Platform.OS === 'ios' && Platform.isTV && {
      textAlign: 'left',
      textAlignVertical: 'center',
    }),
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
