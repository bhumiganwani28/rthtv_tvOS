import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Pressable,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { useTVEventHandler } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/colors';

const PROGRESS_HEIGHT = 3;
const SCRUBBER_RADIUS = 9;

const VideoPlayerScreen = ({ route, navigation }) => {
  const videoUri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const streamName = 'The Christmas Chronicles';  // Use your actual video name

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const videoRef = useRef(null);
  const progressWidth = useRef(0);
  const controlFadeAnim = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef(null);

  // Show controls and auto-fade-out
  const showControlsTemporarily = () => {
    setControlsVisible(true);
    controlFadeAnim.setValue(1);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      Animated.timing(controlFadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 4000);
  };

  // TV remote: show controls on any interaction
  useTVEventHandler(({ eventType }) => {
    if (
      eventType === 'right' ||
      eventType === 'left' ||
      eventType === 'up' ||
      eventType === 'down' ||
      eventType === 'select' ||
      eventType === 'playPause'
    ) {
      showControlsTemporarily();
    }
  });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const seekTo = (time) => {
    const t = Math.max(0, Math.min(duration, time));
    videoRef.current?.seek(t);
    setCurrentTime(t);
    showControlsTemporarily();
  };

  const togglePlayPause = () => {
    setPaused((p) => !p);
    showControlsTemporarily();
  };

  const displayedTime = scrubbing ? scrubTime : currentTime;

  // Progress bar + scrubber
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        setScrubbing(true);
        showControlsTemporarily();
        return true;
      },
      onPanResponderMove: (e, gesture) => {
        if (!progressWidth.current) return;
        const touchX = Math.max(0, Math.min(gesture.moveX - 24, progressWidth.current));
        const ratio = touchX / (progressWidth.current || 1);
        setScrubTime(ratio * duration);
      },
      onPanResponderRelease: () => {
        seekTo(scrubTime);
        setScrubbing(false);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Pressable style={{ flex: 1 }} onPress={showControlsTemporarily}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          muted={muted}
          fullscreen
          onLoad={({ duration }) => setDuration(duration)}
          onProgress={({ currentTime }) => {
            if (!scrubbing) setCurrentTime(currentTime);
          }}
          onEnd={() => navigation.goBack()}
        />

        {/* Controls */}
        {controlsVisible && (
          <Animated.View style={[styles.overlay, { opacity: controlFadeAnim }]}>
            {/* Back Arrow */}
            <TouchableOpacity
              style={styles.back}
              onPress={() => navigation.goBack()}
              hitSlop={12}
            >
              <Icon name="arrow-back" size={28} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.contentBottom}>
              {/* Progress bar row */}
              <View style={styles.progressWrapper}>
                <Text style={styles.time}>{formatTime(displayedTime)}</Text>
                <View
                  style={styles.progressBar}
                  onLayout={e => {
                    progressWidth.current = e.nativeEvent.layout.width - SCRUBBER_RADIUS * 2;
                  }}
                >
                  <View style={styles.bgTrack} />
                  <View
                    style={[
                      styles.fgTrack,
                      { width: `${(displayedTime / (duration || 1)) * 100}%` },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.scrubber,
                      {
                        left: (displayedTime / (duration || 1)) * (progressWidth.current || 1),
                      },
                    ]}
                    {...panResponder.panHandlers}
                  />
                </View>
                <Text style={styles.time}>{formatTime(duration)}</Text>
              </View>

              {/* Bottom Controls */}
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => seekTo(currentTime - 10)} style={styles.actionBtn}>
                  <MIcon name="replay-10" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.actionBtn}>
                  <Icon name={paused ? 'play' : 'pause'} size={34} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekTo(currentTime + 10)} style={styles.actionBtn}>
                  <MIcon name="forward-10" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {streamName}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.actionBtn}>
                  <Icon name="help-circle-outline" size={26} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MIcon name="subtitles" size={26} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MIcon name="fullscreen" size={26} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
};

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  video: { position: 'absolute', width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  back: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    padding: 7,
  },
  contentBottom: { paddingBottom: 20 },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
    height: SCRUBBER_RADIUS * 2,
    justifyContent: 'center',
  },
  bgTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PROGRESS_HEIGHT,
    backgroundColor: '#6b6b6b',
    borderRadius: 2,
  },
  fgTrack: {
    position: 'absolute',
    left: 0,
    height: PROGRESS_HEIGHT,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  scrubber: {
    position: 'absolute',
    width: SCRUBBER_RADIUS * 2,
    height: SCRUBBER_RADIUS * 2,
    borderRadius: SCRUBBER_RADIUS,
    backgroundColor: COLORS.white,
    top: PROGRESS_HEIGHT / 2 - SCRUBBER_RADIUS,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 2,
  },
  time: {
    minWidth: 48,
    color: COLORS.white,
    fontSize: 13,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: 18,
  },
  actionBtn: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    maxWidth: 200,
    textAlign: 'center',
  },
});

export default VideoPlayerScreen;
