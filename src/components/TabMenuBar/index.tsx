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
}

const TabMenuBar: React.FC<TabMenuBarProps> = ({
  tabs,
  selectedTab,
  focusedTab,
  rowFocus,
  onTabPress,
  onTabFocus,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedTab === item.id;
          const isFocused = focusedTab === item.id && rowFocus === 'tabs';

          return (
            <TouchableOpacity
              style={[
                styles.tabItem,
                isSelected && styles.selectedTab,
                isFocused && styles.focusedTab,
              ]}
              onPress={() => onTabPress(item.id)}
              onFocus={() => onTabFocus(item.id)}
              hasTVPreferredFocus={item.id === 'home'}
              focusable={Platform.isTV}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.selectedTabText,
                  isFocused && styles.focusedTabText,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default TabMenuBar;
