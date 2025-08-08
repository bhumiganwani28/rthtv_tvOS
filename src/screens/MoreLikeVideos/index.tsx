import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import apiHelper from '../../config/apiHelper';
import { TRENDING_VIDEOS, NEXT_PUBLIC_API_CDN_ENDPOINT, PAGE_LIMIT, SEASON_LIST } from '../../config/apiEndpoints';
import Header from '../../components/Header';
import { COLORS } from '../../theme/colors';
import styles from './styles';
import { scale } from 'react-native-size-matters';
import FIcon from 'react-native-vector-icons/FontAwesome6';

import BackHandlerComponent from '../../components/BackHandlerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appendTrendingVideosData, resetTrendingVideosData, setTrendingVideosData } from '../../redux/slices/TrendingSlice';
import { IMAGES } from '../../theme/images';
import { useTVEventHandler } from 'react-native';

type MoreLikeVideosScreenNavigationProp = StackNavigationProp<any>;

const MoreLikeVideos: React.FC = () => {
    const navigation = useNavigation<MoreLikeVideosScreenNavigationProp>();
    const trendingVideosData = useSelector((state: any) => state.trendingVideos?.data);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    
    const dispatch = useDispatch();

    // Grid configuration like Channels screen
    const NUM_COLUMNS = 5;
    const CARD_ASPECT_RATIO = 16 / 9;
    const itemHorizontalSpacing = scale(12);
    const windowWidth = Dimensions.get('window').width;
    const totalSpacing = itemHorizontalSpacing * (NUM_COLUMNS + 1);
    const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
    const cardHeight = cardWidth / CARD_ASPECT_RATIO;
    const itemMargin = itemHorizontalSpacing / 1.5;

    // navigate to particular image press in VOD screen with seasonID
    const handleSeasonPress = (item: any) => {
        navigation.navigate("VODScreen", { seasonID: item?._id });
    };

    const handleBackPress = useCallback(() => {
        navigation.goBack();
        return true;
    }, [navigation]);

    const fetchTrendingVideos = async (pageNum: number, isRefresh = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await apiHelper.get(`${SEASON_LIST}?page=${pageNum}&limit=${PAGE_LIMIT}`);
            const res = response?.data;    
            if (res?.data) {
                if (isRefresh) {
                    dispatch(setTrendingVideosData(res?.data));
                } else {
                    dispatch(appendTrendingVideosData(res?.data));
                }
                setTotalPages(res?.totalPages);
            }
        } catch (error) {
            console.error('Error fetching trending Videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchSubscriptionData = async () => {
          try {
            const storedSubscription = await AsyncStorage.getItem("subscription");
            
            if (storedSubscription) {
              setSubscriptionData(JSON.parse(storedSubscription));
            }
          } catch (error) {
            console.error("Error fetching subscription data:", error);
          }
        };
    
        fetchSubscriptionData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            dispatch(setTrendingVideosData([]));
            fetchTrendingVideos(1);
            
            // Reset focus when screen comes into focus
            if (Platform.isTV) {
                setFocusedIndex(0);
            }
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        dispatch(resetTrendingVideosData());
        fetchTrendingVideos(1, true);
    }, [dispatch]);

    const loadMore = useCallback(() => {
        if (page < totalPages && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTrendingVideos(nextPage);
        }
    }, [page, totalPages, loading]);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isFocused = index === focusedIndex;

        return (
            <TouchableOpacity
                onPress={() => handleSeasonPress(item)}
                onFocus={() => {
                    if (Platform.isTV) {
                        setFocusedIndex(index);
                    }
                }}
                hasTVPreferredFocus={index === 0}
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
                        { 
                            width: cardWidth, 
                            height: cardHeight,
                            borderWidth: isFocused ? scale(3) : 0,
                            borderColor: isFocused ? COLORS.white : 'transparent',
                        },
                    ]}
                >
                    <Image
                        source={{
                            uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobilePosterImage}`,
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

    const noDataView = (
        <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Trending Videos Found</Text>
        </View>
    );

    const keyExtractor = (item: any, index: number) => {
        return `${item?.id}-${item?.slug}-${index}`;
    };

    const gridWidth = NUM_COLUMNS * cardWidth + (NUM_COLUMNS + 1) * itemMargin;

    // 🔁 Smooth TV Remote Navigation
    useTVEventHandler((evt) => {
        if (!Platform.isTV || !evt) return;

        switch (evt.eventType) {
            case 'up':
                // Navigate up in the grid
                const upIndex = focusedIndex - NUM_COLUMNS;
                if (upIndex >= 0) {
                    setFocusedIndex(upIndex);
                }
                break;
            case 'down':
                // Navigate down in the grid
                const downIndex = focusedIndex + NUM_COLUMNS;
                if (downIndex < trendingVideosData.length) {
                    setFocusedIndex(downIndex);
                }
                break;
            case 'left':
                // Navigate left in the grid
                const leftIndex = focusedIndex - 1;
                if (focusedIndex % NUM_COLUMNS !== 0 && leftIndex >= 0) {
                    setFocusedIndex(leftIndex);
                }
                break;
            case 'right':
                // Navigate right in the grid
                const rightIndex = focusedIndex + 1;
                if ((rightIndex % NUM_COLUMNS !== 0) && rightIndex < trendingVideosData.length) {
                    setFocusedIndex(rightIndex);
                }
                break;
            case 'select':
                if (trendingVideosData[focusedIndex]) {
                    handleSeasonPress(trendingVideosData[focusedIndex]);
                }
                break;
        }
    });

    return (
        <View style={styles.container}>
            <BackHandlerComponent onBackPress={handleBackPress} />
            <Header
                title="More Like This"
                // showBack
                // onBackPress={() => navigation.goBack()}
                // showSearch
                // onSearchPress={() => navigation.navigate("SearchVideos")}
            />
            
            <View style={styles.contentContainer}>
                <View style={styles.contentTitleContainer}>
                    <Text style={styles.contentTitle}>More Like This</Text>
                </View>
                
                {loading && page === 1 ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : trendingVideosData?.length === 0 ? (
                    noDataView
                ) : (
                    <FlatList
                        data={trendingVideosData}
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

export default MoreLikeVideos;
