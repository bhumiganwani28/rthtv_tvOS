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
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FIcon from 'react-native-vector-icons/Feather';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

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
  onKeyboardShow,
  onKeyboardHide,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTVKeyboard, setShowTVKeyboard] = useState(false);
  const isTablet = useSelector((state: any) => state.auth?.isTablet);
  const inputRef = useRef<TextInput>(null);
  const [currentKeyboardType, setCurrentKeyboardType] = useState<'letters' | 'numbers' | 'symbols'>('letters');

  // Auto-focus handling for TV
  useEffect(() => {
    if (hasTVPreferredFocus && isTV) {
      setTimeout(() => {
        if (onPress) {
          onPress();
        }
      }, 200);
    }
  }, [hasTVPreferredFocus]);

  // Call keyboard visibility callbacks
  useEffect(() => {
    if (showTVKeyboard) {
      onKeyboardShow && onKeyboardShow();
    } else {
      onKeyboardHide && onKeyboardHide();
    }
  }, [showTVKeyboard, onKeyboardShow, onKeyboardHide]);

  const handleFocus = () => {
    setIsFocused(true);
    if (isTV) {
      setShowTVKeyboard(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleTVInputPress = () => {
    if (isTV) {
      setShowTVKeyboard(true);
    }
    if (onPress) {
      onPress();
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onChangeText(value.slice(0, -1));
    } else if (key === 'space') {
      onChangeText(value + ' ');
    } else if (key === 'done') {
      setShowTVKeyboard(false);
    } else if (key === 'clear') {
      onChangeText('');
    } else if (key === 'letters') {
      setCurrentKeyboardType('letters');
    } else if (key === 'numbers') {
      setCurrentKeyboardType('numbers');
    } else if (key === 'symbols') {
      setCurrentKeyboardType('symbols');
    } else {
      if (maxLength && value.length >= maxLength) return;
      onChangeText(value + key);
    }
  };

  // Define keyboard layouts
  const alphabetKeys = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const symbolKeys = ['@', '.', '_', '-', '+', '!', '#', '$', '%', '&', '*', '(', ')', '/', ':', ';'];

  const renderCurrentKeyboard = () => {
    switch (currentKeyboardType) {
      case 'letters':
        return (
          <>
            <View style={styles.keyRow}>
              {alphabetKeys.slice(0, 10).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  focusable
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {alphabetKeys.slice(10, 20).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  focusable
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {alphabetKeys.slice(20).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  focusable
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 'numbers':
        return (
          <View style={styles.keyRow}>
            {numberKeys.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handleKeyPress(key)}
                focusable
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'symbols':
        return (
          <View style={styles.keyboardScrollContainer}>
            <View style={styles.keyRow}>
              {symbolKeys.slice(0, 8).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  focusable
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {symbolKeys.slice(8).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  focusable
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Render TV keyboard
  const renderTVKeyboard = () => {
    return (
      <Modal
        visible={showTVKeyboard}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.keyboardModal}>
          <View style={styles.keyboardContainer}>
            <View style={styles.inputPreview}>
              <Text style={styles.inputPreviewText}>{value || placeholder}</Text>
            </View>
            
            <View style={styles.keyboardTabsContainer}>
              <TouchableOpacity 
                style={[styles.keyboardTab, currentKeyboardType === 'letters' && styles.activeKeyboardTab]} 
                onPress={() => setCurrentKeyboardType('letters')}
                focusable
              >
                <Text style={styles.keyboardTabText}>Letters</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.keyboardTab, currentKeyboardType === 'numbers' && styles.activeKeyboardTab]} 
                onPress={() => setCurrentKeyboardType('numbers')}
                focusable
              >
                <Text style={styles.keyboardTabText}>Numbers</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.keyboardTab, currentKeyboardType === 'symbols' && styles.activeKeyboardTab]} 
                onPress={() => setCurrentKeyboardType('symbols')}
                focusable
              >
                <Text style={styles.keyboardTabText}>Symbols</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.keyboardContent}>
              {renderCurrentKeyboard()}
            </View>
            
            <View style={styles.specialKeysRow}>
              <TouchableOpacity
                style={styles.specialKey}
                onPress={() => handleKeyPress('backspace')}
                focusable
              >
                <Text style={styles.keyText}>⌫</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.specialKey}
                onPress={() => handleKeyPress('space')}
                focusable
              >
                <Text style={styles.keyText}>Space</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.specialKey}
                onPress={() => handleKeyPress('clear')}
                focusable
              >
                <Text style={styles.keyText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.specialKey, styles.doneKey]}
                onPress={() => handleKeyPress('done')}
                focusable
              >
                <Text style={[styles.keyText, styles.doneKeyText]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleTVInputPress}
        style={[
          styles.inputContainer,
          containerStyle,
          isFocused && styles.focusedContainer,
          {
            backgroundColor: bgColor || 'rgba(51, 51, 51, 0.8)',
            borderColor: isFocused ? COLORS.primary : 'transparent',
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
          ]}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          placeholderTextColor={COLORS.greyText}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!isTV}
        />
        {secureTextEntry && togglePassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePassword}
            focusable={isTV}
          >
            <FIcon
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={isTV ? scale(18) : scale(14)}
              color={COLORS.greyText}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {errorShow && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
      {isTV && renderTVKeyboard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(12),
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: scale(15),
    height: scale(35),
    width: '100%',
  },
  focusedContainer: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  leftComponent: {
    marginRight: scale(10),
  },
  textInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: isTV ? scale(18) : scale(14),
    fontFamily: FONTS.montRegular,
    padding: 0,
    height: '100%',
  },
  eyeIcon: {
    padding: scale(6),
  },
  errorText: {
    color: COLORS.red,
    fontSize: isTV ? scale(14) : scale(12),
    marginTop: scale(4),
    fontFamily: FONTS.montRegular,
  },
  // TV Keyboard styles
  keyboardModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    width: width * 0.6,
    backgroundColor: COLORS.darkGrey,
    borderRadius: 10,
    padding: scale(20),
    alignItems: 'center',
  },
  inputPreview: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: scale(12),
    borderRadius: 6,
    marginBottom: scale(20),
  },
  inputPreviewText: {
    color: COLORS.white,
    fontSize: scale(18),
    fontFamily: FONTS.montRegular,
  },
  keyboardTabsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: scale(15),
  },
  keyboardTab: {
    flex: 1,
    padding: scale(10),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeKeyboardTab: {
    borderBottomColor: COLORS.primary,
  },
  keyboardTabText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontFamily: FONTS.montSemiBold,
  },
  keyboardContent: {
    width: '100%',
    marginBottom: scale(15),
  },
  keyboardScrollContainer: {
    width: '100%',
  },
  keyboardSectionTitle: {
    color: COLORS.white,
    fontSize: scale(16),
    fontFamily: FONTS.montSemiBold,
    alignSelf: 'flex-start',
    marginBottom: scale(8),
    marginTop: scale(8),
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: scale(8),
    width: '100%',
  },
  key: {
    width: scale(40),
    height: scale(40),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: scale(4),
  },
  keyText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontFamily: FONTS.montRegular,
  },
  specialKeysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: scale(15),
  },
  specialKey: {
    height: scale(40),
    paddingHorizontal: scale(15),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: scale(4),
  },
  doneKey: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: scale(20),
  },
  doneKeyText: {
    fontFamily: FONTS.montSemiBold,
  },
});

export default CInput;
