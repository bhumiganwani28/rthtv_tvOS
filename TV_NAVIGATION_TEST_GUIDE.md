# Android TV Navigation Test Guide - LatestSeason Screen

## Overview
This guide helps test the Android TV remote control navigation for the LatestSeason screen after implementing the fixes.

## Test Environment Setup
1. **Device**: Android TV device or Android TV emulator
2. **Remote**: Android TV remote control or keyboard
3. **App**: LatestSeason screen should be accessible via navigation

## Key Navigation Features to Test

### 1. Tab Navigation (Top Row)
- **Focus**: Should start on "Featured" tab when screen loads
- **Left/Right**: Navigate between Home, Channels, Premium, Featured tabs
- **Visual Feedback**: Focused tab should have white border and primary background
- **Select**: Should navigate to respective screens

### 2. Content Grid Navigation (5-column layout)
- **Focus**: Should move to first item when pressing DOWN from tabs
- **Grid Movement**: 
  - UP: Move to previous row or back to tabs if on first row
  - DOWN: Move to next row
  - LEFT: Move to previous item in same row
  - RIGHT: Move to next item in same row
- **Visual Feedback**: Focused item should have white border
- **Select**: Should navigate to VODScreen with season ID

### 3. Key Codes to Test
```
19 - KEYCODE_DPAD_UP
20 - KEYCODE_DPAD_DOWN  
21 - KEYCODE_DPAD_LEFT
22 - KEYCODE_DPAD_RIGHT
23 - KEYCODE_DPAD_CENTER / KEYCODE_ENTER
4  - KEYCODE_BACK
```

## Test Scenarios

### Scenario 1: Basic Navigation Flow
1. Navigate to LatestSeason screen
2. Verify focus starts on "Featured" tab
3. Press RIGHT → should move to "Home" tab
4. Press LEFT → should move back to "Featured" tab
5. Press DOWN → should move to first content item
6. Press UP → should move back to "Featured" tab

### Scenario 2: Grid Navigation
1. Press DOWN from tabs to enter content grid
2. Press RIGHT → should move to next item in same row
3. Press DOWN → should move to item below (next row)
4. Press LEFT → should move to previous item in same row
5. Press UP → should move to item above (previous row)

### Scenario 3: Edge Cases
1. **First Row**: Press UP from first row → should go to tabs
2. **Last Row**: Press DOWN from last row → should stay in place
3. **First Column**: Press LEFT from first column → should stay in place
4. **Last Column**: Press RIGHT from last column → should stay in place
5. **Empty Grid**: If no content, navigation should be disabled

### Scenario 4: Selection
1. Focus on a tab and press ENTER → should navigate to that screen
2. Focus on a content item and press ENTER → should navigate to VODScreen
3. Press BACK from anywhere → should go back to previous screen

## Debug Information

### Console Logs to Monitor
Look for these log messages in the console:
```
LatestSeason - Android TV Key Pressed: [keyCode] Row Focus: [focus] Focus Index: [index]
LatestSeason - Moving [direction] in grid from [oldIndex] to [newIndex]
LatestSeason - Moving from [area] to [area]
```

### Visual Indicators
- **Tab Focus**: White border + primary background color
- **Content Focus**: White border around item
- **Debug Mode**: Enable `showDebugInfo` prop to see focus labels

## Common Issues and Solutions

### Issue 1: Focus not moving properly
**Solution**: Check if KeyEvent listener is properly set up and not conflicting with useTVEventHandler

### Issue 2: Grid navigation jumping incorrectly
**Solution**: Verify NUM_COLUMNS constant matches actual layout (should be 5)

### Issue 3: Debouncing too aggressive
**Solution**: Adjust `keyPressDebounceTime` from 150ms to 100ms if needed

### Issue 4: Focus getting stuck
**Solution**: Ensure proper cleanup of event listeners in useEffect

## Performance Considerations
- Debouncing prevents rapid key presses from causing issues
- Focus state updates are optimized with useCallback
- Event listeners are properly cleaned up to prevent memory leaks

## Accessibility Features
- All focusable elements have proper accessibility labels
- Screen reader support for tab navigation
- Visual focus indicators for users with visual impairments

## Testing Checklist
- [ ] Tab navigation works smoothly
- [ ] Grid navigation follows 5-column layout
- [ ] Focus indicators are visible
- [ ] Selection works for both tabs and content
- [ ] Back button works from any focus state
- [ ] No focus getting stuck or jumping
- [ ] Performance is smooth without lag
- [ ] Console logs show proper key handling
- [ ] Edge cases handled correctly
- [ ] Accessibility features working

## Troubleshooting
If navigation is still not working:
1. Check if `Platform.isTV` is returning true
2. Verify `react-native-keyevent` is properly installed
3. Ensure Android TV permissions are granted
4. Check console for any error messages
5. Test with different Android TV devices/emulators
