import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  FlatList,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Platform,
  BackHandler,
  RefreshControl,
  useTVEventHandler,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { scale, verticalScale } from "react-native-size-matters";
import Header from "../../components/Header";
import Slider from "../../components/Slider";
import { COLORS } from "../../theme/colors";
import { IMAGES } from "../../theme/images";
import apiHelper from "../../config/apiHelper";
import { 
  CHANNELS, 
  HOME_PAGE_API, 
  HOME_SLIDER, 
  NEXT_PUBLIC_API_CDN_ENDPOINT, 
  PAGE_LIMIT, 
  SEASON_LIST, 
  TRENDING_VIDEOS, 
  UPCOMING_SHOWS 
} from "../../config/apiEndpoints";
import CTrendingVideos from "../../components/CTrendingVideos";
import BackHandlerComponent from "../../components/BackHandlerComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import moment from 'moment-timezone';
import styles from './styles';

const { width, height } = Dimensions.get('window');
const isTV = Platform.isTV;

// Define navigation prop type
type HomeScreenNavigationProp = StackNavigationProp<
  {
    LiveNow: undefined;
    SeriesDetails: undefined;
    StreamDetails: undefined;
    VideoPlayerScreen: { videoUri: string | undefined; streamName: string };
    ChannelDetails: { channelId: string };
    VODScreen: { seasonID: string };
    AllVideosScreen: undefined;
    TrendingVideos: undefined;
    UpcomingShows: undefined;
    Channels: undefined;
    LatestSeason: undefined;
    SearchVideos: undefined;
  },
  "LiveNow"
>;

// Tab interface
interface Tab {
  id: string;
  title: string;
}

interface RootState {
  auth: {
    isTablet: boolean;
  };
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  // States for API data
  const [sliderData, setSliderData] = useState<any[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [channelsVideos, setChannelsVideos] = useState<any[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<any[]>([]);
  const [featuredSeasons, setFeaturedSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Tab navigation
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'home', title: 'Home' },
    { id: 'tvshows', title: 'TV Shows' },
    { id: 'movies', title: 'Movies' },
    { id: 'featured', title: 'Featured' },
    { id: 'mylist', title: 'My List' },
  ]);
  const [selectedTab, setSelectedTab] = useState<string>('home');
  const [focusedTab, setFocusedTab] = useState<string>('home');
  
  // Focus management for TV remote
  const [rowFocus, setRowFocus] = useState<'tabs' | 'slider' | 'content'>('tabs');
  const [contentRowFocus, setContentRowFocus] = useState<number>(0);
  
  // Use ref to prevent multiple API calls
  const dataFetchedRef = useRef(false);
  const isTablet = useSelector((state: RootState) => state.auth.isTablet);

  useFocusEffect(
    React.useCallback(() => {
      fetchData(); // Refetch profiles when screen gains focus
    }, [])
  );

  // TV remote navigation handler
  useTVEventHandler((evt) => {
    if (evt && evt.eventType) {
      switch (evt.eventType) {
        case 'down':
          if (rowFocus === 'tabs') {
            setRowFocus('slider');
          } else if (rowFocus === 'slider') {
            setRowFocus('content');
            setContentRowFocus(0);
          } else if (rowFocus === 'content') {
            if (contentRowFocus < 3) { // Assuming 4 content rows
              setContentRowFocus(contentRowFocus + 1);
            }
          }
          break;
        case 'up':
          if (rowFocus === 'content') {
            if (contentRowFocus > 0) {
              setContentRowFocus(contentRowFocus - 1);
            } else {
              setRowFocus('slider');
            }
          } else if (rowFocus === 'slider') {
            setRowFocus('tabs');
          }
          break;
        case 'right':
          if (rowFocus === 'tabs') {
            const currentIndex = tabs.findIndex(tab => tab.id === focusedTab);
            if (currentIndex < tabs.length - 1) {
              setFocusedTab(tabs[currentIndex + 1].id);
            }
          }
          break;
        case 'left':
          if (rowFocus === 'tabs') {
            const currentIndex = tabs.findIndex(tab => tab.id === focusedTab);
            if (currentIndex > 0) {
              setFocusedTab(tabs[currentIndex - 1].id);
            }
          }
          break;
        case 'select':
          if (rowFocus === 'tabs') {
            setSelectedTab(focusedTab);
          }
          break;
      }
    }
  });

  // channels
  const handleChannelPress = (item: any) => {
    navigation.navigate('ChannelDetails', { channelId: item?.id });
  };

  // navigate to particluar image press in VOD screen with seasonID
  const handleTvShowPress = (item: any) => {
    navigation.navigate("VODScreen", { seasonID: item?._id });
  };

  const fetchData = async () => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    setLoading(true);
    try {
      const timezone = moment.tz.guess();

      const responses = await Promise.allSettled([
        apiHelper.get(HOME_SLIDER),
        apiHelper.get(CHANNELS),
        apiHelper.get(`${SEASON_LIST}?page=${1}&limit=${PAGE_LIMIT}&trending=true`),
        apiHelper.get(SEASON_LIST),
        apiHelper.get(UPCOMING_SHOWS, { headers: { timezone: timezone } })
      ]);
      
      const handlers = [
        (response: any) => setSliderData(response.value.data || []),
        (response: any) => setChannelsVideos(response.value.data?.data || []),
        (response: any) => setFeaturedSeasons(response.value.data?.data || []),
        (response: any) => setTrendingVideos(response.value.data?.data || []),
        (response: any) => setUpcomingShows(response.value.data?.data || []),
      ];

      responses.forEach((response, index) => {
        if (response.status === "fulfilled") {
          handlers[index](response);
        } else {
          console.error(`Request ${index + 1} failed:`, response.reason);
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShowPress = async (item: any) => {
    try {
      setLoading(true);
      const showId = item?.type === "vod" ? item?.episode?._id : item?.tvShow?.id;
      
      if (!showId) {
        console.error("No valid show ID found.");
        return;
      }
      const response = await apiHelper.get(`${TRENDING_VIDEOS}/${showId}`);

      if (response?.status !== 200 || !response?.data) {
        console.error("Failed to fetch video details.");
        return;
      }

      const data = response.data;

      let videoUri: string | undefined;

      if (data.type === "VOD" && data?.episode?.video) {
        videoUri = `${NEXT_PUBLIC_API_CDN_ENDPOINT}/${data.episode.video}`;
      } else if (data.rtmp?.primary) {
        videoUri = data.rtmp.primary;
      }

      navigation.navigate("VideoPlayerScreen", {
        videoUri,
        streamName: data?.name || "Untitled Stream",
      });
    } catch (error) {
      console.error("Error fetching video URL:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    dataFetchedRef.current = false;
    await fetchData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    BackHandler.exitApp();
    return true;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // for back also calling api 
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [navigation])
  );

  // Render tab bar
  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      <FlatList
        horizontal
        data={tabs}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tabItem,
              selectedTab === item.id && styles.selectedTab,
              focusedTab === item.id && rowFocus === 'tabs' && styles.focusedTab,
            ]}
            onPress={() => {
              setSelectedTab(item.id);
              setFocusedTab(item.id);
            }}
            hasTVPreferredFocus={item.id === 'home'}
            focusable={true}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === item.id && styles.selectedTabText,
                focusedTab === item.id && rowFocus === 'tabs' && styles.focusedTabText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Content based on selected tab
  const renderContent = () => {
    // For this example, all tabs show the same content but in a real app,
    // you would show different content based on the selected tab
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewStyle}
        contentContainerStyle={{ paddingBottom: scale(50) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Slider Section - Featured Content */}
        {sliderData.length > 0 && (
          <View style={styles.sliderContainer}>
            <Slider
              topbtn
              sliderData={sliderData}
              bottomLiveBtn={true}
              onImagePress={(item) => handleShowPress(item)}
            />
          </View>
        )}

        {/* Content Rows */}
        <View style={styles.contentContainer}>
          {/* Upcoming Shows */}
          {upcomingShows && upcomingShows.length > 0 && (
            <CTrendingVideos
              trendingVideosData={upcomingShows}
              title="Live & Upcoming Shows"
              imageKey="banner"
              showViewAllText
              viewAllLink="AllVideosScreen"
              itemHeight={scale(85)}
              itemWidth={scale(150)}
              onViewAllPress={() => navigation.navigate('UpcomingShows')}
              bannerImg=""
            />
          )}

          {/* Featured Seasons */}
          {featuredSeasons && featuredSeasons.length > 0 && (
            <CTrendingVideos
              trendingVideosData={featuredSeasons}
              title="Featured Seasons"
              imageKey="mobilePosterImage"
              showViewAllText
              viewAllLink="AllVideosScreen"
              itemHeight={scale(160)}
              itemWidth={scale(110)}
              onImagePress={(item) => handleTvShowPress(item)}
              onViewAllPress={() => navigation.navigate('TrendingVideos')}
              bannerImg="true"
            />
          )}

          {/* Channels */}
          {channelsVideos && channelsVideos.length > 0 && (
            <CTrendingVideos
              trendingVideosData={channelsVideos}
              title="Channels"
              imageKey="coverImage"
              showViewAllText
              viewAllLink="AllVideosScreen"
              itemHeight={scale(85)}
              itemWidth={scale(150)}
              onImagePress={(item) => handleChannelPress(item)}
              onViewAllPress={() => navigation.navigate('Channels')}
              bannerImg=""
            />
          )}

          {/* Latest Seasons */}
          {trendingVideos && trendingVideos.length > 0 && (
            <CTrendingVideos
              trendingVideosData={trendingVideos}
              title="Latest Seasons"
              imageKey="mobileBanner"
              showViewAllText
              viewAllLink="AllVideosScreen"
              itemHeight={scale(85)}
              itemWidth={scale(150)}
              onImagePress={(item) => handleTvShowPress(item)}
              onViewAllPress={() => navigation.navigate('LatestSeason')}
              bannerImg=""
            />
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />
      <Header
        title=""
        showLogo={true}
        showBack={false}
        showSearch={true}
        onSearchPress={() => navigation.navigate("SearchVideos")}
      />
      
      {/* Tab Navigation */}
      {renderTabBar()}
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        renderContent()
      )}
    </View>
  );
};

export default HomeScreen; 