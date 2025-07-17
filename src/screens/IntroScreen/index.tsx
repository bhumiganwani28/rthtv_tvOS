import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';

let TVEventHandler;
if (Platform.OS === 'android') {
  TVEventHandler = require('react-native').TVEventHandler;
}

import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';
import { FONTS } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Unlimited Shows, One Low Price',
    text: 'Everything on RTH TV, starting at just $200.00',
    image: IMAGES.intro_1,
    backgroundColor: COLORS.black,
  },
  {
    key: '2',
    title: 'Download and Watch Offline',
    text: 'Never run out of something to watch.',
    image: IMAGES.intro_2,
    backgroundColor: COLORS.black,
  },
  {
    key: '3',
    title: 'Enjoy the Freedom to Cancel Anytime',
    text: 'Don’t wait—join today and get started instantly!',
    image: IMAGES.intro_3,
    backgroundColor: COLORS.black,
  },
  {
    key: '4',
    title: 'Stream Anytime, Anywhere!',
    text: 'Stream seamlessly on your TV and beyond.',
    image: IMAGES.intro_4,
    backgroundColor: COLORS.black,
  },
];

const IntroSlider = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedDot, setFocusedDot] = useState(currentIndex);
  const [isFocusedButton, setIsFocusedButton] = useState(false);
  const [isFocusedSkip, setIsFocusedSkip] = useState(false);

  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    setFocusedDot(currentIndex);
  }, [currentIndex]);

  const tvEventHandlerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && TVEventHandler) {
      tvEventHandlerRef.current = new TVEventHandler();
      tvEventHandlerRef.current.enable(null, (cmp, evt) => {
        if (!evt) return;
        switch (evt.eventType) {
          case 'right':
            // Focus moves Skip -> Next -> Dots in cycle
            if (isFocusedSkip) setIsFocusedSkip(false), setIsFocusedButton(true);
            else if (isFocusedButton) {
              // Move focus to first dot if exists
              setIsFocusedButton(false);
              setFocusedDot(0);
            } else if (focusedDot < slides.length - 1) {
              setFocusedDot((prev) => prev + 1);
            }
            break;
          case 'left':
            if (focusedDot > 0) {
              setFocusedDot((prev) => prev - 1);
            } else if (!isFocusedButton && !isFocusedSkip) {
              // Move focus to Next button if on first dot
              setFocusedDot(-1);
              setIsFocusedButton(true);
            } else if (!isFocusedSkip && isFocusedButton) {
              // From Next to Skip
              setIsFocusedButton(false);
              setIsFocusedSkip(true);
            }
            break;
          case 'select':
            if (isFocusedSkip) {
              navigation.replace('OnBoarding');
            } else if (isFocusedButton) {
              onPressNext();
            } else if (focusedDot >= 0) {
              setCurrentIndex(focusedDot);
            }
            break;
          default:
            break;
        }
      });
    }
    return () => {
      if (tvEventHandlerRef.current) {
        tvEventHandlerRef.current.disable();
        tvEventHandlerRef.current = null;
      }
    };
  }, [focusedDot, isFocusedButton, isFocusedSkip]);

  const onPressNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFocusedDot(currentIndex + 1);
      setIsFocusedButton(false);
    } else {
      navigation.replace('OnBoarding');
    }
  };

  const onPressSkip = () => {
    navigation.replace('OnBoarding');
  };

  const slide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: slide.backgroundColor }]}>
      <Image source={slide.image} style={styles.backgroundImage} />

      {/* Skip button top right */}
      <TouchableOpacity
        style={styles.skipButtonTopRight}
        onPress={onPressSkip}
        hasTVPreferredFocus={isFocusedSkip}
        activeOpacity={0.7}
        onFocus={() => setIsFocusedSkip(true)}
        onBlur={() => setIsFocusedSkip(false)}
      >
        <Text style={[styles.skipButtonText, isFocusedSkip && styles.skipButtonTextFocused]}>
          Skip
        </Text>
      </TouchableOpacity>

      <View style={styles.overlay}>
        {currentIndex === 0 && (
          <View style={styles.logoContainer}>
            <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
          </View>
        )}

        <View style={styles.textView}>
          <Text style={styles.title} numberOfLines={2}>
            {slide.title}
          </Text>
          <Text style={styles.text} numberOfLines={3}>
            {slide.text}
          </Text>
        </View>

        {/* Dots row */}
        <View style={styles.dotsWrapper}>
          {slides.map((_, idx) => (
            <TouchableHighlight
              key={`dot-${idx}`}
              onPress={() => setCurrentIndex(idx)}
              onFocus={() => {
                setFocusedDot(idx);
                setIsFocusedButton(false);
                setIsFocusedSkip(false);
              }}
              onBlur={() => setFocusedDot(-1)}
              style={[
                styles.dot,
                focusedDot === idx && styles.dotFocused,
                currentIndex === idx && styles.activeDot,
              ]}
              underlayColor="transparent"
              hasTVPreferredFocus={focusedDot === idx}
            >
              <View />
            </TouchableHighlight>
          ))}
        </View>

        {/* Get Started / Next button */}
        <TouchableHighlight
          style={[styles.tvButton, isFocusedButton && styles.tvButtonFocused]}
          underlayColor={COLORS.primaryDark}
          hasTVPreferredFocus={!isFocusedSkip && !~focusedDot}
          onFocus={() => {
            setIsFocusedButton(true);
            setIsFocusedSkip(false);
            setFocusedDot(-1);
          }}
          onBlur={() => setIsFocusedButton(false)}
          onPress={onPressNext}
        >
          <Text style={styles.tvButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

export default IntroSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    resizeMode: 'cover',
  },
  skipButtonTopRight: {
    position: 'absolute',
    top: scale(30),
    right: scale(30),
    paddingVertical: scale(8),
    paddingHorizontal: scale(18),
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 9999,
  },
  skipButtonText: {
    color: COLORS.white,
    fontSize: scale(13),
    fontWeight: '600',
  },
  skipButtonTextFocused: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  overlay: {
    flex: 1,
    width,
    paddingHorizontal: width * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  logoContainer: {
    marginBottom: scale(28),
    width: width * 0.4,
    height: height * 0.13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textView: {
    marginBottom: scale(30),
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: scale(24),
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: scale(15),
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: scale(20),
  },
  dotsWrapper: {
    flexDirection: 'row',
    marginBottom: scale(40),
  },
  dot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: scale(6),
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  dotFocused: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  tvButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: scale(10),
    paddingHorizontal: scale(32),
    alignItems: 'center',
    marginBottom: scale(20),
  },
  tvButtonFocused: {
    shadowColor: COLORS.white,
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  tvButtonText: {
    fontSize: scale(14),
    fontFamily: FONTS.montSemiBold,
    color: COLORS.white,
    textAlign: 'center',
  },
});
