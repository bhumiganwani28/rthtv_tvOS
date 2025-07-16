// styles.ts
import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const isTV = Platform.isTV;

export default StyleSheet.create({
  centerWrapper: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(20),
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },

  titleContainer: {
    marginBottom: verticalScale(16),
  },

  title: {
    fontSize: scale(14),
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: FONTS.montBold,
    letterSpacing: 0.5,
  },

  profilesScroll: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(40),
  },

  profileWrapper: {
    marginHorizontal: scale(15),
    alignItems: 'center',
  },

  addProfileCard:{
  marginHorizontal: scale(15),
    alignItems: 'center',
 
  },
  profileCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(10),
    backgroundColor: 'transparent',
  },

  focusedProfileCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    // backgroundColor: 'rgba(255,255,255,0.08)',
  },

  profileImage: {
    borderRadius: scale(10),
    borderWidth: 0.6,
    borderColor: COLORS.borderColor,
  },

  profileName: {
    marginTop: verticalScale(10),
    color: COLORS.white,
    fontSize: scale(10),
    textAlign: 'center',
    fontFamily: FONTS.montMedium,
  },

  addProfileContainer: {
    borderRadius: scale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(10),
  },

  headerContainer: {
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(10),
    backgroundColor: COLORS.black,
    alignItems: 'center',
  },
});
