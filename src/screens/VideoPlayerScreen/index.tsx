import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
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

const SEEK_STEP = 10; // seconds
const CONTROLS_HIDE_TIMEOUT = 5000;
const SAFE_HORIZONTAL_PADDING = 60;

type VideoPlayerScreenProps = {
  route: RouteProp<any, any> & { params: { videoUri: string; streamName: string } };
  navigation: StackNavigationProp<any, any>;
};

const VideoPlayerScreen = ({ route }: VideoPlayerScreenProps) => {
  const { videoUri, streamName } = route.params;
  const videoRef = useRef<VideoRef | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Properly typed ref for slider
  const sliderRef = useRef<TouchableOpacity | null>(null);

  // Other focusable refs if needed:
  const playRef = useRef<TouchableOpacity | null>(null);
  const rewindRef = useRef<TouchableOpacity | null>(null);
  const forwardRef = useRef<TouchableOpacity | null>(null);
  const muteRef = useRef<TouchableOpacity | null>(null);
  const fullscreenRef = useRef<TouchableOpacity | null>(null);

  // State
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [focusedControl, setFocusedControl] = useState('');
  const [muted, setMuted] = useState(false);
  const [sliderFocused, setSliderFocused] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showBigCenterIcon, setShowBigCenterIcon] = useState(false);
  const [centerIconType, setCenterIconType] = useState<'play' | 'pause'>('pause');

  const [videoScale, setVideoScale] = useState(1);
const MIN_SCALE = 1;
const MAX_SCALE = 3; // max zoom x3
const SCALE_STEP = 0.25;

  // Format time helper - mm:ss or hh:mm:ss
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

  // Show controls and schedule hide
  const showAndScheduleHide = useCallback(() => {
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
  }, [fadeAnim]);

  // Prevent accidental back navigation when a control is focused
  useEffect(() => {
    const unsubscribe = navigationRef.addListener('beforeRemove', (e) => {
      if (showControls && focusedControl !== '') {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [showControls, focusedControl]);

  // TV event handler for remote
  useTVEventHandler((evt) => {
    if (!evt || !evt.eventType) return;

    // Always show controls and reset hide timer
    if (!showControls) {
      showAndScheduleHide();
    }

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, CONTROLS_HIDE_TIMEOUT);

    // If a control is focused, block select/playPause here so Touchable handles it
    if (focusedControl && (evt.eventType === 'select' || evt.eventType === 'playPause')) {
      return true;
    }

    // Slider controls when focused
    if (sliderFocused) {
      if (evt.eventType === 'right' || evt.eventType === 'fastForward' || evt.eventType === 'seekForward' || evt.eventType === 'seekRight' || evt.eventType === 'swipeRight') {
        setSliderValue((v) => Math.min(duration, v + SEEK_STEP));
        setSeeking(true);
      } else if (evt.eventType === 'left' || evt.eventType === 'rewind' || evt.eventType === 'seekBackward' || evt.eventType === 'seekLeft' || evt.eventType === 'swipeLeft') {
        setSliderValue((v) => Math.max(0, v - SEEK_STEP));
        setSeeking(true);
      } else if (evt.eventType === 'select') {
        videoRef.current?.seek(sliderValue);
        setCurrentTime(sliderValue);
        setSeeking(false);
        setShowBigCenterIcon(true);
        setCenterIconType('pause');
        setTimeout(() => setShowBigCenterIcon(false), 900);
      }
      return;
    }

      // Zoom keys when no control or slider focused
    if (!focusedControl && !sliderFocused) {
      if (evt.eventType === 'up') {
        setVideoScale((scale) => Math.min(MAX_SCALE, scale + SCALE_STEP));
        showAndScheduleHide();
        return true;
      }

      if (evt.eventType === 'down') {
        setVideoScale((scale) => Math.max(MIN_SCALE, scale - SCALE_STEP));
        showAndScheduleHide();
        return true;
      }
    }
    

    // If no control focused: Left/Right seek, select/playPause toggle
    if (!focusedControl) {
      if (evt.eventType === 'right') {
        const newTime = Math.min(duration, currentTime + SEEK_STEP);
        videoRef.current?.seek(newTime);
        setCurrentTime(newTime);
        setShowBigCenterIcon(true);
        setCenterIconType('pause');
        setTimeout(() => setShowBigCenterIcon(false), 700);
      } else if (evt.eventType === 'left') {
        const newTime = Math.max(0, currentTime - SEEK_STEP);
        videoRef.current?.seek(newTime);
        setCurrentTime(newTime);
        setShowBigCenterIcon(true);
        setCenterIconType('pause');
        setTimeout(() => setShowBigCenterIcon(false), 700);
      } else if (evt.eventType === 'select' || evt.eventType === 'playPause') {
        handlePlayPause();
      }
    }
  });

  // Sync sliderValue with currentTime when slider not focused
  useEffect(() => {
    if (!sliderFocused) {
      setSliderValue(currentTime);
      setSeeking(false);
    }
  }, [currentTime, sliderFocused]);

  // Real-time seek while user is seeking with slider focused
  useEffect(() => {
    if (sliderFocused && seeking) {
      videoRef.current?.seek(sliderValue);
      setCurrentTime(sliderValue);
    }
  }, [sliderValue, seeking, sliderFocused]);

  // Clear timers on component unmount
  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  // Play/Pause toggle handler with center overlay icon
  const handlePlayPause = useCallback(() => {
    setPaused((prev) => {
      const nowPaused = !prev;
      setShowBigCenterIcon(true);
      setCenterIconType(nowPaused ? 'play' : 'pause');
      setTimeout(() => setShowBigCenterIcon(false), 900);
      return nowPaused;
    });
    showAndScheduleHide();
  }, [showAndScheduleHide]);

  const progress = duration > 0 ? (sliderFocused ? sliderValue : currentTime) / duration : 0;

  // Handle press anywhere outside controls: toggle play/pause
  const handleAnyAreaPress = () => {
    if (!focusedControl && !sliderFocused) {
      handlePlayPause();
    } else {
      showAndScheduleHide();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleAnyAreaPress}>
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          // style={StyleSheet.absoluteFill}
style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: videoScale }] },  // <-- here zoom applied
          ]}
          paused={paused}
          muted={muted}
          resizeMode="contain"
          onLoad={(meta) => setDuration(meta.duration)}
          onProgress={({ currentTime: progTime }) => {
            if (!seeking) setCurrentTime(progTime);
          }}
          onEnd={() => setPaused(true)}
        />

        {/* Big center play/pause icon */}
        {showBigCenterIcon && (
          <View style={styles.centerIconWrap}>
            <View style={styles.centerIconBg}>
              <Icon
                name={centerIconType === 'play' ? 'play' : 'pause'}
                color={COLORS.white}
                size={scale(30)}
              />
            </View>
          </View>
        )}

        {/* Controls overlay */}
        {showControls && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <View style={styles.topGradient} />
            <View style={styles.bottomGradient} />
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>{streamName}</Text>
            </View>

            <View style={styles.bottomControls}>
              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <TouchableOpacity
                  ref={sliderRef}
                  focusable
                  onFocus={() => setSliderFocused(true)}
                  onBlur={() => {
                    setSliderFocused(false);
                    setSeeking(false);
                  }}
                  onPress={() => {
                    if (sliderFocused) {
                      videoRef.current?.seek(sliderValue);
                      setCurrentTime(sliderValue);
                      setSeeking(false);
                      showAndScheduleHide();
                    }
                  }}
                  style={[styles.progressTouchable, sliderFocused && styles.progressFocused]}
                  activeOpacity={1}
                    accessible
                    accessibilityRole="adjustable"
                    accessibilityHint="Swipe or press right/left to seek"
                    accessibilityActions={[
                      { name: 'increment' },
                      { name: 'decrement' },
                    ]}
               onAccessibilityAction={(e) => {
                const name = e.nativeEvent.actionName;
                const effDuration = duration > 0 ? duration : Math.max(currentTime + 1, sliderValue + 1);
                if (name === 'increment') {
                  setSliderValue(v => Math.min(effDuration, v + SEEK_STEP));
                  setSeeking(true);
                } else if (name === 'decrement') {
                  setSliderValue(v => Math.max(0, v - SEEK_STEP));
                  setSeeking(true);
                }
              }}
                >
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    <View
                      style={[
                        styles.progressThumb,
                        { left: `${progress * 100}%` },
                        sliderFocused && styles.progressThumbFocused,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Controls row */}
              <View style={styles.controlsContainer}>
                <View style={styles.leftControls}>
                  <TouchableOpacity
                    ref={playRef}
                    focusable
                    onPress={handlePlayPause}
                    onFocus={() => setFocusedControl('play')}
                    onBlur={() => setFocusedControl('')}
                    style={[styles.playButton, focusedControl === 'play' && styles.focusedButton]}
                  >
                    <Icon name={paused ? 'play' : 'pause'} size={scale(25)} color={COLORS.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    ref={rewindRef}
                    focusable
                    onPress={() => {
                      const newTime = Math.max(0, currentTime - SEEK_STEP);
                      videoRef.current?.seek(newTime);
                      setCurrentTime(newTime);
                      setShowBigCenterIcon(true);
                      setCenterIconType('pause');
                      setTimeout(() => setShowBigCenterIcon(false), 700);
                      showAndScheduleHide();
                    }}
                    onFocus={() => setFocusedControl('rewind')}
                    onBlur={() => setFocusedControl('')}
                    style={[styles.controlButton, focusedControl === 'rewind' && styles.focusedButton]}
                    activeOpacity={0.7}
                  >
                    <MIcon name="replay-10" size={scale(22)} color={COLORS.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    ref={forwardRef}
                    focusable
                    onPress={() => {
                      const newTime = Math.min(duration, currentTime + SEEK_STEP);
                      videoRef.current?.seek(newTime);
                      setCurrentTime(newTime);
                      setShowBigCenterIcon(true);
                      setCenterIconType('pause');
                      setTimeout(() => setShowBigCenterIcon(false), 700);
                      showAndScheduleHide();
                    }}
                    onFocus={() => setFocusedControl('forward')}
                    onBlur={() => setFocusedControl('')}
                    style={[styles.controlButton, focusedControl === 'forward' && styles.focusedButton]}
                    activeOpacity={0.7}
                  >
                    <MIcon name="forward-10" size={scale(22)} color={COLORS.white} />
                  </TouchableOpacity>

                  <Text style={styles.timeText}>
                    {formatTime(sliderFocused ? sliderValue : currentTime)} / {formatTime(duration)}
                  </Text>
                </View>

                <View style={styles.rightControls}>
                  <TouchableOpacity
                    ref={muteRef}
                    focusable
                    onPress={() => setMuted((m) => !m)}
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
                    onPress={() => {
                      // Handle fullscreen toggle if needed
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
    </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    textAlign: 'center',
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
  progressFocused: {},
  progressTrack: {
    height: scale(5),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: scale(5),
    position: 'relative',
  },
  progressFill: {
    height: scale(5),
    backgroundColor: COLORS.primary,
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  progressThumbFocused: {
    // transform: [{ scale: 1.2 }],
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    borderRadius:scale(25),
    width: scale(8),
    height: scale(8),
    
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
    marginLeft: scale(20),
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centerIconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  centerIconBg: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: scale(50),
    width: scale(50),
    height: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayerScreen;
