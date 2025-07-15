import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Text,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PixelRatio,
  useWindowDimensions,
  PanResponder,
  PermissionsAndroid,
  Linking,
  Easing,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import AIcon from 'react-native-vector-icons/AntDesign';
// import Orientation from 'react-native-orientation-locker';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { IMAGES } from '../../theme/images';
import { FONTS } from '../../utils/fonts';
import { TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import { debounce } from 'lodash';
import { DEFAULTIMAGE, NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import apiHelper from '../../config/apiHelper';

interface CVideoPlayerProps {
  videoUri: string;
  streamName: string;
  onClose: () => void;
}

const CVideoPlayer: React.FC<CVideoPlayerProps> = ({ videoUri, streamName, onClose }) => {
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scaleVideo, setScaleVideo] = useState(1);
  const [showSeekIndicator, setShowSeekIndicator] = useState<'forward' | 'backward' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSliding, setIsSliding] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number | null>(null);
  const isTablet = useSelector((state: RootState) => state.auth.isTablet);
  const PLAYER_ASPECT = 16 / 9;          // or 9/16 for a portrait feed
  const { width: scrW, height: scrH } = useWindowDimensions();
  const screenAspect = scrW / scrH;
  const videoStyle = screenAspect >= PLAYER_ASPECT
    ? { width: scrH * PLAYER_ASPECT, height: scrH }   // fit‐height, add pillar-boxes
    : { width: scrW, height: scrW / PLAYER_ASPECT };  // fit‐width, add letter-boxes
    const brightnessValue = useRef(new Animated.Value(1)).current;
    const [brightness, setBrightness] = useState(1);
    const brightnessBarHeight =  isTablet ? 250 : 120; // Must match your styles
    const brightnessAnim = useRef(new Animated.Value(1)).current;
const [defaultImageUri, setDefaultImageUri] = useState<string | null>(null);
const [showPlaceholder, setShowPlaceholder] = useState(true);

// Debounce brightness updates to reduce jitter
const setBrightnessDebounced = useRef(
  debounce((value: number) => {
    DeviceBrightness.setBrightnessLevel(value);
  }, 50)
).current;

    useEffect(() => {
      DeviceBrightness.getBrightnessLevel().then(level => setBrightness(level));
    }, []);

// PermissionsAndroid for brigthness
  useEffect(() => {
  async function setup() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_SETTINGS,
        {
          title: "Write Settings Permission",
          message: "App needs permission to change brightness.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Linking.openSettings();
      }
    }

    const level = await DeviceBrightness.getBrightnessLevel();
    setBrightness(level);
  }
  setup();
}, []);

useEffect(() => {
  const fetchDefaultImage = async () => {
    try {
      const response = await apiHelper.get(DEFAULTIMAGE);
      const res = response?.data;

      // console.log("res>", res);

      if (res?.data?.placeholderImage) {
        const imageId = res.data.placeholderImage;
        const imageUrl = `${NEXT_PUBLIC_API_CDN_ENDPOINT}${imageId}`;
        // console.log("imageUrl.",imageUrl);
                setDefaultImageUri(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching default image:', error);
    }
  };
  fetchDefaultImage();
}, []);




// for brightness
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
          handleBarPress(evt.nativeEvent);
        },
        onPanResponderMove: (evt, gestureState) => {
          handleBarPress(evt.nativeEvent);
        },
      })
    ).current;
    const handleBarPress = (nativeEvent) => {
  const { locationY } = nativeEvent;
  let value = 1 - locationY / brightnessBarHeight;
  value = Math.max(0, Math.min(1, value));

  if (Math.abs(brightness - value) > 0.005) {
    Animated.timing(brightnessValue, {
      toValue: value,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    setBrightness(value);
    setBrightnessDebounced(value);
  }
};
  
  // back-forword animation
  const replayAnim = useRef(new Animated.Value(1)).current;
  const forwardAnim = useRef(new Animated.Value(1)).current;

  const triggerSeekAnimation = (type: 'forward' | 'backward') => {
    const anim = type === 'forward' ? forwardAnim : replayAnim;
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const videoRef = useRef<Video>(null);
  const resetHideControlsTimer = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  };


  const handleSingleOrDoubleTap = (tapX: number) => {
    const screenWidth = Dimensions.get('window').width;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      if (tapX < screenWidth / 2) {
        seekVideo(currentTime - 10, 'backward');
      } else {
        seekVideo(currentTime + 10, 'forward');
      }
    } else {
      setControlsVisible((prev) => !prev);
      resetHideControlsTimer();
    }
    lastTap.current = now;
  };



  useEffect(() => {
    if (controlsVisible) {
      // every time we show the controls, arm the auto-hide timer
      setTimeout(() =>
        setControlsVisible(false),
        7000)
    }
  }, [controlsVisible]);
  
  const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`; // HH:MM:SS
  } else {
    return `${minutes}:${pad(seconds)}`; // MM:SS
  }
};

  const seekVideo = (time: number, type: 'forward' | 'backward') => {
    const clampedTime = Math.max(0, Math.min(duration, time));
    videoRef.current?.seek(clampedTime);
    setShowSeekIndicator(type);
    triggerSeekAnimation(type);
    setTimeout(() => setShowSeekIndicator(null), 800);
  };


  const toggleZoom = () => {
    setScaleVideo((prev) => (prev === 1 ? 1.5 : 1));
  };

  // const handleLoadStart = () => setLoading(true);
  // const handleLoad = (data: { duration: number }) => {
  //   setLoading(false);
  //   setDuration(data.duration);
  // };

const handleLoadStart = () => {
  setLoading(true);
};

const handleLoad = (data: { duration: number }) => {
  // console.log("data>",data);
  // console.log("duration>",data?.duration);
  setLoading(false);
  setDuration(data.duration);
  setShowPlaceholder(false); // hide image after video loads
};
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
 
{showPlaceholder && defaultImageUri && (
  <View style={styles.fullscreenPlaceholder}>
    <Image
      source={{ uri: defaultImageUri }}
      style={styles.video}
      resizeMode="contain"
    />
  </View>
)}

      <TouchableWithoutFeedback onPress={(e) => handleSingleOrDoubleTap(e.nativeEvent.locationX)}>
        <Animated.View style={{ transform: [{ scale: scaleVideo }],flex:1 }} >
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            // style={[styles.video,{aspectRatio:  Platform.OS === 'ios' ? 16/9 : isTablet ? 15/17 : 18 / 8,}]}
            // resizeMode="cover"
            repeat={false}
            resizeMode="contain"
            paused={paused}
            muted={isMuted}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onProgress={(data) => {
              if (!isSliding) setCurrentTime(data.currentTime);
              resetHideControlsTimer();
            }}
            onEnd={onClose} 
            bufferConfig={{
               minBufferMs: 15000,
              maxBufferMs: 60000,
              bufferForPlaybackMs: 3000,
              bufferForPlaybackAfterRebufferMs: 6000,
            }}
            repeat
          />
          
        </Animated.View>
             
        </TouchableWithoutFeedback>
        {controlsVisible && (
      <View style={styles.controls}>




        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <AIcon name="arrowleft" size={isTablet ? 28 : 24} color={COLORS.white} /> 
          </TouchableOpacity>
          <Text style={[styles.streamName,{ fontSize: isTablet ? scale(8) : scale(16),}]}>{streamName}</Text>
        </View>

        {/* Center Controls */}
        <View style={[styles.centerControls]}>
           {/* Brightness Slider */}
      <View style={styles.brightnessSliderContainer}>
            <Icon name="sunny" size={isTablet ? 25 : 28} color={COLORS.white} style={styles.sunIcon} />
         
            <View style={[styles.brightnessContainer,{
              width: isTablet ? scale(15) : scale(25),
            }]}>
<Animated.View
  style={[
    styles.brightnessBar,
    {
      height: brightnessBarHeight, // Full bar height
    },
  ]}
  {...panResponder.panHandlers}
>
  <Animated.View
    style={[
      styles.brightnessLevel,
      {
        height: brightnessValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, brightnessBarHeight],
        }),
      },
    ]}
  />
</Animated.View>
</View>

          </View>
          <TouchableOpacity onPress={() => seekVideo(currentTime - 10, 'backward')}>
            <Animated.View style={{ transform: [{ scale: replayAnim }] }}>
            <MIcon name="replay-10" size={isTablet ? scale(25) : scale(45)} color={COLORS.white} />
          </Animated.View>
          </TouchableOpacity>
          {showSeekIndicator === 'backward' && <Text style={styles.seekTextLeft}>-10s</Text>}

          <TouchableOpacity onPress={() => setPaused(!paused)} >
            <Icon name={paused ? 'play' : 'pause'} size={isTablet ? scale(25) : scale(55)} color={COLORS.white} />
          </TouchableOpacity>

          {showSeekIndicator === 'forward' && <Text style={styles.seekTextRight}>+10s</Text>}
          <TouchableOpacity onPress={() => seekVideo(currentTime + 10, 'forward')}>
            <Animated.View style={{ transform: [{ scale: forwardAnim }] }}>
            <MIcon name="forward-10" size={isTablet ? scale(25) : scale(45)} color={COLORS.white} />
          </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={[styles.bottomControls,{
          marginBottom:isTablet ? scale(30) : scale(20),
        }]}>
          <TouchableOpacity onPress={toggleZoom}>
            <Icon name={scaleVideo === 1 ? 'resize' : 'contract'} size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* <Text style={[styles.timeText,{fontSize: isTablet ? scale(9) : scale(11)}]}>{formatTime(currentTime)}</Text> */}
<Text
  style={[styles.timeText, { 
    fontSize: isTablet ? scale(8) : scale(11) }]}
  numberOfLines={1}
  ellipsizeMode="clip"
>
  {formatTime(currentTime)}
</Text>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={(value) => {
              if (!isSliding) setCurrentTime(value); // prevent jitter
            }}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={(value) => {
              videoRef.current?.seek(value);
              setCurrentTime(value); // sync state after seek
              setIsSliding(false);
            }}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.white}
            // thumbImage={Platform.OS === 'ios' && isTablet ? IMAGES.sliderThumb3x : undefined}
            thumbTintColor={COLORS.primary}

          />

         <Text
          style={[styles.timeText, { fontSize: isTablet ? scale(8) : scale(11) }]}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
            {formatTime(duration)}</Text>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
            <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
       )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
 brightnessSliderContainer: {
    position: 'absolute',
    left: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  brightnessContainer: {
    
    backgroundColor: '#444',
    borderRadius: scale(8),
    overflow: 'hidden',
    marginTop: scale(6),
  },
  brightnessBar: {
    width: scale(30),
    backgroundColor: '#888',
    justifyContent: 'flex-end',
  },
   brightnessLevel: {
    width: '100%',
    backgroundColor:COLORS.white,
    // backgroundColor: '#FFD700', // bright yellow for visibility
  },
  sunIcon: {
    marginBottom: 8,
    opacity: 0.85,
  },
  
  video: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: scale(10),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    // backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
  backButton: { padding: 10 },
  streamName: {
    flex: 1,
    color: COLORS.white,
    fontFamily: FONTS.montSemiBold,
    textAlign: 'center',
    marginRight: scale(20),
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    // backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: scale(30),
  },
  timeText: {
    color: COLORS.white,
    marginHorizontal: scale(10),
    // width: scale(40),
    textAlign: 'center',
    fontFamily: FONTS.montSemiBold,
  },
  progressBar: {
    flex: 1,
    height: scale(40),
  },
  seekTextLeft: {
    position: 'absolute',
    left: scale(30),
    top: '50%',
    transform: [{ translateY: -10 }],
    color: COLORS.white,
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
  },
  seekTextRight: {
    position: 'absolute',
    right: scale(30),
    top: '50%',
    transform: [{ translateY: -10 }],
    color: COLORS.white,
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
  },
  fullscreenPlaceholder: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: COLORS.black,
  zIndex: 10,
  justifyContent: 'center',
  alignItems: 'center',
},

});

export default CVideoPlayer;
