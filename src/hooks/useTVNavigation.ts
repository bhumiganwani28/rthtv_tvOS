import { useState } from 'react';
import { useTVEventHandler } from 'react-native';

type Tab = { id: string; title: string };

export function useTVNavigation(
  tabs: Tab[], 
  itemCount: number, 
  numColumns: number
) {
  const [rowFocus, setRowFocus] = useState<'tabs' | 'content'>('tabs');
  const [focusedTab, setFocusedTab] = useState<string>(tabs[0]?.id || '');
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]?.id || '');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useTVEventHandler((evt) => {
    if (!evt?.eventType) return;

    switch (evt.eventType) {
    case 'down':
  if (rowFocus === 'tabs') {
    setRowFocus('content');
    setFocusedIndex(0);
  } else if (rowFocus === 'content') {
    const nextIndex = focusedIndex + numColumns;
    if (nextIndex < itemCount) {
      setFocusedIndex(nextIndex);
    }
  }
  break;

    case 'up':
  if (rowFocus === 'content') {
    const prevIndex = focusedIndex - numColumns;
    if (prevIndex >= 0) {
      setFocusedIndex(prevIndex);
    } else {
      setRowFocus('tabs');
    }
  }
  break;

      case 'right':
        if (rowFocus === 'tabs') {
          const currentIndex = tabs.findIndex((t) => t.id === focusedTab);
          if (currentIndex < tabs.length - 1) {
            setFocusedTab(tabs[currentIndex + 1].id);
          }
        } else if (rowFocus === 'content') {
          const next = focusedIndex + 1;
          if (next < itemCount) {
            setFocusedIndex(next);
          }
        }
        break;

      case 'left':
        if (rowFocus === 'tabs') {
          const currentIndex = tabs.findIndex((t) => t.id === focusedTab);
          if (currentIndex > 0) {
            setFocusedTab(tabs[currentIndex - 1].id);
          }
        } else if (rowFocus === 'content') {
          const prev = focusedIndex - 1;
          if (prev >= 0) {
            setFocusedIndex(prev);
          }
        }
        break;

      case 'select':
        if (rowFocus === 'tabs') {
          setSelectedTab(focusedTab);
        }
        // content select handled externally
        break;

      default:
        break;
    }
  });

  return {
    rowFocus,
    setRowFocus,
    focusedTab,
    setFocusedTab,
    selectedTab,
    setSelectedTab,
    focusedIndex,
    setFocusedIndex,
  };
}
