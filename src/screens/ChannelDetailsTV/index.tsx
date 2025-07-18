
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
import CTrendingVideos from '../../components/CTrendingVideos'; // reuse existing one
import styles from './styles';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';

const width = Dimensions.get('window').width;
const numColumns = 3;
const itemMargin = scale(16);
const itemWidth = (width - itemMargin * (numColumns + 1)) / numColumns;

const ChannelDetailsTV = ({ route }) => {
  const { channelId } = route.params || {};
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

  const liveDotAnim = useRef(new Animated.Value(1)).current;

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
      ])
    ).start();
  };

  const fetchShowDetails = useCallback(async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await apiHelper.get(`${LIVE_SHOW_DETAIL}/${channelId}`, {}, {
        headers: {'Time-Zone': timezone },
      });
      if(response?.status === 200){
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
      if (!channelId) {
        throw new Error('No stream selected.');
      }

      const sliderUrl = `${CHANNELS_SLIDER}/${channelId}`; // slider (live)
      const nameUrl = `${CHANNELS}/${channelId}`; // featured name display
      const featureListUrl = `${CHANNELS_DETAIL_LIST}/${channelId}`; //feature list
      //   const latestSeasonUrl = `${SEASON_LIST}/?trending=false`;

      const [sliderResult, nameResult, featureResult, latestSeasonResult] =
        await Promise.allSettled([
          apiHelper.get(sliderUrl),
          apiHelper.get(nameUrl),
          apiHelper.get(featureListUrl),
          // apiHelper.get(latestSeasonUrl),
        ]);

      // Handle Slider Result
      if (
        sliderResult.status === 'fulfilled' &&
        sliderResult.value?.status === 200
      ) {
        setChannelSliderData(sliderResult.value?.data?.tvShow || []);
      } else {
        console.warn('Slider fetch failed:', sliderResult.reason);
      }

      // Handle Name Result
      if (
        nameResult.status === 'fulfilled' &&
        nameResult.value?.status === 200
      ) {
        setPopularName(nameResult.value?.data?.name);
      } else {
        console.warn('Name fetch failed:', nameResult.reason);
      }

      // Handle Feature List Result
      if (
        featureResult.status === 'fulfilled' &&
        featureResult.value?.status === 200
      ) {
        setFeatureList(featureResult.value.data?.channel || []);
      } else {
        console.warn('Feature list fetch failed:', featureResult.reason);
      }
    } catch (error: any) {
      setModalMessage(error?.message || 'An error occurred. Please try again.');
    //   setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

//   const fetchChannelData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [sliderRes, channelRes, featureRes] = await Promise.all([
//         apiHelper.get(`${CHANNELS_SLIDER}/${channelId}`),
//         apiHelper.get(`${CHANNELS}/${channelId}`),
//         apiHelper.get(`${CHANNELS_DETAIL_LIST}/${channelId}`),
//       ]);

//       if (sliderRes?.status === 200) setChannelSliderData(sliderRes.data?.tvShow ?? []);
//       if (channelRes?.status === 200) setPopularName(channelRes.data?.name ?? '');
//       if (featureRes?.status === 200) setFeatureList(featureRes.data?.channel ?? []);

//     } catch (err) {
//       setModalMessage('Server error.');
//       setModalVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   }, [channelId]);

  useEffect(() => {
    fetchChannelData();
    fetchShowDetails();
    animateLiveDot();
  }, []);

  const keyExtractor = (item, index) => String(item?._id || index);

  // 🔴 LIST 1 - Slider Banner (Live Now)
  const renderLiveBanner = () => {
    if (!channelSliderData?.length || showType !== 'Live') return null;
    const bannerItem = showDetails?.tvShows?.[0];

    return (
      <TouchableHighlight
        hasTVPreferredFocus={true}
        onPress={() =>
          navigation.navigate('BannerDetail', {
            channeDetaillID: channelId,
          })
        }
        underlayColor={COLORS.primary + '22'}
        style={styles.sliderBanner}
      >
        <>
          <Image
            source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${bannerItem?.banner}` }}
            style={styles.sliderImage}
          />
          <View style={styles.liveBadge}>
            <Animated.View style={[
              styles.liveDot,
              { transform: [{ scale: liveDotAnim }] },
            ]}/>
            <Text style={styles.liveText}>Live Now</Text>
          </View>
        </>
      </TouchableHighlight>
    );
  };

  // 🟣 LIST 2 - Featured (re-using CTrendingVideos)
  const renderFeaturedList = () => (
    featureList?.length > 0 ? (
      <CTrendingVideos
        trendingVideosData={featureList}
        title={`Featured in ${popularName}`}
        imageKey="mobilePosterImage"
        showViewAllText={false}
        bannerImg
         itemHeight={scale(120)}
        itemWidth={scale(90)}
        onImagePress={(item) => navigation.navigate('VODScreen', { seasonID: item?._id })}
      />
    ) : null
  );

  // 🔵 LIST 3 - All seasons grid
  const renderSeasonItem = ({ item, index }) => (
    <TouchableHighlight
      onPress={() => navigation.navigate('VODScreen', { seasonID: item?._id })}
      hasTVPreferredFocus={index === 0}
      underlayColor={COLORS.primary + '33'}
      style={{
        margin: itemMargin / 2,
        width: itemWidth,
        height: itemWidth * 0.55,
        borderRadius: scale(6),
        overflow: 'hidden',
        backgroundColor: COLORS.darkGray,
      }}
    >
      <Image
        source={{
          uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.mobileBanner}`,
        }}
        style={styles.gridImage}
      />
    </TouchableHighlight>
  );

  return (
    <View style={styles.container}>
      <BackHandlerComponent onBackPress={() => navigation.goBack()} />
      <Header
        title={popularName}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showSearchIcon={false}
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {renderLiveBanner()}
          {renderFeaturedList()}

          <Text style={styles.sectionTitle}>All Seasons</Text>
          <FlatList
            data={featureList}
            renderItem={renderSeasonItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: scale(12),
              paddingBottom: scale(40),
            }}
          />
        </>
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
