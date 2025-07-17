import { StyleSheet, Platform, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
     paddingTop: scale(10),
  },
  profileSelectorContainer: {
    position: 'absolute',
    top: scale(40),
    right: scale(50),
    zIndex: 1000,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewStyle: {
    flex: 1,
  },
  tabBarContainer:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: scale(16),
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
    fontSize: scale(11),
    fontFamily: FONTS.montRegular,
  },
  selectedTabText: {
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
  },
  focusedTabText: {
    color: COLORS.white,
  },
  sliderContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topSpaceShowsContainer:{
    marginBottom: verticalScale(10),
  },
  contentContainer: {
    paddingTop: verticalScale(10),
  },
});

export default styles;
