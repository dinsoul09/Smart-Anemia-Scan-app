import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii } from '../../theme';

export default function Card({ children, style, tone = 'surface' }) {
  const bg = { surface: colors.block, primary: colors.primary, rose: colors.roseTint, mint: colors.primaryTint }[tone] ?? colors.block;
  return <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    padding: 20,
  },
});
