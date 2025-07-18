import {StyleSheet, Platform, Dimensions} from 'react-native';
import {scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../utils/fonts';

const {width, height} = Dimensions.get('window');
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
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  loginBox: {
    width: scale(280),
    padding: scale(20),
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 0,
    alignItems: 'center',
    borderRadius: scale(8),
  },
  heading: {
    fontSize: scale(15),
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputView: {
    marginBottom: verticalScale(15),
    width: '100%',
  },
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
 
  signInButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    marginTop:scale(5),
    paddingVertical: verticalScale(2),
    borderRadius: 4,
    alignItems: 'center',
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily: FONTS.montSemiBold,
  },
  backText: {
    marginTop: verticalScale(12),
    color: COLORS.white,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default styles;
