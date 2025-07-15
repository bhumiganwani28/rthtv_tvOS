import { Dimensions, Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTV ? 80 : 20,
  },
  logo: {
    marginBottom: isTV ? 60 : 40,
  },
  buttonGroup: {
    width: isTV ? '60%' : '90%',
    alignItems: 'center',
    marginBottom: isTV ? 50 : 30,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: isTV ? 20 : 14,
    paddingHorizontal: isTV ? 60 : 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontSize: isTV ? 26 : 18,
    fontFamily: FONTS.montBold,
    textAlign: 'center',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
    paddingVertical: isTV ? 20 : 14,
    paddingHorizontal: isTV ? 60 : 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.white,
    fontSize: isTV ? 24 : 16,
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
  },
  termsContainer: {
    paddingHorizontal: isTV ? 80 : 20,
    marginTop: isTV ? 20 : 10,
  },
  termsText: {
    color: COLORS.white,
    fontSize: isTV ? 20 : 12,
    fontFamily: FONTS.montRegular,
    textAlign: 'center',
    lineHeight: isTV ? 28 : 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
  },
});

export default styles;
