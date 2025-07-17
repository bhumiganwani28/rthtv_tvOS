import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    width,
    paddingHorizontal: width * 0.1, // 10% margin
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: width * 0.045,   // Responsive font
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: width * 0.03,    // Responsive font
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
});
