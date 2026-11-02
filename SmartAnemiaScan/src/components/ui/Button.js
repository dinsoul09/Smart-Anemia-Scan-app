import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radii } from '../../theme';

const VARIANTS = {
  primary: { bg: colors.ink, pressed: colors.cameraBg, fg: colors.onPrimary, shadow: true },
  secondary: { bg: colors.surface, pressed: '#EEF3F1', fg: colors.primary, border: '#C9D8D3' },
  inverse: { bg: colors.surface, pressed: '#EEF3F1', fg: colors.primary },
  ghost: { bg: 'transparent', pressed: 'rgba(29, 91, 83, 0.08)', fg: colors.primary },
  danger: { bg: colors.surface, pressed: '#FBEDEA', fg: colors.danger },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  size = 'lg',
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const isDisabled = disabled || loading;
  const dimmed = isDisabled && !loading && variant === 'primary';
  const fg = dimmed ? '#4F5C58' : v.fg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: dimmed ? colors.disabled : pressed ? v.pressed : v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        v.shadow && !dimmed && styles.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.text, size === 'md' && styles.textMd, { color: fg }, textStyle]}>{title}</Text>
          {iconRight ? <Feather name={iconRight} size={20} color={fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  md: {
    height: 48,
  },
  // Soft dark glow under the main action
  shadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  textMd: {
    fontSize: 15,
  },
});
