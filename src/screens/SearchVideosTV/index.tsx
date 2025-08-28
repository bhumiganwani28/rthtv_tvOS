// export default SearchVideosTV;
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  useTVEventHandler,
  BackHandler,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  SEASON_ALL,
  SEASON_LIST,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import apiHelper from '../../config/apiHelper';
import {COLORS} from '../../theme/colors';
import styles from './styles'; // Custom style file (see below)
import {scale} from 'react-native-size-matters';
import FFIcon from 'react-native-vector-icons/Feather';
import KeyEvent from 'react-native-keyevent';

interface TrendingItem {
  id: string;
  name: string;
}
interface SeasonItem {
  _id: string;
  mobilePosterImage: string;
  access?: string;
}

const NUM_COLUMNS = 5; // Grid columns
const screenWidth = Dimensions.get('window').width;
const ITEM_SPACING = scale(26);
const totalSpacing = ITEM_SPACING * (NUM_COLUMNS + 1);
const cardWidth = (screenWidth - totalSpacing) / NUM_COLUMNS;
const cardHeight = cardWidth * 1.4;
const itemMargin = ITEM_SPACING / 1.5;

const SearchVideosTV: React.FC = () => {
  const navigation = useNavigation<any>();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [seasonsData, setSeasonsData] = useState<SeasonItem[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // TV Navigation States
  const [currentSection, setCurrentSection] = useState<'trending' | 'search' | 'seasons'>('trending');
  const [focusedTrendingIndex, setFocusedTrendingIndex] = useState<number>(0);
  const [focusedSeasonIndex, setFocusedSeasonIndex] = useState<number>(0);
  const [searchIconFocused, setSearchIconFocused] = useState(false);

  const allSeasonsFetched = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const trendingListRef = useRef<FlatList>(null);
  const isKeyEventEnabled = useRef<boolean>(false);

  // Fetch trending channels
  const fetchTrendingData = async () => {
    try {
      const res = await apiHelper.get(SEASON_ALL);
      if (res?.status === 200) {
        setTrendingData(res.data?.data || []);
      }
    } catch (error) {
      console.error('Trending fetch error:', error);
    }
  };

  const fetchSeasons = async (channelId?: string, pageNumber = 1) => {
    if (loading) return;
    setLoading(true);

    const endpoint = channelId
      ? `${SEASON_LIST}?page=${pageNumber}&limit=${PAGE_LIMIT}&channelId=${channelId}`
      : `${SEASON_LIST}?page=${pageNumber}&limit=${PAGE_LIMIT}`;

    try {
      const res = await apiHelper.get(endpoint);
      if (res?.status === 200) {
        const items = res?.data?.data || [];
        setSeasonsData(prev =>
          pageNumber === 1 ? items : [...prev, ...items],
        );
        setHasMore(items.length === PAGE_LIMIT);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Season fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingSelect = async (item: TrendingItem) => {
    setSeasonsData([]); // reset
    setSelectedChannelId(item.id);
    setPage(1);
    setFocusedSeasonIndex(0);
    setCurrentSection('seasons');
    await fetchSeasons(item.id, 1);
  };

  const handleSeasonPress = (item: SeasonItem) => {
    console.log("item>",item);
    navigation.navigate('VODScreen', {seasonID: item?._id});
  };

  const handleSearchPress = () => {
    navigation.navigate('SearchScreenTV');
  };

  // TV Navigation Functions
  const handleUpNavigation = useCallback(() => {
    console.log('SearchVideosTV - UP pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'trending':
        // Move to search icon
        setCurrentSection('search');
        setSearchIconFocused(true);
        break;
      case 'search':
        // Stay on search icon
        break;
      case 'seasons':
        // Move to trending section
        setCurrentSection('trending');
        setFocusedTrendingIndex(0);
        break;
    }
  }, [currentSection]);

  const handleDownNavigation = useCallback(() => {
    console.log('SearchVideosTV - DOWN pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'trending':
        // Move to seasons section
        setCurrentSection('seasons');
        setFocusedSeasonIndex(0);
        break;
      case 'search':
        // Move to seasons section
        setCurrentSection('seasons');
        setFocusedSeasonIndex(0);
        break;
      case 'seasons':
        // Stay in seasons section, move down in grid
        const nextRow = focusedSeasonIndex + NUM_COLUMNS;
        if (nextRow < seasonsData.length) {
          setFocusedSeasonIndex(nextRow);
        }
        break;
    }
  }, [currentSection, focusedSeasonIndex, seasonsData.length]);

  const handleLeftNavigation = useCallback(() => {
    console.log('SearchVideosTV - LEFT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'trending':
        // Move left in trending list
        if (focusedTrendingIndex > 0) {
          setFocusedTrendingIndex(focusedTrendingIndex - 1);
        }
        break;
      case 'search':
        // Move to trending section
        setCurrentSection('trending');
        setFocusedTrendingIndex(trendingData.length - 1);
        break;
      case 'seasons':
        // Move left in grid
        if (focusedSeasonIndex % NUM_COLUMNS > 0) {
          setFocusedSeasonIndex(focusedSeasonIndex - 1);
        }
        break;
    }
  }, [currentSection, focusedTrendingIndex, focusedSeasonIndex, trendingData.length]);

  const handleRightNavigation = useCallback(() => {
    console.log('SearchVideosTV - RIGHT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'trending':
        // Move right in trending list
        if (focusedTrendingIndex < trendingData.length - 1) {
          setFocusedTrendingIndex(focusedTrendingIndex + 1);
        } else {
          // Move to search icon
          setCurrentSection('search');
          setSearchIconFocused(true);
        }
        break;
      case 'search':
        // Move to trending section
        setCurrentSection('trending');
        setFocusedTrendingIndex(0);
        break;
      case 'seasons':
        // Move right in grid
        if (focusedSeasonIndex % NUM_COLUMNS < NUM_COLUMNS - 1 && focusedSeasonIndex < seasonsData.length - 1) {
          setFocusedSeasonIndex(focusedSeasonIndex + 1);
        }
        break;
    }
  }, [currentSection, focusedTrendingIndex, focusedSeasonIndex, trendingData.length, seasonsData.length]);

  const handleSelectNavigation = useCallback(() => {
    console.log('SearchVideosTV - SELECT pressed, Current section:', currentSection);
    
    switch (currentSection) {
      case 'trending':
        if (trendingData[focusedTrendingIndex]) {
          handleTrendingSelect(trendingData[focusedTrendingIndex]);
        }
        break;
      case 'search':
        handleSearchPress();
        break;
      case 'seasons':
        if (seasonsData[focusedSeasonIndex]) {
          handleSeasonPress(seasonsData[focusedSeasonIndex]);
        }
        break;
    }
  }, [currentSection, focusedTrendingIndex, focusedSeasonIndex, trendingData, seasonsData]);

  const handleBackPress = useCallback(() => {
    console.log('SearchVideosTV - BACK pressed');
    navigation.goBack();
    return true;
  }, [navigation]);

  // Android TV Key Event Handler
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      KeyEvent.onKeyDownListener((keyEvent: any) => {
        console.log('SearchVideosTV - KeyEvent:', keyEvent);
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

        console.log('SearchVideosTV - TV Event:', evt.eventType);
        
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

  useEffect(() => {
    if (!allSeasonsFetched.current) {
      allSeasonsFetched.current = true;
      fetchTrendingData();
      fetchSeasons(); // All seasons by default
    }
  }, []);

  const renderTrendingItem = ({
    item,
    index,
  }: {
    item: TrendingItem;
    index: number;
  }) => {
    const isSelected = selectedChannelId === item.id;
    const isFocused = currentSection === 'trending' && focusedTrendingIndex === index;

    const combinedStyle = [
      styles.trendingItem,
      isSelected && styles.trendingSelected,
      isFocused && styles.trendingFocused,
    ];

    return (
      <TouchableOpacity
        focusable={Platform.isTV}
        hasTVPreferredFocus={isFocused}
        onFocus={() => {
          if (Platform.isTV) {
            setCurrentSection('trending');
            setFocusedTrendingIndex(index);
          }
        }}
        onPress={() => handleTrendingSelect(item)}
        style={combinedStyle}>
        <Text style={styles.trendingText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderSeasonItem = ({
    item,
    index,
  }: {
    item: SeasonItem;
    index: number;
  }) => {
    const isFocused = currentSection === 'seasons' && focusedSeasonIndex === index;

    return (
      <TouchableOpacity
        onPress={() => handleSeasonPress(item)}
        focusable={Platform.isTV}
        hasTVPreferredFocus={isFocused}
        onFocus={() => {
          if (Platform.isTV) {
            setCurrentSection('seasons');
            setFocusedSeasonIndex(index);
          }
        }}
        style={{
          width: cardWidth,
          height: cardHeight,
          marginHorizontal: itemMargin / 1.5,
          marginVertical: itemMargin / 1.5,
        }}>
        <View
          style={[
            styles.itemContainer,
            isFocused && styles.focusedItemContainer,
            {width: cardWidth, height: cardHeight},
          ]}>
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobilePosterImage}`,
            }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ========= "Trending In" with Search Icon ========= */}
      <View
        style={[
          styles.trendingHeaderRow,
          {paddingHorizontal: scale(20), marginBottom: scale(10)},
        ]}>
        <Text style={styles.headerTitle}>Trending In</Text>
        <TouchableOpacity
          onPress={handleSearchPress}
          focusable={Platform.isTV}
          hasTVPreferredFocus={currentSection === 'search'}
          onFocus={() => {
            if (Platform.isTV) {
              setCurrentSection('search');
              setSearchIconFocused(true);
            }
          }}
          onBlur={() => setSearchIconFocused(false)}
          style={[
            styles.searchIconButton,
            searchIconFocused && styles.focusedSearchIcon,
          ]}>
          <FFIcon name="search" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* ========== Trending List ========== */}
      <View 
      style={{
        paddingHorizontal: scale(20),
      }}>
        <FlatList
          ref={trendingListRef}
          horizontal
          data={trendingData}
          renderItem={renderTrendingItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
         paddingBottom: scale(10),
}}
        />
      </View>
      
      {/* ========== Season List Results ========== */}
      {loading && seasonsData.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={seasonsData}
          keyExtractor={item => item._id}
          renderItem={renderSeasonItem}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: itemMargin,
            paddingBottom: scale(60),
          }}
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchSeasons(selectedChannelId || undefined, page);
            }
          }}
          onEndReachedThreshold={0.7}
        />
      )}
    </View>
  );
};

export default SearchVideosTV;
