import React, { ReactNode } from 'react';
import { Platform, TVFocusGuideView, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface TVFocusGuideProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  vertical?: boolean;
}

/**
 * A wrapper component that provides focus guidance for TV platforms
 * On non-TV platforms, it just renders a regular View
 */
const TVFocusGuide: React.FC<TVFocusGuideProps> = ({
  children,
  style,
  horizontal = false,
  vertical = true,
}) => {
  if (Platform.isTV) {
    return (
      <TVFocusGuideView 
        style={[styles.container, style]}
        destinations={[]}
        autoFocus
        trapFocusLeft={!horizontal}
        trapFocusRight={!horizontal}
        trapFocusUp={!vertical}
        trapFocusDown={!vertical}
      >
        {children}
      </TVFocusGuideView>
    );
  }
  
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default TVFocusGuide; 