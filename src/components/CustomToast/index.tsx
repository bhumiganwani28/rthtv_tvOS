// CustomToast.tsx (You can place this in your utils folder or a new file)
import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const CustomToast = () => {
    return (
        <Toast
            config={{
                success: ({ text1, props }) => (
                    <View style={[styles.toast, { backgroundColor: props?.backgroundColor || COLORS.black }]}>
                        <Text style={[styles.text, { color: props?.textColor || COLORS.white }]}>{text1}</Text>
                    </View>
                ),
                error: ({ text1, props }) => (
                    <View style={[styles.toast, { backgroundColor: props?.backgroundColor || COLORS.black }]}>
                        <Text style={[styles.text, { color: props?.textColor || COLORS.white }]}>{text1}</Text>
                    </View>
                ),
            }}
        />
    );
};

const styles = StyleSheet.create({
    toast: {
        height: 60,
        width: '90%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CustomToast;
