import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  useTVEventHandler,
  BackHandler,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
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
import { COLORS } from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import styles from './styles';
import { s, scale } from 'react-native-size-matters';
import CInput from '../../components/CInput';
import KeyEvent from 'react-native-keyevent';

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const channelsData = useSelector((state: any) => state.channels?.data);
  const trendingVideosData = useSelector(
    (state: any) => state.trendingVideos?.data,
  );
  const route = useRoute();
  const { query } = route.params || {};
  const [searchText, setSearchText] = useState(query || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  // TV Navigation States
  const [currentSection, setCurrentSection] = useState<'search' | 'clear' | 'tabs' | 'content'>('search');
  const [focusedTabIndex, setFocusedTabIndex] = useState<number>(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [clearButtonFocused, setClearButtonFocused] = useState(false);

  const isKeyEventEnabled = useRef<boolean>(false);

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
      navigation.navigate('ChannelDetails', { channelId: item?.id });
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
     navigation.goBack();
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
    setFocusedItemIndex(0);
    setCurrentSection('content');
    tabIndex === 0
      ? dispatch(resetChannelsData())
      : dispatch(resetTrendingVideosData());
    fetchData(1, true);
  };

  // TV Navigation Functions
  const handleUpNavigation = useCallback(() => {
    console.log('SearchScreenTV - UP pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'search':
        // Stay on search input
        break;
      case 'clear':
        // Move to search input
        setCurrentSection('search');
        setSearchInputFocused(true);
        break;
      case 'tabs':
        // Move to clear button
        setCurrentSection('clear');
        setClearButtonFocused(true);
        break;
      case 'content':
        // Move to tabs
        setCurrentSection('tabs');
        setFocusedTabIndex(activeTab);
        break;
    }
  }, [currentSection, activeTab]);

  const handleDownNavigation = useCallback(() => {
    console.log('SearchScreenTV - DOWN pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'search':
        // Move to clear button
        setCurrentSection('clear');
        setClearButtonFocused(true);
        break;
      case 'clear':
        // Move to tabs
        setCurrentSection('tabs');
        setFocusedTabIndex(activeTab);
        break;
      case 'tabs':
        // Move to content
        setCurrentSection('content');
        setFocusedItemIndex(0);
        break;
      case 'content':
        // Stay in content, move down in grid
        const currentData = activeTab === 0 ? channelsData : trendingVideosData;
        const nextRow = focusedItemIndex + NUM_COLUMNS;
        if (nextRow < currentData.length) {
          setFocusedItemIndex(nextRow);
        }
        break;
    }
  }, [currentSection, activeTab, focusedItemIndex, channelsData.length, trendingVideosData.length]);

  const handleLeftNavigation = useCallback(() => {
    console.log('SearchScreenTV - LEFT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'search':
        // Stay on search input
        break;
      case 'clear':
        // Move to search input
        setCurrentSection('search');
        setSearchInputFocused(true);
        break;
      case 'tabs':
        // Move left in tabs
        if (focusedTabIndex > 0) {
          setFocusedTabIndex(focusedTabIndex - 1);
        }
        break;
      case 'content':
        // Move left in grid
        if (focusedItemIndex % NUM_COLUMNS > 0) {
          setFocusedItemIndex(focusedItemIndex - 1);
        }
        break;
    }
  }, [currentSection, focusedTabIndex, focusedItemIndex]);

  const handleRightNavigation = useCallback(() => {
    console.log('SearchScreenTV - RIGHT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'search':
        // Move to clear button
        setCurrentSection('clear');
        setClearButtonFocused(true);
        break;
      case 'clear':
        // Move to tabs
        setCurrentSection('tabs');
        setFocusedTabIndex(0);
        break;
      case 'tabs':
        // Move right in tabs
        if (focusedTabIndex < 1) {
          setFocusedTabIndex(focusedTabIndex + 1);
        }
        break;
      case 'content':
        // Move right in grid
        const currentData = activeTab === 0 ? channelsData : trendingVideosData;
        if (focusedItemIndex % NUM_COLUMNS < NUM_COLUMNS - 1 && focusedItemIndex < currentData.length - 1) {
          setFocusedItemIndex(focusedItemIndex + 1);
        }
        break;
    }
  }, [currentSection, focusedTabIndex, focusedItemIndex, activeTab, channelsData.length, trendingVideosData.length]);

  const handleSelectNavigation = useCallback(() => {
    console.log('SearchScreenTV - SELECT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'search':
        // Focus search input for typing
        setSearchInputFocused(true);
        break;
      case 'clear':
        handleClear();
        break;
      case 'tabs':
        // Switch to focused tab
        switchTab(focusedTabIndex);
        break;
      case 'content':
        // Select current item
        const currentData = activeTab === 0 ? channelsData : trendingVideosData;
        if (currentData[focusedItemIndex]) {
          handlePress(currentData[focusedItemIndex]);
        }
        break;
    }
  }, [currentSection, focusedTabIndex, focusedItemIndex, activeTab, channelsData, trendingVideosData]);

  const handleBackPress = useCallback(() => {
    console.log('SearchScreenTV - BACK pressed');
    navigation.goBack();
    return true;
  }, [navigation]);

  // Android TV Key Event Handler
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      KeyEvent.onKeyDownListener((keyEvent: any) => {
        console.log('SearchScreenTV - KeyEvent:', keyEvent);
        handleAndroidTVKey(keyEvent.keyCode);
      });
      isKeyEventEnabled.current = true;
    }

    return () => {
      if (isKeyEventEnabled.current) {
        KeyEvent.removeKeyDownListener();
      }
    };
  }, []);

  const handleAndroidTVKey = useCallback((keyCode: number) => {
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        handleUpNavigation();
        break;
      case 20: // KEYCODE_DPAD_DOWN
        handleDownNavigation();
        break;
      case 21: // KEYCODE_DPAD_LEFT
        handleLeftNavigation();
        break;
      case 22: // KEYCODE_DPAD_RIGHT
        handleRightNavigation();
        break;
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        handleSelectNavigation();
        break;
      case 4: // KEYCODE_BACK
        handleBackPress();
        break;
    }
  }, [handleUpNavigation, handleDownNavigation, handleLeftNavigation, handleRightNavigation, handleSelectNavigation, handleBackPress]);

  // Apple TV Event Handler
  useTVEventHandler(
    useCallback(
      (evt) => {
        if (!Platform.isTV || !evt || Platform.OS === 'android') return;

        console.log('SearchScreenTV - TV Event:', evt.eventType);
        
        switch (evt.eventType) {
          case 'up':
            handleUpNavigation();
            break;
          case 'down':
            handleDownNavigation();
            break;
          case 'left':
            handleLeftNavigation();
            break;
          case 'right':
            handleRightNavigation();
            break;
          case 'select':
            handleSelectNavigation();
            break;
          case 'back':
            handleBackPress();
            break;
        }
      },
      [handleUpNavigation, handleDownNavigation, handleLeftNavigation, handleRightNavigation, handleSelectNavigation, handleBackPress]
    )
  );

  // Android Back Handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android' && Platform.isTV) {
          handleBackPress();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        // Note: BackHandler.removeEventListener might not be available in all React Native versions
        // The event listener will be cleaned up when the component unmounts
      };
    }, [handleBackPress])
  );

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
      } catch { }
    };
    fetchSubscriptionData();
  }, []);

  const keyExtractor = (item: any, index: number) => `${item?.id}-${index}`;

  const renderChannelItem = ({ item, index }: { item: any, index: number }) => {
    const isFocused = currentSection === 'content' && focusedItemIndex === index && activeTab === 0;
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
        focusable={Platform.isTV}
        hasTVPreferredFocus={isFocused}
        onFocus={() => {
          if (Platform.isTV) {
            setCurrentSection('content');
            setFocusedItemIndex(index);
          }
        }}>
        <View
          style={[
            styles.itemContainer,
            isFocused && styles.focusedItemContainer,
            {
              width: cardWidth,
              height: cardHeight,
              borderWidth: isFocused ? scale(3) : 0,
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

  const renderTrendingItem = ({ item, index }: { item: any, index: number }) => {
    const isFocused = currentSection === 'content' && focusedItemIndex === index && activeTab === 1;
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
        focusable={Platform.isTV}
        hasTVPreferredFocus={isFocused}
        onFocus={() => {
          if (Platform.isTV) {
            setCurrentSection('content');
            setFocusedItemIndex(index);
          }
        }}>
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
        <CInput
          placeholder="Search here..."
          value={searchText}
          onChangeText={setSearchText}
          keyboardType="default"
          containerStyle={{ marginRight: 8 }}
          onPress={() => { }}
          style={{
            minHeight: scale(22),
            justifyContent: 'center',
            width: '95%'
          }}
           onSubmitEditing={handleSearch} 
          focusable={Platform.isTV}
          hasTVPreferredFocus={currentSection === 'search'}
          onFocus={() => {
            if (Platform.isTV) {
              setCurrentSection('search');
              setSearchInputFocused(true);
            }
          }}
          onBlur={() => setSearchInputFocused(false)}
        />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <TouchableOpacity
            onPress={handleClear}
            focusable={Platform.isTV}
            hasTVPreferredFocus={currentSection === 'clear'}
            onFocus={() => {
              if (Platform.isTV) {
                setCurrentSection('clear');
                setClearButtonFocused(true);
              }
            }}
            onBlur={() => setClearButtonFocused(false)}
            style={[
              styles.clearIcon, 
              { width: scale(25), height: scale(25), borderRadius: scale(5) },
              clearButtonFocused && styles.focusedTabItem
            ]}
          >
            <FIcon name="x" size={scale(15)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 0 && styles.activeTab,
            currentSection === 'tabs' && focusedTabIndex === 0 && styles.focusedTabItem,
          ]}
          onPress={() => switchTab(0)}
          focusable={Platform.isTV}
          hasTVPreferredFocus={currentSection === 'tabs' && focusedTabIndex === 0}
          onFocus={() => {
            if (Platform.isTV) {
              setCurrentSection('tabs');
              setFocusedTabIndex(0);
            }
          }}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 0 && styles.activeText,
              currentSection === 'tabs' && focusedTabIndex === 0 && styles.focusedTabText,
            ]}
          >
            Channels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 1 && styles.activeTab,
            currentSection === 'tabs' && focusedTabIndex === 1 && styles.focusedTabItem,
          ]}
          onPress={() => switchTab(1)}
          focusable={Platform.isTV}
          hasTVPreferredFocus={currentSection === 'tabs' && focusedTabIndex === 1}
          onFocus={() => {
            if (Platform.isTV) {
              setCurrentSection('tabs');
              setFocusedTabIndex(1);
            }
          }}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 1 && styles.activeText,
              currentSection === 'tabs' && focusedTabIndex === 1 && styles.focusedTabText,
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