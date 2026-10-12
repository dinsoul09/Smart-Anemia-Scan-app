import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Badge } from '../ui';
import { assessScan, colors, fonts, radii } from '../../theme';
import { formatScanDate, percent } from './scanFormat';

const SHORT_LABEL = { low: 'Low', moderate: 'Moderate', high: 'High' };

// One scan in the history list; opens the full result on press
export default function ScanRow({ scan, onPress }) {
  const { risk, anemiaProbability } = assessScan(scan);
  const date = formatScanDate(scan.scanDate);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scan ${date}, ${SHORT_LABEL[risk]} probability`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Feather name="eye" size={22} color={colors.rose} />
      </View>
      <View style={styles.text}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.caption}>{percent(anemiaProbability)}% probability</Text>
      </View>
      <Badge risk={risk} label={SHORT_LABEL[risk]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  date: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
});
