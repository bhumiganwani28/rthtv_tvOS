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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FIcon from 'react-native-vector-icons/Feather';
import { scale, verticalScale } from 'react-native-size-matters';
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
    bgColor?: string; // Accept background color
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
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const isTablet = useSelector((state: RootState) => state.auth.isTablet);

    // Handle focus and blur
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <>
            <View
                style={[
                    styles.inputContainer,
                    containerStyle,
                    {
                        backgroundColor: bgColor ? COLORS.greyBorder : COLORS.black,
                        borderColor: bgColor ? COLORS.borderColor : COLORS.greyBorder,
                        height: isTablet ? scale(20) : scale(40),
                        width:  isTablet ?'100%' : '100%',
                        // justifyContent:'center',
                        // paddingVertical:10,
                     }, // Dynamic background
                ]}
            >
                {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
                <TextInput
                    style={[
                        styles.textInput,
                        { color: bgColor ? COLORS.textColor : COLORS.white,
                            fontSize:isTablet ? scale(6) :  scale(13),
                            //  lineHeight:isTablet ? scale(12) : scale(22),
                            width:'100%' 
                        },
                        // Adjust text color for bgColor
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
                />
                <View style={{position:'absolute',right:scale(8)}}>
                {icon && (
                    <Icon
                        name={icon}
                        size={24}
                        color={isFocused ? COLORS.iconColor : COLORS.iconColor}
                        style={styles.icon}
                    />
                )}
                {isPasswordVisible !== undefined && (
                    <FIcon
                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                        size={20}
                        color={isPasswordVisible ? COLORS.iconColor : COLORS.greyBorder}
                        style={styles.eyeIcon}
                        onPress={togglePassword}
                    />
                )}
                </View>
            </View>
            {errorShow && <Text style={[styles.errTrxtStyl,{fontSize:isTablet ? scale(5) : scale(11), marginLeft: isTablet ? scale(2) : scale(8),}]}>{errorText}</Text>}
        </>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent:'center',
        borderWidth: 1,
        borderColor: COLORS.greyBorder,
        color: COLORS.white,
        paddingHorizontal: scale(8),
    },
    textInput: {
        // flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        // paddingVertical: scale(10),
        // paddingLeft:scale(8),
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
