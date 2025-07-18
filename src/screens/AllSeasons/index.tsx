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
import styles from './styles';
import apiHelper from '../../config/apiHelper';
import {
  CHANNELS_DETAIL_LIST,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  PAGE_LIMIT,
} from '../../config/apiEndpoints';
import Header from '../../components/Header';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import { COLORS } from '../../theme/colors';
import {
  appendSeasonsData,
  resetSeasonsData,
  setSeasonsData,
} from '../../redux/slices/allSeasonsSlice';
import { scale } from 'react-native-size-matters';

interface AllSeasonsProps {
  route: {
    params: {
      channelId: string;
      popularName?: string;
    };
  };
}



const AllSeasons: React.FC<AllSeasonsProps> = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { channelId, popularName } = route?.params;

  const allSeasonsData = useSelector((state: any) => state.allSeasons?.data);
  const isTablet = useSelector((state: any) => state.auth?.isTablet);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

const NUM_COLUMNS = 5;
const CARD_ASPECT_RATIO = 16 / 9;
const itemHorizontalSpacing = scale(12); // space between cards
  const windowWidth = Dimensions.get('window').width;
  const totalSpacing = itemHorizontalSpacing * (NUM_COLUMNS + 1);
  const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemMargin = itemHorizontalSpacing / 1.5;
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const handleSeasonPress = (item: any) => {
    navigation.navigate("VODScreen", { seasonID: item?._id });
  };

  const fetchAllSeasons = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiHelper.get(
        `${CHANNELS_DETAIL_LIST}/${channelId}?page=${pageNum}&limit=${PAGE_LIMIT}`
      );
      const res = response.data;

      if (res?.channel) {
        isRefresh
          ? dispatch(setSeasonsData(res.channel))
          : dispatch(appendSeasonsData(res.channel));
        setTotalPages(res.totalPages);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(resetSeasonsData());
      setPage(1);
      fetchAllSeasons(1);
    }, [channelId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(resetSeasonsData());
    setPage(1);
    fetchAllSeasons(1, true);
  }, [channelId]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllSeasons(nextPage);
    }
  }, [page, totalPages, loading]);

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
                      { width: cardWidth,
                         height: cardHeight,
                         borderWidth: isFocused ? scale(1) : 0,
                       borderColor: isFocused ? COLORS.white : 'transparent',
                       },
                    ]}
                  >
          <Image
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.webBanner}` }}
            style={styles.image}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any, index: number) => `${item?._id}-${index}`;

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />
      <Header
        // title={`All Seasons ${popularName || ''}`}
        // showSearch
        // showBack
        onSearchPress={() => navigation.navigate('SearchVideos')}
        onBackPress={handleBackPress}
      />

      <View style={styles.contentContainer}>
        <View style={styles.contentTitleContainer}>
          <Text style={styles.contentTitle}>{`All Seasons ${popularName || ''}`}</Text>
        </View>

        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : allSeasonsData?.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Seasons Found</Text>
          </View>
        ) : (
          <FlatList
            data={allSeasonsData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.7}
            contentContainerStyle={{
              width: NUM_COLUMNS * cardWidth + (NUM_COLUMNS + 1) * itemMargin,
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

export default AllSeasons;
