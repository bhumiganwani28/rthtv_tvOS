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
  formWrapper: {
    width: scale(280),
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: scale(20),
    borderWidth: 0,
    borderRadius: 4,
    marginVertical: scale(20),
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: scale(15),
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInputWrapper: {
    width: '48%',
    marginBottom: scale(10),
  },
  singleInputWrapper: {
    width: '100%',
    marginBottom: scale(12),
  },
  contryInContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: COLORS.borderColor, 
    backgroundColor: COLORS.black,
    height: scale(22), 
    paddingHorizontal: scale(8),
    overflow: 'hidden',
  },
  inputLabel: {
    fontSize: scale(10),
    color: COLORS.white,
    fontFamily: FONTS.montRegular,
    marginBottom: scale(5),
    alignSelf: 'flex-start',
  },
  contrycodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%', 
    marginRight: scale(6)
  },
  input: {
    width: '100%',
  },
  callingCode: {
    color: COLORS.white,
    fontSize: scale(10),
    marginLeft: scale(4),
    fontFamily: FONTS.montRegular,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginTop: verticalScale(15),
    alignItems: 'center',
    height: scale(22),
    justifyContent: 'center',
    paddingVertical: verticalScale(2),
  },
  buttonText: {
    fontSize: scale(10),
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
  },
  buttonContainer: {
    width: '100%',
    marginTop: verticalScale(10),
  },
  footerContainer: {
    marginTop: verticalScale(15),
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: 4,
  },
  footerText: {
    color: COLORS.greyText,
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.red,
    fontSize: scale(10),
    marginTop: scale(2),
    fontFamily: FONTS.montRegular,
  },
});

export default styles;
