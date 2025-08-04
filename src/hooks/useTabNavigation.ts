import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTVEventHandler } from 'react-native';

interface Tab {
  id: string;
  title: string;
}

interface UseTabNavigationProps {
  tabs: Tab[];
  initialSelectedTab?: string;
  initialFocusedTab?: string;
  initialRowFocus?: 'tabs' | 'slider' | 'content';
}

export const useTabNavigation = ({
  tabs,
  initialSelectedTab = 'home',
  initialFocusedTab = 'home',
  initialRowFocus = 'tabs',
}: UseTabNavigationProps) => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<string>(initialSelectedTab);
  const [focusedTab, setFocusedTab] = useState<string>(initialFocusedTab);
  const [rowFocus, setRowFocus] = useState<'tabs' | 'slider' | 'content'>(initialRowFocus);

  // Navigate when focused tab changes immediately
  useEffect(() => {
    if (focusedTab && focusedTab !== selectedTab) {
      console.log('Navigating to tab:', focusedTab);
      handleTabNavigation(focusedTab);
    }
  }, [focusedTab, selectedTab]);

  const handleTabNavigation = useCallback((tabId: string) => {
    console.log('Tab Navigation:', tabId);
    setSelectedTab(tabId);
    switch (tabId) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'channels':
        navigation.navigate('Channels');
        break;
      case 'premium':
        navigation.navigate('PremiumVideos');
        break;
      case 'featured':
        navigation.navigate('LatestSeason');
        break;
      default:
        console.log('Unknown tab:', tabId);
        break;
    }
  }, [navigation]);

  const handleTabPress = useCallback((tabId: string) => {
    console.log('Tab Press:', tabId);
    setFocusedTab(tabId);
    handleTabNavigation(tabId);
  }, [handleTabNavigation]);

  // TV Remote navigation for tabs
  useTVEventHandler(evt => {
    if (!evt?.eventType || rowFocus !== 'tabs') return;

    switch (evt.eventType) {
      case 'left':
        const currentIndex = tabs.findIndex(tab => tab.id === focusedTab);
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1];
          setFocusedTab(prevTab.id);
        }
        break;
      case 'right':
        const nextIndex = tabs.findIndex(tab => tab.id === focusedTab);
        if (nextIndex < tabs.length - 1) {
          const nextTab = tabs[nextIndex + 1];
          setFocusedTab(nextTab.id);
        }
        break;
      case 'down':
        setRowFocus('content');
        break;
      case 'select':
        handleTabPress(focusedTab);
        break;
    }
  });

  return {
    selectedTab,
    setSelectedTab,
    focusedTab,
    setFocusedTab,
    rowFocus,
    setRowFocus,
    handleTabPress,
  };
}; 