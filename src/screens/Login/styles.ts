import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: scale(500),
    padding: scale(20),
    backgroundColor: 'rgba(0,0,0,0.85)',
        borderWidth:0.8,
        borderColor:COLORS.greyBorder,
    // borderRadius: scale(8),
    alignItems: 'center',
  },
  heading: {
    fontSize: scale(20),
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    marginBottom: verticalScale(20),
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.darkGrey,
    borderRadius: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(12),
  },
  inputText: {
    color: COLORS.white,
    fontSize: scale(11),
    fontFamily: FONTS.montRegular,
  },
  signInButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(12),
    borderRadius: scale(4),
    marginTop: verticalScale(12),
    alignItems: 'center',
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: scale(13),
    fontFamily: FONTS.montSemiBold,
  },
  bottom: {
    marginTop: verticalScale(20),
  },
  newText: {
    color: COLORS.white,
    fontSize: scale(11),
  },
  signUpText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default styles;
