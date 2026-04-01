import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface EmailInputStepProps {
  email: string;
  onEmailChange: (text: string) => void;
  emailError: boolean;
}

const EmailInputStep: React.FC<EmailInputStepProps> = ({ email, onEmailChange, emailError }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        placeholder="example@example.com"
        placeholderTextColor="#00BCD4"
        style={styles.emailInput}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? (
        <Text style={styles.errorText}>Please enter a valid email address</Text>
      ) : null}
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
  emailInput: {
    backgroundColor: '#E5EEF3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#16BFD3',
    fontSize: 24,
  },
  errorText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#20BED4',
    fontSize: 14,
  },
});

export default EmailInputStep;
