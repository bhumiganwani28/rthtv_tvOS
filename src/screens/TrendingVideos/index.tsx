// TrendingVideos.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
  Image, TouchableOpacity, Dimensions, Platform, useTVEventHandler
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';

import Header from '../../components/Header';
import TabMenuBar from '../../components/TabMenuBar';
import ProfileSelector from '../../components/ProfileSelector';
import BackHandlerComponent from '../../components/BackHandlerComponent';

import apiHelper from '../../config/apiHelper';
import { SEASON_LIST, NEXT_PUBLIC_API_CDN_ENDPOINT, PAGE_LIMIT } from '../../config/apiEndpoints';
import { COLORS } from '../../theme/colors';
import { setTrendingVideosData, appendTrendingVideosData, resetTrendingVideosData } from '../../redux/slices/TrendingSlice';
import styles from './styles';
import { scale } from 'react-native-size-matters';

const tabs = [
  { id: 'home', title: 'Home' },
  { id: 'channels', title: 'Channels' },
  { id: 'premium', title: 'Premium' },
  { id: 'featured', title: 'Featured' },
  { id: 'mylist', title: 'My List' },
];

const TrendingVideos: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const trendingVideosData = useSelector((state: any) => state.trendingVideos?.data ?? []);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const NUM_COLUMNS = 5;
  const screenWidth = Dimensions.get('window').width;
  const ITEM_SPACING = scale(26);
  const itemMargin = ITEM_SPACING / 2;
  const totalSpacing = ITEM_SPACING * (NUM_COLUMNS + 1);
  const cardWidth = (screenWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth * 1.25;

  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');
  const [focusedTab, setFocusedTab] = useState<string>('featured');
  const [selectedTab, setSelectedTab] = useState<string>('featured');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (rowFocus === 'content' && flatListRef.current && trendingVideosData.length > 0) {
      try {
        flatListRef.current.scrollToIndex({
          animated: true,
          index: focusedIndex,
          viewPosition: 0.5,
        });
      } catch (_) {}
    }
  }, [focusedIndex, rowFocus, trendingVideosData]);

  useTVEventHandler((evt) => {
    if (!evt?.eventType) return;

    switch (evt.eventType) {
      case 'down':
        if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedIndex(0);
        } else {
          const nextIndex = focusedIndex + NUM_COLUMNS;
          if (nextIndex < trendingVideosData.length) setFocusedIndex(nextIndex);
        }
        break;

      case 'up':
        if (rowFocus === 'content') {
          const prevIndex = focusedIndex - NUM_COLUMNS;
          if (prevIndex >= 0) setFocusedIndex(prevIndex);
          else setRowFocus('tabs');
        }
        break;

      case 'right':
        if (rowFocus === 'tabs') {
          const currentIndex = tabs.findIndex((t) => t.id === focusedTab);
          if (currentIndex < tabs.length - 1) setFocusedTab(tabs[currentIndex + 1].id);
        } else {
          const next = focusedIndex + 1;
          if ((next % NUM_COLUMNS !== 0) && next < trendingVideosData.length) setFocusedIndex(next);
        }
        break;

      case 'left':
        if (rowFocus === 'tabs') {
          const currentIndex = tabs.findIndex((t) => t.id === focusedTab);
          if (currentIndex > 0) setFocusedTab(tabs[currentIndex - 1].id);
        } else {
          const prev = focusedIndex - 1;
          if (focusedIndex % NUM_COLUMNS !== 0 && prev >= 0) setFocusedIndex(prev);
        }
        break;

      case 'select':
        if (rowFocus === 'tabs') {
          setSelectedTab(focusedTab);
          handleTabPress(focusedTab);
        } else {
          const item = trendingVideosData[focusedIndex];
          if (item) handleTvShowPress(item);
        }
        break;
    }
  });

  const handleTabPress = (tabId: string) => {
    setSelectedTab(tabId);
    switch (tabId) {
      case 'home': navigation.navigate('Home'); break;
      case 'channels': navigation.navigate('Channels'); break;
      case 'premium': navigation.navigate('PremiumVideos'); break;
      case 'featured': navigation.navigate('TrendingVideos'); break;
      // case 'mylist': navigation.navigate('AllVideosScreen'); break;
    }
  };

  const handleTvShowPress = (item: any) => {
    navigation.navigate('VODScreen', { seasonID: item._id });
  };

  const fetchSubscriptionData = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscription');
      if (stored) setSubscriptionData(JSON.parse(stored));
    } catch (e) {
      console.error('Subscription fetch error:', e);
    }
  };

  const fetchTrendingVideos = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiHelper.get(`${SEASON_LIST}?page=${pageNum}&limit=${PAGE_LIMIT}&trending=true`);
      const data = res?.data?.data;
      if (data) {
        isRefresh
          ? dispatch(setTrendingVideosData(data))
          : dispatch(appendTrendingVideosData(data));
        setTotalPages(res?.data?.totalPages || 1);
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setTrendingVideosData([]));
      fetchTrendingVideos(1);
      fetchSubscriptionData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetTrendingVideosData());
    fetchTrendingVideos(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrendingVideos(nextPage);
    }
  }, [page, totalPages, loading]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = rowFocus === 'content' && index === focusedIndex;

    return (
      <TouchableOpacity
        focusable={Platform.isTV}
        onPress={() => handleTvShowPress(item)}
        onFocus={() => {
          setFocusedIndex(index);
          setRowFocus('content');
        }}
        hasTVPreferredFocus={isFocused}
        style={{
          width: cardWidth,
          height: cardHeight,
          marginHorizontal: itemMargin,
          marginTop: itemMargin,
        }}
      >
        <View style={[
          styles.itemContainer,
          isFocused && styles.focusedItemContainer,
          { width: cardWidth, height: cardHeight },
        ]}>
          <Image
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobilePosterImage}` }}
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

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={() => navigation.goBack()} />
      <Header
        title=""
        showLogo
        showSearch
        showLogout
        onSearchPress={() => navigation.navigate('SearchVideosTV')}
      />

      {/* Tab bar */}
      <View style={styles.tabBarContainer}>
        <TabMenuBar
          tabs={tabs}
          selectedTab={selectedTab}
          focusedTab={focusedTab}
          rowFocus={rowFocus}
          onTabPress={handleTabPress}
          onTabFocus={setFocusedTab}
        />
        <ProfileSelector onProfileChange={onRefresh} />
      </View>

      {/* Title + Content */}
      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>Trending Videos</Text>
        </View>

        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : trendingVideosData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Trending Videos Found</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={trendingVideosData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: itemMargin,
              paddingBottom: scale(60),
              alignSelf: 'center',
            }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.7}
            getItemLayout={(_, index) => ({
              length: cardHeight + itemMargin,
              offset: (cardHeight + itemMargin) * index,
              index,
            })}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default TrendingVideos;
