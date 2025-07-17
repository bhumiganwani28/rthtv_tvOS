import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { scale } from 'react-native-size-matters';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingTop: scale(10),
  },
  tabBarContainer:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: scale(16),
  },
  contentContainer:{
    paddingTop: scale(10),
  },
  contentTitleContainer:{
    paddingVertical: scale(5),
  },
  contentTitle:{
    color: COLORS.white,
    fontSize:scale(13),
    fontFamily: FONTS.montSemiBold,
    marginLeft: scale(20),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    fontSize: 26,
    textAlign: 'center',
  },
  itemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: COLORS.itemContainer,
  },
  focusedItemContainer: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.focusItem,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: COLORS.black, // fallback to hide loading gaps
  },
  subscriptionContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 4,
    zIndex: 10,
  },
  subscriptionIcon: {
    color: COLORS.yellow,
  },
});
