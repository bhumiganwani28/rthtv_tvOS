import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
  Linking,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import IIcon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../theme/colors';
import {scale} from 'react-native-size-matters';
import {FONTS} from '../../utils/fonts';
import {IMAGES} from '../../theme/images';
import AIcon from 'react-native-vector-icons/AntDesign'; // For caret-right icon
import styles from './styles';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  HOME_PAGE_API,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  SEASON_LIST,
  SHOW_DETAILS_API,
} from '../../config/apiEndpoints';
import apiHelper from '../../config/apiHelper';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import FIIcon from 'react-native-vector-icons/FontAwesome';
import FFIcon from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '../../components/Header';
import {ScrollView} from 'react-native-gesture-handler';

type VODScreenNavigationProp = NavigationProp<any>; // Use the correct type for your stack

const VODScreen: React.FC = ({route}) => {
  const navigation = useNavigation<VODScreenNavigationProp>();
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Episodes');
  const [seasonCount, setSeasonCount] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [channelId, setChannelID] = useState<any>('');
  const [seasonsData, setSeasonsData] = useState<SeasonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [longISDescription, setLongISDescription] = useState<any>(null);
  const {seasonID} = route?.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const limitedSeasonsData = Array.isArray(seasonsData)
    ? seasonsData?.slice(0, 6)
    : [];
  const [genreNames, setGenreNames] = useState<string>('');

  const isTablet = useSelector((state: RootState) => state.auth.isTablet);
  // const windowWidth = Dimensions.get('window').width;
  // const posterSpacing = isTablet ? scale(8) : scale(10);

  const screenWidth = Dimensions.get('window').width;
  const itemMargin =  scale(24);
  const columns = 5;
  const posterWidth = (screenWidth - itemMargin * (columns + 1)) / columns;
  const posterHeight = posterWidth * 1.5;

  const ICON_SIZE =  scale(40); // Adjust icon size for tablet/phone (you can tweak these)
  const HALF_ICON_SIZE = ICON_SIZE / 2;
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleWatchNow = () => {
    if (!episodesList || episodesList.length === 0) {
      console.warn('No episodes available');
      return;
    }

    const now = new Date();

    // Try to find the currently playing episode
    const currentEpisode = episodesList.find((episode: any) => {
      const start = new Date(episode?.startTime);
      const end = new Date(episode?.endTime);
      return start <= now && now <= end;
    });

    const episodeToPlay = currentEpisode || episodesList[0]; // Fallback to first episode if none matched

    if (!episodeToPlay) {
      console.warn('No valid episode to play');
      return;
    }
    handleTvShowPress(episodeToPlay); // Reuse your existing video launch function
  };

  const handleTvShowPress = async (item: any) => {
    setLoading(true); // Start loading before API call
    try {
      const response = await apiHelper.get(`${HOME_PAGE_API}/${item._id}`);
      // console.log(">>",response?.data?.data?.video?.accessKey);
      if (response?.data) {
        // const videoUrl =
        const videoUri = response?.data?.data?.video?.accessKey;
        // const videoUri = `${NEXT_PUBLIC_API_CDN_ENDPOINT}${response?.data?.data?.video}`;
        // console.log("Video URL:", videoUri); // Log video URL to console

        navigation.navigate('VideoPlayerScreen', {
          videoUri,
          streamName: response?.data.data?.title,
        });
      } else {
        console.error('No data received for the selected video.');
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');

        if (storedSubscription) {
          setSubscriptionData(JSON.parse(storedSubscription));
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  // When a season is selected, update the state and call the API for that season
  const handleSeasonSelect = (seasonNumber: number) => {
    // console.log("seasonNumber>",seasonNumber);

    setSelectedSeason(seasonNumber);
    setIsDropdownVisible(false);
    // Call the fetch function with the selected season number as a parameter.
    fetchShowData(seasonNumber);
  };

  const fetchShowData = useCallback(
    async (seasonNo?: number) => {
      if (!seasonID) return;
      setLoading(true);
      try {
        // Build the endpoint. If seasonNo is provided, append it as a query parameter.
        let endpoint = `${SHOW_DETAILS_API}/${seasonID}`;
        if (seasonNo) {
          endpoint += `?seasonNo=${seasonNo}`;
        }
        const response = await apiHelper.get(endpoint);
        if (response?.status === 200) {
          setLongISDescription(response?.data?.season?.longDescription);
          setShowDetails(response?.data);
          setChannelID(response.data?.season?.channel?._id);
          //   setChannelID(response?.data?.episode?.season?.channel?._id);
          setEpisodesList(response.data?.episode || []);
          // Otherwise, seasonCount can be set elsewhere.
          setSeasonCount(response.data?.totalSeasonCount?.seasonNo);

          // ✅ Set genre names here
          const genresArray = response?.data?.season?.genre || [];
          const genreNamesList = genresArray.map((genre: any) => genre.name);
          setGenreNames(genreNamesList.join(', '));
        } else {
          console.error('Failed to fetch show details');
        }
      } catch (error: any) {
        console.error('API Error:', error.message);
      } finally {
        setLoading(false);
      }
    },
    [seasonID],
  );

  // Fetch seasons data based on the channelId.
  const fetchSeasonsByItemId = async () => {
    // Optionally, you can use a separate loading state for seasons.
    setLoading(true);
    let url = SEASON_LIST;
    if (channelId) {
      url = `${SEASON_LIST}?channelId=${channelId}`;
    }
    try {
      const response = await apiHelper.get(url);
      // console.log("Fetched seasons:", response?.data); // Debugging
      if (response?.status === 200) {
        const data = response?.data;

        if (Array.isArray(data?.data)) {
          setSeasonsData(data?.data);
        } else {
          console.error('Seasons data is not an array:', data);
          setSeasonsData([]); // Prevent undefined issues
        }
      } else {
        console.error('Failed to fetch seasons:', response?.status);
      }
    } catch (error: any) {
      console.error('Error fetching seasons:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // navigate to particluar image press in VOD screen with seasonID
  const handleSeasonPress = (item: any) => {
    navigation.navigate('VODScreen', {seasonID: item?._id});
  };

  useEffect(() => {
    fetchShowData();
  }, [fetchShowData]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (channelId) {
      fetchSeasonsByItemId();
    }
  }, [channelId]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 150], // Adjust scroll range for a smoother effect
    outputRange: ['transparent', 'black'],
    extrapolate: 'clamp',
  });

  const renderEpisodeItem = ({item}: {item: typeof episodesList}) => (
    <TouchableOpacity
      onPress={() => handleTvShowPress(item)}
      style={[
        styles.itemView,
        {
          paddingVertical: scale(8),
          //  borderBottomWidth: null,
          borderBottomColor: COLORS.lightGrey,
        },
      ]}>
      <View style={styles.episodeItem}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.coverImage}`}}
            style={[
              styles.episodeImage,
              {
                width: scale(110),
                height: scale(60),
              },
            ]}
          />
          <View style={styles.overlay} />
          {!subscriptionData && item?.access === 'Paid' && (
            <View
              style={[
                styles.subscriptionContainer,
                {
                  top: scale(5),
                  right: scale(5),
                  padding: scale(5),
                  borderRadius: scale(5),
                },
              ]}>
              <FIcon
                name="crown"
                size={scale(8)}
                style={styles.subscriptionIcon}
              />
            </View>
          )}
          <View
            style={[
              styles.playIconContainer,
              {
                top: '50%',
                left: '50%',
                transform: [
                  {translateX: -HALF_ICON_SIZE},
                  {translateY: -HALF_ICON_SIZE},
                ],
                width: ICON_SIZE,
                height: ICON_SIZE,
              },
            ]}>
            <IIcon
              name="play-circle-outline"
              size={scale(18)}
              color="white"
            />
          </View>
        </View>
        <View
          style={[
            styles.episodeDetails,
            {
              marginLeft:scale(10),
            },
          ]}>
          <View>
            <Text
              style={[
                styles.episodeTitle,
                {
                  fontSize: scale(10),
                },
              ]}>{`${item?.episodeNo}. ${item?.name}`}</Text>
            {isTablet && (
              <Text
                style={[
                  styles.episodeDescription,
                  {
                    fontSize:scale(8),
                    lineHeight :scale(12),
                    marginTop: scale(2),
                  },
                ]}>
                {item?.shortDescription}
              </Text>
            )}
          </View>
        </View>
      </View>
      {!isTablet && (
        <View style={styles.desView}>
          <Text
            style={[
              styles.episodeDescription,
              {
                fontSize:  scale(13),
                lineHeight: scale(18),
              },
            ]}>
            {item?.shortDescription}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSeasonItem = ({item}: {item: any}) => (
    <TouchableOpacity
      onPress={() => handleSeasonPress(item)}
      style={{
        width: posterWidth,
        height: posterHeight,
        margin: itemMargin / 1.5,
      }}>
      <Image
        source={{
          uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobilePosterImage}`,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const keyExtractor = (item: any, index: number) =>
    `${item?.id}-${item?.slug}-${index}`;

  const headerComponent = (
    <View style={{flex: 1}}>
      {/* Banner */}
      <View style={{flex: 1}}>
        {showDetails?.season?.mobileBanner && (
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${showDetails?.season?.mobileBanner}`,
            }}
            style={{
              width: '100%',
              height:  scale(200),
            }}
          />
        )}
      </View>
      <View
        style={{
          flex: 1,
          marginHorizontal: scale(12),
        }}>
        <View>
          <View>
            {showDetails?.season?.title && (
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: scale(13),
                    lineHeight:  scale(18),
                    marginVertical: scale(10),
                  },
                ]}>
                {showDetails?.season?.title}
              </Text>
            )}
          </View>
          {seasonCount > 1 ? (
            <>
              <TouchableOpacity
                style={[
                  styles.sessionTag,
                  {
                    // paddingVertical:  scale(5),
                    paddingHorizontal: scale(10),
                  },
                ]}
                onPress={toggleDropdown}>
                <Text
                  style={styles.sessionText}>{`Season ${selectedSeason}`}</Text>
                <FFIcon
                  name="chevron-down"
                  size={scale(12)}
                  color={COLORS.white}
                  style={styles.iconStyl}
                />
              </TouchableOpacity>
              {!isDropdownVisible && seasonCount && (
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      width: '50%',
                      top: scale(20), // Adjust this value based on your layout
                    },
                  ]}>
                  {Array.from(
                    {length: seasonCount},
                    (_, index) => index + 1,
                  ).map(season => (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.dropdownItem,
                        {
                          padding:scale(5),
                        },
                      ]}
                      onPress={() => handleSeasonSelect(season)}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {fontSize: scale(10)},
                        ]}>{`Season ${season}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.sessionTag,
                {
                  paddingVertical:  scale(5),
                  paddingHorizontal: scale(10),
                },
              ]}
              onPress={toggleDropdown}>
              <Text
                style={[
                  styles.sessionText,
                  {
                    fontSize:scale(13),
                  },
                ]}>{`Season ${selectedSeason}`}</Text>
              <FFIcon
                name="chevron-down"
                size={16}
                color={COLORS.white}
                style={[
                  styles.iconStyl,
                  {
                    marginLeft: scale(10),
                  },
                ]}
              />
            </TouchableOpacity>
          )}
          <View
            style={[
              styles.seasonInfo,
              {
                paddingVertical: scale(5),
              },
            ]}>
            {showDetails?.season?.shortDescription && (
              <Text
                style={[
                  styles.seasonDescription,
                  {
                    fontSize:  scale(11),
                    lineHeight: scale(15),
                    marginTop:  scale(5),
                  },
                ]}>
                {showDetails?.season?.shortDescription}
              </Text>
            )}
            <Text
              style={[
                styles.yearInfo,
                {
                  fontSize: scale(12),
                  lineHeight:  scale(18),
                  marginTop:scale(5),
                },
              ]}>
              {showDetails?.season?.releaseDate
                ? `${new Date(
                    showDetails?.season?.releaseDate,
                  ).getFullYear()} • `
                : ''}
              {episodesList?.length}{' '}
              {episodesList?.length === 1 ? 'Episode' : 'Episodes'}
            </Text>
          </View>
        </View>

        {/* Watch now section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleWatchNow}
            style={[
              styles.actionButton,
              {
              paddingVertical:  scale(5),
              paddingHorizontal: scale(10),
              },
            ]}>
            <FIIcon
              name="play"
              size={15}
              color={COLORS.white}
              style={styles.watchIcon}
            />
            <Text
              style={[
                styles.watchText,
                {
                  fontSize:  scale(12),
                  marginLeft:  scale(10),
                },
              ]}>
              Watch Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                width:  scale(25),
                height: scale(25),
                marginHorizontal: scale(5),
              },
            ]}>
            <FFIcon name="share-2" size={scale(10)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={handleBackPress} />
      {/*  Header  */}
      <Header
        title={showDetails?.season?.title}
        // showBackButton
        onBackPress={() => navigation.goBack()}
        // showSearchIcon={false}
      />
      <View style={{flex: 1}}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={{flex: 1}}>
            <FlatList
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={headerComponent}
              ListFooterComponent={
                <View style={{flex: 1, marginBottom: scale(20)}}>
                  {/* Tabs */}
                  <View
                    style={[
                      styles.tabContainer,
                      {
                        marginTop: scale(5),
                      },
                    ]}>
                    <TouchableOpacity
                      style={[
                        styles.tabItem,
                        {
                          paddingVertical:  scale(10),
                        },
                        activeTab === 'Episodes' && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab('Episodes')}>
                      <Text
                        style={[
                          styles.tabLabel,
                          activeTab === 'Episodes' && styles.activeText,
                          {
                            fontSize:  scale(13),
                            lineHeight:  scale(20),
                          },
                        ]}>
                        Episodes
                      </Text>
                      {activeTab === 'Episodes' && (
                        <View style={styles.activeTabIndicator} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabItem,
                        {
                          paddingVertical: scale(10),
                        },
                        activeTab === '"More Details' && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab('More Details')}>
                      <Text
                        style={[
                          styles.tabLabel,
                          activeTab === 'More Details' && styles.activeText,
                          {
                            fontSize: scale(13),
                            lineHeight:  scale(20),
                          },
                        ]}>
                        More Details
                      </Text>
                      {activeTab === 'More Details' && (
                        <View style={styles.activeTabIndicator} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Tab Content */}
                  {tabLoading ? (
                    <View style={styles.loaderContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  ) : activeTab === 'Episodes' ? (
                    <View style={{flex: 1}}>
                      <FlatList
                        style={{
                          flex: 1,
                          marginHorizontal: scale(12),
                        }}
                        showsVerticalScrollIndicator={false}
                        data={episodesList}
                        renderItem={renderEpisodeItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={{
                          flexGrow: 1,
                          paddingVertical: scale(10),
                        }}
                      />
                      {/* More Like This section */}
                      <View style={{flex: 1, marginHorizontal:  scale(5),}}>
                        <View
                          style={[
                            styles.viewHeader,
                            {
                              marginHorizontal:  scale(12),
                              marginVertical:  scale(10),
                            },
                          ]}>
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={[
                              styles.viewAllTitle,
                              {
                                fontSize: scale(11),
                                lineHeight: scale(13),
                              },
                            ]}>
                            More Like This
                          </Text>
                          <TouchableOpacity
                            style={styles.link}
                            onPress={() =>
                              navigation.navigate('MoreLikeVideos', {
                                channelId: channelId,
                              })
                            }>
                            <Text
                              style={[
                                styles.viewAllText,
                                {
                                  fontSize:  scale(10),
                                  lineHeight:scale(12),
                                  marginRight:scale(2),
                                },
                              ]}>
                              View All
                            </Text>
                            <FFIcon
                              name="chevron-right"
                              size={scale(12)}
                              color={COLORS.white}
                            />
                          </TouchableOpacity>
                        </View>
                        <FlatList
                          data={limitedSeasonsData}
                          renderItem={renderSeasonItem}
                          keyExtractor={(_, index) => `more-${index}`}
                          style={{flex: 1}}
                          numColumns={columns}
                          contentContainerStyle={{
                            flexGrow: 1,
                          }}
                          scrollEnabled={false}
                          showsVerticalScrollIndicator={false}
                        />
                      </View>
                    </View>
                  ) : (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{
                        flex: 1,
                        paddingHorizontal:  scale(10),
                        paddingTop:  scale(10),
                      }}
                      contentContainerStyle={{flexGrow: 1}}>
                      {genreNames && (
                        <Text
                          style={[
                            styles.genreText,
                            {fontSize: scale(13)},
                          ]}>
                          Genres: {genreNames}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.moreDetails,
                          {
                            fontSize:  scale(13),
                            lineHeight:  scale(19),
                            paddingTop:  scale(10),
                          },
                        ]}>
                        {longISDescription}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              }
              keyExtractor={() => 'unique'}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: false},
              )}
              scrollEventThrottle={16}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default VODScreen;
