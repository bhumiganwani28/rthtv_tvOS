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
    fontSize: scale(12),
    fontFamily: FONTS.montSemiBold,
  },
 itemContainer: {
    // borderWidth: 3,
    // borderColor: 'transparent',
    // backgroundColor: COLORS.itemContainer,
  },
  focusedItemContainer: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.focusItem,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: COLORS.black, // fallback to hide loading gaps
  },
});
