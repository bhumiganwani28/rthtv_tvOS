import { StyleSheet, Dimensions } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../utils/fonts';

const timeSlotWidth = 120;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  guideContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
  },
  channelList: {
    position: 'absolute',
    top: scale(40),
    zIndex: 2,
  },
  channelItem: {
    width: scale(100),
    height: scale(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(10),
  },
  timeSlotContainer: {
    flexDirection: 'row',
    paddingLeft: scale(110), // leave space for logos
  },
  timeSlotText: {
    color: COLORS.white,
    fontSize: scale(12),
    textAlign: 'center',
  },
  nowIndicator: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    width: 3,
    top: scale(40),
    height: '100%',
  },
  programRow: {
    flexDirection: 'row',
    height: scale(60),
    alignItems: 'center',
    marginVertical: scale(2),
    marginLeft: scale(100),
  },
  programBlock: {
    backgroundColor: COLORS.lightBlack,
    marginHorizontal: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: 8,
  },
  programText: {
    color: COLORS.white,
    fontSize: scale(10),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  channelLogo: {
    width: scale(80),
    height: scale(60),
    resizeMode: 'contain',
  },
  dateSelector: {
    flexDirection: 'row',
    paddingVertical: scale(10),
  },
  dateItem: {
    padding: scale(10),
    marginHorizontal: scale(6),
    backgroundColor: COLORS.lightBlack,
    borderRadius: 10,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    color: COLORS.white,
    fontSize: scale(12),
    textAlign: 'center',
  },
});
