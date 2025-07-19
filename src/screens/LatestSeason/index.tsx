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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import styles from './styles';
import apiHelper from '../../config/apiHelper';
import {
  SEASON_LIST,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import Header from '../../components/Header';
import ProfileSelector from '../../components/ProfileSelector';
import { COLORS } from '../../theme/colors';
import {
  appendLatestSeasonData,
  resetLatestSeasonData,
  setLatestSeasonData,
} from '../../redux/slices/latestSeasonSlice';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import TabMenuBar from '../../components/TabMenuBar';
import { useTVEventHandler } from 'react-native';
import { scale } from 'react-native-size-matters';

type Tab = {
  id: string;
  title: string;
};

type LatestSeasonScreenNavigationProp = any; // adapt this as needed

const NUM_COLUMNS = 5;
const CARD_ASPECT_RATIO = 16 / 9;
const ITEM_HORIZONTAL_SPACING = 24;

const LatestSeason: React.FC = () => {
  const navigation = useNavigation<LatestSeasonScreenNavigationProp>();
  const dispatch = useDispatch();
  const latestVideosData = useSelector((state: any) => state.latestSeason?.data);
  const dataFetchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Tabs (you can add more if needed)
  const [tabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'latestSeason', title: 'Latest Season' },
    { id: 'premium', title: 'Premium' },
    { id: 'featured', title: 'Featured' },
    { id: 'mylist', title: 'My List' },
  ]);
  const [selectedTab, setSelectedTab] = useState('latestSeason');
  const [focusedTab, setFocusedTab] = useState('latestSeason');
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');

  const windowWidth = Dimensions.get('window').width;
  const totalSpacing = ITEM_HORIZONTAL_SPACING * (NUM_COLUMNS + 1);
  const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemMargin = ITEM_HORIZONTAL_SPACING / 2;

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');
        if (storedSubscription) setSubscriptionData(JSON.parse(storedSubscription));
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }
    };
    fetchSubscriptionData();
  }, []);

  const fetchLatestVideos = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiHelper.get(
        `${SEASON_LIST}?page=${pageNum}&limit=${PAGE_LIMIT}&trending=false`
      );
      const res = response?.data;

      if (res?.data) {
        if (isRefresh) {
          dispatch(setLatestSeasonData(res?.data));
        } else {
          dispatch(appendLatestSeasonData(res?.data));
        }
        setTotalPages(res?.totalPages);
      }
    } catch (error) {
      console.error('Error fetching latest videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setLatestSeasonData([]));
      fetchLatestVideos(1);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetLatestSeasonData());
    fetchLatestVideos(1, true);
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLatestVideos(nextPage);
    }
  }, [page, totalPages, loading]);

  const handleSeasonPress = (item: any) => {
    navigation.navigate('VODScreen', { seasonID: item?._id });
  };

  // Tab navigation handler
  const handleTabPress = (tabId: string) => {
    setSelectedTab(tabId);
    setFocusedTab(tabId);
    switch (tabId) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'latestSeason':
        navigation.navigate('LatestSeason');
        break;
      case 'premium':
        navigation.navigate('PremiumVideos');
        break;
      case 'featured':
        navigation.navigate('Featured'); // update route name if required
        break;
      case 'mylist':
        // navigation.navigate('AllVideosScreen');
        break;
    }
  };

  // TV Remote navigation
  useTVEventHandler(evt => {
    if (evt?.eventType === 'down' && rowFocus === 'tabs') {
      setRowFocus('content');
    } else if (evt?.eventType === 'up' && rowFocus === 'content') {
      setRowFocus('tabs');
    }
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;

    return (
      <TouchableOpacity
        onPress={() => handleSeasonPress(item)}
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
            { width: cardWidth, height: cardHeight },
          ]}
        >
          <Image
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobileBanner}` }}
            style={styles.image}
          />
          {!subscriptionData && item?.access === 'Paid' && (
            <View style={styles.subscriptionContainer}>
              <FIcon name="crown" size={scale(8)} style={styles.subscriptionIcon} />
            </View>
          )}
        </View>
        {/* <Text style={[styles.showTitle, isFocused && styles.focusedShowTitle]} numberOfLines={1}>
          {item?.title || item?.name || ''}
        </Text> */}
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any, index: number) => `${item?._id}-${index}`;

  const gridWidth = NUM_COLUMNS * cardWidth + (NUM_COLUMNS + 1) * itemMargin;

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={() => navigation.goBack()} />
      <Header
        title=""
        showLogo
        showBack={false}
        showSearch
        showLogout
        onSearchPress={() => navigation.navigate('SearchVideosTV')}
      />

      {/* Tab Bar */}
      {/* <View style={styles.tabBarContainer}>
        <TabMenuBar
          tabs={tabs}
          selectedTab={selectedTab}
          focusedTab={focusedTab}
          rowFocus={rowFocus}
          onTabPress={handleTabPress}
          onTabFocus={setFocusedTab}
        />
        <ProfileSelector
          onProfileChange={() => {
            onRefresh();
          }}
        />
      </View> */}

      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>Latest Season</Text>
        </View>

        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : latestVideosData?.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Latest Videos Found</Text>
          </View>
        ) : (
          <FlatList
            data={latestVideosData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.7}
            contentContainerStyle={{
              width: gridWidth,
              alignSelf: 'center',
              paddingBottom: scale(40),
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListFooterComponent={
              loading && page > 1 ? <ActivityIndicator size="small" color={COLORS.primary} /> : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default LatestSeason;
