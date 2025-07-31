import React, { useEffect, useRef, useState } from 'react';
import { Platform, useTVEventHandler, View } from 'react-native';

interface TVFocusGuideProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onPlayPausePress?: () => void;
  enableKeyboard?: boolean;
  enableRemote?: boolean;
}

interface FocusableElement {
  id: string;
  ref: React.RefObject<any>;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  onSelect?: () => void;
}

export const TVFocusGuide: React.FC<TVFocusGuideProps> = ({
  children,
  onBackPress,
  onMenuPress,
  onPlayPausePress,
  enableKeyboard = true,
  enableRemote = true,
}) => {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const focusableElements = useRef<Map<string, FocusableElement>>(new Map());

  // Register a focusable element
  const registerElement = (id: string, element: FocusableElement) => {
    focusableElements.current.set(id, element);
  };

  // Unregister a focusable element
  const unregisterElement = (id: string) => {
    focusableElements.current.delete(id);
  };

  // Set focus to a specific element
  const setFocus = (id: string) => {
    const element = focusableElements.current.get(id);
    if (element?.ref?.current) {
      // Set native props for TV focus
      element.ref.current.setNativeProps({
        hasTVPreferredFocus: true,
        focusable: true
      });
      setFocusedElement(id);
      element.onFocus?.();
    }
  };

  // Move focus to next element
  const moveToNext = () => {
    const elements = Array.from(focusableElements.current.keys());
    const currentIndex = elements.indexOf(focusedElement || '');
    const nextIndex = (currentIndex + 1) % elements.length;
    setFocus(elements[nextIndex]);
  };

  // Move focus to previous element
  const moveToPrevious = () => {
    const elements = Array.from(focusableElements.current.keys());
    const currentIndex = elements.indexOf(focusedElement || '');
    const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    setFocus(elements[prevIndex]);
  };

  // Handle TV remote events
  useTVEventHandler((evt) => {
    if (!Platform.isTV || !enableRemote || !evt) return;

    switch (evt.eventType) {
      case 'up':
        moveToPrevious();
        break;
      case 'down':
        moveToNext();
        break;
      case 'left':
        // Handle left navigation (could be used for grid navigation)
        break;
      case 'right':
        // Handle right navigation (could be used for grid navigation)
        break;
      case 'select':
        // Trigger the focused element's onPress or onSelect
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
        onBackPress?.();
        break;
    }
  });

  // Handle keyboard visibility for Apple TV
  useTVEventHandler((evt) => {
    if (!Platform.isTV || !enableKeyboard || !evt) return;

    if (evt.eventType === 'keyboard') {
      setShowKeyboard(true);
    }
  });

  // Auto-focus first element when component mounts
  useEffect(() => {
    if (Platform.isTV && focusableElements.current.size > 0) {
      const firstElement = Array.from(focusableElements.current.keys())[0];
      if (firstElement) {
        setTimeout(() => setFocus(firstElement), 100);
      }
    }
  }, []);

  // Expose methods to children via context
  const contextValue = {
    registerElement,
    unregisterElement,
    setFocus,
    moveToNext,
    moveToPrevious,
    focusedElement,
    showKeyboard,
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

// Hook for individual focusable components
export const useTVFocus = (
  id: string,
  onFocus?: () => void,
  onBlur?: () => void,
  onPress?: () => void,
  onSelect?: () => void
) => {
  const ref = useRef(null);

  return {
    ref,
    focusable: true,
    hasTVPreferredFocus: false,
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
    onPress: () => {
      onPress?.();
    },
    onSelect: () => {
      onSelect?.();
    },
  };
};

// Context for TV navigation
import { createContext, useContext } from 'react';

interface TVNavigationContextType {
  registerElement: (id: string, element: FocusableElement) => void;
  unregisterElement: (id: string) => void;
  setFocus: (id: string) => void;
  moveToNext: () => void;
  moveToPrevious: () => void;
  focusedElement: string | null;
  showKeyboard: boolean;
}

const TVNavigationContext = createContext<TVNavigationContextType | null>(null);

export const useTVNavigation = () => {
  const context = useContext(TVNavigationContext);
  if (!context) {
    throw new Error('useTVNavigation must be used within a TVFocusGuide');
  }
  return context;
}; 