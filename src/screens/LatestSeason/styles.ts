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
     flex:1,
    paddingTop: scale(10),
  },
  contentTitleContainer:{
    paddingVertical: scale(5),
  },
  contentTitle:{
    color: COLORS.white,
    fontSize:scale(12),
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
    fontSize: scale(12),
    textAlign: 'center',
  },
  itemContainer: {
    //  borderRadius: scale(10),
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
    // borderRadius: scale(10),
    resizeMode: 'cover',
    backgroundColor: COLORS.black, // fallback to hide loading gaps
  },
  subscriptionContainer: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: scale(4),
    padding: scale(5),
    zIndex: 10,
  },
  subscriptionIcon: {
    color: COLORS.yellow,
  },
});
