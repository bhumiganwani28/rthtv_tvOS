
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';

const { width } = Dimensions.get('window');
const isTV = Platform.isTV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(20),
  },
    closeButtonContainer: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    zIndex: 10,
  },
closeButton: {
  padding: scale(10),
  backgroundColor: COLORS.lightBlack,
  borderRadius: scale(20),
},

closeButtonFocused: {
  backgroundColor: COLORS.primary,
  shadowColor: COLORS.primary,
  shadowOpacity: 0.8,
  shadowRadius: 8,
  elevation: 5,
  transform: [{ scale: 1.1 }],
},
  avatarWrapper: {
    margin: scale(10),
    borderRadius: scale(8),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: scale(60),
    height: scale(60),
    resizeMode: 'contain',
    backgroundColor: COLORS.iconColor,
    borderRadius: scale(8),
  },
  avatarSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  avatarFocused: {
    borderColor: COLORS.white,
    borderWidth: 3,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
    transform: [{ scale: 1.08 }],
  },
});

export default styles;