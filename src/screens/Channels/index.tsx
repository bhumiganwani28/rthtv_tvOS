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
  CHANNELS,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import Header from '../../components/Header';
import ProfileSelector from "../../components/ProfileSelector";
import { COLORS } from '../../theme/colors';
import {
  setChannelsData,
  appendChannelsData,
  resetChannelsData,
} from '../../redux/slices/channelsSlice';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import TabMenuBar from '../../components/TabMenuBar';
import { useTVEventHandler } from 'react-native';
import { scale } from 'react-native-size-matters';

// Tab type
type Tab = {
  id: string;
  title: string;
};

// Navigation type
type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

const Channels: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const channelsData = useSelector((state: any) => state.channels?.data);
  const dataFetchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // 🟦 Tab menu state with smooth navigation
  const [tabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'channels', title: 'Channels' },
    { id: 'premium', title: 'Premium' },
    { id: 'featured', title: 'Featured' },
  ]);
  const [selectedTab, setSelectedTab] = useState<string>('channels');
  const [focusedTab, setFocusedTab] = useState<string>('channels');
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');
  const [tabFocusIndex, setTabFocusIndex] = useState<number>(1); // Start with channels tab

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

  const handleChannelPress = (item: any) => {
    // console.log(">channelId>",item);
    
    navigation.navigate('ChannelDetailsTV', { channelId: item?.id });
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

  const fetchChannels = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiHelper.get(
        `${CHANNELS}?page=${pageNum}&limit=${PAGE_LIMIT}`
      );
      const res = response?.data;
      if (res?.data) {
        isRefresh
          ? dispatch(setChannelsData(res?.data))
          : dispatch(appendChannelsData(res?.data));
        setTotalPages(res?.totalPages);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setChannelsData([]));
      fetchChannels(1);
      
      // 🎯 Reset focus to tabs when screen comes into focus
      if (Platform.isTV) {
        console.log('Channels screen focused - resetting navigation state');
        setRowFocus('tabs');
        setTabFocusIndex(1); // Focus on channels tab
        setFocusedTab('channels');
        setFocusedIndex(0);
        
        // Add a small delay to ensure proper focus
        setTimeout(() => {
          console.log('Channels - Focus reset completed');
        }, 100);
      }
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetChannelsData());
    fetchChannels(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChannels(nextPage);
    }
  }, [page, totalPages, loading]);

  // 🎯 Smooth Tab Navigation
  const navigateTabs = useCallback((direction: 'left' | 'right') => {
    console.log('Navigating tabs:', direction, 'Current index:', tabFocusIndex);
    
    if (direction === 'left') {
      const newIndex = Math.max(0, tabFocusIndex - 1);
      setTabFocusIndex(newIndex);
      setFocusedTab(tabs[newIndex].id);
      console.log('Tab navigation left - new index:', newIndex, 'new tab:', tabs[newIndex].id);
    } else {
      const newIndex = Math.min(tabs.length - 1, tabFocusIndex + 1);
      setTabFocusIndex(newIndex);
      setFocusedTab(tabs[newIndex].id);
      console.log('Tab navigation right - new index:', newIndex, 'new tab:', tabs[newIndex].id);
    }
  }, [tabFocusIndex, tabs]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex && rowFocus === 'content';

    return (
      <TouchableOpacity
        onPress={() => handleChannelPress(item)}
        onFocus={() => {
          if (Platform.isTV) {
            console.log('Channel focused:', index, item?.name);
            setFocusedIndex(index);
            setRowFocus('content');
          }
        }}
        onBlur={() => {
          if (Platform.isTV) {
            console.log('Channel unfocused:', index);
          }
        }}
        hasTVPreferredFocus={index === 0 && rowFocus === 'content'}
        focusable={Platform.isTV}
        accessible={Platform.isTV}
        accessibilityRole="button"
        accessibilityLabel={`Channel ${item?.name || 'Unknown'}`}
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
            { width: cardWidth, height: cardHeight,
               borderWidth: isFocused ? scale(3) : 0,
               borderColor: isFocused ? COLORS.white : 'transparent',
            },
          ]}
        >
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.coverImage}`,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    dataFetchedRef.current = false;
    await fetchChannels(1, true);
    setRefreshing(false);
  };

  // 🔁 Smooth TV Remote Navigation
  useTVEventHandler((evt) => {
    if (!Platform.isTV || !evt || Platform.OS === 'android') return;

    switch (evt.eventType) {
      case 'up':
        if (rowFocus === 'content') {
          // Calculate previous row in grid
          const currentRow = Math.floor(focusedIndex / NUM_COLUMNS);
          if (currentRow > 0) {
            // Move up within content grid
            const newIndex = Math.max(0, focusedIndex - NUM_COLUMNS);
            setFocusedIndex(newIndex);
          } else {
            // Move to tabs
            setRowFocus('tabs');
            setTabFocusIndex(1); // Focus on channels tab
          }
        }
        break;
      case 'down':
        if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedIndex(0);
        } else if (rowFocus === 'content') {
          // Calculate next row in grid
          const totalItems = channelsData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + NUM_COLUMNS);
          if (newIndex !== focusedIndex && newIndex < totalItems) {
            setFocusedIndex(newIndex);
          }
        }
        break;
      case 'left':
        if (rowFocus === 'tabs') {
          navigateTabs('left');
        } else if (rowFocus === 'content') {
          const newIndex = Math.max(0, focusedIndex - 1);
          setFocusedIndex(newIndex);
        }
        break;
      case 'right':
        if (rowFocus === 'tabs') {
          navigateTabs('right');
        } else if (rowFocus === 'content') {
          const totalItems = channelsData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + 1);
          setFocusedIndex(newIndex);
        }
        break;
      case 'select':
        if (rowFocus === 'tabs') {
          handleTabPress(focusedTab);
        } else if (rowFocus === 'content' && channelsData && channelsData[focusedIndex]) {
          handleChannelPress(channelsData[focusedIndex]);
        }
        break;
    }
  });

  // Android TV Key Event Handler - Same pattern as Home screen
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      KeyEvent.onKeyDownListener((keyEvent: any) => {
        console.log('Channels - Android TV Key:', keyEvent.keyCode);
        handleAndroidTVKey(keyEvent.keyCode);
      });

      return () => {
        KeyEvent.removeKeyDownListener();
      };
    }
  }, [rowFocus, focusedIndex, tabFocusIndex, focusedTab, channelsData]);

  const handleAndroidTVKey = (keyCode: number) => {
    console.log('Channels - Android TV Key Pressed:', keyCode, 'Row Focus:', rowFocus, 'Focus Index:', focusedIndex);
    
    // Add small delay to prevent rapid key presses
    const currentTime = Date.now();
    if (currentTime - (handleAndroidTVKey as any).lastKeyPressTime < 150) {
      return;
    }
    (handleAndroidTVKey as any).lastKeyPressTime = currentTime;
    
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        console.log('⬆️ Channels - UP pressed');
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
            setTabFocusIndex(1); // Focus on channels tab
            setFocusedTab('channels');
            console.log('Moving from content to tabs');
          }
        }
        break;
      case 20: // KEYCODE_DPAD_DOWN
        console.log('⬇️ Channels - DOWN pressed');
        if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedIndex(0);
          console.log('Moving from tabs to content');
        } else if (rowFocus === 'content') {
          // Calculate next row in grid
          const totalItems = channelsData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + NUM_COLUMNS);
          if (newIndex !== focusedIndex && newIndex < totalItems) {
            setFocusedIndex(newIndex);
            console.log('Moving down in grid from', focusedIndex, 'to', newIndex);
          }
        }
        break;
      case 21: // KEYCODE_DPAD_LEFT
        console.log('⬅️ Channels - LEFT pressed');
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
        console.log('➡️ Channels - RIGHT pressed');
        if (rowFocus === 'tabs') {
          navigateTabs('right');
        } else if (rowFocus === 'content') {
          // Navigate right in content grid
          const totalItems = channelsData?.length || 0;
          const newIndex = Math.min(totalItems - 1, focusedIndex + 1);
          setFocusedIndex(newIndex);
          console.log('Moving right in grid from', focusedIndex, 'to', newIndex);
        }
        break;
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        console.log('✅ Channels - SELECT pressed');
        if (rowFocus === 'tabs') {
          handleTabPress(focusedTab);
        } else if (rowFocus === 'content' && channelsData && channelsData[focusedIndex]) {
          handleChannelPress(channelsData[focusedIndex]);
        }
        break;
      case 4: // KEYCODE_BACK
        console.log('🔙 Channels - BACK pressed');
        handleBackPress();
        break;
      default:
        console.log('Channels - Unknown Android TV key:', keyCode);
        break;
    }
  };

  // Initialize lastKeyPressTime
  (handleAndroidTVKey as any).lastKeyPressTime = 0;

  // Handle data changes and maintain focus
  useEffect(() => {
    if (channelsData && channelsData.length > 0 && rowFocus === 'content') {
      // Ensure focusedIndex is within bounds
      if (focusedIndex >= channelsData.length) {
        setFocusedIndex(0);
      }
    }
  }, [channelsData, focusedIndex, rowFocus]);

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
          onProfileChange={(profile) => {
            console.log('Profile changed:', profile.name);
            handleRefresh();
          }}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>Channels</Text>
        </View>
        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : channelsData?.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Channels Found</Text>
          </View>
        ) : (
          <FlatList
            data={channelsData}
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

export default Channels;
