import React from 'react';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import { COLORS } from '../../theme/colors';

const CStatusBar = ({
  statusBarStyle = 'light-content',
  statusBarColor = COLORS.black,
  translucent = false,
}) => {
  return (
    <View style={[styles.statusBarContainer, { backgroundColor: 'statusBarColor' }]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={translucent}
        hidden={false}
        networkActivityIndicatorVisible={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBarContainer: {
    height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight, // Adjust based on platform
    backgroundColor: 'transparent', // Handle translucent backgrounds
  },
});

export default CStatusBar;
