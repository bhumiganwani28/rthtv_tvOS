import { useCallback, useRef, useState, useEffect } from 'react';
import { Platform, useTVEventHandler, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import KeyEvent from 'react-native-keyevent';

interface TVNavigationOptions {
  enableKeyboard?: boolean;
  enableRemote?: boolean;
  onBackPress?: () => boolean;
  onMenuPress?: () => void;
  onPlayPausePress?: () => void;
  onHomePress?: () => void;
  onSearchPress?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
}

export const useTVNavigation = (options: TVNavigationOptions = {}) => {
  const navigation = useNavigation();
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const focusableElements = useRef<Map<string, any>>(new Map());
  const gridRef = useRef<{ rows: number; columns: number }>({ rows: 0, columns: 0 });
  const isKeyEventEnabled = useRef<boolean>(false);

  const {
    enableKeyboard = true,
    enableRemote = true,
    onBackPress,
    onMenuPress,
    onPlayPausePress,
    onHomePress,
    onSearchPress,
    onVolumeUp,
    onVolumeDown,
  } = options;

  // Enable KeyEvent listener for Android TV
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'android' && enableKeyboard) {
      KeyEvent.onKeyDownListener((keyEvent) => {
        console.log('KeyEvent:', keyEvent);
        handleKeyEvent(keyEvent);
      });
      isKeyEventEnabled.current = true;
    }

    return () => {
      if (isKeyEventEnabled.current) {
        KeyEvent.removeKeyDownListener();
      }
    };
  }, [enableKeyboard]);

  // Handle KeyEvent for Android TV
  const handleKeyEvent = useCallback((keyEvent: any) => {
    if (!Platform.isTV || !enableRemote) return;

    const { keyCode, eventType } = keyEvent;
    
    // Android TV remote key codes
    switch (keyCode) {
      case 19: // KEYCODE_DPAD_UP
        moveFocus('up');
        break;
      case 20: // KEYCODE_DPAD_DOWN
        moveFocus('down');
        break;
      case 21: // KEYCODE_DPAD_LEFT
        moveFocus('left');
        break;
      case 22: // KEYCODE_DPAD_RIGHT
        moveFocus('right');
        break;
      case 23: // KEYCODE_DPAD_CENTER or KEYCODE_ENTER
        handleSelect();
        break;
      case 4: // KEYCODE_BACK
        handleBackPress();
        break;
      case 82: // KEYCODE_MENU
        onMenuPress?.();
        break;
      case 24: // KEYCODE_VOLUME_UP
        onVolumeUp?.();
        break;
      case 25: // KEYCODE_VOLUME_DOWN
        onVolumeDown?.();
        break;
      case 3: // KEYCODE_HOME
        onHomePress?.();
        break;
      case 84: // KEYCODE_SEARCH
        onSearchPress?.();
        break;
      case 85: // KEYCODE_MEDIA_PLAY_PAUSE
        onPlayPausePress?.();
        break;
      case 86: // KEYCODE_MEDIA_PLAY
        onPlayPausePress?.();
        break;
      case 87: // KEYCODE_MEDIA_PAUSE
        onPlayPausePress?.();
        break;
    }
  }, [enableRemote, onMenuPress, onPlayPausePress, onHomePress, onSearchPress, onVolumeUp, onVolumeDown]);

  // Register a focusable element
  const registerElement = useCallback((id: string, element: any) => {
    focusableElements.current.set(id, element);
  }, []);

  // Unregister a focusable element
  const unregisterElement = useCallback((id: string) => {
    focusableElements.current.delete(id);
  }, []);

  // Set focus to a specific element
  const setFocus = useCallback((id: string) => {
    const element = focusableElements.current.get(id);
    if (element?.ref?.current) {
      element.ref.current.setNativeProps({
        hasTVPreferredFocus: true,
        focusable: true,
      });
      setFocusedElement(id);
      element.onFocus?.();
    }
  }, []);

  // Handle select action
  const handleSelect = useCallback(() => {
    if (focusedElement) {
      const element = focusableElements.current.get(focusedElement);
      element?.onSelect?.() || element?.onPress?.();
    }
  }, [focusedElement]);

  // Handle back press
  const handleBackPress = useCallback(() => {
    if (onBackPress) {
      const shouldBlock = onBackPress();
      if (shouldBlock) {
        console.log('Back press intercepted');
        return;
      }
    }
    navigation.goBack();
  }, [onBackPress, navigation]);

  // Move focus in grid navigation
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const { rows, columns } = gridRef.current;
    if (rows === 0 || columns === 0) return;

    let newRow = currentRow;
    let newColumn = currentColumn;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(rows - 1, currentRow + 1);
        break;
      case 'left':
        newColumn = Math.max(0, currentColumn - 1);
        break;
      case 'right':
        newColumn = Math.min(columns - 1, currentColumn + 1);
        break;
    }

    setCurrentRow(newRow);
    setCurrentColumn(newColumn);

    // Find element at new position
    const elementId = `grid-${newRow}-${newColumn}`;
    const element = focusableElements.current.get(elementId);
    if (element) {
      setFocus(elementId);
    }
  }, [currentRow, currentColumn, setFocus]);

  // Handle TV remote events (for iOS TV)
  useTVEventHandler(
    useCallback(
      (evt) => {
        if (!Platform.isTV || !enableRemote || !evt || Platform.OS === 'android') return;

        switch (evt.eventType) {
          case 'up':
            moveFocus('up');
            break;
          case 'down':
            moveFocus('down');
            break;
          case 'left':
            moveFocus('left');
            break;
          case 'right':
            moveFocus('right');
            break;
          case 'select':
            handleSelect();
            break;
          case 'menu':
            onMenuPress?.();
            break;
          case 'play':
          case 'pause':
            onPlayPausePress?.();
            break;
          case 'back':
            handleBackPress();
            break;
        }
      },
      [moveFocus, handleSelect, handleBackPress, onMenuPress, onPlayPausePress, enableRemote]
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

  // Set grid dimensions
  const setGridDimensions = useCallback((rows: number, columns: number) => {
    gridRef.current = { rows, columns };
  }, []);

  return {
    registerElement,
    unregisterElement,
    setFocus,
    moveFocus,
    focusedElement,
    currentRow,
    currentColumn,
    setGridDimensions,
    setCurrentRow,
    setCurrentColumn,
    handleSelect,
    handleBackPress,
  };
};
