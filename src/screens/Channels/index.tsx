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


const Channels: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const channelsData = useSelector((state: any) => state.channels?.data);
  const dataFetchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // 🟦 Tab menu state
  const [tabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'channels', title: 'Channels' },
    { id: 'premium', title: 'Premium' },
    { id: 'featured', title: 'Featured' },
    { id: 'mylist', title: 'My List' },
  ]);
  const [selectedTab, setSelectedTab] = useState<string>('channels');
  const [focusedTab, setFocusedTab] = useState<string>('channels');
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');



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

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === focusedIndex;

    return (
      <TouchableOpacity
        onPress={() => handleChannelPress(item)}
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
            { width: cardWidth, height: cardHeight ,
               borderWidth: isFocused ? scale(1) : 0,
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

  // ✅ Tab Navigation Handler
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
      case 'mylist':
        navigation.navigate('AllVideosScreen');
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


  // 🔁 TV Remote Navigation
  useTVEventHandler((evt) => {
    if (evt?.eventType === 'down' && rowFocus === 'tabs') {
      setRowFocus('content');
    } else if (evt?.eventType === 'up' && rowFocus === 'content') {
      setRowFocus('tabs');
    }
  });

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />
      <Header
        title=""
        showLogo
        showBack={false}
        showSearch
        showLogout
        onSearchPress={() => navigation.navigate('SearchVideos')}
      />

      {/* ✅ Tab Bar at the top */}
      <View style={styles.tabBarContainer}>
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
          // You could refresh content based on profile here
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
            // paddingBottom: 50,
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
