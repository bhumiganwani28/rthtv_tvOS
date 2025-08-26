// components/TabMenuBar.tsx

import React from 'react';
import { View, FlatList, TouchableOpacity, Text, Platform } from 'react-native';
import styles from './styles';

// Props interface
interface Tab {
  id: string;
  title: string;
}

interface TabMenuBarProps {
  tabs: Tab[];
  selectedTab: string;
  focusedTab: string;
  rowFocus: string;
  onTabPress: (tabId: string) => void;
  onTabFocus: (tabId: string) => void;
  tabFocusIndex?: number;
  setTabFocusIndex?: (index: number) => void;
}

const TabMenuBar: React.FC<TabMenuBarProps> = ({
  tabs,
  selectedTab,
  focusedTab,
  rowFocus,
  onTabPress,
  onTabFocus,
  tabFocusIndex,
  setTabFocusIndex,
}) => {
  const renderTabItem = ({ item, index }: { item: Tab; index: number }) => {
    const isSelected = selectedTab === item.id;
    const isFocused = focusedTab === item.id && rowFocus === 'tabs';
    const isTabFocused = tabFocusIndex === index && rowFocus === 'tabs';

    return (
      <TouchableOpacity
        style={[
          styles.tabItem,
          isSelected && styles.selectedTab,
          (isFocused || isTabFocused) && styles.focusedTab,
        ]}
        onPress={() => onTabPress(item.id)}
        onFocus={() => {
          if (Platform.isTV) {
            onTabFocus(item.id);
            setTabFocusIndex?.(index);
          }
        }}
        hasTVPreferredFocus={index === tabFocusIndex && rowFocus === 'tabs'}
        focusable={Platform.isTV}
        accessible={Platform.isTV}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} tab`}
        accessibilityState={{
          selected: isSelected,
          focused: isFocused || isTabFocused,
        }}
      >
        <Text
          style={[
            styles.tabText,
            isSelected && styles.selectedTabText,
            (isFocused || isTabFocused) && styles.focusedTabText,
          ]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={renderTabItem}
        contentContainerStyle={styles.tabListContainer}
        scrollEnabled={false} // Disable scroll for TV navigation
      />
    </View>
  );
};

export default TabMenuBar;
