import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  BackHandler,
  findNodeHandle,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';
import { useEffect, useRef, useState } from 'react';

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri, streamName } = route.params;

  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const backRef = useRef(null);
  const rewindRef = useRef(null);
  const playRef = useRef(null);
  const forwardRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [focusedControl, setFocusedControl] = useState('');
  const [focusMap, setFocusMap] = useState({});
  const [hasPreferredFocus, setHasPreferredFocus] = useState(true); // Only once

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const showAndScheduleHide = () => {
    setShowControls(true);
    fadeAnim.setValue(1);
    clearTimeout(showAndScheduleHide.timeout);
    showAndScheduleHide.timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, 5000);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      clearTimeout(showAndScheduleHide.timeout);
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const focusHandles = {
        back: findNodeHandle(backRef.current),
        rewind: findNodeHandle(rewindRef.current),
        play: findNodeHandle(playRef.current),
        forward: findNodeHandle(forwardRef.current),
      };
      setFocusMap(focusHandles);

      // Remove preferred focus after first mount
      setHasPreferredFocus(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [showControls]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        resizeMode="cover"
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={(prog) => setCurrentTime(prog.currentTime)}
        onEnd={() => navigation.goBack()}
      />

      {showControls && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.overlayBackground} />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              ref={backRef}
              focusable
              nextFocusDown={focusMap?.rewind}
              onPress={() => navigation.goBack()}
              onFocus={() => setFocusedControl('back')}
              onBlur={() => setFocusedControl('')}
              style={[
                styles.backBtn,
                focusedControl === 'back' && styles.focusedControl,
              ]}
            >
              <Icon name="arrow-back" size={scale(18)} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{streamName}</Text>
          </View>

          {/* Controls Center */}
          <View style={styles.centerControls}>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                ref={rewindRef}
                focusable
                nextFocusRight={focusMap?.play}
                nextFocusUp={focusMap?.back}
                onPress={() => videoRef.current?.seek(currentTime - 10)}
                onFocus={() => setFocusedControl('rewind')}
                onBlur={() => setFocusedControl('')}
                style={[
                  styles.controlBtn,
                  focusedControl === 'rewind' && styles.focusedControl,
                ]}
              >
                <Icon name="play-back" size={scale(18)} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                ref={playRef}
                focusable
                hasTVPreferredFocus={hasPreferredFocus}
                nextFocusLeft={focusMap?.rewind}
                nextFocusRight={focusMap?.forward}
                nextFocusUp={focusMap?.back}
                onPress={() => setPaused(prev => !prev)}
                onFocus={() => setFocusedControl('play')}
                onBlur={() => setFocusedControl('')}
                style={[
                  styles.playBtn,
                  focusedControl === 'play' && styles.focusedControl,
                ]}
              >
                <Icon name={paused ? 'play' : 'pause'} size={scale(22)} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                ref={forwardRef}
                focusable
                nextFocusLeft={focusMap?.play}
                nextFocusUp={focusMap?.back}
                onPress={() => videoRef.current?.seek(currentTime + 10)}
                onFocus={() => setFocusedControl('forward')}
                onBlur={() => setFocusedControl('')}
                style={[
                  styles.controlBtn,
                  focusedControl === 'forward' && styles.focusedControl,
                ]}
              >
                <Icon name="play-forward" size={scale(18)} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Overlay */}
          <View style={styles.bottomOverlay}>
            <View style={styles.bottomBar}>
              <View style={styles.leftGroup}>
                <Icon name="volume-high" size={scale(12)} color={COLORS.white} />
                <Text style={styles.timeText}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </View>
            </View>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack} />
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentTime / duration) * 100}%` },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
  },
  title: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: 'bold',
    marginLeft: scale(16),
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(60),
  },
  playBtn: {
    padding: 18,
    backgroundColor: COLORS.primary,
    borderRadius: scale(50),
  },
  controlBtn: {
    padding: 18,
    borderRadius: scale(50),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  focusedControl: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  timeText: {
    color: COLORS.white,
    fontSize: scale(10),
    marginLeft: scale(6),
  },
  progressWrap: {
    height: scale(5),
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: scale(5),
  },
  progressTrack: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#333',
  },
  progressFill: {
    height: scale(5),
    backgroundColor: COLORS.primary,
  },
});

export default VideoPlayerScreen;
