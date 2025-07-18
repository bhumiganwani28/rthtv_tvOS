import { StyleSheet, Dimensions } from 'react-native';
import { scale } from 'react-native-size-matters';
import { FONTS } from '../../utils/fonts';
import { COLORS } from '../../theme/colors';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    marginHorizontal:scale(5),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderBanner: {
    width: screenWidth,
    height: scale(320),
    borderRadius: scale(8),
    marginBottom: scale(12),
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveBadge: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(6),
  },
  liveDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: COLORS.white,
    marginRight: scale(6),
  },
  liveText: {
    color: COLORS.white,
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: scale(10),
    marginTop:scale(15),
    marginHorizontal:scale(5),
    marginBottom: scale(5),
    fontFamily: FONTS.montBold,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
