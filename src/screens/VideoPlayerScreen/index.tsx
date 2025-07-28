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
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTVEventHandler } from 'react-native';

// Types

type VideoPlayerScreenProps = {
  route: RouteProp<any, any> & { params: { videoUri: string; streamName: string } };
  navigation: StackNavigationProp<any, any>;
};

const SEEK_STEP = 10; // seconds
const CONTROLS_HIDE_TIMEOUT = 5000;
// Set safe horizontal padding for TV (e.g., 60px)
const SAFE_HORIZONTAL_PADDING = 60;
const SLIDER_WIDTH = 1920 - SAFE_HORIZONTAL_PADDING * 2; // For 1080p/4K TVs, adjust as needed

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
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
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

  // Show controls on any remote key press (except select when already visible)
  useTVEventHandler((evt) => {
    if (!showControls) {
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
    } else if (evt && evt.eventType !== 'select') {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, CONTROLS_HIDE_TIMEOUT);
    }
    // Slider navigation
    if (sliderFocused) {
      if (evt && evt.eventType === 'right') {
        setSliderValue((v) => Math.min(duration, v + 2));
        setSeeking(true);
      } else if (evt && evt.eventType === 'left') {
        setSliderValue((v) => Math.max(0, v - 2));
        setSeeking(true);
      } else if (evt && evt.eventType === 'select') {
        videoRef.current?.seek(sliderValue);
        setCurrentTime(sliderValue);
        setSeeking(false);
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

  // Calculate slider thumb position
  const progress = duration > 0 ? (sliderFocused ? sliderValue : currentTime) / duration : 0;
  const thumbLeft = Math.max(0, progress * SLIDER_WIDTH - 10);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        muted={muted}
        resizeMode="cover"
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={(prog) => {
          if (!seeking) setCurrentTime(prog.currentTime);
        }}
        onEnd={() => setPaused(true)}
      />
      {showControls && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          {/* Subtle gradient overlay at the bottom for readability */}
          <View style={styles.gradientOverlay} />
          {/* Header at the top with streamName */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{streamName}</Text>
          </View>
          {/* Controls Row (compact, floats above seekbar) */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              ref={rewindRef}
              focusable
              onPress={() => videoRef.current?.seek(Math.max(0, currentTime - SEEK_STEP))}
              onFocus={() => setFocusedControl('rewind')}
              onBlur={() => setFocusedControl('')}
              style={[styles.controlBtn, focusedControl === 'rewind' && styles.focusedControl]}
            >
              <Icon name="play-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              ref={playRef}
              focusable
              onPress={() => setPaused((prev) => !prev)}
              onFocus={() => setFocusedControl('play')}
              onBlur={() => setFocusedControl('')}
              style={[styles.playBtn, focusedControl === 'play' && styles.focusedControl]}
            >
              <Icon name={paused ? 'play' : 'pause'} size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              ref={forwardRef}
              focusable
              onPress={() => videoRef.current?.seek(Math.min(duration, currentTime + SEEK_STEP))}
              onFocus={() => setFocusedControl('forward')}
              onBlur={() => setFocusedControl('')}
              style={[styles.controlBtn, focusedControl === 'forward' && styles.focusedControl]}
            >
              <Icon name="play-forward" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              ref={muteRef}
              focusable
              onPress={() => setMuted((m) => !m)}
              onFocus={() => setFocusedControl('mute')}
              onBlur={() => setFocusedControl('')}
              style={[styles.controlBtn, focusedControl === 'mute' && styles.focusedControl]}
            >
              <Icon name={muted ? 'volume-mute' : 'volume-high'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Seekbar Row (just the slider, full width) */}
          <View style={styles.seekbarRow}>
            <TouchableOpacity
              ref={sliderRef}
              focusable
              onFocus={() => setSliderFocused(true)}
              onBlur={() => setSliderFocused(false)}
              style={[styles.sliderTouchable, sliderFocused && styles.focusedSlider]}
              activeOpacity={1}
            >
              <View style={styles.progressWrap}>
                <View style={styles.progressTrack} />
                <View
                  style={[
                    styles.progressFill,
                    { width: progress * SLIDER_WIDTH },
                  ]}
                />
                {/* Slider Thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    { left: Math.max(0, progress * SLIDER_WIDTH - 12) },
                    sliderFocused && styles.sliderThumbFocused,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* Timer below the slider, centered */}
          <View style={styles.bottomTimeRow}>
            <Text style={styles.bottomTimeText}>{formatTime(sliderFocused ? sliderValue : currentTime)} / {formatTime(duration)}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

// --- FINAL REFINED PIXEL-PERFECT UI LAYOUT ---
// 1. Controls row: compact, smaller icons, less vertical space, floats above seekbar
// 2. Seekbar: truly full width (edge-to-edge, minus safe padding), bold but not too thick, prominent thumb
// 3. Overlay: less tall, subtle gradient, controls and seekbar visually grouped
// 4. All elements visually balanced, centered, and responsive
// --- FINAL REFINED PIXEL-PERFECT STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    zIndex: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 18,
    zIndex: 2,
  },
  playBtn: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    marginHorizontal: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  controlBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  focusedControl: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.08 }],
  },
  seekbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SAFE_HORIZONTAL_PADDING,
    marginBottom: 10,
    zIndex: 2,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    width: 90,
    textAlign: 'left',
    marginRight: 14,
    alignSelf: 'center',
  },
  sliderTouchable: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  focusedSlider: {
    // No border/shadow on the whole slider
  },
  progressWrap: {
    width: SLIDER_WIDTH,
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  sliderThumbFocused: {
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  bottomTimeRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomTimeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default VideoPlayerScreen;