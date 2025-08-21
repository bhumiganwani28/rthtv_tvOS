import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

interface TVFocusTestProps {
  currentSection: string;
  currentRow: number;
  currentItem: number;
  focusedTab: string;
}

const TVFocusTest: React.FC<TVFocusTestProps> = ({
  currentSection,
  currentRow,
  currentItem,
  focusedTab,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 TV Navigation Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Focus:</Text>
        <Text style={[styles.info, currentSection === 'tabs' && styles.active]}>
          📋 Section: {currentSection}
        </Text>
        <Text style={[styles.info, currentSection === 'content' && styles.active]}>
          📺 Row: {currentRow}
        </Text>
        <Text style={[styles.info, currentItem >= 0 && styles.active]}>
          🎯 Item: {currentItem === -1 ? 'View All' : currentItem}
        </Text>
        <Text style={[styles.info, currentSection === 'tabs' && styles.active]}>
          🏷️ Tab: {focusedTab}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Guide:</Text>
        <Text style={styles.instruction}>⬆️⬇️ Navigate between sections</Text>
        <Text style={styles.instruction}>⬅️➡️ Navigate within sections</Text>
        <Text style={styles.instruction}>✅ Select items</Text>
        <Text style={styles.instruction}>🔙 Back to exit app</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Buttons:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton}>
            <Text style={styles.buttonText}>Test 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton}>
            <Text style={styles.buttonText}>Test 2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton}>
            <Text style={styles.buttonText}>Test 3</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: scale(100),
    right: scale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: scale(15),
    borderRadius: scale(8),
    zIndex: 1000,
    minWidth: scale(200),
  },
  title: {
    color: COLORS.white,
    fontSize: scale(14),
    fontFamily: FONTS.montBold,
    marginBottom: scale(10),
    textAlign: 'center',
  },
  section: {
    marginBottom: scale(10),
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: scale(12),
    fontFamily: FONTS.montSemiBold,
    marginBottom: scale(5),
  },
  info: {
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    marginBottom: scale(2),
  },
  active: {
    color: COLORS.primary,
    fontFamily: FONTS.montSemiBold,
  },
  instruction: {
    color: COLORS.greyText,
    fontSize: scale(9),
    fontFamily: FONTS.montRegular,
    marginBottom: scale(2),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButton: {
    backgroundColor: COLORS.primary,
    padding: scale(5),
    borderRadius: scale(4),
    flex: 1,
    marginHorizontal: scale(2),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: scale(8),
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
  },
});

export default TVFocusTest;
