import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Platform,
  BackHandler,
} from "react-native";
import AIcon from "react-native-vector-icons/AntDesign";
import apiHelper from "../../config/apiHelper";
import {
  TRENDING_VIDEOS,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  CHANNELS_SLIDER,
} from "../../config/apiEndpoints";
import { COLORS } from "../../theme/colors";
import { scale } from "react-native-size-matters";
import { FONTS } from "../../utils/fonts";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import CTrendingVideos from "../../components/CTrendingVideos";
import TVTouchable from "../../components/TVTouchable";
import CAlertModal from "../../components/CAlertModal";
import BackHandlerComponent from "../../components/BackHandlerComponent";
import { RootState } from "../../redux/store";
import styles from "./styles";


interface StreamDetails {
  banner: string;
  name: string;
  description: string;
  rtmp: {
    primary: string;
  };
}

const Details: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isTV = Platform.isTV;
  const { tvShowId } = route.params || {};
  const isTablet = useSelector((state: RootState) => state.auth.isTablet);

  const [loading, setLoading] = useState(true);
  const [streamDetails, setStreamDetails] = useState<StreamDetails | null>(null);
  const [popularData, setPopularData] = useState<any[]>([]);
  const [tvChannelID, setTvChannelID] = useState<string>('');
  const [isListingLoading, setListingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [modalMessage, setModalMessage] = useState('');
  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Focus state for "Watch Now" button to show focus style on TV
  const [isWatchNowFocused, setWatchNowFocused] = useState(false);

  // Back button handling for Android TV
  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  // Animate live dot pulse effect
  const animateLiveDot = useCallback(() => {
    liveDotAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [liveDotAnim]);

  // Fetch stream details by ID
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      if (!tvShowId) {
        setModalMessage("No stream selected.");
        setModalType('error');
        setModalVisible(true);
        setLoading(false);
        return;
      }
      const response = await apiHelper.get(`${TRENDING_VIDEOS}/${tvShowId}`);
      if (response?.status === 200) {
        const data = response.data;
        setTvChannelID(data?.channel);
        setStreamDetails({
          banner: data?.banner,
          name: data?.name,
          description: data?.description,
          rtmp: data?.rtmp,
        });
      }
    } catch (err: any) {
      setModalMessage(err?.message || 'Error fetching stream details.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [tvShowId]);

  // Fetch popular videos list by channel ID
  const fetchData = useCallback(async () => {
    if (!tvChannelID) return;
    setListingLoading(true);
    try {
      const res = await apiHelper.get(`${CHANNELS_SLIDER}/${tvChannelID}`);
      if (res?.status === 200) {
        setPopularData(res.data?.tvShow || []);
      }
    } catch (err: any) {
      setModalMessage(err?.message || 'Error fetching videos.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setListingLoading(false);
    }
  }, [tvChannelID]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDetails();
    // fetchData depends on tvChannelID set in fetchDetails, so wait for that effect
    setRefreshing(false);
  }, [fetchDetails]);

  // Fetch data when tvChannelID changes (after fetchDetails)
  useEffect(() => {
    if (tvChannelID) fetchData();
  }, [tvChannelID, fetchData]);

  // On screen focus
  useFocusEffect(
    useCallback(() => {
      fetchDetails();
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [fetchDetails, handleBackPress])
  );

  // Start live dot animation on mount
  useEffect(() => {
    animateLiveDot();
  }, [animateLiveDot]);

  // Navigation handlers
  const handleWatchNow = () => {
    if (!streamDetails) return;
    navigation.navigate('VideoPlayerScreen', {
      videoUri: streamDetails.rtmp.primary,
      streamName: streamDetails.name,
    });
  };

  const handleTvShowPress = (item: any) => {
    navigation.navigate('Details', { tvShowId: item?.id });
  };

  // Header background color animation based on scroll
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ["transparent", "black"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !streamDetails ? (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { fontSize: isTablet ? scale(10) : scale(18) }]}>
              No details available.
            </Text>
          </View>
        ) : (
          <>
            {/* Header with Back button */}
            <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
              <TVTouchable
                onPress={handleBackPress}
                style={{ padding: scale(10) }}
                hasTVPreferredFocus={!isTV} // On TV, initial focus on Watch Now
                accessible={true}
                accessibilityLabel="Back"
              >
                <AIcon name="arrowleft" size={isTablet ? 24 : 20} color={COLORS.white} />
              </TVTouchable>
            </Animated.View>

            {/* Banner Image + Live Now badge */}
            <TVTouchable accessible={false}>
              <Image
                source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${streamDetails.banner}` }}
                style={styles.bannerImageTV}
              />
              <View style={styles.liveNoBtnWrapper}>
                <Animated.View
                  style={[
                    styles.liveDot,
                    { transform: [{ scale: liveDotAnim }] },
                  ]}
                />
                <Text style={styles.liveNowButtonText}>Live Now</Text>
              </View>
            </TVTouchable>

            {/* Stream details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.streamNameTV}>{streamDetails.name}</Text>
              <Text style={styles.descriptionTV} numberOfLines={6}>
                {streamDetails.description}
              </Text>
            </View>

            {/* Watch Now button */}
            <View style={styles.btnContainer}>
              <TVTouchable
                onPress={handleWatchNow}
                onFocus={() => setWatchNowFocused(true)}
                onBlur={() => setWatchNowFocused(false)}
                hasTVPreferredFocus={true} // Initial focus on TV
                accessible={true}
                accessibilityLabel="Watch Now"
              >
                <View style={[styles.watchNowButton, isWatchNowFocused && styles.watchNowButtonFocused]}>
                  <Text style={styles.watchNowButtonText}>Watch Now</Text>
                  <AIcon name="caretright" size={20} color="#FFF" />
                </View>
              </TVTouchable>
            </View>

            {/* Trending videos list */}
            <View style={styles.trendingSection}>
              {isListingLoading ? (
                <View style={[styles.loaderContainer, { marginTop: scale(50) }]}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : (
                <CTrendingVideos
                  trendingVideosData={popularData}
                  title="All Videos"
                  showViewAllText
                  viewAllLink="AllVideosScreen"
                  itemHeight={scale(120)}
                  itemWidth={scale(90)}
                  onImagePress={handleTvShowPress}
                  onViewAllPress={() => navigation.navigate('AllVideos', { tvChannelID })}
                  bannerImg
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Alert modal */}
      <CAlertModal
        visible={modalVisible}
        message={modalMessage}
        type={modalType}
        btnTitle="OK"
        onOkPress={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Details;
