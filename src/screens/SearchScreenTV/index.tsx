import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  setChannelsData,
  appendChannelsData,
  resetChannelsData,
} from '../../redux/slices/channelsSlice';
import {
  setTrendingVideosData,
  appendTrendingVideosData,
  resetTrendingVideosData,
} from '../../redux/slices/TrendingSlice';
import {
  CHANNELS,
  TRENDING_VIDEOS,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import {COLORS} from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import styles from './styles';
import {scale} from 'react-native-size-matters';

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const channelsData = useSelector((state: any) => state.channels?.data);
  const trendingVideosData = useSelector(
    (state: any) => state.trendingVideos?.data,
  );
  const route = useRoute();
  const {query} = route.params || {};
  const [searchText, setSearchText] = useState(query || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedId, setFocusedId] = useState<string | number | null>(null);
const [focusedTabIndex, setFocusedTabIndex] = useState<number | null>(null);

  // ✅ Responsive spacing logic
  const NUM_COLUMNS = 5;
  const SIDE_PADDING = scale(32); // ✅ fixed and equal side padding
  const CARD_GAP = activeTab === 0 ? scale(12) : scale(26); // spacing between items
  const screenWidth = Dimensions.get('window').width;
  const totalCardGap = CARD_GAP * (NUM_COLUMNS - 1); // 4 gaps between 5 items
    const totalSpacing = CARD_GAP * (NUM_COLUMNS + 1);
  const cardWidth = activeTab === 0 ? (screenWidth - SIDE_PADDING * 2 - totalCardGap) / NUM_COLUMNS : (screenWidth - totalSpacing) / NUM_COLUMNS;;
  const cardHeight =
    activeTab === 0 ? cardWidth / (16 / 9) : cardWidth * 1.25;

  const handlePress = (item: any) => {
    if (activeTab === 0) {
      navigation.navigate('ChannelDetails', {channelId: item?.id});
    } else {
      navigation.navigate('Details', {
        tvShowId: item?.id,
        TvChannelId: item?.channel,
      });
    }
  };

  const fetchData = async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 0 ? CHANNELS : TRENDING_VIDEOS;
      const response = await apiHelper.get(
        `${endpoint}?page=${pageNum}&limit=${PAGE_LIMIT}&search=${searchText}`,
      );
      const res = response?.data;
      if (res?.data) {
        if (isRefresh) {
          activeTab === 0
            ? dispatch(setChannelsData(res.data))
            : dispatch(setTrendingVideosData(res.data));
        } else {
          activeTab === 0
            ? dispatch(appendChannelsData(res.data))
            : dispatch(appendTrendingVideosData(res.data));
        }
        setTotalPages(res.totalPages || 1);
      }
    } catch (error) {
      // Ignore error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleClear = () => {
    setSearchText('');
    setPage(1);
    activeTab === 0
      ? dispatch(resetChannelsData())
      : dispatch(resetTrendingVideosData());
    fetchData(1, true);
  };

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchData(1, true);
  }, [searchText, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    activeTab === 0
      ? dispatch(resetChannelsData())
      : dispatch(resetTrendingVideosData());
    fetchData(1, true);
  }, [activeTab, dispatch]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [page, totalPages, loading]);

  const switchTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
    setPage(1);
    setSearchText('');
    tabIndex === 0
      ? dispatch(resetChannelsData())
      : dispatch(resetTrendingVideosData());
    fetchData(1, true);
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchData(1, true);
    }, [activeTab, searchText]),
  );

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');
        if (storedSubscription)
          setSubscriptionData(JSON.parse(storedSubscription));
      } catch {}
    };
    fetchSubscriptionData();
  }, []);

  const keyExtractor = (item: any, index: number) => `${item?.id}-${index}`;

  const renderChannelItem = ({item, index}: {item: any, index: number}) => {
    const isFocused = focusedId === item.id && activeTab === 0;
    const isLastColumn = (index + 1) % NUM_COLUMNS === 0;

    return (
      <TouchableOpacity
        style={{
          width: cardWidth,
          height: cardHeight,
          marginBottom: CARD_GAP,
          marginRight: isLastColumn ? 0 : CARD_GAP,
        }}
        onPress={() => handlePress(item)}
        focusable
        onFocus={() => setFocusedId(item.id)}
        hasTVPreferredFocus={isFocused}>
        <View
          style={[
            styles.itemContainer,
            isFocused && styles.focusedItemContainer,
            {
              width: cardWidth,
              height: cardHeight,
              borderWidth: isFocused ? scale(1) : 0,
              borderColor: isFocused ? COLORS.white : 'transparent',
            },
          ]}>
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.coverImage || item?.banner}`,
            }}
            style={styles.image}
          />
        </View>
        {!subscriptionData && item?.access === 'Paid' && (
          <View style={styles.subscriptionContainer}>
            <FIcon name="crown" size={36} style={styles.subscriptionIcon} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrendingItem = ({item, index}: {item: any, index: number}) => {
    const isFocused = focusedId === item.id && activeTab === 1;
    const isLastColumn = (index + 1) % NUM_COLUMNS === 0;

    return (
      <TouchableOpacity
        style={{
          width: cardWidth,
          height: cardHeight,
          marginBottom: CARD_GAP,
          marginRight: isLastColumn ? 0 : CARD_GAP,
        }}
        onPress={() => handlePress(item)}
        focusable
        onFocus={() => setFocusedId(item.id)}
        hasTVPreferredFocus={isFocused}>
        <View
          style={[
            styles.itemContainer,
            isFocused && styles.focusedItemContainer,
            {
              width: cardWidth,
              height: cardHeight,
            },
          ]}>
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.coverImage || item?.banner}`,
            }}
            style={styles.image}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const noDataView = (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No Data Found</Text>
    </View>
  );

  const noData =
    activeTab === 0
      ? channelsData.length === 0
      : trendingVideosData.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.mainSearch}>
        <Text style={styles.searchInfo}>
          Use remote/search UI to search. Current: {searchText}
        </Text>
        <TouchableOpacity
          onPress={handleClear}
          focusable
          style={styles.clearIcon}>
          <FIcon name="x" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 0 && styles.activeTab]}
          onPress={() => switchTab(0)}
          focusable>
          <Text style={[styles.tabLabel, activeTab === 0 && styles.activeText]}>
            Channels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 1 && styles.activeTab]}
          onPress={() => switchTab(1)}
          focusable>
          <Text style={[styles.tabLabel, activeTab === 1 && styles.activeText]}>
            Trending Videos
          </Text>
        </TouchableOpacity>
      </View> */}
<View style={styles.tabBar}>
  <TouchableOpacity
    style={[
      styles.tabItem,
      activeTab === 0 && styles.activeTab,
      focusedTabIndex === 0 && styles.focusedTabItem,
    ]}
    onPress={() => switchTab(0)}
    focusable
    onFocus={() => setFocusedTabIndex(0)}
    onBlur={() => setFocusedTabIndex(null)}
  >
    <Text
      style={[
        styles.tabLabel,
        activeTab === 0 && styles.activeText,
        focusedTabIndex === 0 && styles.focusedTabText,
      ]}
    >
      Channels
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.tabItem,
      activeTab === 1 && styles.activeTab,
      focusedTabIndex === 1 && styles.focusedTabItem,
    ]}
    onPress={() => switchTab(1)}
    focusable
    onFocus={() => setFocusedTabIndex(1)}
    onBlur={() => setFocusedTabIndex(null)}
  >
    <Text
      style={[
        styles.tabLabel,
        activeTab === 1 && styles.activeText,
        focusedTabIndex === 1 && styles.focusedTabText,
      ]}
    >
      Trending Videos
    </Text>
  </TouchableOpacity>
</View>

      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : noData ? (
        noDataView
      ) : (
        <FlatList
          data={activeTab === 0 ? channelsData : trendingVideosData}
          keyExtractor={keyExtractor}
          renderItem={activeTab === 0 ? renderChannelItem : renderTrendingItem}
          numColumns={NUM_COLUMNS}
          onEndReached={loadMore}
          onEndReachedThreshold={0.7}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING, // ✅ fixed both-left-right spacing
            paddingTop: 16,
            paddingBottom: 64,
          }}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default SearchScreen;
