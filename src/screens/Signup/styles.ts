import { StyleSheet, Platform, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    width: '100%',
    height: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    // backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: scale(25),
    left: scale(25),
    zIndex: 10,
  },
  logo: {
    width: scale(70),
    height: scale(25),
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: scale(8),
  },
  formWrapper: {
    width: scale(280),
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: scale(20),
    borderWidth: 0,
    borderRadius: 4,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },

  // Row container for first and last name side by side
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // marginBottom: verticalScale(10),
  },
  halfInputWrapper: {
    width: '48%',
    marginBottom:scale(10),
  },
  singleInputWrapper: {
    width: '100%',
    marginBottom:scale(12),
  },

  // Label above inputs
  inputLabel: {
    fontSize: scale(10),
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
    marginBottom: scale(5),
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
  },

  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginTop: verticalScale(15),
    alignItems: 'center',
    height: scale(22), // increased height for button
    justifyContent: 'center',
    paddingVertical: verticalScale(2),
  },
  buttonText: {
    fontSize: scale(10),
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
  },
  footerContainer: {
    marginTop: verticalScale(15),
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    padding: scale(4),
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  footerText: {
    color: COLORS.greyText,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
  },
  linkText: {
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    fontSize: scale(10),
    textDecorationLine: 'underline',
  },
  errorText: {
    color: COLORS.red,
    fontSize: scale(10),
    marginTop: scale(2),
    fontFamily: FONTS.montRegular,
  },
});

export default styles;
