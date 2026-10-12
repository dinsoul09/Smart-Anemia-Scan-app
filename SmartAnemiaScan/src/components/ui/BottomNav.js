import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const BAR_HEIGHT = 68;
const BAR_GAP = 10; // space between the bar and the bottom safe edge

// Tab screens pad their scroll content by this much so the floating bar never covers the last row
export const NAV_CLEARANCE = BAR_HEIGHT + BAR_GAP + 36;

const LEFT_TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'courses', label: 'Courses', icon: 'book-open' },
];
const RIGHT_TABS = [
  { key: 'history', label: 'History', icon: 'clock' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

function ScanIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#0E2A26" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <Path d="M7 12s2-3 5-3 5 3 5 3-2 3-5 3-5-3-5-3z" />
    </Svg>
  );
}

function Tab({ tab, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      <Feather name={tab.icon} size={24} color={active ? '#FFFFFF' : '#8FA19C'} />
      <View style={[styles.activeDot, active && styles.activeDotOn]} />
    </Pressable>
  );
}

// Floating dark pill with icon-only tabs and the mint scan button in the middle
export default function BottomNav({ active, onChange, onScan }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, 16) + BAR_GAP }]} accessibilityRole="tablist">
      {LEFT_TABS.map((tab) => (
        <Tab key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
      ))}
      <Pressable
        onPress={onScan}
        accessibilityRole="button"
        accessibilityLabel="New scan"
        style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
      >
        <ScanIcon />
      </Pressable>
      {RIGHT_TABS.map((tab) => (
        <Tab key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  tab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  activeDotOn: {
    backgroundColor: colors.mint,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
