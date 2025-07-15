import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export const useScreenshotDetector = (onScreenshot: () => void) => {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const { ScreenshotDetector } = NativeModules;
    if (!ScreenshotDetector) {
      console.warn('❌ ScreenshotDetector native module not found.');
      return;
    }

    const emitter = new NativeEventEmitter(ScreenshotDetector);
    const subscription = emitter.addListener('userDidTakeScreenshot', () => {
      console.log('📸 Screenshot detected');
      onScreenshot();
    });

    return () => subscription.remove();
  }, []);
};
