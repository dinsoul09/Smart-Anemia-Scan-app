import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

function PasswordField({ label, value, onChangeText }) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.passwordInput}
          placeholder="••••••••••"
          placeholderTextColor="#38C4D6"
          secureTextEntry={hidden}
        />
        <TouchableOpacity onPress={() => setHidden((prev) => !prev)}>
          <Text style={styles.eye}>{hidden ? '◠' : '◡'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ForgotPasswordStepContent({
  step,
  email,
  onEmailChange,
  emailError,
  code,
  onCodeChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  codeError,
}) {
  if (step === 'code') {
    const codeItems = Array.from({ length: 5 }, (_, index) => code[index] ?? '');

    return (
      <View>
        <TextInput
          value={code}
          onChangeText={(value) => onCodeChange(value.replace(/\D/g, '').slice(0, 5))}
          keyboardType="number-pad"
          maxLength={5}
          style={styles.hiddenInput}
        />

        <View style={styles.codeRow}>
          {codeItems.map((item, index) => (
            <TouchableOpacity key={`code-${index}`} style={styles.codeBox}>
              <Text style={styles.codeDigit}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {codeError ? <Text style={styles.error}>Wrong code, please try again</Text> : null}
      </View>
    );
  }

  if (step === 'reset') {
    return (
      <View style={styles.resetContainer}>
        <PasswordField label="Password" value={newPassword} onChangeText={onNewPasswordChange} />
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
        />
      </View>
    );
  }

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
      {emailError ? <Text style={styles.error}>Please enter a valid email address</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
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
  codeRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22BED4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDigit: {
    fontSize: 30,
    color: '#1D1D1D',
    fontWeight: '500',
  },
  error: {
    marginTop: 14,
    textAlign: 'center',
    color: '#20BED4',
    fontSize: 14,
  },
  resetContainer: {
    marginTop: 16,
    gap: 18,
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