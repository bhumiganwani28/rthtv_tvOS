import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';

interface TVFocusIndicatorProps {
  isFocused: boolean;
  children: React.ReactNode;
  label?: string;
  showDebugInfo?: boolean;
}

const TVFocusIndicator: React.FC<TVFocusIndicatorProps> = ({
  isFocused,
  children,
  label,
  showDebugInfo = false,
}) => {
  if (!Platform.isTV) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      {children}
      {isFocused && showDebugInfo && label && (
        <View style={styles.debugLabel}>
          <Text style={styles.debugText}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  focusedContainer: {
    borderWidth: scale(3),
    borderColor: COLORS.white,
    borderRadius: scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  debugLabel: {
    position: 'absolute',
    top: -scale(25),
    left: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    zIndex: 1000,
  },
  debugText: {
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily: 'monospace',
  },
});

export default TVFocusIndicator;
