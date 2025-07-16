// components/tabMenuBarStyles.ts
import { StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

export default StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
   tabItem: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(10),
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  focusedTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    transform: [{ scale: 1.05 }],
  },
  tabText: {
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
  },
  selectedTabText: {
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
  },
  focusedTabText: {
    color: COLORS.white,
  },
});
