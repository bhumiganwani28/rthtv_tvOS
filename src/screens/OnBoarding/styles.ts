import { Dimensions, Platform, StyleSheet } from 'react-native';
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTV ? 40 : 20,
    width: '100%',
  },
  logo: {
    width:  scale(300) ,
    height: scale(150),
    marginBottom: isTV ? 30 : 20,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: isTV ? 40 : 25,
    width: '100%',
    maxWidth: isTV ? 600 : 400,
  },
  title: {
    color: COLORS.white,
    fontSize: scale(35),
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
    marginBottom: isTV ? 12 : 8,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: scale(20),
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: scale(20),
    maxWidth: 400,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    marginRight:scale(15),
  },
  signinButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.white,
    borderWidth: 1,
    marginLeft: scale(15),
  },
  buttonText: {
    color: COLORS.white,
    fontSize:  scale(20),
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginTop: scale(20),
    width: '100%',
    maxWidth: 600,
  },
  termsText: {
    color: COLORS.greyText,
    fontSize: scale(20),
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
    lineHeight:scale(35),
  },
  linkText: {
    textDecorationLine: 'underline',
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    fontSize: scale(20),
     lineHeight:30,
  },
});

// Helper function for scaling
function scale(size: number): number {
  return isTV ? size * 1.1 : size;
}

export default styles;
