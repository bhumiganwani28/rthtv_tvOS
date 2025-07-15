import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import styles from './styles';
import { IMAGES } from '../../theme/images';

interface SplashProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const logoSize = width * 0.5;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('OnBoarding'); // Go to OnBoarding screen after splash
      }, 1500);
    });
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <Image source={IMAGES.splash} style={styles.backgroundImage} />
        <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
          <Image
            source={IMAGES.logo}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </>
  );
};

export default Splash;
