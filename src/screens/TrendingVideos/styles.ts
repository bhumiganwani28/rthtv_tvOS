import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const isTV = Platform.isTV;

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
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    // borderRadius: scale(10),
    backgroundColor: COLORS.black,
  },

  subscriptionContainer: {
    position: 'absolute',
    padding: scale(3),
    borderRadius: scale(3),
    top: scale(5),
    right: scale(5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Background for better visibility
    alignItems: 'center',
    justifyContent: 'center',
  },

  subscriptionIcon: {
    color: COLORS.yellow,
  },

});
