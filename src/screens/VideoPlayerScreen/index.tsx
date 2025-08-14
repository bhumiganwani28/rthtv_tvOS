import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  GestureResponderEvent,
  StyleSheet as RNStyleSheet,
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

const SEEK_STEP = 10; // seconds for global navigation
const SWIPE_JUMP = 30; // seconds for swipe gestures
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

  // focusable refs
  const sliderRef = useRef<TouchableOpacity | null>(null);
  const playRef = useRef<TouchableOpacity | null>(null);
  const rewindRef = useRef<TouchableOpacity | null>(null);
  const forwardRef = useRef<TouchableOpacity | null>(null);
  const muteRef = useRef<TouchableOpacity | null>(null);
  const fullscreenRef = useRef<TouchableOpacity | null>(null);

  // State
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekableDur, setSeekableDur] = useState(0);
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
  const MAX_SCALE = 3;
  const SCALE_STEP = 0.25;

  // slider layout width for continuous scrub mapping
  const sliderWidthRef = useRef(1);

  // robust duration
  const effectiveDuration = useMemo(
    () => (duration > 0 ? duration : seekableDur > 0 ? seekableDur : 0),
    [duration, seekableDur]
  );

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return h > 0
      ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
      : `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('beforeRemove', (e) => {
      if (showControls && focusedControl !== '') e.preventDefault();
    });
    return unsubscribe;
  }, [showControls, focusedControl]);

  // Continuous sliding TV remote handler - keeps sliding as long as you hold
  useTVEventHandler((evt) => {
    if (!evt?.eventType) return;

    // Show controls on any interaction
    if (!showControls) showAndScheduleHide();
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, CONTROLS_HIDE_TIMEOUT);

    // Don't handle select/playPause if a control is focused
    if (focusedControl && (evt.eventType === 'select' || evt.eventType === 'playPause')) {
      return true;
    }

    // Handle slider-focused interactions - CONTINUOUS sliding
    if (sliderFocused) {
      const currentSeekTime = sliderValue || currentTime;
      
      // Swipe gestures for larger jumps (like YouTube)
      if (evt.eventType === 'swipeRight' || evt.eventType === 'fastForward' || 
          evt.eventType === 'seekRight' || evt.eventType === 'seekForward') {
        const jumpTime = Math.min(effectiveDuration, currentSeekTime + SWIPE_JUMP);
        instantSeek(jumpTime);
        return true;
      }
      
      if (evt.eventType === 'swipeLeft' || evt.eventType === 'rewind' || 
          evt.eventType === 'seekLeft' || evt.eventType === 'seekBackward') {
        const jumpTime = Math.max(0, currentSeekTime - SWIPE_JUMP);
        instantSeek(jumpTime);
        return true;
      }

      // D-pad arrows for CONTINUOUS sliding - keeps sliding as long as you hold
      if (evt.eventType === 'right') {
        // Ultra small increment for super smooth sliding
        const increment = Math.max(0.1, effectiveDuration / 10000); // 0.01% of duration
        const newTime = Math.min(effectiveDuration, currentSeekTime + increment);
        instantSeek(newTime);
        return true;
      }
      
      if (evt.eventType === 'left') {
        // Ultra small decrement for super smooth sliding
        const decrement = Math.max(0.1, effectiveDuration / 10000); // 0.01% of duration
        const newTime = Math.max(0, currentSeekTime - decrement);
        instantSeek(newTime);
        return true;
      }

      // Commit seek on select
      if (evt.eventType === 'select') {
        commitSeek(sliderValue);
        return true;
      }
      
      return true; // Consume all events when slider is focused
    }

    // Zoom controls when nothing is focused
    if (!focusedControl && !sliderFocused) {
      if (evt.eventType === 'up') {
        setVideoScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
        showAndScheduleHide();
        return true;
      }
      if (evt.eventType === 'down') {
        setVideoScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
        showAndScheduleHide();
        return true;
      }
    }

    // Global navigation when no control is focused
    if (!focusedControl && !sliderFocused) {
      if (evt.eventType === 'right') {
        const newTime = Math.min(effectiveDuration, currentTime + SEEK_STEP);
        commitSeek(newTime);
        return true;
      } 
      if (evt.eventType === 'left') {
        const newTime = Math.max(0, currentTime - SEEK_STEP);
        commitSeek(newTime);
        return true;
      } 
      if (evt.eventType === 'select' || evt.eventType === 'playPause') {
        handlePlayPause();
        return true;
      }
    }
  });

  // INSTANT seek functions - immediate smooth playback
  const instantSeek = useCallback((t: number) => {
    setSliderValue(t);
    setSeeking(true);
    setCurrentTime(t);
    // Immediate seek without any delays
    videoRef.current?.seek(t, 0); // 0 tolerance for immediate seek
    // Always keep video playing for smooth experience
    setPaused(false);
  }, []);

  const commitSeek = useCallback((t: number) => {
    setSliderValue(t);
    setSeeking(false);
    setCurrentTime(t);
    // Immediate seek without any delays
    videoRef.current?.seek(t, 0); // 0 tolerance for immediate seek
    // Always keep video playing for smooth experience
    setPaused(false);
    
    // Show feedback
    setShowBigCenterIcon(true);
    setCenterIconType('pause');
    setTimeout(() => setShowBigCenterIcon(false), 700);
    
    showAndScheduleHide();
  }, [showAndScheduleHide]);

  // Keep UI synced when not focused
  useEffect(() => {
    if (!sliderFocused) {
      setSliderValue(currentTime);
      setSeeking(false);
    }
  }, [currentTime, sliderFocused]);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

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

  // progress ratio (avoid NaN/0‑div)
  const progress = useMemo(() => {
    const denom = effectiveDuration > 0 ? effectiveDuration : Math.max(sliderValue, currentTime, 1);
    const num = sliderFocused ? sliderValue : currentTime;
    return Math.max(0, Math.min(1, num / denom));
  }, [effectiveDuration, sliderFocused, sliderValue, currentTime]);

  // map touch X -> time - CONTINUOUS smooth mapping
  const positionFromX = (x: number) => {
    const w = Math.max(1, sliderWidthRef.current);
    const ratio = Math.max(0, Math.min(1, x / w));
    return (effectiveDuration || 0) * ratio;
  };

  // INSTANT responder handlers for continuous scrubbing
  const onSliderLayout = (e: LayoutChangeEvent) => {
    sliderWidthRef.current = e.nativeEvent.layout.width;
  };

  const onSliderGrant = (e: GestureResponderEvent) => {
    if (!sliderFocused) setSliderFocused(true);
    const x = e.nativeEvent.locationX;
    const t = positionFromX(x);
    instantSeek(t);
  };

  const onSliderMove = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const t = positionFromX(x);
    instantSeek(t);
  };

  const onSliderRelease = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const t = positionFromX(x);
    commitSeek(t);
  };

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
          style={[
            RNStyleSheet.absoluteFill,
            { transform: [{ scale: videoScale }] },
          ]}
          paused={paused}
          muted={muted}
          resizeMode="contain"
          onLoad={(meta) => setDuration(meta.duration || 0)}
          onProgress={({ currentTime: progTime, seekableDuration }) => {
            // when scrubbing we drive currentTime locally; otherwise follow player
            if (!seeking && !sliderFocused) setCurrentTime(progTime);
            if (!duration && seekableDuration && seekableDuration > 0) {
              setSeekableDur(seekableDuration);
            }
          }}
          onEnd={() => setPaused(true)}
        />

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

        {showControls && (
          <Animated.View pointerEvents="box-none" style={[styles.overlay, { opacity: fadeAnim }]}>
            <View style={styles.topGradient} />
            <View style={styles.bottomGradient} />
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>{streamName}</Text>
            </View>

            <View style={styles.bottomControls}>
              {/* Progress bar with CONTINUOUS sliding */}
              <View style={styles.progressContainer}>
                <TouchableOpacity
                  ref={sliderRef}
                  focusable
                  onLayout={onSliderLayout}
                  onFocus={() => setSliderFocused(true)}
                  onBlur={() => {
                    setSliderFocused(false);
                    setSeeking(false);
                  }}
                  // Responder setup for continuous sliding
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={onSliderGrant}
                  onResponderMove={onSliderMove}
                  onResponderRelease={onSliderRelease}
                  onResponderTerminationRequest={() => false}
                  onPress={() => {
                    if (sliderFocused) commitSeek(sliderValue);
                  }}
                  style={[styles.progressTouchable, sliderFocused && styles.progressFocused]}
                  activeOpacity={1}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityHint="Slide continuously - keeps sliding as long as you hold"
                  accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                  onAccessibilityAction={(e) => {
                    const action = e.nativeEvent.actionName;
                    const currentSeekTime = sliderValue || currentTime;
                    
                    if (action === 'increment') {
                      // Ultra small increment for super smooth sliding
                      const increment = Math.max(0.1, effectiveDuration / 10000);
                      const newTime = Math.min(effectiveDuration, currentSeekTime + increment);
                      instantSeek(newTime);
                    } else if (action === 'decrement') {
                      // Ultra small decrement for super smooth sliding
                      const decrement = Math.max(0.1, effectiveDuration / 10000);
                      const newTime = Math.max(0, currentSeekTime - decrement);
                      instantSeek(newTime);
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
                      commitSeek(newTime);
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
                      const cap = effectiveDuration || Number.MAX_SAFE_INTEGER;
                      const newTime = Math.min(cap, currentTime + SEEK_STEP);
                      commitSeek(newTime);
                    }}
                    onFocus={() => setFocusedControl('forward')}
                    onBlur={() => setFocusedControl('')}
                    style={[styles.controlButton, focusedControl === 'forward' && styles.focusedButton]}
                    activeOpacity={0.7}
                  >
                    <MIcon name="forward-10" size={scale(22)} color={COLORS.white} />
                  </TouchableOpacity>

                  <Text style={styles.timeText}>
                    {formatTime(sliderFocused ? sliderValue : currentTime)} / {formatTime(effectiveDuration)}
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
                    onPress={() => {}}
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
  container: { flex: 1, backgroundColor: COLORS.black },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: scale(30),
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  titleContainer: { position: 'absolute', top: 30, left: SAFE_HORIZONTAL_PADDING, right: SAFE_HORIZONTAL_PADDING },
  titleText: {
    color: COLORS.white, fontSize: scale(10), textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: scale(10), paddingHorizontal: SAFE_HORIZONTAL_PADDING },
  progressContainer: { marginBottom: scale(8), paddingVertical: scale(5) },
  // Focus target large; visual track thin
  progressTouchable: { height: 50, justifyContent: 'center' },
  progressFocused: {},
  progressTrack: {
    height: scale(7),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: scale(5),
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: { height: scale(7), backgroundColor: COLORS.primary, borderRadius: scale(5) },
  progressThumb: {
    position: 'absolute', top: -2, width: scale(12), height: scale(1),
    backgroundColor: COLORS.primary, borderRadius: scale(25), marginLeft: -10,
    borderWidth: 3, borderColor: COLORS.white,
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  progressThumbFocused: {
    backgroundColor: COLORS.white, borderColor: COLORS.primary, shadowOpacity: 0.6, shadowRadius: 8,
    borderRadius: scale(25), width: scale(8), height: scale(8),
  },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftControls: { flexDirection: 'row', alignItems: 'center' },
  rightControls: { flexDirection: 'row', alignItems: 'center' },
  playButton: { justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  controlButton: { justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  focusedButton: {
    backgroundColor: 'rgba(255,255,255,0.25)', transform: [{ scale: 1.15 }],
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  timeText: {
    color: COLORS.white, fontSize: scale(12), marginLeft: scale(20),
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  centerIconWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 30 },
  centerIconBg: { backgroundColor: 'rgba(0,0,0,0.42)', borderRadius: scale(50), width: scale(50), height: scale(50), justifyContent: 'center', alignItems: 'center' },
});

export default VideoPlayerScreen;