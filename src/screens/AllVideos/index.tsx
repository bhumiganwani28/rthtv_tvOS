import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import styles from './styles';
import apiHelper from '../../config/apiHelper';
import {
  CHANNELS_SLIDER,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import Header from '../../components/Header';
import { COLORS } from '../../theme/colors';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import { useTVEventHandler } from 'react-native';
import { scale } from 'react-native-size-matters';
import { appendAllVideossData, resetAllVideossData, setAllVideossData } from '../../redux/slices/allVideosSlice';

const AllVideos: React.FC = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const allVideosData = useSelector((state: any) => state.allVideos?.data);
  const dataFetchedRef = useRef(false);
  const { tvChannelID } = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const NUM_COLUMNS = 5;
  const CARD_ASPECT_RATIO = 16 / 9;
  const itemHorizontalSpacing = scale(12); // space between cards
  const windowWidth = Dimensions.get('window').width;
  const totalSpacing = itemHorizontalSpacing * (NUM_COLUMNS + 1);
  const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemMargin = itemHorizontalSpacing / 1.5;

  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const handleVideoPress = (item: any) => {
    navigation.navigate('Details', {
      tvShowId: item?.id,
      TvChannelId: item?.channel,
    });
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const stored = await AsyncStorage.getItem('subscription');
        if (stored) setSubscriptionData(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };
    fetchSubscriptionData();
  }, []);

  const fetchAllVideos = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiHelper.get(`${CHANNELS_SLIDER}/${tvChannelID}?page=${pageNum}&limit=${PAGE_LIMIT}`);
      const res = response.data;
      if (res) {
        if (isRefresh) {
          // Reset the data and update total pages/count for refresh
          dispatch(setAllVideossData(res?.tvShow));
        } else {
          // Append data to the existing list
          dispatch(appendAllVideossData(res?.tvShow));
        }
        setTotalPages(res?.totalPages);
      }
    } catch (error) {
      console.error('Error fetching all videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setAllVideossData([]));
      fetchAllVideos(1);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetAllVideossData());
    fetchAllVideos(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllVideos(nextPage);
    }
  }, [page, totalPages, loading]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;

    return (
      <TouchableOpacity
        onPress={() => handleVideoPress(item)}
        onFocus={() => setFocusedIndex(index)}
        hasTVPreferredFocus={index === 0}
        focusable
        style={{
          width: cardWidth,
          height: cardHeight,
          marginLeft: itemMargin,
          marginTop: itemMargin,
        }}
      >
        <View
          style={[
            styles.itemContainer,
            isFocused && styles.focusedItemContainer,
            { 
              width: cardWidth, 
              height: cardHeight,
              // borderWidth: isFocused ? scale(1) : 0,
              // borderColor: isFocused ? COLORS.white : 'transparent',
            },
          ]}
        >
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.banner}`,
            }}
            style={styles.image}
          />
          {!subscriptionData && item?.access === 'Paid' && (
            <View style={styles.subscriptionContainer}>
              <FIcon name="crown" size={scale(8)} style={styles.subscriptionIcon} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any, index: number) =>
    `${item?.id}-${item?.slug}-${index}`;

  const gridWidth = NUM_COLUMNS * cardWidth + (NUM_COLUMNS + 1) * itemMargin;

  const handleRefresh = async () => {
    setRefreshing(true);
    dataFetchedRef.current = false;
    await fetchAllVideos(1, true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />
      <Header
        title=""
        showLogo
        showBack={false}
        showSearch
        showLogout
        onSearchPress={() => navigation.navigate('SearchVideosTV')}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>All Videos</Text>
        </View>
        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : allVideosData?.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Videos Found</Text>
          </View>
        ) : (
          <FlatList
            data={allVideosData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.7}
            contentContainerStyle={{
              width: gridWidth,
              alignSelf: 'center',
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.white]}
              />
            }
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default AllVideos;
