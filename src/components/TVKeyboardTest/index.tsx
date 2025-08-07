import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useTVEventHandler,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import CInput from '../CInput';
import { COLORS } from '../../theme/colors';
import { scale } from 'react-native-size-matters';

const TVKeyboardTest: React.FC = () => {
  const [testText1, setTestText1] = useState('');
  const [testText2, setTestText2] = useState('');
  const [testText3, setTestText3] = useState('');
  const [testText4, setTestText4] = useState('');
  const [testText5, setTestText5] = useState('');
  const [focusedField, setFocusedField] = useState<'input1' | 'input2' | 'input3' | 'input4' | 'input5' | 'button'>('input1');
  const isTV = Platform.isTV;
  
  const inputRef1 = useRef<TextInput>(null);
  const inputRef2 = useRef<TextInput>(null);
  const inputRef3 = useRef<TextInput>(null);

  // Memoize TV props for better performance
  const tvProps = useMemo(() => ({
    ...(Platform.OS === 'ios' && Platform.isTV && {
      textContentType: 'none' as const,
      autoComplete: 'off' as const,
      autoFill: 'off' as const,
      keyboardAppearance: 'dark' as const,
      returnKeyLabel: 'done' as const,
      textAlign: 'left' as const,
      textAlignVertical: 'center' as const,
      accessible: true,
      accessibilityRole: 'text' as const,
      caretHidden: false,
      selectTextOnFocus: false,
      contextMenuHidden: true,
      clearButtonMode: 'never' as const,
    }),
  }), []);

  // Memoize event handlers
  const handleTextChange1 = useCallback((text: string) => {
    console.log('Native TextInput text changed:', text);
    setTestText1(text);
  }, []);

  const handleTextChange2 = useCallback((text: string) => {
    console.log('CInput text changed:', text);
    setTestText2(text);
  }, []);

  const handleTextChange3 = useCallback((text: string) => {
    console.log('Touchable TextInput text changed:', text);
    setTestText3(text);
  }, []);

  const handleTextChange4 = useCallback((text: string) => {
    console.log('Minimal TextInput text changed:', text);
    setTestText4(text);
  }, []);

  const handleTextChange5 = useCallback((text: string) => {
    console.log('Ultra minimal text changed:', text);
    setTestText5(text);
  }, []);

  const handleFocus1 = useCallback(() => {
    console.log('Native TextInput focused');
    setFocusedField('input1');
  }, []);

  const handleFocus2 = useCallback(() => {
    console.log('CInput focused');
    setFocusedField('input2');
  }, []);

  const handleFocus3 = useCallback(() => {
    console.log('Touchable TextInput focused');
    setFocusedField('input3');
  }, []);

  const handleFocus4 = useCallback(() => {
    console.log('Minimal TextInput focused');
    setFocusedField('input4');
  }, []);

  const handleFocus5 = useCallback(() => {
    console.log('Ultra minimal focused');
    setFocusedField('input5');
  }, []);

  const handleBlur = useCallback(() => {
    console.log('TextInput blurred');
  }, []);

  const handleTouchablePress = useCallback(() => {
    console.log('Touchable pressed, focusing input3');
    inputRef3.current?.focus();
  }, []);

  useTVEventHandler(evt => {
    if (evt && evt.eventType) {
      console.log('TVKeyboardTest - TV Event:', evt.eventType);
      
      switch (evt.eventType) {
        case 'down':
          if (focusedField === 'input1') setFocusedField('input2');
          else if (focusedField === 'input2') setFocusedField('input3');
          else if (focusedField === 'input3') setFocusedField('input4');
          else if (focusedField === 'input4') setFocusedField('input5');
          else if (focusedField === 'input5') setFocusedField('button');
          break;
        case 'up':
          if (focusedField === 'button') setFocusedField('input5');
          else if (focusedField === 'input5') setFocusedField('input4');
          else if (focusedField === 'input4') setFocusedField('input3');
          else if (focusedField === 'input3') setFocusedField('input2');
          else if (focusedField === 'input2') setFocusedField('input1');
          break;
        case 'select':
          if (focusedField === 'input1') {
            console.log('TVKeyboardTest - Focusing input1');
            inputRef1.current?.focus();
          } else if (focusedField === 'input2') {
            console.log('TVKeyboardTest - Focusing input2');
            inputRef2.current?.focus();
          } else if (focusedField === 'input3') {
            console.log('TVKeyboardTest - Focusing input3');
            inputRef3.current?.focus();
          } else if (focusedField === 'input4') {
            console.log('TVKeyboardTest - Focusing input4');
            // input4 doesn't have a ref, it's direct
          } else if (focusedField === 'input5') {
            console.log('TVKeyboardTest - Focusing input5');
            // input5 doesn't have a ref, it's direct
          }
          break;
      }
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TV Keyboard Test</Text>
      <Text style={styles.subtitle}>Testing different input approaches on Apple TV</Text>
      
      {/* Test 1: Native TextInput */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test 1 - Native TextInput:</Text>
        <TextInput
          ref={inputRef1}
          style={[
            styles.nativeInput,
            focusedField === 'input1' && styles.focusedInput
          ]}
          placeholder="Native TextInput test..."
          value={testText1}
          onChangeText={handleTextChange1}
          onFocus={handleFocus1}
          onBlur={handleBlur}
          editable={true}
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={true}
          enablesReturnKeyAutomatically={true}
          selectionColor={COLORS.primary}
          placeholderTextColor={COLORS.greyText}
          focusable={isTV}
          hasTVPreferredFocus={focusedField === 'input1'}
          {...tvProps}
        />
        <Text style={styles.valueText}>Value: "{testText1}"</Text>
      </View>

      {/* Test 2: CInput Component */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test 2 - CInput Component:</Text>
        <CInput
          placeholder="CInput component test..."
          value={testText2}
          onChangeText={handleTextChange2}
          onPress={handleFocus2}
          hasTVPreferredFocus={focusedField === 'input2'}
          focusable={true}
          containerStyle={[
            styles.customInput,
            focusedField === 'input2' && styles.focusedInput
          ]}
          keyboardType="default"
        />
        <Text style={styles.valueText}>Value: "{testText2}"</Text>
      </View>

      {/* Test 3: Simple TextInput with Touchable wrapper */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test 3 - Touchable + TextInput:</Text>
        <TouchableOpacity
          style={[
            styles.touchableInput,
            focusedField === 'input3' && styles.focusedInput
          ]}
          onPress={handleTouchablePress}
          focusable={isTV}
          hasTVPreferredFocus={focusedField === 'input3'}
        >
          <TextInput
            ref={inputRef3}
            style={styles.innerInput}
            placeholder="Touchable + TextInput test..."
            value={testText3}
            onChangeText={handleTextChange3}
            onFocus={handleFocus3}
            onBlur={handleBlur}
            editable={true}
            multiline={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="default"
            returnKeyType="done"
            blurOnSubmit={true}
            enablesReturnKeyAutomatically={true}
            selectionColor={COLORS.primary}
            placeholderTextColor={COLORS.greyText}
            {...tvProps}
          />
        </TouchableOpacity>
        <Text style={styles.valueText}>Value: "{testText3}"</Text>
      </View>

      {/* Test 4: Minimal TextInput - Bare bones */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test 4 - Minimal TextInput:</Text>
        <TextInput
          style={[
            styles.minimalInput,
            focusedField === 'input4' && styles.focusedInput
          ]}
          placeholder="Minimal test..."
          value={testText4}
          onChangeText={handleTextChange4}
          onFocus={handleFocus4}
          onBlur={handleBlur}
          editable={true}
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={true}
          enablesReturnKeyAutomatically={true}
          selectionColor={COLORS.primary}
          placeholderTextColor={COLORS.greyText}
          focusable={isTV}
          hasTVPreferredFocus={focusedField === 'input4'}
        />
        <Text style={styles.valueText}>Value: "{testText4}"</Text>
      </View>

      {/* Test 5: Ultra Minimal TextInput */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test 5 - Ultra Minimal:</Text>
        <TextInput
          style={styles.ultraMinimalInput}
          placeholder="Ultra minimal..."
          value={testText5}
          onChangeText={handleTextChange5}
          onFocus={handleFocus5}
          onBlur={handleBlur}
          editable={true}
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={true}
          enablesReturnKeyAutomatically={true}
          selectionColor={COLORS.primary}
          placeholderTextColor={COLORS.greyText}
          focusable={isTV}
          hasTVPreferredFocus={focusedField === 'input5'}
        />
        <Text style={styles.valueText}>Value: "{testText5}"</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Platform: {Platform.OS} {isTV ? '(TV)' : '(Mobile)'}
        </Text>
        <Text style={styles.infoText}>
          Focused Field: {focusedField}
        </Text>
        <Text style={styles.infoText}>
          Total Characters: {testText1.length + testText2.length + testText3.length + testText4.length + testText5.length}
        </Text>
        <Text style={styles.infoText}>
          React Native TV Version: 0.77.0-0
        </Text>
        <Text style={styles.infoText}>
          Debug: Check console for focus/blur events
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>1. Use remote to navigate between inputs</Text>
        <Text style={styles.instructionText}>2. Press select to focus each input</Text>
        <Text style={styles.instructionText}>3. Try typing in each input</Text>
        <Text style={styles.instructionText}>4. Check console for debug logs</Text>
        <Text style={styles.instructionText}>5. See which input works best</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: scale(24),
    color: COLORS.white,
    marginBottom: scale(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(16),
    color: COLORS.greyText,
    marginBottom: scale(30),
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: scale(400),
    marginBottom: scale(20),
  },
  label: {
    fontSize: scale(14),
    color: COLORS.white,
    marginBottom: scale(10),
  },
  nativeInput: {
    height: scale(50),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightBlack,
    color: COLORS.white,
    fontSize: scale(14),
    paddingHorizontal: scale(15),
    borderRadius: scale(8),
  },
  customInput: {
    height: scale(50),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightBlack,
    borderRadius: scale(8),
  },
  touchableInput: {
    height: scale(50),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightBlack,
    borderRadius: scale(8),
    justifyContent: 'center',
  },
  innerInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: scale(14),
    paddingHorizontal: scale(15),
  },
  minimalInput: {
    height: scale(50),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightBlack,
    color: COLORS.white,
    fontSize: scale(14),
    paddingHorizontal: scale(15),
    borderRadius: scale(8),
  },
  ultraMinimalInput: {
    height: scale(50),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightBlack,
    color: COLORS.white,
    fontSize: scale(14),
    paddingHorizontal: scale(15),
    borderRadius: scale(8),
  },
  focusedInput: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  valueText: {
    fontSize: scale(12),
    color: COLORS.greyText,
    marginTop: scale(5),
  },
  infoContainer: {
    width: '100%',
    maxWidth: scale(400),
    marginBottom: scale(30),
    padding: scale(15),
    backgroundColor: COLORS.lightBlack,
    borderRadius: scale(8),
  },
  infoText: {
    fontSize: scale(12),
    color: COLORS.white,
    marginBottom: scale(5),
  },
  instructions: {
    width: '100%',
    maxWidth: scale(400),
  },
  instructionTitle: {
    fontSize: scale(16),
    color: COLORS.primary,
    marginBottom: scale(10),
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: scale(12),
    color: COLORS.greyText,
    marginBottom: scale(5),
  },
});

export default TVKeyboardTest;
