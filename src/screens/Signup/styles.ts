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
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingHorizontal: scale(30),
  },
  formWrapper: {
    backgroundColor: COLORS.lightBlack,
    borderRadius: scale(12),
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: scale(16),
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: verticalScale(15),
  },
  label: {
    fontSize: scale(11),
    fontFamily: FONTS.montRegular,
    color: COLORS.textColor,
    marginBottom: scale(4),
  },
  input: {
    height: verticalScale(40),
    borderColor: COLORS.greyBorder,
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
    backgroundColor: COLORS.black,
  },
  errorText: {
    color: COLORS.red,
    fontSize: scale(10),
    marginTop: scale(3),
    fontFamily: FONTS.montRegular,
  },
  button: {
    height: verticalScale(42),
    backgroundColor: COLORS.primary,
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(15),
  },
  buttonText: {
    fontSize: scale(12),
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
  },
  footerText: {
    marginTop: verticalScale(25),
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
    fontSize: scale(11),
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.montSemiBold,
    fontSize: scale(11),
    textDecorationLine: 'underline',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
