import React, {useEffect, useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  FlatList,
  TouchableHighlight,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  useTVEventHandler,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import apiHelper from '../../config/apiHelper';
import {
  CHANNELS,
  CHANNELS_DETAIL_LIST,
  CHANNELS_SLIDER,
  LIVE_SHOW_DETAIL,
  NEXT_PUBLIC_API_CDN_ENDPOINT,
} from '../../config/apiEndpoints';

import Header from '../../components/Header';
import BackHandlerComponent from '../../components/BackHandlerComponent';
import CAlertModal from '../../components/CAlertModal';
import CTrendingVideos from '../../components/CTrendingVideos';
import {COLORS} from '../../theme/colors';
import styles from './styles';
import {scale} from 'react-native-size-matters';

const ChannelDetailsTV = ({route}) => {
  const {channelId} = route.params || {};
  console.log('channelId>', channelId);

  const navigation = useNavigation();
  const isTablet = useSelector(state => state.auth?.isTablet);

  const [loading, setLoading] = useState(true);
  const [channelSliderData, setChannelSliderData] = useState([]);
  const [featureList, setFeatureList] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [showType, setShowType] = useState(null);
  const [popularName, setPopularName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const [rowFocus, setRowFocus] = useState<'live' | 'content' | 'grid'>('live');
  const [contentRowFocus, setContentRowFocus] = useState<number>(0);

  const windowWidth = Dimensions.get('window').width;
  const NUM_COLUMNS = 5;
  const itemSpacing = scale(20);
  const CARD_ASPECT_RATIO = 16 / 9;
  const totalSpacing = itemSpacing * (NUM_COLUMNS + 1);
  const cardWidth = (windowWidth - totalSpacing) / NUM_COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemMargin = itemSpacing / 2;

  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const hasLiveBanner = channelSliderData?.length && showType === 'Live';

  useEffect(() => {
    fetchChannelData();
    fetchShowDetails();
    animateLiveDot();
  }, []);
  // navigate to particluar image press in VOD screen with seasonID
  const handleTvShowPress = (item: any) => {
    console.log('item>', item);

    // navigation.navigate('VODScreen', {seasonID: item?._id});
  };
  const animateLiveDot = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const fetchShowDetails = useCallback(async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await apiHelper.get(
        `${LIVE_SHOW_DETAIL}/${channelId}`,
        {},
        {
          headers: {'Time-Zone': timezone},
        },
      );

      if (response?.status === 200) {
        setShowDetails(response.data);
        if (response.data?.tvShows?.length > 0) {
          setShowType(response.data.tvShows[0].type);
        }
      }
    } catch (e) {
      setModalMessage('Live show data failed.');
      setModalVisible(true);
    }
  }, [channelId]);

  const fetchChannelData = useCallback(async () => {
    setLoading(true);
    try {
      if (!channelId) throw new Error('No stream selected.');

      const [sliderResult, nameResult, featureResult] =
        await Promise.allSettled([
          apiHelper.get(`${CHANNELS_SLIDER}/${channelId}`),
          apiHelper.get(`${CHANNELS}/${channelId}`),
          apiHelper.get(`${CHANNELS_DETAIL_LIST}/${channelId}`),
        ]);

      if (
        sliderResult.status === 'fulfilled' &&
        sliderResult.value?.status === 200
      ) {
        setChannelSliderData(sliderResult.value?.data?.tvShow || []);
      }

      if (
        nameResult.status === 'fulfilled' &&
        nameResult.value?.status === 200
      ) {
        setPopularName(nameResult.value?.data?.name);
      }

      if (
        featureResult.status === 'fulfilled' &&
        featureResult.value?.status === 200
      ) {
        setFeatureList(featureResult.value.data?.channel || []);
      }
    } catch (error) {
      setModalMessage(error?.message || 'An error occurred. Please try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // ⬆️⬇️ TV Focus Navigation Handler
  useTVEventHandler(evt => {
    if (!Platform.isTV) return;

    if (evt.eventType === 'down') {
      if (rowFocus === 'live') {
        setRowFocus('content');
        setContentRowFocus(0);
      } else if (rowFocus === 'content') {
        setRowFocus('grid');
      }
    } else if (evt.eventType === 'up') {
      if (rowFocus === 'grid') {
        setRowFocus('content');
        setContentRowFocus(0);
      } else if (rowFocus === 'content' && hasLiveBanner) {
        setRowFocus('live');
      }
    }
  });

  const keyExtractor = (item, index) => String(item?._id || index);

  const renderLiveBanner = () => {
    if (!hasLiveBanner) return null;
    const bannerItem = showDetails?.tvShows?.[0];

    return (
      <TouchableHighlight
        focusable
        hasTVPreferredFocus={rowFocus === 'live'}
        underlayColor={COLORS.primary + '22'}
        style={[
          styles.sliderBanner,
          {borderWidth: 2, borderColor: COLORS.primary},
        ]}
        onPress={() =>
          navigation.navigate('BannerDetail', {channeDetaillID: channelId})
        }>
        <>
          <Image
            source={{
              uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${bannerItem?.banner}`,
            }}
            style={styles.sliderImage}
          />
          <View style={styles.liveBadge}>
            <Animated.View
              style={[styles.liveDot, {transform: [{scale: liveDotAnim}]}]}
            />
            <Text style={styles.liveText}>Live Now</Text>
          </View>
        </>
      </TouchableHighlight>
    );
  };

  const renderFeaturedSections = () => {
    if (!featureList?.length) return null;

    return (
      <CTrendingVideos
        rowIndex={0}
        rowFocus={rowFocus}
        contentRowFocus={contentRowFocus}
        trendingVideosData={featureList}
        title={`Featured in ${popularName}`}
        imageKey="mobilePosterImage"
        showViewAllText={true}
        viewAllLink="AllVideosScreen"
        bannerImg
        itemHeight={isTablet ? scale(140) : scale(120)}
        itemWidth={isTablet ? scale(100) : scale(90)}
        //  onViewAllPress={() => navigation.navigate('ChannelDetailsTV', {channelId: channelId})}
        onImagePress={item => handleTvShowPress(item)}
        onViewAllPress={() =>
          navigation.navigate('AllSeasons', {
            channelId,
            popularName: popularName,
          })
        }
      />
    );
  };

  const renderSeasonItem = ({item, index}) => {
    const isFocused = focusedIndex === index && rowFocus === 'grid';

    return (
      <TouchableOpacity
        onFocus={() => setFocusedIndex(index)}
        focusable
        hasTVPreferredFocus={index === 0 && rowFocus === 'grid'}
        // onPress={() => navigation.navigate('VODScreen', { seasonID: item?._id })}
        style={{
          width: cardWidth,
          height: cardHeight,
          margin: itemMargin,
          borderWidth: isFocused ? scale(2) : 0,
          borderColor: isFocused ? COLORS.white : 'transparent',
          overflow: 'hidden',
        }}>
        <Image
          source={{uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobileBanner}`}}
          style={styles.gridImage}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={() => navigation.goBack()} />
      <Header title={popularName} showSearchIcon={false} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{paddingBottom: scale(40)}}
          showsVerticalScrollIndicator={false}>
          {renderLiveBanner()}
          {renderFeaturedSections()}

          <Text style={styles.sectionTitle}>All Seasons</Text>

          <FlatList
            data={featureList}
            renderItem={renderSeasonItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            scrollEnabled={false} // Disable internal scroll, controlled by ScrollView
          />
        </ScrollView>
      )}

      <CAlertModal
        visible={modalVisible}
        message={modalMessage}
        type="error"
        btnTitle="OK"
        onOkPress={() => setModalVisible(false)}
      />
    </View>
  );
};

export default ChannelDetailsTV;
