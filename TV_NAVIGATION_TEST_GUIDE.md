# Android TV Navigation Test Guide

## 🎮 How to Test TV Navigation

### Prerequisites
1. Make sure you're running the app on an Android TV device or emulator
2. Have an Android TV remote control connected
3. Check that `Platform.isTV` returns `true`

### Testing Steps

#### 1. Basic Navigation Test
- **Start the app** and navigate to the Home screen
- **Look for the TV Focus Test panel** in the top-right corner
- **Use the remote control** to navigate:
  - ⬆️ **UP**: Move between sections (Tabs → Slider → Content)
  - ⬇️ **DOWN**: Move between sections (Content → Slider → Tabs)
  - ⬅️ **LEFT**: Navigate within current section
  - ➡️ **RIGHT**: Navigate within current section
  - ✅ **SELECT**: Select current item
  - 🔙 **BACK**: Exit the app

#### 2. Console Logging
- **Open developer console** to see navigation logs
- **Look for these log messages**:
  ```
  🎮 TV Event: up Current Section: tabs
  ⬆️ UP pressed
  🔄 UP Navigation - Current: tabs 0
  📱 Moved to tabs
  ```

#### 3. Visual Indicators
- **Focused tabs** should have a white border and glow effect
- **Focused content items** should have a white border and scale up
- **Focused "View All" buttons** should have a white border and glow

#### 4. Navigation Flow Test

##### Tab Navigation:
1. **Start on tabs section** (default)
2. **Press LEFT/RIGHT** to move between tabs
3. **Press DOWN** to move to slider
4. **Press UP** to return to tabs

##### Content Navigation:
1. **Press DOWN** from tabs to reach content
2. **Press LEFT/RIGHT** to move between items in a row
3. **Press UP/DOWN** to move between content rows
4. **Press SELECT** to select items

##### Slider Navigation:
1. **Navigate to slider section**
2. **Press LEFT/RIGHT** to navigate slider items
3. **Press SELECT** to select slider items

### Expected Behavior

#### ✅ Working Features:
- [ ] **Directional navigation** between sections
- [ ] **Tab navigation** with visual focus
- [ ] **Content row navigation** with item selection
- [ ] **Visual focus indicators** on all elements
- [ ] **Console logging** for all navigation events
- [ ] **Back button** exits the app

#### 🔧 Debug Information:
The TV Focus Test panel shows:
- **Current Section**: tabs, slider, or content
- **Current Row**: 0-3 for content rows
- **Current Item**: -1 for "View All", 0-9 for items
- **Current Tab**: Selected tab name

### Troubleshooting

#### Issue: Remote not responding
**Solution:**
1. Check if `Platform.isTV` is true
2. Verify remote is connected
3. Check console for KeyEvent logs
4. Restart the app

#### Issue: Focus not visible
**Solution:**
1. Check if focus styles are applied
2. Verify `focusable` and `hasTVPreferredFocus` props
3. Check if current section matches component expectations

#### Issue: Navigation stuck
**Solution:**
1. Check console logs for navigation state
2. Verify section transitions are working
3. Reset navigation state by restarting app

### Key Code Reference

#### Android TV Remote Key Codes:
- `19` - KEYCODE_DPAD_UP
- `20` - KEYCODE_DPAD_DOWN
- `21` - KEYCODE_DPAD_LEFT
- `22` - KEYCODE_DPAD_RIGHT
- `23` - KEYCODE_DPAD_CENTER
- `4` - KEYCODE_BACK

#### Navigation States:
- `currentSection`: 'tabs' | 'slider' | 'content'
- `currentRow`: 0-3 (content rows)
- `currentItem`: -1 (View All) or 0-9 (items)
- `focusedTab`: Current tab ID

### Testing Checklist

- [ ] Remote responds to all directional keys
- [ ] Visual focus indicators appear correctly
- [ ] Navigation flows smoothly between sections
- [ ] Console logs show all navigation events
- [ ] Back button exits the app
- [ ] Tab selection works properly
- [ ] Content item selection works
- [ ] Focus resets appropriately when changing sections

### Performance Notes

- Navigation should be **responsive** (no lag)
- Focus transitions should be **smooth**
- Console logging should be **minimal** in production
- Visual effects should be **subtle** but visible

### Next Steps

After testing, you can:
1. **Remove debug components** for production
2. **Optimize focus styles** for better UX
3. **Add haptic feedback** for focus changes
4. **Implement smooth transitions** between focus states
5. **Add accessibility support** for screen readers
