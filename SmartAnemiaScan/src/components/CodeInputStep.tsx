import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface CodeInputStepProps {
  code: string;
  onCodeChange: (text: string) => void;
  codeError: boolean;
}

const CodeInputStep: React.FC<CodeInputStepProps> = ({ code, onCodeChange, codeError }) => {
  const codeInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(focusTimer);
  }, []);

  const handleCodeChange = (value: string) => {
    onCodeChange(value.replace(/\D/g, '').slice(0, 5));
  };

  const codeItems = Array.from({ length: 5 }, (_, index) => code[index] ?? '');

  return (
    <View>
      <TextInput
        ref={codeInputRef}
        value={code}
        onChangeText={handleCodeChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={5}
        style={styles.hiddenInput}
      />

      <View style={styles.codeRow}>
        {codeItems.map((item, index) => (
          <TouchableOpacity
            key={`code-${index}`}
            style={styles.codeBox}
            activeOpacity={0.9}
            onPress={() => codeInputRef.current?.focus()}
          >
            <Text style={styles.codeDigit}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {codeError ? (
        <Text style={styles.error}>Wrong code, please try again</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
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
});

export default CodeInputStep;
