import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  useTVEventHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {scale} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import FFIcon from 'react-native-vector-icons/Feather';

import {FONTS} from '../../utils/fonts';
import {COLORS} from '../../theme/colors';
import {NEXT_PUBLIC_API_CDN_ENDPOINT} from '../../config/apiEndpoints';

interface TrendingVideoItem {
  _id: string;
  banner: string;
  streamName: string;
  streamDescription?: string;
  isSeries?: boolean;
  access?: 'Free' | 'Paid';
  bannerImg: string;
}

interface TrendingVideoProps {
  trendingVideosData: TrendingVideoItem[];
  showSubscriptionIcon?: boolean;
  title: string;
  viewAllLink?: string;
  viewText?: string;
  bannerImg: string;
  showViewAllText?: boolean;
  showStreamName?: boolean;
  onViewAllPress?: () => void;
  customStyles?: {
    container?: object;
    header?: object;
    title?: object;
    itemContainer?: object;
    image?: object;
    streamName?: object;
    streamDescription?: object;
  };
  showStreamDescription?: boolean;
  onImagePress?: (item: TrendingVideoItem) => void;
  itemHeight?: number;
  itemWidth?: number;
  imageKey?: string;

  // 🚨 Added for TV focus tracking
  rowFocus?: 'tabs' | 'slider' | 'content';
  rowIndex?: number;
  contentRowFocus?: number;
}

export default function CTrendingVideos(props: TrendingVideoProps) {
  const isTablet = useSelector((state: any) => state.auth.isTablet);
  const navigation = useNavigation();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const viewAllRef = useRef(null);

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
    imageKey = 'banner',
    rowFocus,
    contentRowFocus,
    rowIndex,
  } = props;

  const isRowFocused = rowFocus === 'content' && contentRowFocus === rowIndex;

  useTVEventHandler(evt => {
    if (!isRowFocused) return;

    switch (evt.eventType) {
      case 'down':
        setFocusedIndex(null); // Focus back to View All
        break;

      case 'up':
        setFocusedIndex(null); // Prevent from going above
        break;

      case 'left':
        if (focusedIndex === 0 || focusedIndex === null) {
          setFocusedIndex(null); // Keep focus on View All
        } else {
          setFocusedIndex(prev => (prev ?? 0) - 1);
        }
        break;

      case 'right':
        if (focusedIndex === null) {
          setFocusedIndex(0); // From View All to first item
        } else if (focusedIndex < trendingVideosData.length - 1) {
          setFocusedIndex(prev => (prev ?? 0) + 1); // Move to next
        }
        break;

      case 'select': {
        if (focusedIndex === null) {
          handleViewAllPress();
        } else {
          const item = trendingVideosData?.[focusedIndex];
          if (item) onImagePress?.(item);
        }
        break;
      }
    }
  });

  useEffect(() => {
    if (isRowFocused) {
      setFocusedIndex(null); // View All will be focused
    }
  }, [isRowFocused]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');
        if (storedSubscription) {
          setSubscriptionData(JSON.parse(storedSubscription));
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }
    };
    fetchSubscriptionData();
  }, []);

  const handleViewAllPress = () => {
    console.log('View All Pressed!');
    if (onViewAllPress) return onViewAllPress();
    if (viewAllLink) navigation.navigate(viewAllLink);
  };

  return (
    <View style={[styles.container, customStyles.container]}>
      {/* 🔹 Section Header Title */}
      <View
        style={[
          styles.header,
          customStyles.header,
          {marginVertical: scale(8), marginHorizontal: scale(5)},
        ]}>
        <Text numberOfLines={1} style={[styles.title, customStyles.title]}>
          {title}
        </Text>
        {viewAllLink && (
          <TouchableOpacity
            ref={viewAllRef}
            onPress={handleViewAllPress}
            focusable={Platform.isTV && isRowFocused}
            hasTVPreferredFocus={
              Platform.isTV && isRowFocused && focusedIndex === null
            }
            onFocus={() => {
              if (isRowFocused) {
                setFocusedIndex(null);
              }
            }}
            style={[
              styles.link,
              isRowFocused && focusedIndex === null && styles.focusedLink,
            ]}>
            {showViewAllText && (
              <Text style={styles.viewAllText}>{viewText}</Text>
            )}
            <FFIcon name="chevron-right" size={20} color={'#fff'} />
          </TouchableOpacity>


        )}
      </View>

      {/* 🔹 Horizontal Scroll List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginHorizontal: isTablet ? scale(2) : scale(8),
        }}>
        {trendingVideosData?.slice(0, 10).map((item, index) => {
          const isFocused = isRowFocused && focusedIndex === index;
          return (
            <TouchableOpacity
              key={item._id || `item-${index}`}
              onPress={() => onImagePress?.(item)}
              onFocus={() => isRowFocused && setFocusedIndex(index)}
              focusable={Platform.isTV && isRowFocused}
              hasTVPreferredFocus={Platform.isTV && isRowFocused && index === 0}
              style={[
                styles.itemContainer,
                isFocused && styles.focusedImageWrapper,

                //  isFocused && styles.highlighted,
                {
                  width: itemWidth,
                  height: itemHeight + (showStreamName ? scale(20) : 0),
                  marginHorizontal: scale(5),
                 
                  // overflow: 'hidden',
                },
                customStyles.itemContainer,
              ]}>
              <View
                style={[
                  styles.imageWrapper,
                  //
                  {width: itemWidth,
                     height: itemHeight,
                     borderWidth: isFocused ? scale(1) : 0,
                  borderColor: isFocused ? COLORS.white : 'transparent',},
                ]}>
                <Image
                  source={{
                    uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.[imageKey]}`,
                  }}
                  style={[styles.image, customStyles.image]}
                  resizeMode="cover"
                />
              </View>

              {!subscriptionData && item?.access === 'Paid' && (
                <View style={styles.subscriptionContainer}>
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
          );
        })}
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
    fontSize: scale(10),
    lineHeight: scale(15),
  },
  // link: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(4),
  },
  focusedLink: {
    padding: scale(4),
    borderWidth: scale(2),
    borderColor: COLORS.white,
    borderRadius: 6,
    backgroundColor: COLORS.focusItem,
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
    // borderRadius: scale(6),
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionIcon: {
    color: COLORS.yellow,
  },

});
