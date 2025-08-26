# WhosWatching Screen Test Guide - Android TV

## Overview
This guide helps test the "Who's Watching" screen profile selection functionality on Android TV after implementing the fixes.

## Test Environment Setup
1. **Device**: Android TV device or Android TV emulator
2. **Remote**: Android TV remote control or keyboard
3. **App**: Navigate to WhosWatching screen from Home page via ProfileSelector

## How to Access WhosWatching Screen
1. **From Home Screen**: Click on the profile avatar in the top-right corner
2. **Direct Navigation**: Use `navigation.navigate('WhosWatching')` from any screen

## Key Navigation Features to Test

### 1. Profile Navigation (Horizontal Row)
- **Focus**: Should start on first profile when screen loads
- **Left/Right**: Navigate between profiles horizontally
- **Visual Feedback**: Focused profile should have white border and primary background
- **Select**: Should select profile and navigate to Home screen

### 2. Add Profile Button
- **Focus**: Should be focusable after last profile
- **Visual Feedback**: Should have white border when focused
- **Select**: Should navigate to AddProfile screen

### 3. Edit Profiles Button (Bottom)
- **Focus**: Should be focusable when pressing DOWN from profiles
- **Visual Feedback**: Should have white border when focused
- **Select**: Should toggle edit mode

### 4. Key Codes to Test
```
19 - KEYCODE_DPAD_UP
20 - KEYCODE_DPAD_DOWN  
21 - KEYCODE_DPAD_LEFT
22 - KEYCODE_DPAD_RIGHT
23 - KEYCODE_DPAD_CENTER / KEYCODE_ENTER
4  - KEYCODE_BACK
```

## Test Scenarios

### Scenario 1: Basic Profile Selection
1. Navigate to WhosWatching screen
2. Verify focus starts on first profile
3. Press RIGHT → should move to next profile
4. Press LEFT → should move to previous profile
5. Press ENTER → should select profile and go to Home
6. Verify profile is saved in AsyncStorage

### Scenario 2: Add Profile Navigation
1. Navigate to last profile in the list
2. Press RIGHT → should move to "Add" button
3. Press ENTER → should navigate to AddProfile screen
4. Press BACK → should return to WhosWatching

### Scenario 3: Edit Mode Navigation
1. Press DOWN from any profile → should focus on "Edit Profiles" button
2. Press ENTER → should enter edit mode
3. Press UP → should return to profiles
4. Focus on a profile and press ENTER → should navigate to AddProfile for editing

### Scenario 4: Edge Cases
1. **First Profile**: Press LEFT from first profile → should stay in place
2. **Last Profile**: Press RIGHT from last profile → should move to Add button (if available)
3. **No Profiles**: If no profiles exist, focus should start on Add button
4. **Max Profiles**: If 6 profiles exist, no Add button should be shown

### Scenario 5: Back Navigation
1. Press BACK from any focus state → should exit app (if not in edit mode)
2. In edit mode, press BACK → should exit edit mode
3. In edit mode, press BACK again → should exit app

## Debug Information

### Console Logs to Monitor
Look for these log messages in the console:
```
WhosWatching - Android TV Key Pressed: [keyCode] Section: [section] Focus Index: [index]
WhosWatching - Profile selected: [profileId]
Profile saved to storage, navigating to Home
```

### Visual Indicators
- **Profile Focus**: White border + primary background color
- **Add Button Focus**: White border around add button
- **Edit Button Focus**: White border around edit button
- **Edit Mode**: Pencil overlay on profiles when in edit mode

## Profile Selection Flow

### Normal Mode (Not Editing)
1. **Select Profile**: Press ENTER on any profile
2. **Save to Storage**: Profile data saved to AsyncStorage
3. **Navigate**: Automatically navigate to Home screen
4. **Update UI**: Home screen should show selected profile

### Edit Mode
1. **Enter Edit Mode**: Press ENTER on "Edit Profiles" button
2. **Select Profile**: Press ENTER on any profile
3. **Navigate**: Go to AddProfile screen with profile data
4. **Edit Profile**: Modify profile details
5. **Save**: Return to WhosWatching screen

## AsyncStorage Data Structure
When a profile is selected, the following data is saved:
```javascript
// selectedProfile
{
  id: "profile_id",
  name: "Profile Name",
  avatar: "avatar_url",
  isKids: false
}

// selectedProfileImage
"avatar_url"

// selectedProfileName
"Profile Name"
```

## Common Issues and Solutions

### Issue 1: Profile selection not working
**Solution**: Check if profile data is being fetched correctly from API

### Issue 2: Navigation not working
**Solution**: Verify navigation prop is properly typed and available

### Issue 3: Focus not moving properly
**Solution**: Check if KeyEvent listener is properly set up

### Issue 4: Profile not saving to storage
**Solution**: Check AsyncStorage permissions and error handling

### Issue 5: Home screen not updating
**Solution**: Verify Home screen is reading from AsyncStorage on focus

## Performance Considerations
- Profile data is fetched once when screen loads
- Focus state is reset when screen comes into focus
- Debouncing prevents rapid key presses
- Event listeners are properly cleaned up

## Accessibility Features
- All focusable elements have proper accessibility labels
- Screen reader support for profile names
- Visual focus indicators for users with visual impairments
- Keyboard navigation support

## Testing Checklist
- [ ] Profile navigation works smoothly
- [ ] Add profile button is accessible
- [ ] Edit mode toggle works
- [ ] Profile selection saves to storage
- [ ] Navigation to Home works after selection
- [ ] Back button works from any focus state
- [ ] No focus getting stuck or jumping
- [ ] Performance is smooth without lag
- [ ] Console logs show proper key handling
- [ ] Edge cases handled correctly
- [ ] Accessibility features working
- [ ] Profile data persists after app restart

## Troubleshooting
If profile selection is still not working:
1. Check if `Platform.isTV` is returning true
2. Verify `react-native-keyevent` is properly installed
3. Ensure Android TV permissions are granted
4. Check console for any error messages
5. Verify API endpoint is working and returning profile data
6. Test with different Android TV devices/emulators
7. Check AsyncStorage is working properly
8. Verify navigation is properly configured in AppNavigator

## Expected Behavior Summary
- **Focus starts** on first profile
- **Horizontal navigation** between profiles
- **Vertical navigation** to edit button
- **Profile selection** saves data and navigates to Home
- **Add profile** navigates to AddProfile screen
- **Edit mode** allows profile editing
- **Back navigation** works properly
- **Visual feedback** is clear and responsive
