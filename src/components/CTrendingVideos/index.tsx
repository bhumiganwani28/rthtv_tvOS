import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {s, scale, ScaledSheet} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {IMAGES} from '../../theme/images';
import {FONTS} from '../../utils/fonts';
import {NEXT_PUBLIC_API_CDN_ENDPOINT} from '../../config/apiEndpoints';
import {COLORS} from '../../theme/colors';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import FFIcon from 'react-native-vector-icons/Feather';
import store from '../../redux/store';
import {useSelector} from 'react-redux';

interface Episode {
  episodeThumbnail: any;
  episodeNo: string;
  episodeDuration: string;
  episodeDescription: string;
}

interface TrendingVideoItem {
  _id: string;
  banner: string;
  streamName: string;
  showStreamName?: boolean;
  streamDescription?: string;
  isSeries?: boolean;
  showViewAllText?: boolean;
  bannerImg: string;
}

interface TrendingVideoProps {
  trendingVideosData: TrendingVideoItem[];
  showSubscriptionIcon?: boolean;
  title: string; // Dynamic section title
  viewAllLink?: string; // Optional navigation for "View All"
  viewText?: string; // Optional custom "View All" text
  bannerImg: string;
  showViewAllText?: boolean;
  showStreamName?: boolean;
  onViewAllPress?: () => void; // Custom handler for "View All"
  customStyles?: {
    container?: object; // Custom styles for the container
    header?: object; // Custom styles for the header
    title?: object; // Custom styles for the title
    itemContainer?: object; // Custom styles for item containers
    image?: object; // Custom styles for images
    streamName?: object; // Custom styles for the stream name
    streamDescription?: object; // Custom styles for the stream description
  };
  showStreamDescription?: boolean; // Whether to display descriptions under images
  onImagePress?: (item: TrendingVideoItem) => void; // Custom handler for image press
  itemHeight?: number; // Custom image height
  itemWidth?: number; // Custom image width
  imageKey?: string;
}

// export default function CTrendingVideos({
export default function CTrendingVideos(props: TrendingVideoProps) {
  const isTablet = useSelector((state: RootState) => state.auth.isTablet);
  const {
    trendingVideosData,
    title,
    viewAllLink,
    showViewAllText,
    bannerImg,
    showStreamName,
    viewText = 'View All',
    onViewAllPress,
    customStyles = {},
    showStreamDescription = false,
    onImagePress,
    itemHeight,
    itemWidth,
    //  itemHeight=isTablet ? 280 : 240,
    //   itemWidth=isTablet ? 180 : 160,
    //    itemHeight = isTablet ? scale(80) : scale(100),
    // itemWidth = isTablet ? scale(100) : scale(70),
    // itemHeight = scale(120), // Default height
    // itemWidth = Dimensions.get("window").width / 3 - scale(10), // Default width
    imageKey = 'banner',
  } = props;

  // }: TrendingVideoProps) {
  const navigation = useNavigation();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  // const {auth: {isTablet},} = store.getState();
  // console.log("isTablet>",isTablet);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');
        if (storedSubscription) {
          setSubscriptionData(JSON.parse(storedSubscription));
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleViewAllPress = () => {
    if (onViewAllPress) {
      onViewAllPress(); // Use custom "View All" handler if provided
    } else if (viewAllLink) {
      navigation.navigate(viewAllLink); // Default navigation
    }
  };

  return (
    <View
      style={[
        styles.container,
        customStyles.container,
        {
          // marginTop:isTablet ? scale(2) : scale(5),
        },
      ]}>
      {/* Section Header */}
      <View
        style={[
          styles.header,
          customStyles.header,
          {
            marginVertical: scale(8),
            marginHorizontal: scale(5),
          },
        ]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={[styles.title, customStyles.title]}>
          {title}
        </Text>
        {viewAllLink && (
          <TouchableOpacity onPress={handleViewAllPress} style={styles.link}>
            {showViewAllText && (
              <Text style={[styles.viewAllText]}>{viewText}</Text>
            )}
            <FFIcon name="chevron-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontally Scrollable List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginHorizontal: isTablet ? scale(2) : scale(8),
        }}>
        {/* {trendingVideosData.map((item, index) => ( */}
        {trendingVideosData?.slice(0, 10).map((item, index) => (
          <TouchableOpacity
            key={item._id || `item-${index}`}
            onPress={() => onImagePress?.(item)}
            style={[
              styles.itemContainer,
              {
                width: itemWidth,
                height: itemHeight + (showStreamName ? scale(20) : 0),
                marginHorizontal: isTablet ? scale(3) : scale(6),
              },
              customStyles.itemContainer,
            ]}
            // style={[styles.itemContainer, customStyles.itemContainer,{ marginHorizontal:isTablet ? scale(3) : scale(6),}]}
          >
            <Image
              source={{
                uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${
                  item?.[imageKey] || item?.banner
                }`,
              }}
              style={[
                {
                  width: itemWidth,
                  height: itemHeight,
                },
                customStyles.image,
              ]}
              resizeMode="cover"
            />

            {!subscriptionData && item?.access === 'Paid' && (
              <View style={[styles.subscriptionContainer]}>
                <FIcon
                  name="crown"
                  size={scale(8)} 
                  style={styles.subscriptionIcon}
                />
              </View>
            )}

            {showStreamName && (
              <Text style={[styles.streamName, customStyles.streamName]}>
                {item.streamName}
              </Text>
            )}
            {showStreamDescription && item.streamDescription && (
              <Text
                style={[
                  styles.streamDescription,
                  customStyles.streamDescription,
                ]}>
                {item.streamDescription}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    fontSize: scale(9),
    lineHeight: scale(15),
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    marginRight: scale(4),
    fontSize: scale(8),
    lineHeight: scale(15),
  },
  itemContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  streamName: {
    marginTop: scale(6),
    fontSize: scale(12),
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
  },
  streamDescription: {
    marginTop: scale(4),
    fontSize: scale(10),
    fontFamily: FONTS.montRegular,
    color: COLORS.greyText,
  },
  subscriptionContainer: {
    position: 'absolute',
    padding: scale(3),
    borderRadius: scale(3),
    top: scale(5),
    right: scale(5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Background for better visibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionIcon: {
    color: COLORS.yellow, // Ensure the color is correct
  },
});
