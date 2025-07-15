import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  useTVEventHandler,
  Platform,
} from 'react-native';
import CInput from '../../components/CInput';
import CButton from '../../components/CButton';
import { IMAGES } from '../../theme/images';
import styles from './styles';

const LoginTV = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'submit'>('email');

  const handleLogin = () => {
    console.log('Login clicked', email, password);
    // Add your actual login logic here
  };

  useTVEventHandler((evt) => {
    if (evt && evt.eventType) {
      switch (evt.eventType) {
        case 'down':
          if (focusedField === 'email') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('submit');
          break;
        case 'up':
          if (focusedField === 'submit') setFocusedField('password');
          else if (focusedField === 'password') setFocusedField('email');
          break;
        case 'select':
          if (focusedField === 'submit') handleLogin();
          break;
      }
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={IMAGES.appBg} resizeMode="cover" style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.loginBox}>
            <Text style={styles.heading}>Sign In</Text>
    
            <CInput
              placeholder="Email or phone number"
              value={email}
              onChangeText={setEmail}
              onPress={() => setFocusedField('email')}
              hasTVPreferredFocus={focusedField === 'email'}
              focusable
              style={styles.input}
              textStyle={styles.inputText}
            />
            <CInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onPress={() => setFocusedField('password')}
              hasTVPreferredFocus={focusedField === 'password'}
              focusable
              style={styles.input}
              textStyle={styles.inputText}
            />

            <CButton
              text="Sign In"
              onPress={handleLogin}
              style={styles.signInButton}
              textStyle={styles.signInButtonText}
              hasTVPreferredFocus={focusedField === 'submit'}
              focusable
            />

            <View style={styles.bottom}>
              <Text style={styles.newText}>
                New to RTH.TV?{' '}
                <Text style={styles.signUpText} onPress={() => navigation.navigate('SignUp')}>
                  Sign up now
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoginTV;
