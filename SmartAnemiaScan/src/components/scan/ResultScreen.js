import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, IconButton, Badge } from '../ui';
import { assessScan, colors, fonts, radii } from '../../theme';
import RiskGauge from './RiskGauge';
import { FALLBACK_DISCLAIMER, formatCalendarDate, formatScanDate, riskCopy } from './scanFormat';

// Full result of one scan: a fresh prediction (`analyseDate`) or a history item (`scanDate`).
// `disclaimer` comes from the API response; it is never hard-coded on purpose.
// `onAddLab` opens the blood-test form; `justSaved` shows a "Saved" confirmation after returning from it.
export default function ResultScreen({ scan, disclaimer, onClose, onScanAgain, onAddLab, justSaved }) {
  const { risk, anemiaProbability } = assessScan(scan);
  const hasLab = scan.labHemoglobin != null;
  const copy = riskCopy[risk];
  const date = scan.analyseDate ?? scan.scanDate;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <View style={styles.header}>
        <IconButton icon="x" accessibilityLabel="Close" onPress={onClose} />
        <Text style={styles.headerTitle} accessibilityRole="header">Scan result</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.gaugeCard}>
          <RiskGauge probability={anemiaProbability} />
          <Badge risk={risk} size="lg" style={styles.badge} />
          {date ? <Text style={styles.date}>{formatScanDate(date, { withYear: true })}</Text> : null}
        </View>

        <View style={styles.meaningCard}>
          <Text style={styles.meaning}>{copy.meaning}</Text>
          <View style={styles.divider} />
          <View style={styles.tip}>
            <View style={[styles.tipIcon, { backgroundColor: colors.primaryTint }]}>
              <Feather name="calendar" size={17} color={colors.primary} />
            </View>
            <Text style={styles.tipText}>{copy.next}</Text>
          </View>
          {copy.doctor ? (
            <View style={styles.tip}>
              <View style={[styles.tipIcon, { backgroundColor: colors.roseTint }]}>
                <Feather name="heart" size={17} color={colors.roseInk} />
              </View>
              <Text style={styles.tipText}>{copy.doctor}</Text>
            </View>
          ) : null}
        </View>

        {onAddLab && scan.id ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasLab ? 'Edit blood test result' : 'Add blood test result'}
            onPress={onAddLab}
            style={({ pressed }) => [styles.labCard, pressed && styles.labCardPressed]}
          >
            <View style={[styles.tipIcon, { backgroundColor: colors.roseTint }]}>
              <Feather name="droplet" size={17} color={colors.roseInk} />
            </View>
            <View style={styles.labText}>
              {hasLab ? (
                <>
                  <Text style={styles.labTitle}>
                    Blood test: {scan.labHemoglobin} g/dL
                    {scan.labMeasuredAt ? ` · ${formatCalendarDate(scan.labMeasuredAt)}` : ''}
                  </Text>
                  {justSaved ? <Text style={styles.labSaved}>Saved</Text> : null}
                </>
              ) : (
                <>
                  <Text style={styles.labTitle}>Add blood test result</Text>
                  <Text style={styles.labSub}>Had a blood test? Add your haemoglobin.</Text>
                </>
              )}
            </View>
            {hasLab ? <Text style={styles.labEdit}>Edit</Text> : <Feather name="chevron-right" size={20} color={colors.muted} />}
          </Pressable>
        ) : null}

        <View style={styles.disclaimer}>
          <Feather name="info" size={16} color="#46524E" style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>{disclaimer || FALLBACK_DISCLAIMER}</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {onScanAgain ? (
          <Button title="Scan again" variant="secondary" onPress={onScanAgain} style={styles.action} />
        ) : null}
        <Button title="Done" onPress={onClose} style={styles.action} />
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
    paddingBottom: 6,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  gaugeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    alignSelf: 'center',
    marginTop: 10,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 8,
  },
  meaningCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 18,
    gap: 14,
  },
  meaning: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    paddingTop: 6,
  },
  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 16,
  },
  labCardPressed: {
    backgroundColor: colors.divider,
  },
  labText: {
    flex: 1,
    gap: 2,
  },
  labTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  labSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  labSaved: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.risk.low.fg,
  },
  labEdit: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: '#E6EAE8',
  },
  disclaimerIcon: {
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: '#46524E',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  action: {
    flex: 1,
  },
});
