import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5"; // Adjust icon imports based on your setup
import CButton from "../CButton"; // Custom button component
import { COLORS } from "../../theme/colors"; // Color theme file
import { FONTS } from "../../utils/fonts"; // Font theme file
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

interface CAlertModalProps {
    visible: boolean;
    type: "success" | "error";
    message: string;
    btnTitle: string;
    btnTitle2?: string; // Secondary button is optional
    onOkPress: () => void;
    onCancelPress?: () => void; // Cancel button is optional
}

const CAlertModal: React.FC<CAlertModalProps> = ({
    visible,
    type,
    message,
    btnTitle,
    btnTitle2,
    onOkPress,
    onCancelPress,
}) => {
    
    const isTablet = useSelector((state: RootState) => state.auth.isTablet);

    const renderIcon = () => (
        <View
            style={[
                styles.iconWrapper,
                { backgroundColor: type === "success" ? COLORS.green : COLORS.red,
                    width:isTablet ? scale(35) : scale(50),
                    height:isTablet ? scale(35) : scale(50),
                    marginBottom: isTablet ? scale(15) : scale(20),
                 },
            ]}
        >
            <Icon
                name={type === "success" ? "check" : "times"}
                size={isTablet ? scale(18) : scale(24)}
                color={COLORS.white}
            />
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer,    
                {width:isTablet ? scale(200) : scale(300),
                    padding:isTablet ? scale(15) : scale(25)

                }]}>
                    {renderIcon()}
                    <Text style={[styles.messageText,{
                        fontSize: isTablet ? scale(10) : scale(16),
                        marginBottom: isTablet ? scale(10) : scale(20),
                        }]}>{message}</Text>
                    <View style={[styles.buttonsContainer,{
                         width:isTablet ? '80%' : "100%",
                    }]}>
                        <CButton
                            text={btnTitle}
                            onPress={onOkPress}
                            style={styles.okButton}
                            textStyle={styles.okButtonText}
                        />
                        {btnTitle2 && onCancelPress && (
                            <CButton
                                outline
                                text={btnTitle2}
                                onPress={onCancelPress}
                                style={styles.cancelButton}
                                textStyle={styles.cancelButtonText}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: COLORS.black,
        // borderRadius: scale(10),
        alignItems: "center",
        elevation: 5,
    },
    iconWrapper: {
        borderRadius: scale(25),
        justifyContent: "center",
        alignItems: "center",
        
    },
    messageText: {
        // fontSize: scale(16),
        textAlign: "center",
        color: COLORS.white,
        fontFamily: FONTS.montRegular,
        
    },
    buttonsContainer: {
       
    },
    okButton: {
        backgroundColor: COLORS.green,
        // marginBottom: scale(10),
    },
    okButtonText: {
        color: COLORS.white,
        fontSize: scale(16),
        fontFamily: FONTS.montSemiBold,
    },
    cancelButton: {
        backgroundColor: COLORS.greyBorder,
    },
    cancelButtonText: {
        color: COLORS.white,
        fontSize: scale(16),
        fontFamily: FONTS.montRegular,
    },
});

export default CAlertModal;
