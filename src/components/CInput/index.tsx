import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FIcon from 'react-native-vector-icons/Feather';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { useSelector } from 'react-redux';

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
  bgColor?: string;
  focusable?: boolean;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
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
  bgColor,
  focusable = true,
  hasTVPreferredFocus = false,
  onPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isTablet = useSelector((state: any) => state.auth?.isTablet);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={[
          styles.inputContainer,
          containerStyle,
          {
            backgroundColor: bgColor ? COLORS.greyBorder : COLORS.black,
            borderColor: bgColor ? COLORS.borderColor : COLORS.greyBorder,
            height: isTablet ? scale(20) : scale(40),
            width: '100%',
          },
        ]}
        focusable={focusable}
        hasTVPreferredFocus={hasTVPreferredFocus}
      >
        {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
        <TextInput
          style={[
            styles.textInput,
            {
              color: bgColor ? COLORS.textColor : COLORS.white,
              fontSize: isTablet ? scale(6) : scale(13),
              width: '100%',
            },
          ]}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={COLORS.greyText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          editable={!Platform.isTV} // 🛑 Prevent typing on tvOS
        />
        <View style={{ position: 'absolute', right: scale(8) }}>
          {icon && (
            <Icon name={icon} size={24} color={COLORS.iconColor} style={styles.icon} />
          )}
          {isPasswordVisible !== undefined && (
            <FIcon
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.iconColor}
              style={styles.eyeIcon}
              onPress={togglePassword}
            />
          )}
        </View>
      </TouchableOpacity>
      {errorShow && (
        <Text
          style={[
            styles.errTrxtStyl,
            {
              fontSize: isTablet ? scale(5) : scale(11),
              marginLeft: isTablet ? scale(2) : scale(8),
            },
          ]}
        >
          {errorText}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: scale(8),
  },
  textInput: {
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
  },
  errTrxtStyl: {
    marginTop: scale(5),
    color: COLORS.red,
    fontFamily: FONTS.montRegular,
  },
  icon: {
    marginLeft: scale(10),
  },
  eyeIcon: {
    marginLeft: scale(10),
  },
  leftComponent: {
    marginRight: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CInput;
