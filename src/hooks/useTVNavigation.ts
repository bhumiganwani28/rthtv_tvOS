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

// New hook for search screen navigation
export function useSearchTVNavigation() {
  const [rowFocus, setRowFocus] = useState<'search' | 'tabs' | 'content'>('search');
  const [focusedTabIndex, setFocusedTabIndex] = useState<number>(0);
  const [focusedId, setFocusedId] = useState<string | number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [clearFocused, setClearFocused] = useState(false);

  const handleNavigation = (
    evt: any,
    data: any[],
    onSearchFocus?: () => void,
    onClear?: () => void,
    onTabSwitch?: (index: number) => void,
    onItemSelect?: (item: any) => void
  ) => {
    if (!evt?.eventType) return;

    switch (evt.eventType) {
      case 'down':
        if (rowFocus === 'search') {
          setRowFocus('tabs');
          setFocusedTabIndex(0);
        } else if (rowFocus === 'tabs') {
          setRowFocus('content');
          setFocusedId(null);
        } else if (rowFocus === 'content') {
          if (data.length > 0) {
            setFocusedId(data[0]?.id);
          }
        }
        break;

      case 'up':
        if (rowFocus === 'content') {
          setRowFocus('tabs');
          setFocusedTabIndex(0);
        } else if (rowFocus === 'tabs') {
          setRowFocus('search');
          setSearchFocused(true);
        }
        break;

      case 'right':
        if (rowFocus === 'search') {
          setSearchFocused(false);
          setClearFocused(true);
        } else if (rowFocus === 'tabs') {
          const nextTab = focusedTabIndex === 0 ? 1 : 0;
          setFocusedTabIndex(nextTab);
        } else if (rowFocus === 'content') {
          const currentIndex = data.findIndex((item: any) => item.id === focusedId);
          if (currentIndex < data.length - 1) {
            setFocusedId(data[currentIndex + 1]?.id);
          }
        }
        break;

      case 'left':
        if (rowFocus === 'search') {
          setSearchFocused(false);
        } else if (rowFocus === 'tabs') {
          const prevTab = focusedTabIndex === 1 ? 0 : 1;
          setFocusedTabIndex(prevTab);
        } else if (rowFocus === 'content') {
          const currentIndex = data.findIndex((item: any) => item.id === focusedId);
          if (currentIndex > 0) {
            setFocusedId(data[currentIndex - 1]?.id);
          }
        }
        break;

      case 'select':
        if (rowFocus === 'search' && searchFocused) {
          onSearchFocus?.();
        } else if (rowFocus === 'search' && clearFocused) {
          onClear?.();
        } else if (rowFocus === 'tabs') {
          onTabSwitch?.(focusedTabIndex || 0);
        } else if (rowFocus === 'content' && focusedId) {
          const selectedItem = data.find((item: any) => item.id === focusedId);
          if (selectedItem) {
            onItemSelect?.(selectedItem);
          }
        }
        break;

      default:
        break;
    }
  };

  return {
    rowFocus,
    setRowFocus,
    focusedTabIndex,
    setFocusedTabIndex,
    focusedId,
    setFocusedId,
    searchFocused,
    setSearchFocused,
    clearFocused,
    setClearFocused,
    handleNavigation,
  };
}
