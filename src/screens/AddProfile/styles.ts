import { StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { COLORS } from "../../theme/colors";
import { FONTS } from "../../utils/fonts";

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
        // backgroundColor: 'rgba(0,0,0,0.6)',
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
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderWidth: 0,
        alignItems: 'center',
        borderRadius: 4,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    heading: {
        fontSize: scale(15),
        color: COLORS.white,
        fontFamily: FONTS.montSemiBold,
        marginBottom: verticalScale(15),
        textAlign: 'center',
    },
    inputView: {
        marginBottom: scale(20),
         width: '100%',
    },
       input: {
        width: '100%',
    },
    inputLabel: {
        fontSize: scale(10),
        color: COLORS.white,
        fontFamily: FONTS.montRegular,
        marginBottom: scale(5),
        alignSelf: 'flex-start',
    },
 

    avatarWrapper: {
        alignItems: 'center',
        marginBottom: scale(20),
    },
    profileImage: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(50),
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: COLORS.iconColor,
    },
    editIcon: {
        position: 'absolute',
        bottom: scale(-5),
        right: scale(-15),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: scale(15),
        padding: scale(5),
        borderWidth: 1,
        borderColor: COLORS.greyBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: verticalScale(2),
        borderRadius: 4,
        alignItems: 'center',

    },
    DeletButton:{
        width: '100%',
        backgroundColor: COLORS.lightBlack,
        paddingVertical: verticalScale(2),
        borderRadius: 4,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: scale(10),
        fontFamily: FONTS.montSemiBold,
    },

});

export default styles;
