import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
  },
});

export default styles;
