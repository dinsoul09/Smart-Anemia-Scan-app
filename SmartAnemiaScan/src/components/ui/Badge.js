import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, riskLabel } from '../../theme';

// Risk pill: <Badge risk="low" /> or <Badge risk="high" label="High" />
export default function Badge({ risk = 'low', label, size = 'sm', style }) {
  const tone = colors.risk[risk] ?? colors.risk.low;
  return (
    <View style={[styles.base, size === 'lg' && styles.lg, { backgroundColor: tone.bg }, style]}>
      <Text style={[styles.text, size === 'lg' && styles.textLg, { color: tone.fg }]}>{label ?? riskLabel[risk]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  lg: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  textLg: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
