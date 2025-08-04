import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';

const TVTouchable = ({ children, focused, onPress, onFocus, style, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.08 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        style,
        { transform: [{ scale: scaleAnim }] },
        focused && styles.focusedOutline,
      ]}
    >
      <TouchableOpacity
        {...props}
        onFocus={onFocus}
        onPress={onPress}
        focusable={Platform.isTV}
        hasTVPreferredFocus={focused}
        accessible={true}
        importantForAccessibility="yes"
        activeOpacity={0.85}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  focusedOutline: {
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 2,
    borderRadius: 10,
  },
});

export default TVTouchable;