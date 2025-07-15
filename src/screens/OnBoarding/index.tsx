import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StatusBar,
  Platform,
  Dimensions,
  useTVEventHandler,
} from 'react-native';
import { IMAGES } from '../../theme/images';
import { COLORS } from '../../theme/colors';
import styles from './styles';
import CButton from '../../components/CButton';

const { width } = Dimensions.get('window');
const isTV = Platform.isTV;

const OnBoarding = ({ navigation }) => {
  const logoSize = width * 0.3;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <Image source={IMAGES.splash} style={styles.backgroundImage} resizeMode="cover" />

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
              onPress={() => navigation.navigate('SignUp')}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
              hasTVPreferredFocus={true} // ✅ Default focused button
              focusable={true}            // ✅ Enable focus
            />
            <CButton
              text="Already a Member? Sign In"
              onPress={() => navigation.navigate('Login')}
              style={styles.outlineButton}
              textStyle={styles.outlineButtonText}
              outline
              focusable={true}            // ✅ Enable focus
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

          {/* Optional Debug View */}
          {/* {isTV && (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
              Last Remote Event: {lastEventType}
            </Text>
          )} */}
        </View>
      </View>
    </>
  );
};

export default OnBoarding;
