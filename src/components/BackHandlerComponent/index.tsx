import React, { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const BackHandlerComponent: React.FC<{ onBackPress: () => boolean }> = ({ onBackPress }) => {
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (onBackPress()) {
          return true; // Prevent default behavior
        }
        return false; // Allow default behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => {
        backHandler.remove(); // Clean up listener on component unmount
      };
    }, [onBackPress])
  );

  return null; // This component doesn't render anything
};

export default BackHandlerComponent;
