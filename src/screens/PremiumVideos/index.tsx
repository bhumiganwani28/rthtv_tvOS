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
import Header from '../../components/Header';
import ProfileSelector from '../../components/ProfileSelector';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import TabMenuBar from '../../components/TabMenuBar';
import apiHelper from '../../config/apiHelper';
import {
  PREMIUM_VIDEOS_API,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import { COLORS } from '../../theme/colors';
import {
  appendPremiumVideosData,
  resetPremiumVideosData,
  setPremiumVideosData,
} from '../../redux/slices/premiumSlice';
import { scale } from 'react-native-size-matters';
import styles from './styles';

type Tab = {
  id: string;
  title: string;
};

const PremiumVideos: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const premiumVideosData = useSelector((state: any) => state.premiumVideos?.data);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');
const [focusedTab, setFocusedTab] = useState<string>('premium');
const [selectedTab, setSelectedTab] = useState<string>('premium');
const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const dataFetchedRef = useRef(false);

  // Grid Config
  const NUM_COLUMNS = 5;
  const screenWidth = Dimensions.get('window').width;
  const ITEM_SPACING = scale(24);
  const totalSpacing = ITEM_SPACING * (NUM_COLUMNS + 1);
  const cardWidth = (screenWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth * 1.35;
  const itemMargin = ITEM_SPACING / 2;

  // Tab Bar Config
  const [tabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'channels', title: 'Channels' },
    { id: 'premium', title: 'Premium' },
    { id: 'featured', title: 'Featured' },
    { id: 'mylist', title: 'My List' },
  ]);


  // Navigation
  const handleTabPress = (tabId: string) => {
    setSelectedTab(tabId);
    setFocusedTab(tabId);
    switch (tabId) {
      case 'home': navigation.navigate('Home'); break;
      case 'channels': navigation.navigate('Channels'); break;
      case 'premium': navigation.navigate('PremiumVideos'); break;
      case 'featured': navigation.navigate('LatestSeason'); break;
      case 'mylist': navigation.navigate('AllVideosScreen'); break;
    }
  };

  const handleTvShowPress = (item: any) => {
    navigation.navigate('VODScreen', { seasonID: item._id });
  };

  const fetchSubscriptionData = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscription');
      if (stored) setSubscriptionData(JSON.parse(stored));
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };

  const fetchPremiumVideos = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiHelper.get(
        `${PREMIUM_VIDEOS_API}?page=${pageNum}&limit=${PAGE_LIMIT}`
      );
      const res = response?.data;
      if (res?.season) {
        if (isRefresh) {
          dispatch(setPremiumVideosData(res.season));
        } else {
          dispatch(appendPremiumVideosData(res.season));
        }
        setTotalPages(res.totalPages);
      }
    } catch (error) {
      console.error('Error fetching premium videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      dispatch(setPremiumVideosData([]));
      fetchPremiumVideos(1);
      fetchSubscriptionData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(resetPremiumVideosData());
    fetchPremiumVideos(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPremiumVideos(nextPage);
    }
  }, [page, totalPages, loading]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;
    return (
      <TouchableOpacity
        focusable={Platform.isTV}
        onPress={() => handleTvShowPress(item)}
        onFocus={() => setFocusedIndex(index)}
        hasTVPreferredFocus={index === 0}
        style={{
          width: cardWidth,
          height: cardHeight,
          marginHorizontal: itemMargin,
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
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobilePosterImage}` }}
            style={styles.image}
          />
          {!subscriptionData && (
            <View style={styles.subscriptionContainer}>
              <FIcon name="crown" size={scale(16)} style={styles.subscriptionIcon} />
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
        showBack={false}
        showSearch
        showLogout
        onSearchPress={() => navigation.navigate('SearchVideos')}
      />
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

      {/* Heading */}
      <View style={styles.contentTitleContainer}>
        <Text style={styles.contentTitle}>Premium Videos</Text>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : premiumVideosData?.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Premium Videos Found</Text>
        </View>
      ) : (
        <FlatList
          data={premiumVideosData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: itemMargin,
             paddingBottom: scale(40),
            alignSelf: 'center',
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.7}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default PremiumVideos;
