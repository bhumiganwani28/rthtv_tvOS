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
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
  UPCOMING_SHOWS,
} from '../../config/apiEndpoints';
import Header from '../../components/Header';
import ProfileSelector from "../../components/ProfileSelector";
import { COLORS } from '../../theme/colors';
import {
  appendUpcomingShowsData,
  resetUpcomingShowsData,
  setUpcomingShowsData,
} from '../../redux/slices/upComingShowsSlice';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import TabMenuBar from '../../components/TabMenuBar';
import { useTVEventHandler } from 'react-native';

// Tab type for possible extension if needed
type Tab = { id: string; title: string; };

const NUM_COLUMNS = 5;
const CARD_ASPECT_RATIO = 16 / 9;
const itemHorizontalSpacing = 24;

const UpcomingShows: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const upcomingShowsData = useSelector((state: any) => state.upcomingShows?.data);
  const isTablet = useSelector((state: any) => state.auth.isTablet);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const [focusedIndex, setFocusedIndex] = useState(0);

  // Tab bar state - if you want to keep tabs like Channels screen
  const [tabs] = useState<Tab[]>([
    { id: 'upcoming', title: 'Upcoming' },
    // Add other tabs if needed
  ]);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [focusedTab, setFocusedTab] = useState('upcoming');
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('content'); // default focus on content

  const windowWidth = Dimensions.get('window').width;
  const totalSpacing = itemHorizontalSpacing * (NUM_COLUMNS + 1);
  const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemMargin = itemHorizontalSpacing / 2;

  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

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

  const fetchUpcomingShows = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await apiHelper.get(
        `${UPCOMING_SHOWS}?page=${pageNum}&limit=${PAGE_LIMIT}`,
        { headers: { timezone: timeZone } }
      );
      const res = response?.data;
      if (res?.data) {
        if (isRefresh) {
          dispatch(setUpcomingShowsData(res?.data));
        } else {
          dispatch(appendUpcomingShowsData(res?.data));
        }
        setTotalPages(res?.totalPages);
      }
    } catch (error) {
      console.error('Error fetching upcoming shows:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setUpcomingShowsData([]));
      fetchUpcomingShows(1);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetUpcomingShowsData());
    fetchUpcomingShows(1, true);
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUpcomingShows(nextPage);
    }
  }, [page, totalPages, loading]);

  // Handle TV remote navigation between tabs (if you have multiple)
  useTVEventHandler(evt => {
    if (evt?.eventType === 'down' && rowFocus === 'tabs') {
      setRowFocus('content');
    } else if (evt?.eventType === 'up' && rowFocus === 'content') {
      setRowFocus('tabs');
    }
  });

  const handleTabPress = (tabId: string) => {
    setSelectedTab(tabId);
    setFocusedTab(tabId);
    // You can add different navigation based on tab here
  };

  const handleShowPress = (item: any) => {
    // Navigate or show details as needed
    // e.g. navigation.navigate('ShowDetails', { showId: item?.id });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;
    return (
      <TouchableOpacity
        onPress={() => handleShowPress(item)}
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
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.banner}` }}
            style={styles.image}
          />
          {!subscriptionData && item?.access === 'Paid' && (
            <View style={styles.subscriptionContainer}>
              <FIcon name="crown" size={24} style={styles.subscriptionIcon} />
            </View>
          )}
        </View>
        <Text style={[styles.showTitle, isFocused && styles.focusedShowTitle]} numberOfLines={1}>
          {item?.title || item?.name || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any, index: number) => `${item?.id}-${item?.slug}-${index}`;

  const gridWidth = NUM_COLUMNS * cardWidth + (NUM_COLUMNS + 1) * itemMargin;

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

      {/* Tab bar - optional if you plan to add other tabs */}
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
          onProfileChange={(profile) => {
            console.log('Profile changed:', profile.name);
            onRefresh();
          }}
        />
      </View> */}

      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>Upcoming Shows</Text>
        </View>

        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : upcomingShowsData?.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Shows Found</Text>
          </View>
        ) : (
          <FlatList
            data={upcomingShowsData}
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

export default UpcomingShows;
