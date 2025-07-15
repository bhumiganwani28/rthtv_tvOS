import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StatusBar,
  Platform,
  Dimensions,
  useTVEventHandler,
  TouchableOpacity,
} from 'react-native';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import styles from './styles';

import { navigationRef } from '../../App';
import CButton from '../../components/CButton';

const { width } = Dimensions.get('window');
const isTV = Platform.isTV;

const OnBoarding = ({ navigation }) => {
  const logoSize = width * 0.3;

  // ✅ State to show last remote event
  const [lastEventType, setLastEventType] = useState('');

  // ✅ Log tvOS remote events
  useTVEventHandler((evt) => {
    console.log('📺 TV Remote Event:', evt);
    setLastEventType(evt.eventType);
  });

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <Image
          source={IMAGES.splash}
          style={styles.backgroundImage}
          resizeMode="cover"
          pointerEvents="none" // ✅ Allow touch/focus to pass through
        />

        <View style={styles.contentWrapper}>
          {/* Logo */}
          <Image
            source={IMAGES.logo}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <CButton
              text="Create Free Account"
              onPress={() => {
                // console.log('✅ Create Free Account pressed');
                navigation.navigate('SignUp');
              }}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
              hasTVPreferredFocus={true}
              accessible={true}
              focusable={true}
            />

            <CButton
              text="Already a Member? Sign In"
              onPress={() => navigation.navigate('Login')}
              style={styles.outlineButton}
              textStyle={styles.outlineButtonText}
              outline
              focusable={true}
              accessible={true}
              hasTVPreferredFocus={false}
            />

            
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to RTH.TV{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('TermsUse')}>
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Privacypolicy')}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          
        </View>
      </View>
    </>
  );
};

export default OnBoarding;
