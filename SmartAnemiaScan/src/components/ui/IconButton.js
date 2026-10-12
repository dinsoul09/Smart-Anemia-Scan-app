import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii } from '../../theme';

// 44×44 touch target. `tone="glass"` is for the dark camera screen.
export default function IconButton({ icon, onPress, accessibilityLabel, tone = 'surface', round = false, size = 22, style }) {
  const glass = tone === 'glass';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        round && styles.round,
        { backgroundColor: glass ? 'rgba(255,255,255,0.14)' : colors.surface },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Feather name={icon} size={size} color={glass ? '#FFFFFF' : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    borderRadius: radii.pill,
  },
});
