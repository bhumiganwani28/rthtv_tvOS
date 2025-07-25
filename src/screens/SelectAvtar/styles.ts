import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

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
    listStyl: {
        flex: 1,
        marginTop: scale(8),
        marginHorizontal: scale(8),
    },
    avatarImage: {
        resizeMode: 'contain',
        borderWidth: 2,
        // borderColor: COLORS.greyBorder,
        backgroundColor: COLORS.iconColor,
    },
    avatarImageEmpty: {
        borderWidth: 2,
        borderColor: COLORS.black, // Black border when no image is available
    },
});

export default styles;
