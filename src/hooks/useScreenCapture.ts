// hooks/useScreenCapture.ts
import { useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

const { ScreenShield } = NativeModules;

export const useScreenCapture = () => {
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const interval = setInterval(async () => {
      try {
        const captured = await ScreenShield.isScreenCaptured();
        setIsCaptured(captured);
        if (captured) {
          console.warn('📸 Screen is being recorded or mirrored!');
          // Optional: hide video, blur screen, etc.
        }
      } catch (err) {
        console.error('Screen capture check failed:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return isCaptured;
};
