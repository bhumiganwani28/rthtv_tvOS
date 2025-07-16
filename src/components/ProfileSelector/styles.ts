import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../../theme/colors';
import { scale, verticalScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: verticalScale(40),
    right: scale(50),
    zIndex: 999,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    // borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImage: {
    width: scale(25),
    height: scale(25),
    borderRadius: 4,
    marginRight: scale(8),
  },
  profileName: {
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily : FONTS.montRegular,
  },
  arrowContainer: {
    marginLeft: scale(8),
    justifyContent: 'center',
  },
  arrow: {
    color: COLORS.white,
    fontSize: scale(10),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownContainer: {
    width: scale(180),
    marginTop: verticalScale(70),
    marginRight: scale(50),
    backgroundColor: COLORS.lightBlack,
    borderRadius: 4,
    padding: scale(5),
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  dropdownList: {
    maxHeight: verticalScale(300),
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(10),
    borderRadius: 4,
  },
  focusedProfileItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedProfileItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileItemImage: {
    width: scale(30),
    height: scale(30),
    borderRadius: 4,
    marginRight: scale(10),
  },
  profileItemName: {
    color: COLORS.white,
    fontSize:  scale(12),
  },
  focusedProfileItemName: {
   fontFamily:FONTS.montRegular,
  },
  selectedProfileItemName: {
    color: COLORS.primary,
  },
  manageProfilesButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(5),
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  manageProfilesText: {
    color: COLORS.white,
    fontSize: isTV ? scale(14) : scale(12),
    fontWeight: '500',
  },
}); 