// BackHandlerComponent.tsx
import React, { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTVEventHandler } from 'react-native';

const BackHandlerComponent: React.FC<{ onBackPress: () => boolean }> = ({ onBackPress }) => {
  // Android/Android TV
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        const shouldBlock = onBackPress(); // true = block default (navigate), false = allow it
        return shouldBlock;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => {
        backHandler.remove();
      };
    }, [onBackPress])
  );

  // Apple TV – handles "menu" button
  useTVEventHandler((evt) => {
    if (Platform.isTV && Platform.OS === 'ios' && evt.eventType === 'menu') {
      const shouldBlock = onBackPress();
      // If we return true, we suppress going back
      if (shouldBlock) {
        console.log('Back press intercepted on Apple TV');
      }
    }
  });

  return null;
};

export default BackHandlerComponent;
