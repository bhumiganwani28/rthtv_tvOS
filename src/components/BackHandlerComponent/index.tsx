// BackHandlerComponent.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTVEventHandler } from 'react-native';

interface BackHandlerComponentProps {
  onBackPress?: () => boolean;
  enableBackHandler?: boolean;
  enableTVBackHandler?: boolean;
}

const BackHandlerComponent: React.FC<BackHandlerComponentProps> = ({ 
  onBackPress,
  enableBackHandler = true,
  enableTVBackHandler = true,
}) => {
  const navigation = useNavigation();
  const backPressCount = useRef(0);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Default back handler
  const defaultBackHandler = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      // Double tap to exit app
      backPressCount.current += 1;
      
      if (backPressCount.current === 1) {
        // First back press - show message or handle differently
        console.log('Press back again to exit');
        
        // Reset counter after 2 seconds
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
        backPressTimer.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);
        
        return true;
      } else if (backPressCount.current === 2) {
        // Second back press - exit app
        BackHandler.exitApp();
        return true;
      }
    }
    return false;
  }, [navigation]);

  // Android/Android TV Back Handler
  useFocusEffect(
    useCallback(() => {
      if (!enableBackHandler) return;

      const backAction = () => {
        if (onBackPress) {
          const shouldBlock = onBackPress();
          return shouldBlock;
        } else {
          return defaultBackHandler();
        }
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => {
        backHandler.remove();
      };
    }, [onBackPress, defaultBackHandler, enableBackHandler])
  );

  // Apple TV Back Handler
  useTVEventHandler((evt) => {
    if (!enableTVBackHandler || !Platform.isTV || Platform.OS !== 'ios') return;

    if (evt.eventType === 'menu') {
      if (onBackPress) {
        const shouldBlock = onBackPress();
        if (shouldBlock) {
          console.log('Back press intercepted on Apple TV');
        }
      } else {
        defaultBackHandler();
      }
    }
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, []);

  return null;
};

export default BackHandlerComponent;
