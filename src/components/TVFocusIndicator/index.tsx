import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

interface TVFocusIndicatorProps {
  currentFocusArea: string;
  focusedTabIndex: number;
  focusedContentRow: number;
  focusedItemIndex: number;
}

const TVFocusIndicator: React.FC<TVFocusIndicatorProps> = ({
  currentFocusArea,
  focusedTabIndex,
  focusedContentRow,
  focusedItemIndex,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TV Focus Debug</Text>
      <Text style={styles.info}>Focus Area: {currentFocusArea}</Text>
      <Text style={styles.info}>Tab Index: {focusedTabIndex}</Text>
      <Text style={styles.info}>Content Row: {focusedContentRow}</Text>
      <Text style={styles.info}>Item Index: {focusedItemIndex}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: scale(100),
    right: scale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: scale(10),
    borderRadius: scale(5),
    zIndex: 1000,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.montBold,
    fontSize: scale(12),
    marginBottom: scale(5),
  },
  info: {
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
    fontSize: scale(10),
    marginBottom: scale(2),
  },
});

export default TVFocusIndicator;
