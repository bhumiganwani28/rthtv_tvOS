import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';

const EditableInputTV = () => {
  const [name, setName] = useState('John Doe'); // initial value
  const draftRef = useRef(name); // holds text while typing

  const commitDraft = () => {
    setName(draftRef.current);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Name (tvOS):</Text>
      <TextInput
        style={styles.input}
        defaultValue={name} // show initial value
        onChangeText={text => {
          draftRef.current = text;
        }}
        onEndEditing={commitDraft} // commit when user finishes
        onSubmitEditing={() => {
          commitDraft();
          Keyboard.dismiss();
        }}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit
      />
      <Text style={styles.currentValue}>Current saved value: {name}</Text>
    </View>
  );
};

export default EditableInputTV;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    color: '#fff',
  },
  currentValue: {
    marginTop: 12,
    fontSize: 14,
    color: '#ddd',
  },
});









