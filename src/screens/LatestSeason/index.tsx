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
import KeyEvent from 'react-native-keyevent';
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

// Navigation type
type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

const NUM_COLUMNS = 5;
const CARD_ASPECT_RATIO = 16 / 9;
const ITEM_HORIZONTAL_SPACING = 24;

const LatestSeason: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const latestVideosData = useSelector((state: any) => state.latestSeason?.data);
  const dataFetchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // 🟦 Tab menu state with smooth navigation
  const [tabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'channels', title: 'Channels' },
    { id: 'premium', title: 'Premium' },
    { id: 'featured', title: 'Featured' },
  ]);
  const [selectedTab, setSelectedTab] = useState('featured');
  const [focusedTab, setFocusedTab] = useState('featured');
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');
  const [tabFocusIndex, setTabFocusIndex] = useState<number>(3); // Start with featured tab

  // 🔧 Focus Management
  const lastKeyPressTime = useRef<number>(0);
  const keyPressDebounceTime = 200;

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
      
      // 🎯 Reset focus to tabs when screen comes into focus
      if (Platform.isTV) {
        console.log('LatestSeason screen focused - resetting navigation state');
        setRowFocus('tabs');
        setTabFocusIndex(3); // Focus on featured tab
        setFocusedTab('featured');
        setFocusedIndex(0);
        lastKeyPressTime.current = 0;
        
        // Add a small delay to ensure proper focus
        setTimeout(() => {
          console.log('LatestSeason - Focus reset completed');
        }, 100);
      }
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

  // 🎯 Smooth Tab Navigation
  const navigateTabs = useCallback((direction: 'left' | 'right') => {
    const currentTime = Date.now();
    if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
      return;
    }
    lastKeyPressTime.current = currentTime;
    
    console.log('Navigating tabs:', direction, 'Current index:', tabFocusIndex);
    
    if (direction === 'left') {
      const newIndex = Math.max(0, tabFocusIndex - 1);
      setTabFocusIndex(newIndex);
      setFocusedTab(tabs[newIndex].id);
    } else {
      const newIndex = Math.min(tabs.length - 1, tabFocusIndex + 1);
      setTabFocusIndex(newIndex);
      setFocusedTab(tabs[newIndex].id);
    }
  }, [tabFocusIndex, tabs]);

  // ✅ Smooth Tab Navigation Handler
  const handleTabPress = (tabId: string) => {
    setSelectedTab(tabId);
    setFocusedTab(tabId);

    switch (tabId) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'channels':
        navigation.navigate('Channels');
        break;
      case 'premium':
        navigation.navigate('PremiumVideos');
        break;
      case 'featured':
        navigation.navigate('LatestSeason');
        break;
      default:
        break;
    }
  };

  // 🔁 Smooth TV Remote Navigation
  useTVEventHandler((evt) => {
    if (!Platform.isTV || !evt || Platform.OS === 'android') return;

    const currentTime = Date.now();
    if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
      return;
    }
    lastKeyPressTime.current = currentTime;

    switch (evt.eventType) {
      case 'up':
        if (rowFocus === 'content') {
          setRowFocus('tabs');
          setTabFocusIndex(3); // Focus on featured tab
        }
        break;
      case 'down':
        if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedIndex(0);
        }
        break;
      case 'left':
        if (rowFocus === 'tabs') {
          navigateTabs('left');
        }
        break;
      case 'right':
        if (rowFocus === 'tabs') {
          navigateTabs('right');
        }
        break;
      case 'select':
        if (rowFocus === 'tabs') {
          handleTabPress(focusedTab);
        } else if (rowFocus === 'content' && latestVideosData[focusedIndex]) {
          handleSeasonPress(latestVideosData[focusedIndex]);
        }
        break;
    }
  });

  // Android TV Key Event Handler - Fixed for focus issues
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      console.log('LatestSeason - Setting up Android TV KeyEvent listener');
      KeyEvent.onKeyDownListener((keyEvent: any) => {
        console.log('LatestSeason - Android TV Key:', keyEvent.keyCode);
        handleAndroidTVKey(keyEvent.keyCode);
      });

      return () => {
        console.log('LatestSeason - Removing Android TV KeyEvent listener');
        KeyEvent.removeKeyDownListener();
      };
    }
  }, [rowFocus, focusedIndex, tabFocusIndex, focusedTab, latestVideosData]);

  const handleAndroidTVKey = (keyCode: number) => {
    const currentTime = Date.now();
    if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
      return;
    }
    lastKeyPressTime.current = currentTime;
    
    console.log('LatestSeason - Android TV Key Pressed:', keyCode, 'Row Focus:', rowFocus, 'Focus Index:', focusedIndex);
    
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        console.log('⬆️ LatestSeason - UP pressed');
        if (rowFocus === 'content') {
          // Calculate previous row in grid
          const currentRow = Math.floor(focusedIndex / NUM_COLUMNS);
          if (currentRow > 0) {
            // Move up within content grid
            const newIndex = Math.max(0, focusedIndex - NUM_COLUMNS);
            setFocusedIndex(newIndex);
            console.log('Moving up in grid from', focusedIndex, 'to', newIndex);
          } else {
            // Move to tabs
            setRowFocus('tabs');
            setTabFocusIndex(3); // Focus on featured tab
            setFocusedTab('featured');
            console.log('Moving from content to tabs');
          }
        }
        break;
      case 20: // KEYCODE_DPAD_DOWN
        console.log('⬇️ LatestSeason - DOWN pressed');
        if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedIndex(0);
          console.log('Moving from tabs to content');
        } else if (rowFocus === 'content') {
          // Calculate next row in grid
          const totalItems = latestVideosData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + NUM_COLUMNS);
          if (newIndex !== focusedIndex && newIndex < totalItems) {
            setFocusedIndex(newIndex);
            console.log('Moving down in grid from', focusedIndex, 'to', newIndex);
          }
        }
        break;
      case 21: // KEYCODE_DPAD_LEFT
        console.log('⬅️ LatestSeason - LEFT pressed');
        if (rowFocus === 'tabs') {
          navigateTabs('left');
        } else if (rowFocus === 'content') {
          // Navigate left in content grid
          const newIndex = Math.max(0, focusedIndex - 1);
          setFocusedIndex(newIndex);
          console.log('Moving left in grid from', focusedIndex, 'to', newIndex);
        }
        break;
      case 22: // KEYCODE_DPAD_RIGHT
        console.log('➡️ LatestSeason - RIGHT pressed');
        if (rowFocus === 'tabs') {
          navigateTabs('right');
        } else if (rowFocus === 'content') {
          // Navigate right in content grid
          const totalItems = latestVideosData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + 1);
          setFocusedIndex(newIndex);
          console.log('Moving right in grid from', focusedIndex, 'to', newIndex);
        }
        break;
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        console.log('✅ LatestSeason - SELECT pressed');
        if (rowFocus === 'tabs') {
          handleTabPress(focusedTab);
        } else if (rowFocus === 'content' && latestVideosData && latestVideosData[focusedIndex]) {
          handleSeasonPress(latestVideosData[focusedIndex]);
        }
        break;
      case 4: // KEYCODE_BACK
        console.log('🔙 LatestSeason - BACK pressed');
        navigation.goBack();
        break;
      default:
        console.log('LatestSeason - Unknown Android TV key:', keyCode);
        break;
    }
  };

  // Handle data changes and maintain focus
  useEffect(() => {
    if (latestVideosData && latestVideosData.length > 0 && rowFocus === 'content') {
      // Ensure focusedIndex is within bounds
      if (focusedIndex >= latestVideosData.length) {
        setFocusedIndex(0);
      }
    }
  }, [latestVideosData, focusedIndex, rowFocus]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex && rowFocus === 'content';

    return (
      <TouchableOpacity
        onPress={() => handleSeasonPress(item)}
        onFocus={() => {
          if (Platform.isTV) {
            const currentTime = Date.now();
            if (currentTime - lastKeyPressTime.current < keyPressDebounceTime) {
              return;
            }
            lastKeyPressTime.current = currentTime;
            
            console.log('Season focused:', index, item?.name);
            setFocusedIndex(index);
            setRowFocus('content');
          }
        }}
        hasTVPreferredFocus={index === 0 && rowFocus === 'content'}
        focusable={Platform.isTV}
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

      {/* ✅ Smooth Tab Bar */}
      <View style={styles.tabBarContainer}>
        <TabMenuBar
          tabs={tabs}
          selectedTab={selectedTab}
          focusedTab={focusedTab}
          rowFocus={rowFocus}
          onTabPress={handleTabPress}
          onTabFocus={setFocusedTab}
          tabFocusIndex={tabFocusIndex}
          setTabFocusIndex={setTabFocusIndex}
        />
        <ProfileSelector
          onProfileChange={() => {
            onRefresh();
          }}
        />
      </View>

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

export default LatestSeason;
