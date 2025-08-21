# Android TV Navigation System

This document describes the TV navigation system implemented for Android TV remote controls using React Native KeyEvent.

## Overview

The TV navigation system provides comprehensive remote control support for Android TV devices, handling directional navigation, selection, and special function keys.

## Key Features

- **Directional Navigation**: Up, Down, Left, Right navigation between UI elements
- **Selection**: Enter/Select key handling for item selection
- **Back Navigation**: Back button support with custom handling
- **Special Keys**: Search, Menu, Volume, and Media control keys
- **Focus Management**: Visual focus indicators and proper focus tracking
- **Cross-Platform**: Works on both Android TV and iOS TV

## Key Codes Supported

### Directional Keys
- `19` - KEYCODE_DPAD_UP
- `20` - KEYCODE_DPAD_DOWN  
- `21` - KEYCODE_DPAD_LEFT
- `22` - KEYCODE_DPAD_RIGHT
- `23` - KEYCODE_DPAD_CENTER / KEYCODE_ENTER

### Function Keys
- `4` - KEYCODE_BACK
- `3` - KEYCODE_HOME
- `84` - KEYCODE_SEARCH
- `82` - KEYCODE_MENU
- `24` - KEYCODE_VOLUME_UP
- `25` - KEYCODE_VOLUME_DOWN
- `85` - KEYCODE_MEDIA_PLAY_PAUSE
- `86` - KEYCODE_MEDIA_PLAY
- `87` - KEYCODE_MEDIA_PAUSE

## Navigation Structure

### Home Screen Layout
```
Header (Search, Logout)
├── Tab Bar (Home, Channels, Premium, Featured)
├── Slider (Featured Content)
└── Content Rows
    ├── Live & Upcoming Shows
    ├── Featured Seasons
    ├── Channels
    └── Latest Seasons
```

### Focus Areas
1. **Header**: Search and logout buttons
2. **Tabs**: Navigation between main sections
3. **Slider**: Featured content carousel
4. **Content**: Individual content rows with items

## Usage

### Basic Implementation

```typescript
import { useHomeTVNavigation } from '../hooks/useHomeTVNavigation';

const HomeScreen = () => {
  const {
    currentFocusArea,
    focusedTabIndex,
    focusedContentRow,
    focusedItemIndex,
    // ... other navigation functions
  } = useHomeTVNavigation({
    onBackPress: () => {
      BackHandler.exitApp();
      return true;
    },
    onSearchPress: () => navigation.navigate('SearchVideosTV'),
  });

  return (
    <View>
      {/* Your UI components */}
    </View>
  );
};
```

### Component Integration

Components should use the focus state to show visual indicators:

```typescript
const isFocused = currentFocusArea === 'content' && 
                  focusedContentRow === rowIndex && 
                  focusedItemIndex === itemIndex;

return (
  <TouchableOpacity
    style={[styles.item, isFocused && styles.focusedItem]}
    focusable={Platform.isTV}
    hasTVPreferredFocus={isFocused}
  >
    {/* Item content */}
  </TouchableOpacity>
);
```

## Debugging

The system includes a debug indicator that shows current focus state:

```typescript
{Platform.isTV && (
  <TVFocusIndicator
    currentFocusArea={currentFocusArea}
    focusedTabIndex={focusedTabIndex}
    focusedContentRow={focusedContentRow}
    focusedItemIndex={focusedItemIndex}
  />
)}
```

## Console Logging

The navigation system logs all key events and focus changes:

```
TV Navigation: Key 20 pressed, current focus: tabs
TV Navigation: DOWN pressed, current: tabs, contentRow: 0
TV Navigation: Moved to slider
```

## Customization

### Adding New Focus Areas

1. Update the `FocusArea` type in `useHomeTVNavigation.ts`
2. Add navigation logic in the handler functions
3. Update component focus logic

### Custom Key Handling

Add new key codes to the `handleKeyEvent` function:

```typescript
case 123: // Your custom key code
  handleCustomAction();
  break;
```

## Troubleshooting

### Common Issues

1. **Keys not responding**: Check if KeyEvent listener is properly initialized
2. **Focus not updating**: Verify component focusable and hasTVPreferredFocus props
3. **Navigation stuck**: Check console logs for focus state issues

### Debug Steps

1. Enable debug indicator to see current focus state
2. Check console logs for key events
3. Verify KeyEvent listener is active
4. Test on actual Android TV device

## Dependencies

- `react-native-keyevent`: For Android TV key event handling
- `react-native-tvos`: For TV platform detection
- `@react-navigation/native`: For navigation integration

## Future Enhancements

- [ ] Add haptic feedback for focus changes
- [ ] Implement smooth focus transitions
- [ ] Add accessibility support
- [ ] Support for gamepad controllers
- [ ] Customizable key mappings
