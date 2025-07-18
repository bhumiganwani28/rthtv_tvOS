// export default SearchVideosTV;
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
  const navigation = useNavigation();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [seasonsData, setSeasonsData] = useState<SeasonItem[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [focusedTrendingIndex, setFocusedTrendingIndex] = useState<
    number | null
  >(null);
  const [searchIconFocused, setSearchIconFocused] = useState(false);

  const allSeasonsFetched = useRef(false);
  const flatListRef = useRef<FlatList>(null);

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
    await fetchSeasons(item.id, 1);
  };

  const handleSeasonPress = (item: SeasonItem) => {
    console.log("item>",item);
    
    // navigation.navigate('VODScreen', {seasonID: item?._id});
  };

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
    const isFocused = focusedTrendingIndex === index;

    const combinedStyle = [
      styles.trendingItem,
      isSelected && styles.trendingSelected,
      isFocused && styles.trendingFocused,
    ];

    return (
      <TouchableOpacity
        focusable={Platform.isTV}
        onFocus={() => setFocusedTrendingIndex(index)}
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
    const isFocused = focusedIndex === index;

    return (
      <TouchableOpacity
        onPress={() => handleSeasonPress(item)}
        focusable={Platform.isTV}
        hasTVPreferredFocus={index === 0}
        onFocus={() => setFocusedIndex(index)}
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
          onPress={() => navigation.navigate('SearchScreenTV')}
          focusable={Platform.isTV}
          onFocus={() => setSearchIconFocused(true)}
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
          horizontal
          data={trendingData}
          renderItem={renderTrendingItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
         paddingBottom: scale(10),
}}
          // contentContainerStyle={{paddingBottom: scale(10)}} // No marginBottom here
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
