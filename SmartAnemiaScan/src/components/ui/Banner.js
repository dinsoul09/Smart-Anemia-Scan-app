import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radii } from '../../theme';

// Banner above a form: the request failed for a reason the person can fix.
// error — rose, info — mint, warning — amber.
const TONES = {
  error: { bg: colors.roseTint, fg: colors.roseInk, icon: 'alert-circle' },
  info: { bg: colors.primaryTint, fg: colors.primaryPressed, icon: 'info' },
  warning: { bg: colors.risk.moderate.bg, fg: colors.risk.moderate.fg, icon: 'alert-triangle' },
};

export default function Banner({ tone = 'error', icon, title, text, actionLabel, onAction, style }) {
  const t = TONES[tone] ?? TONES.error;
  return (
    <View
      style={[styles.banner, { backgroundColor: t.bg }, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
    >
      <Feather name={icon ?? t.icon} size={20} color={t.fg} style={styles.icon} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.fg }]}>{title}</Text>
        {text ? <Text style={[styles.text, { color: t.fg }]}>{text}</Text> : null}
        {actionLabel && onAction ? (
          <Text style={[styles.action, { color: t.fg }]} onPress={onAction} accessibilityRole="link" suppressHighlighting>
            {actionLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
  },
  icon: {
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
