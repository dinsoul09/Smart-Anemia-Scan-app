import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts } from '../../theme';

// One short line under a field: red with a warning icon, or green with a check when `ok`.
export default function FieldMessage({ ok = false, children, style }) {
  const color = ok ? colors.risk.low.fg : colors.danger;
  return (
    <View style={[styles.row, style]} accessibilityLiveRegion="polite">
      <Feather name={ok ? 'check' : 'alert-circle'} size={16} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
