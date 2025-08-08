import { StyleSheet, Dimensions, Platform } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const { width } = Dimensions.get('window');
// const imageWidth = width / 2 - scale(13);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1,
        paddingHorizontal: scale(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        textAlignVertical: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
     itemView: {
    backgroundColor: COLORS.black, // or any default background
    // borderRadius: scale(5),
    marginBottom: scale(10),
    paddingHorizontal: scale(10),
    flex: 1,
  },
    mainView: {
        // marginHorizontal: scale(18),
    },
    banner: {
        width: '100%',
        resizeMode: 'cover',
        marginTop: 0,
        paddingTop: 0,
    },
    title: {
        color: COLORS.white,
        fontFamily: FONTS.montBold,
    },
    sessionbtn: {
        flexDirection: 'row',
    },
    sessionTag: {
        backgroundColor: COLORS.greyBorder,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    
    },
    sessionText: {
        color: COLORS.white,
        fontFamily: FONTS.montSemiBold,
        fontSize: scale(11),
    },
    iconStyl: {
        alignSelf: 'center',
        fontSize: scale(11),
    },
    seasonInfo: {
        // paddingVertical: scale(5),
    },
    seasonDescription: {
        fontFamily: FONTS.montRegular, 
        color: 'rgba(255, 255, 255, 0.5)',
    },
    yearInfo: {
        color: 'rgba(255, 255, 255, 0.5)',       
        fontFamily: FONTS.montSemiBold,
    },
    fishingTxt: {
        marginTop: scale(5),
        lineHeight: scale(22),
        fontSize: scale(14),
        color: COLORS.white,
        fontFamily: FONTS.montRegular,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(5),
    },
    circleButton: {
        borderRadius: scale(20),
        backgroundColor: COLORS.greyBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        backgroundColor: COLORS.greyBorder,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: scale(10),
    },
    watchText: {
        color: COLORS.white,
        
        fontFamily: FONTS.montSemiBold,
   
    },
    watchIcon: {
        alignSelf: 'center',
    },

    // tabs
    tabContainer: {
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderColor: COLORS.greyBorder,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
    activeTab: {
        position: 'relative',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: -2,
        left: '10%',
        width: '80%',
        height: 2,
        backgroundColor: COLORS.primary,
    },
    tabLabel: {
        // lineHeight: scale(20),
        color: COLORS.greyBorder,
        fontFamily: FONTS.montSemiBold,
    },
    activeText: {
        color: COLORS.primary,
    },

    // listing style

    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: scale(100),
    },
    
    playIconOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -12 }, { translateY: -12 }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    episodeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderRadius: scale(8),
    },
    episodeImage: {
        // marginRight: scale(10),
    flex: 1,
    width: '100%',
    height: scale(80),
    resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 0.4 = 40% opacity
      },
    imageContainer: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: COLORS.black,
      },
      playIconContainer: {
        position: "absolute",
        // top: "50%",
        // left: "50%",
        transform: [{ translateX: -scale(18) }, { translateY: -scale(18) }],
        justifyContent: "center",
        alignItems: "center",
      },
    subscriptionContainer: {
        position: 'absolute',

        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Background for better visibility
 // Rounded edges
       // Adjust padding for spacing
        alignItems: 'center',
        justifyContent: 'center',
      },
      subscriptionIcon: {
        color: COLORS.yellow, // Ensure the color is correct
      },
    episodeDetails: {
        flex: 1,
        
    },
    episodeTitle: {
        fontFamily: FONTS.montSemiBold,
        color: COLORS.white,
    },
    episodeTime: {
        color: COLORS.white,
        fontFamily: FONTS.montRegular,
        opacity: 0.6,
    },
    desView: {
        marginTop: scale(5),
    },
    episodeDescription: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontFamily: FONTS.montRegular,
    },
    moreDetails: {
        color: COLORS.white,
        // textAlign: 'center',
        fontFamily: FONTS.montRegular,
     

    },
        genreText: {
        color: COLORS.white,
        fontFamily: FONTS.montSemiBold,
 
    },
    // Item Container Style
    viewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginHorizontal: scale(18),
        alignItems: 'center',
    },
    viewAllTitle: {
        fontFamily: FONTS.montSemiBold,
        color: COLORS.white,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontFamily: FONTS.montSemiBold,
        color: COLORS.white,
        // marginRight: scale(4),
    },

      itemContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
        moreLikeimage: {
            width: '100%',
            height: '100%',
          },

            dropdownContainer: {
                backgroundColor: COLORS.greyBorder || COLORS.white, // use a theme value if available
                position: "absolute",
                left: scale(40),
                right: 0,
                zIndex: 1000,
                borderRadius: scale(5),
                elevation: 3,
                shadowColor: COLORS.greyBorder || "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
              },
              dropdownItem: {
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderColor || "#ddd", // use your theme’s border color
              },
              dropdownItemText: {
                color: COLORS.white,
                fontFamily: FONTS.montSemiBold,
                // fontSize: scale(13),
              },
              
 
});

export default styles;
