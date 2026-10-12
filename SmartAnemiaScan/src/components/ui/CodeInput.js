import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../theme';

// One hidden input + N visible boxes (keeps SMS/email autofill working).
export default function CodeInput({ value, onChange, length = 5, error = false, autoFocus = true }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hidden}
        accessibilityLabel="Confirmation code"
      />
      <View style={styles.row}>
        {digits.map((digit, i) => {
          const active = focused && !error && i === activeIndex && value.length < length;
          return (
            <Pressable
              key={`code-${i}`}
              onPress={() => inputRef.current?.focus()}
              accessible={false}
              style={[
                styles.box,
                digit && styles.boxFilled,
                active && styles.boxActive,
                error && styles.boxError,
              ]}
            >
              <Text style={styles.digit}>{digit}</Text>
              {active && !digit ? <View style={styles.caret} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    flex: 1,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: '#9FBDB5',
  },
  boxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  boxError: {
    borderColor: '#C9503E',
    borderWidth: 2,
  },
  digit: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ink,
  },
  caret: {
    position: 'absolute',
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
});
