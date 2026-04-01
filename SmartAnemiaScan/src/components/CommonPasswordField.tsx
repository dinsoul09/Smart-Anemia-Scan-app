import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CommonPasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChangeText, placeholder = "*************" }) => {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#38C4D6"
          secureTextEntry={hidden}
        />
        <TouchableOpacity onPress={() => setHidden((prev) => !prev)}>
          <Text style={styles.eye}>{hidden ? '◠' : '◡'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldBlock: {
    marginTop: 18,
  },
  label: {
    color: '#222',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordWrapper: {
    backgroundColor: '#E9F6FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 11,
    color: '#13BED3',
    fontSize: 24,
  },
  eye: {
    color: '#3BBFD4',
    fontSize: 21,
  },
});

export default CommonPasswordField;
