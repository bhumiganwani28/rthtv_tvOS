import { useCallback, useRef, useState, useEffect } from 'react';
import { Platform, useTVEventHandler, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import KeyEvent from 'react-native-keyevent';

interface HomeTVNavigationOptions {
  onBackPress?: () => boolean;
  onSearchPress?: () => void;
  onLogoutPress?: () => void;
  onProfileChange?: () => void;
}

export type FocusArea = 'tabs' | 'slider' | 'content' | 'header';

export const useHomeTVNavigation = (options: HomeTVNavigationOptions = {}) => {
  const navigation = useNavigation();
  const [currentFocusArea, setCurrentFocusArea] = useState<FocusArea>('tabs');
  const [focusedTabIndex, setFocusedTabIndex] = useState<number>(0);
  const [focusedContentRow, setFocusedContentRow] = useState<number>(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1); // -1 means "View All" is focused
  const isKeyEventEnabled = useRef<boolean>(false);

  const {
    onBackPress,
    onSearchPress,
    onLogoutPress,
    onProfileChange,
  } = options;

  // Enable KeyEvent listener for Android TV
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android') {
      KeyEvent.onKeyDownListener((keyEvent) => {
        console.log('Home KeyEvent:', keyEvent);
        handleKeyEvent(keyEvent);
      });
      isKeyEventEnabled.current = true;
    }

    return () => {
      if (isKeyEventEnabled.current) {
        KeyEvent.removeKeyDownListener();
      }
    };
  }, []);

  // Handle KeyEvent for Android TV
  const handleKeyEvent = useCallback((keyEvent: any) => {
    if (!Platform.isTV) return;

    const { keyCode } = keyEvent;
    
    console.log(`TV Navigation: Key ${keyCode} pressed, current focus: ${currentFocusArea}`);
    
    // Android TV remote key codes
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        handleUpPress();
        break;
      case 20: // KEYCODE_DPAD_DOWN
        handleDownPress();
        break;
      case 21: // KEYCODE_DPAD_LEFT
        handleLeftPress();
        break;
      case 22: // KEYCODE_DPAD_RIGHT
        handleRightPress();
        break;
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        handleSelectPress();
        break;
      case 4: // KEYCODE_BACK
        handleBackPress();
        break;
      case 84: // KEYCODE_SEARCH
        onSearchPress?.();
        break;
      case 3: // KEYCODE_HOME
        // Stay on home page
        break;
    }
  }, [onSearchPress, currentFocusArea, handleUpPress, handleDownPress, handleLeftPress, handleRightPress, handleSelectPress, handleBackPress]);

  // Navigation handlers
  const handleUpPress = useCallback(() => {
    console.log(`TV Navigation: UP pressed, current: ${currentFocusArea}, contentRow: ${focusedContentRow}`);
    switch (currentFocusArea) {
      case 'content':
        if (focusedContentRow > 0) {
          setFocusedContentRow(focusedContentRow - 1);
          setFocusedItemIndex(-1); // Reset to "View All"
          console.log(`TV Navigation: Moved to content row ${focusedContentRow - 1}`);
        } else {
          setCurrentFocusArea('slider');
          console.log(`TV Navigation: Moved to slider`);
        }
        break;
      case 'slider':
        setCurrentFocusArea('tabs');
        console.log(`TV Navigation: Moved to tabs`);
        break;
      case 'tabs':
        setCurrentFocusArea('header');
        console.log(`TV Navigation: Moved to header`);
        break;
      case 'header':
        // Stay in header area
        console.log(`TV Navigation: Stayed in header`);
        break;
    }
  }, [currentFocusArea, focusedContentRow]);

  const handleDownPress = useCallback(() => {
    console.log(`TV Navigation: DOWN pressed, current: ${currentFocusArea}, contentRow: ${focusedContentRow}`);
    switch (currentFocusArea) {
      case 'header':
        setCurrentFocusArea('tabs');
        console.log(`TV Navigation: Moved to tabs`);
        break;
      case 'tabs':
        setCurrentFocusArea('slider');
        console.log(`TV Navigation: Moved to slider`);
        break;
      case 'slider':
        setCurrentFocusArea('content');
        setFocusedContentRow(0);
        setFocusedItemIndex(-1); // Focus "View All"
        console.log(`TV Navigation: Moved to content row 0`);
        break;
      case 'content':
        if (focusedContentRow < 3) { // Assuming 4 content rows (0-3)
          setFocusedContentRow(focusedContentRow + 1);
          setFocusedItemIndex(-1); // Reset to "View All"
          console.log(`TV Navigation: Moved to content row ${focusedContentRow + 1}`);
        }
        break;
    }
  }, [currentFocusArea, focusedContentRow]);

  const handleLeftPress = useCallback(() => {
    switch (currentFocusArea) {
      case 'tabs':
        if (focusedTabIndex > 0) {
          setFocusedTabIndex(focusedTabIndex - 1);
        }
        break;
      case 'content':
        if (focusedItemIndex > -1) {
          setFocusedItemIndex(focusedItemIndex - 1);
        } else {
          // Move to previous content row
          if (focusedContentRow > 0) {
            setFocusedContentRow(focusedContentRow - 1);
            setFocusedItemIndex(-1);
          }
        }
        break;
    }
  }, [currentFocusArea, focusedTabIndex, focusedContentRow, focusedItemIndex]);

  const handleRightPress = useCallback(() => {
    switch (currentFocusArea) {
      case 'tabs':
        if (focusedTabIndex < 3) { // Assuming 4 tabs (0-3)
          setFocusedTabIndex(focusedTabIndex + 1);
        }
        break;
      case 'content':
        if (focusedItemIndex < 9) { // Assuming max 10 items per row
          setFocusedItemIndex(focusedItemIndex + 1);
        } else {
          // Move to next content row
          if (focusedContentRow < 3) {
            setFocusedContentRow(focusedContentRow + 1);
            setFocusedItemIndex(-1);
          }
        }
        break;
    }
  }, [currentFocusArea, focusedTabIndex, focusedContentRow, focusedItemIndex]);

  const handleSelectPress = useCallback(() => {
    switch (currentFocusArea) {
      case 'tabs':
        // Handle tab selection
        break;
      case 'slider':
        // Handle slider selection
        break;
      case 'content':
        // Handle content selection
        break;
      case 'header':
        // Handle header actions
        break;
    }
  }, [currentFocusArea]);

  const handleBackPress = useCallback(() => {
    if (onBackPress) {
      const shouldBlock = onBackPress();
      if (shouldBlock) {
        return;
      }
    }
    // Exit app on back press from home
    BackHandler.exitApp();
  }, [onBackPress]);

  // Handle TV remote events (for iOS TV)
  useTVEventHandler(
    useCallback(
      (evt) => {
        if (!Platform.isTV || !evt || Platform.OS === 'android') return;

        switch (evt.eventType) {
          case 'up':
            handleUpPress();
            break;
          case 'down':
            handleDownPress();
            break;
          case 'left':
            handleLeftPress();
            break;
          case 'right':
            handleRightPress();
            break;
          case 'select':
            handleSelectPress();
            break;
          case 'back':
            handleBackPress();
            break;
        }
      },
      [handleUpPress, handleDownPress, handleLeftPress, handleRightPress, handleSelectPress, handleBackPress]
    )
  );

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android' && Platform.isTV) {
          handleBackPress();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [handleBackPress])
  );

  return {
    currentFocusArea,
    focusedTabIndex,
    focusedContentRow,
    focusedItemIndex,
    setCurrentFocusArea,
    setFocusedTabIndex,
    setFocusedContentRow,
    setFocusedItemIndex,
    handleUpPress,
    handleDownPress,
    handleLeftPress,
    handleRightPress,
    handleSelectPress,
    handleBackPress,
  };
};
