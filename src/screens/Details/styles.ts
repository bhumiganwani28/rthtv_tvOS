import { scale } from "react-native-size-matters";
import { FONTS } from "../../utils/fonts";
import { COLORS } from "../../theme/colors";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const isTV = Platform.isTV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  header: {
    position: "absolute",
    top: scale(20),
    left: 0,
    right: 0,
    zIndex: 10,
    height: scale(60),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
  },

  bannerImageTV: {
    width: width ,
    height: isTV ? scale(250) : scale(220),
    resizeMode: "cover",
    alignSelf: "center",
  },

  liveNoBtnWrapper: {
    position: "absolute",
    top: scale(30),
    right: scale(30),
    backgroundColor: COLORS.red,
    paddingVertical: scale(6),
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    // borderRadius: scale(5),
  },

  liveDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: COLORS.white,
    marginRight: scale(8),
  },

  liveNowButtonText: {
    color: COLORS.white,
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
  },

  detailsContainer: {
    marginTop: scale(20),
    paddingHorizontal: scale(10),
  },

  streamNameTV: {
    color: COLORS.white,
    fontSize: scale(16),
    lineHeight: scale(20),
    fontFamily: FONTS.montBold,
    textAlign: "left",
  },

  descriptionTV: {
    marginTop: scale(8),
    fontFamily: FONTS.montRegular,
    fontSize: scale(14),
    lineHeight: scale(20),
    color: "rgba(255,255,255,0.75)",
    textAlign: "left",
  },

  btnContainer: {
    marginTop: scale(24),
     paddingVertical: scale(5),
     paddingHorizontal: scale(20),
    // alignItems: "center",
    // width:'100%',
  },

  watchNowButton: {
    backgroundColor: COLORS.greyBorder,
    
    // borderRadius: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  watchNowButtonFocused: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.9,
    elevation: 20,
  },

  watchNowButtonText: {
    color: COLORS.white,
    fontSize: scale(18),
    fontFamily: FONTS.montSemiBold,
    marginRight: scale(10),
  },

  trendingSection: {
    marginTop: scale(10),
    paddingBottom: scale(50),
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(40),
  },

  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: scale(100),
  },

  noDataText: {
    color: COLORS.primary,
    fontFamily: FONTS.montSemiBold,
    fontSize: scale(20),
    textAlign: "center",
  },
});

export default styles;
