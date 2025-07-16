import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { s, scale } from 'react-native-size-matters';

export default StyleSheet.create({
  profileMenuContainer: {
    // position: 'absolute',
    // top: scale(50),
    // right: scale(50),
    // zIndex: 1000,
  },
  profileAvatarBtn: {
    // width: scale(30),
    // height: scale(30),
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: scale(25),
    height: scale(25),
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.70)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenuBlock: {
    width: scale(140),
    marginTop: scale(70),
    marginRight: scale(50),
    backgroundColor: COLORS.lightBlack, // eg: '#181818'
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 0,
    shadowColor: COLORS.black,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  menuProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  menuProfileAvatar: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(5),
    marginRight: 14,
    backgroundColor: COLORS.background,
  },
  menuProfileName: {
    color: COLORS.white,
    fontSize: scale(8),
    fontFamily: FONTS.montSemiBold,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.greyBorder,
    marginHorizontal: scale(10),
    marginVertical: scale(5),
    opacity: 0.25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
    paddingHorizontal: scale(10),
  },
  menuItemFocused: {
    backgroundColor: '#292929',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  menuItemIcon: {
    fontSize: scale(8),
    marginRight: 14,
  },
  menuItemLabel: {
    color: COLORS.white,
     fontSize: scale(8),
    fontFamily: FONTS.montRegular,
  },
  menuItemLabelFocused: {
    color: COLORS.primary, // highlight color (eg red or accent)
    fontFamily: FONTS.montSemiBold,
  },
  menuItemDanger: {
    backgroundColor: '#ff2a2a33', // light red, subtle for danger
  },
  menuItemLabelDanger: {
    // color: '#FF3D3D',
  },
});
