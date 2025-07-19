
import { StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingVertical: scale(20),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: scale(15),
    fontFamily:FONTS.montBold,
    marginBottom: scale(15),
    paddingHorizontal: scale(20),
  },
  trendingHeaderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

searchIconButton: {
  padding: scale(6),
  backgroundColor: COLORS.lightBlack,
  borderRadius: scale(4),
},

focusedSearchIcon: {
  borderWidth: scale(1),
  borderColor: COLORS.white,
},
trendingItem: {
  backgroundColor: COLORS.greyBorder,
  paddingHorizontal: scale(8),
  paddingVertical: scale(6),
  marginRight: scale(12),
},

trendingSelected: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.white,
  borderWidth: scale(1),
},

trendingFocused: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.white,
  borderWidth: scale(1),
},
  trendingText: {
    color: COLORS.white,
    fontSize: scale(12),
  },
  itemContainer: {
    backgroundColor: COLORS.lightBlack,
    overflow: 'hidden',
  },
  focusedItemContainer: {
    borderWidth: scale(1),
    borderColor: COLORS.white,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
});
