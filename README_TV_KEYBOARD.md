# TV Keyboard Testing Guide

## Overview
This app now uses the **native/default TV keyboard** like Netflix and other professional TV apps, not a custom keyboard.

## How It Works

### Apple TV
1. **Focus on input field** → Native keyboard opens automatically
2. **Use remote D-pad** → Navigate keyboard keys
3. **Press select** → Type character
4. **Press back** → Close keyboard
5. **Use remote keyboard** → Type with remote control

### Android TV
1. **Focus on input field** → Native keyboard opens automatically
2. **Use remote D-pad** → Navigate keyboard keys
3. **Press select/enter** → Type character
4. **Press back** → Close keyboard
5. **Use remote keyboard** → Type with remote control

## Testing Instructions

### Apple TV Simulator
1. Open the app in Apple TV Simulator
2. Navigate to Login screen
3. Focus on email input field
4. Native keyboard should open automatically
5. Use remote D-pad to navigate keys
6. Press select to type characters
7. Test backspace and other keys
8. Press back to close keyboard

### Android TV
1. Open the app on Android TV device/emulator
2. Navigate to Login screen
3. Focus on email input field
4. Native keyboard should open automatically
5. Use remote D-pad to navigate keys
6. Press select/enter to type characters
7. Test all keyboard functions
8. Press back to close keyboard

## Expected Behavior

✅ **Native Keyboard** - Uses platform's default keyboard  
✅ **Auto-Focus** - Keyboard opens when input is focused  
✅ **Remote Navigation** - D-pad works to navigate keys  
✅ **Character Input** - Select/enter types characters  
✅ **Backspace** - Works properly  
✅ **Space Key** - Works for spaces  
✅ **Close Keyboard** - Back button closes keyboard  
✅ **Cross-Platform** - Works on both Apple TV and Android TV  

## Troubleshooting

### If keyboard doesn't open:
1. Make sure input is focused
2. Press select/enter on the input field
3. Check if TV platform is detected properly

### If keyboard doesn't respond:
1. Make sure remote is connected
2. Try navigating with D-pad first
3. Check console logs for errors

### If focus doesn't work:
1. Ensure `focusable={true}` is set
2. Check `hasTVPreferredFocus` prop
3. Verify TV event handling is working

## Technical Details

- Uses native `TextInput` with `editable={true}`
- TV event handling with `useTVEventHandler`
- Proper focus management with `focusable` and `hasTVPreferredFocus`
- Keyboard show/hide events handled properly
- Cross-platform compatibility ensured

## Files Modified

1. `src/components/CInput/index.tsx` - Native keyboard integration
2. `src/screens/Login/index.tsx` - Keyboard event handling
3. `src/App.tsx` - Global TV event handling
4. Removed custom TVKeyboard component

The app now uses the professional native TV keyboard like Netflix and other TV apps! 