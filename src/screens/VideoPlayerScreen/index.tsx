
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  TVEventHandler,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTVEventHandler } from 'react-native';
import { navigationRef } from '../../App';

// Types
type VideoPlayerScreenProps = {
  route: RouteProp<any, any> & { params: { videoUri: string; streamName: string } };
  navigation: StackNavigationProp<any, any>;
};

const SEEK_STEP = 10; // seconds
const CONTROLS_HIDE_TIMEOUT = 5000;
const SAFE_HORIZONTAL_PADDING = 60;

const VideoPlayerScreen = ({ route }: VideoPlayerScreenProps) => {
  const { videoUri, streamName } = route.params;
  const videoRef = useRef<VideoRef | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Focusable refs
  const rewindRef = useRef<any>(null);
  const playRef = useRef<any>(null);
  const forwardRef = useRef<any>(null);
  const muteRef = useRef<any>(null);
  const sliderRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const subtitlesRef = useRef<any>(null);
  const fullscreenRef = useRef<any>(null);

  // State
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [focusedControl, setFocusedControl] = useState('play');
  const [muted, setMuted] = useState(false);
  const [sliderFocused, setSliderFocused] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [seeking, setSeeking] = useState(false);

  // Format time helper
  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    const hours = Math.floor(t / 3600);
    const min = Math.floor((t % 3600) / 60);
    const sec = Math.floor(t % 60);
    
    if (hours > 0) {
      return `${hours}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Show controls and auto-hide after timeout
  const showAndScheduleHide = () => {
    setShowControls(true);
    fadeAnim.setValue(1);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, CONTROLS_HIDE_TIMEOUT);
  };

  
useEffect(() => {
  const unsubscribe = navigationRef.addListener('beforeRemove', (e) => {
    if (showControls && focusedControl !== '') {
      console.log('Blocked back navigation because control is focused');
      e.preventDefault(); // Block going back
    }
  });
  return unsubscribe;
}, [showControls, focusedControl]);
useTVEventHandler((evt) => {
  if (!evt || !evt.eventType) return;

  console.log('TV event:', evt.eventType);

  // Always show controls on key press
  if (!showControls) {
    setShowControls(true);
    fadeAnim.setValue(1);
  }

  // Reset hide timeout
  if (hideTimeout.current) clearTimeout(hideTimeout.current);
  hideTimeout.current = setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  }, CONTROLS_HIDE_TIMEOUT);

  // 🔒 Block select key globally if control is focused
  if (focusedControl && (evt.eventType === 'select' || evt.eventType === 'playPause')) {
    console.log(`Select key pressed while ${focusedControl} is focused — letting Touchable handle it`);
    return true; // Don't let it bubble further
  }

  // 🎯 Slider seeking
  if (sliderFocused) {
    if (evt.eventType === 'right') {
      setSliderValue((v) => Math.min(duration, v + 10));
      setSeeking(true);
    } else if (evt.eventType === 'left') {
      setSliderValue((v) => Math.max(0, v - 10));
      setSeeking(true);
    } else if (evt.eventType === 'select') {
      videoRef.current?.seek(sliderValue);
      setCurrentTime(sliderValue);
      setSeeking(false);
    }
    return;
  }

  // ➡ Default seeking
  if (!focusedControl) {
    if (evt.eventType === 'right') {
      videoRef.current?.seek(Math.min(duration, currentTime + SEEK_STEP));
    } else if (evt.eventType === 'left') {
      videoRef.current?.seek(Math.max(0, currentTime - SEEK_STEP));
    } else if (evt.eventType === 'select') {
      setPaused((prev) => !prev);
    }
  }
});
  // Slider focus/seek logic
  useEffect(() => {
    if (!sliderFocused) {
      setSliderValue(currentTime);
      setSeeking(false);
    }
  }, [currentTime, sliderFocused]);

  // Clean up hide timeout
  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  // Calculate progress for seekbar
  const progress = duration > 0 ? (sliderFocused ? sliderValue : currentTime) / duration : 0;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        muted={muted}
        resizeMode="contain"
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={(prog) => {
          if (!seeking) setCurrentTime(prog.currentTime);
        }}
        onEnd={() => setPaused(true)}
      />
      
      {showControls && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          {/* Top gradient */}
          <View style={styles.topGradient} />
          
          {/* Bottom gradient with controls */}
          <View style={styles.bottomGradient} />
          
          {/* Title at top left */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{streamName}</Text>
          </View>

          {/* Bottom controls area */}
          <View style={styles.bottomControls}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <TouchableOpacity
                ref={sliderRef}
                focusable
                onFocus={() => {
                  console.log('Progress bar focused');
                  setSliderFocused(true);
                }}
                onBlur={() => {
                  console.log('Progress bar blurred');
                  setSliderFocused(false);
                }}
                onPress={() => {
                  console.log('Progress bar pressed!');
                  if (sliderFocused) {
                    videoRef.current?.seek(sliderValue);
                    setCurrentTime(sliderValue);
                    setSeeking(false);
                  }
                }}
                style={[styles.progressTouchable, sliderFocused && styles.progressFocused]}
                activeOpacity={1}
              >
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  <View 
                    style={[
                      styles.progressThumb, 
                      { left: `${progress * 100}%` },
                      sliderFocused && styles.progressThumbFocused
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Controls row */}
            <View style={styles.controlsContainer}>
              {/* Left side controls */}
              <View style={styles.leftControls}>
                <TouchableOpacity
                  ref={playRef}
                  focusable
                  onPress={() => setPaused(prev => !prev)}
                  onFocus={() => setFocusedControl('play')}
                  onBlur={() => setFocusedControl('')}
                  style={[styles.playButton, focusedControl === 'play' && styles.focusedButton]}
                >
                  <Icon 
                    name={paused ? 'play' : 'pause'} 
                    size={scale(25)} 
                    color={COLORS.white} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  ref={rewindRef}
                  focusable
                  onPress={() => {
                    console.log('Rewind button pressed!');
                    videoRef.current?.seek(Math.max(0, currentTime - SEEK_STEP));
                  }}
                  onFocus={() => setFocusedControl('rewind')}
                  onBlur={() => setFocusedControl('')}
                  style={[styles.controlButton, focusedControl === 'rewind' && styles.focusedButton]}
                  activeOpacity={0.7}
                >
                  {/* <Icon name="play-back" size={scale(18)} color={COLORS.white} /> */}
                              <MIcon name="replay-10" size={scale(22)} color={COLORS.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  ref={forwardRef}
                  focusable
                  onPress={() => {
                    console.log('Forward button pressed!');
                    videoRef.current?.seek(Math.min(duration, currentTime + SEEK_STEP));
                  }}
                  onFocus={() => setFocusedControl('forward')}
                  onBlur={() => setFocusedControl('')}
                  style={[styles.controlButton, focusedControl === 'forward' && styles.focusedButton]}
                  activeOpacity={0.7}
                >
                  {/* <Icon name="play-forward" size={scale(18)} color={COLORS.white} /> */}
                    <MIcon name="forward-10" size={scale(22)} color={COLORS.white} />

                </TouchableOpacity>

               
                {/* Time display */}
                <Text style={styles.timeText}>
                  {formatTime(sliderFocused ? sliderValue : currentTime)} / {formatTime(duration)}
                </Text>
              </View>

              {/* Right side controls */}
              <View style={styles.rightControls}>
                 <TouchableOpacity
                  ref={muteRef}
                  focusable
                  onPress={() => {
                    console.log('Mute button pressed!');
                    setMuted(m => !m);
                  }}
                  onFocus={() => setFocusedControl('mute')}
                  onBlur={() => setFocusedControl('')}
                  style={[styles.controlButton, focusedControl === 'mute' && styles.focusedButton]}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={muted ? 'volume-mute' : 'volume-high'} 
                    size={scale(20)} 
                    color={COLORS.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  ref={fullscreenRef}
                  focusable
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    console.log('Fullscreen pressed');
                  }}
                  onFocus={() => setFocusedControl('fullscreen')}
                  onBlur={() => setFocusedControl('')}
                  style={[styles.controlButton, focusedControl === 'fullscreen' && styles.focusedButton]}
                  activeOpacity={0.8}
                >
                  <Icon name="expand-outline" size={scale(20)} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(30),
    // background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
    backgroundColor: 'rgba(0,0,0,0.6)', // Fallback for React Native
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
    backgroundColor: 'rgba(0,0,0,0.8)', // Fallback for React Native
  },
  titleContainer: {
    position: 'absolute',
    top: 30,
    left: SAFE_HORIZONTAL_PADDING,
    right: SAFE_HORIZONTAL_PADDING,
  },
  titleText: {
    color: COLORS.white,
    fontSize: scale(10),
    textAlign:'center',
    // fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: scale(10),
    paddingHorizontal: SAFE_HORIZONTAL_PADDING,
  },
  progressContainer: {
    marginBottom: scale(8),
    paddingVertical: scale(5),
  },
  progressTouchable: {
    height: scale(5),
    justifyContent: 'center',
  },
  progressFocused: {
    // Add focus ring effect
  },
  progressTrack: {
   height: scale(5),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: scale(5),
    position: 'relative',
  },
  progressFill: {
    height: scale(5),
    backgroundColor:COLORS.primary,
    borderRadius: scale(5),
  },
  progressThumb: {
    position: 'absolute',
    top: -7,
    width: scale(8),
    height: scale(8),
    backgroundColor: COLORS.primary,
    borderRadius: scale(25),
    marginLeft: -10,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressThumbFocused: {
    transform: [{ scale: 1.4 }],
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    // backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  focusedButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ scale: 1.15 }],
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  timeText: {
    color: COLORS.white,
    fontSize: scale(12),
    // fontWeight: '600',
    marginLeft: scale(20),
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default VideoPlayerScreen;