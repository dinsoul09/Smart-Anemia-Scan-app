import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';
import { Button, IconButton } from '../ui';
import { colors, fonts, radii, type } from '../../theme';

const SKIP_GUIDE_KEY = 'skipScanGuide';

// Whether the user ticked "Don't show this again"; the scan button then opens the camera directly
export const shouldSkipScanGuide = async () => {
  try {
    const value = Platform.OS === 'web' ? localStorage.getItem(SKIP_GUIDE_KEY) : await SecureStore.getItemAsync(SKIP_GUIDE_KEY);
    return value === '1';
  } catch {
    return false;
  }
};

const rememberSkip = async (skip) => {
  try {
    if (Platform.OS === 'web') {
      skip ? localStorage.setItem(SKIP_GUIDE_KEY, '1') : localStorage.removeItem(SKIP_GUIDE_KEY);
    } else {
      skip ? await SecureStore.setItemAsync(SKIP_GUIDE_KEY, '1') : await SecureStore.deleteItemAsync(SKIP_GUIDE_KEY);
    }
  } catch {
    // Not critical: the guide simply shows again next time
  }
};

const TIPS = [
  { icon: 'sun', title: 'Bright, even daylight', caption: 'Avoid yellow lamps and shadows' },
  { icon: 'eye-off', title: 'No glasses, hair aside', caption: 'Nothing should cover the eye' },
  { icon: 'smartphone', title: 'Hold the phone steady', caption: 'The eye should fill the frame' },
];

function EyelidHint() {
  return (
    <Svg width={220} height={128} viewBox="0 0 240 140">
      <Path d="M12 62C60 6 180 6 228 62C180 112 60 112 12 62Z" fill="#FFFFFF" />
      <Circle cx="120" cy="58" r="32" fill={colors.primary} />
      <Circle cx="120" cy="58" r="13" fill={colors.ink} />
      <Circle cx="130" cy="48" r="5.5" fill="#FFFFFF" />
      <Path d="M12 62C60 6 180 6 228 62" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M34 92C80 132 160 132 206 92" stroke={colors.rose} strokeWidth={14} strokeLinecap="round" fill="none" />
      <Path d="M120 128v8" stroke={colors.roseInk} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M112 128l8 9 8-9" stroke={colors.roseInk} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function ScanGuideScreen({ onBack, onOpenCamera }) {
  const [skipNextTime, setSkipNextTime] = useState(false);

  const openCamera = async () => {
    await rememberSkip(skipNextTime);
    onOpenCamera();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <View style={styles.header}>
        <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onBack} />
        <Text style={styles.step}>Step 1 of 2</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Text style={type.title} accessibilityRole="header">Before you scan</Text>
          <Text style={type.bodyMuted}>A few things make the result more reliable.</Text>
        </View>

        <View style={styles.hint}>
          <EyelidHint />
          <Text style={styles.hintText}>Gently pull your lower eyelid down so the pink inner part is visible</Text>
        </View>

        <View style={styles.tips}>
          {TIPS.map((tip) => (
            <View key={tip.title} style={styles.tip}>
              <View style={styles.tipIcon}>
                <Feather name={tip.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.tipText}>
                <Text style={type.bodyStrong}>{tip.title}</Text>
                <Text style={type.caption}>{tip.caption}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.skipRow}
          onPress={() => setSkipNextTime((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: skipNextTime }}
        >
          <View style={[styles.checkbox, skipNextTime && styles.checkboxChecked]}>
            {skipNextTime ? <Feather name="check" size={14} color={colors.onPrimary} /> : null}
          </View>
          <Text style={styles.skipText}>Don't show this again</Text>
        </Pressable>
        <Button title="Open camera" iconRight="camera" onPress={openCamera} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  step: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 18,
  },
  intro: {
    gap: 6,
    paddingHorizontal: 4,
  },
  hint: {
    backgroundColor: colors.roseTint,
    borderRadius: radii.xxl,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  hintText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.roseInkDark,
  },
  tips: {
    gap: 10,
  },
  tip: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9FB3AD',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
});
