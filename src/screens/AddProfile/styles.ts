import { StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { COLORS } from "../../theme/colors";
import { FONTS } from "../../utils/fonts";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.black,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    formContainer: {
        marginTop: scale(20),
        marginHorizontal: scale(10),
    },
    profileCard: {
        flex: 1,
        marginBottom: scale(16),
    },
    profileImage: {
  
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: COLORS.greyBorder,
        backgroundColor: COLORS.iconColor,
    },
    editIcon: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: COLORS.greyBorder,
        // bottom: -scale(10),  // Move it slightly above the top of the image
        // left: scale(50), // Move it slightly to the left of the image
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background for the circle
        borderRadius: scale(15), // Circular icon
        padding: scale(5), // Padding inside the circle
        justifyContent: 'center', // Center the icon inside the circle
        alignItems: 'center', // Center the icon inside the circle
      // Set height for the icon
    },
    label: {
        fontFamily: FONTS.montRegular,
        color: COLORS.textColor,
        marginBottom: verticalScale(5),
        lineHeight: scale(20),
    },
    toggleWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: scale(10),
    },
    textView: {
        flex: 1,
    },
    kidsProfileText: {
        color: COLORS.white,
        fontFamily: FONTS.montSemiBold,
    },
    desText: {
        color: COLORS.greyText,
        fontFamily: FONTS.montRegular,
    },
    addProfileContainer: {
        width: scale(70),
        height: scale(70),
        borderWidth: 1,
        borderColor: COLORS.greyBorder,
        backgroundColor: COLORS.lightBlack,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errTrxtStyl: {
        marginTop: scale(5),
        marginLeft: scale(8),
        fontSize: scale(11),
        color: COLORS.red,
        fontFamily: FONTS.montRegular,
    }
    // profileName: {
    //     color: COLORS.white,
    //     fontSize: scale(14),
    //     fontFamily: FONTS.montRegular,
    //     marginTop: verticalScale(8),
    //     textAlign: 'center',
    // },
});

export default styles;
