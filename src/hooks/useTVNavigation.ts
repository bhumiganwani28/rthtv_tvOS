import { useCallback, useRef, useState } from 'react';
import { Platform, useTVEventHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface TVNavigationOptions {
  enableKeyboard?: boolean;
  enableRemote?: boolean;
  onBackPress?: () => boolean;
  onMenuPress?: () => void;
  onPlayPausePress?: () => void;
}

export const useTVNavigation = (options: TVNavigationOptions = {}) => {
  const navigation = useNavigation();
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const focusableElements = useRef<Map<string, any>>(new Map());
  const gridRef = useRef<{ rows: number; columns: number }>({ rows: 0, columns: 0 });

  const {
    enableKeyboard = true,
    enableRemote = true,
    onBackPress,
    onMenuPress,
    onPlayPausePress,
  } = options;

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

  // Handle TV remote events
  useTVEventHandler(
    useCallback(
      (evt) => {
        if (!Platform.isTV || !enableRemote || !evt) return;

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
            if (focusedElement) {
              const element = focusableElements.current.get(focusedElement);
              element?.onSelect?.() || element?.onPress?.();
            }
            break;
          case 'menu':
            onMenuPress?.();
            break;
          case 'play':
          case 'pause':
            onPlayPausePress?.();
            break;
          case 'back':
            if (onBackPress) {
              const shouldBlock = onBackPress();
              if (shouldBlock) {
                console.log('Back press intercepted');
              }
            } else {
              navigation.goBack();
            }
            break;
        }
      },
      [moveFocus, focusedElement, onMenuPress, onPlayPausePress, onBackPress, navigation, enableRemote]
    )
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
  };
};
