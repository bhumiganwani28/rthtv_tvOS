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

  addProfileCard: {
    marginHorizontal: scale(15),
    alignItems: 'center',

  },
  profileCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(10),
    // overflow:'hidden',
    // backgroundColor: 'transparent',
  },

  focusedProfileCard: {
    borderColor: COLORS.primary,
    borderRadius: scale(8),
    borderWidth: scale(3),
    overflow: 'hidden',
    // borderWidth: scale(3),

    backgroundColor:COLORS.white,
    // backgroundColor: 'rgba(255,255,255,0.08)',
  },

  profileImage: {
    borderRadius: scale(6),
    // borderWidth: scale(0.2),
    // borderColor: COLORS.borderColor,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  profileName: {
    marginTop: verticalScale(10),
    color: COLORS.white,
    fontSize: scale(10),
    textAlign: 'center',
    fontFamily: FONTS.montMedium,
  },

  
  addProfileContainer: {
    // borderRadius: scale(10),
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    // backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.3)',
  },

addProfileBox: {
  width: scale(55),
  height: scale(55),
  borderRadius: scale(6),
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderColor: COLORS.borderColor,
  borderWidth: scale(1),
  justifyContent: 'center',
  alignItems: 'center',
},

focusedAddProfileBox: {
  borderColor: COLORS.primary, // Highlight color on focus
  borderWidth: scale(3),
  
},
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right:0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(4),
    // borderWidth: scale(3),
    // overflow:'hidden',
  },

  headerContainer: {
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(10),
    backgroundColor: COLORS.black,
    alignItems: 'center',
  },
  editProfilesButton: {
    width: scale(150),
    alignSelf: 'center',
  },
  cancelEditButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    width: scale(150),
    alignSelf: 'center',
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(60),
    width: '100%',
  },
  focusedEditButton: {
    borderColor: COLORS.primary,
    borderWidth: scale(2),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  focusIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    borderColor: COLORS.primary,
    borderWidth: scale(3),
    borderRadius: scale(8),
    backgroundColor: 'transparent',
  },
  focusedProfileName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  debugPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: scale(10),
    borderRadius: scale(5),
  },
  debugText: {
    color: COLORS.white,
    fontSize: scale(12),
    fontFamily: FONTS.montRegular,
  },
});