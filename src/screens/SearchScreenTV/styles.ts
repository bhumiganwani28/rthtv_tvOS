import { Dimensions, Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';
import { scale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');
const windowWidth = width;
const numColumns = 4;
const itemMargin = 24;
const imageSize = (windowWidth - (numColumns + 1) * itemMargin) / numColumns;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    mainSearch: {
        flexDirection: "row",
        marginHorizontal: 32,
        alignItems: 'center',
        marginTop: 36,
    },
    searchInfo: {
        flex: 1,
        color: COLORS.white,
        fontFamily: FONTS.montRegular,
        fontSize: 26,
    },
    clearIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        marginLeft: 32,
        borderRadius: 30,
        backgroundColor: COLORS.lightBlack,
    },
    tabBar: {
        alignItems: 'center',
        width: "100%",
        flexDirection: 'row',
        marginVertical: scale(12),
    },
    tabItem: {
        width: "50%",
        borderBottomWidth: scale(2),
        borderColor: COLORS.greyBorder,
        paddingVertical: scale(12),
    },
    activeTab: {
        borderBottomWidth: scale(2),
        borderColor: COLORS.primary,
    },
    tabLabel: {
        textAlign: 'center',
        color: COLORS.greyBorder,
        fontFamily: FONTS.montSemiBold,
        fontSize: scale(12),
    },
    activeText: {
        color: COLORS.primary,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: scale(12),
        color: COLORS.primary,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
    },
    focusedItemContainer: {
        borderWidth: scale(1),
        borderColor: COLORS.white,
        backgroundColor: COLORS.focusItem,
        elevation: 5,
    },
    focusedTabItem: {
  borderColor: COLORS.white,
  borderWidth: scale(2),
  backgroundColor: COLORS.primary, // optional focused background
},

focusedTabText: {
  color: COLORS.white,
},
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    subscriptionContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        top: 6,
        right: 12,
        padding: 6,
        borderRadius: 6,
    },
    subscriptionIcon: {
        color: COLORS.yellow,
    },
});

export default styles;
