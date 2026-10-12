import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, AppState, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getProfileInfo } from '../api/ProfileApi';
import { getScanHistory } from '../api/anemiaApi';
import { getAccessToken } from '../api/tokenStorage';
import { Badge, Button, FadeIn, NAV_CLEARANCE } from './ui';
import AmbientBackground from './home/AmbientBackground';
import RiskTrendChart from './home/RiskTrendChart';
import WeekPath from './home/WeekPath';
import { assessScan, colors, fonts, riskLabel, type } from '../theme';
import { percent } from './scan/scanFormat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TREND_POINTS = 5;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); // back to Monday
  return d.getTime();
};

// Consecutive weeks with at least one scan, ending this week (or last week, if this week has none yet)
const weeklyStreak = (scans) => {
  const weeks = new Set(scans.map((s) => startOfWeek(s.scanDate)));
  let week = startOfWeek(new Date());
  if (!weeks.has(week)) week -= WEEK_MS;
  let count = 0;
  while (weeks.has(week)) {
    count += 1;
    week -= WEEK_MS;
  }
  return count;
};

// "MON, 5 OCT" for the next weekly scan, or "DUE NOW" once a week has passed
const nextScanLabel = (lastScanDate) => {
  const due = new Date(new Date(lastScanDate).getTime() + WEEK_MS);
  if (due.getTime() <= Date.now()) return 'DUE NOW';
  return due.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '').replace(' ', ', ').toUpperCase();
};

const lastScanDay = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function PlanRow({ icon, iconBg, iconColor, caption, captionColor, title, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.planRow, !last && styles.planDivider, pressed && styles.pressed]}
    >
      <View style={[styles.planIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.planText}>
        <Text style={[styles.planCaption, { color: captionColor }]}>{caption}</Text>
        <Text style={type.bodyStrong}>{title}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#8A9692" />
    </Pressable>
  );
}

export default function HomeScreen({ onStartScan, onOpenScan, onOpenProfile, onOpenCourses, onOpenHistory }) {
  const [profile, setProfile] = useState(null);
  const [scans, setScans] = useState([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const [profileData, history] = await Promise.all([
        getProfileInfo(token).catch(() => null),
        getScanHistory(token, 1, 50),
      ]);
      if (profileData) setProfile(profileData.profile);
      setScans(history.items);
      setDisclaimer(history.disclaimer);
      setLoadError(false);
    } catch (err) {
      console.error('HomeScreen load error:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => subscription.remove();
  }, [load]);

  const latest = scans[0] ?? null;
  const latestAssessment = latest ? assessScan(latest) : null;
  // Oldest on the left, newest on the right
  const trend = useMemo(
    () =>
      scans
        .slice(0, TREND_POINTS)
        .reverse()
        .map((s) => {
          const { risk, anemiaProbability } = assessScan(s);
          return { date: s.scanDate, probability: anemiaProbability, risk };
        }),
    [scans],
  );
  const streak = useMemo(() => weeklyStreak(scans), [scans]);
  const scanDates = useMemo(() => scans.map((s) => s.scanDate), [scans]);

  // Change against the previous scan, in percentage points
  const previous = scans[1] ? assessScan(scans[1]) : null;
  const delta = latestAssessment && previous ? percent(latestAssessment.anemiaProbability) - percent(previous.anemiaProbability) : null;

  const firstName = (profile?.fullName || '').trim().split(/\s+/)[0];
  const initial = (firstName || profile?.email || '?').charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        >
          <View style={styles.header}>
            <Pressable onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel="Profile" style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </Pressable>
            <View style={styles.headerText}>
              <Text style={type.caption}>{greeting()}</Text>
              <Text style={styles.name} accessibilityRole="header">{firstName || 'Welcome'}</Text>
            </View>
          </View>

          {loadError && !latest ? (
            <View style={styles.card}>
              <Text style={type.subheading}>Couldn't load your scans</Text>
              <Text style={type.bodyMuted}>Check your connection and try again.</Text>
              <Button title="Try again" variant="secondary" size="md" onPress={() => { setLoading(true); load(); }} />
            </View>
          ) : (
            <>
              <FadeIn>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={type.caption}>{latest ? `Last scan · ${lastScanDay(latest.scanDate)}` : 'No scans yet'}</Text>
                    {latest ? (
                      <Badge risk={latestAssessment.risk} label={riskLabel[latestAssessment.risk]} />
                    ) : null}
                  </View>

                  <View style={styles.numberRow}>
                    <Text style={[styles.bigNumber, !latest && styles.bigNumberEmpty]}>
                      {latest ? `${percent(latestAssessment.anemiaProbability)}%` : '—%'}
                    </Text>
                    <Text style={styles.numberCaption}>chance of{'\n'}anemia signs</Text>
                    {delta !== null && delta !== 0 ? (
                      <View style={styles.delta} accessibilityLabel={`${Math.abs(delta)} points ${delta < 0 ? 'lower' : 'higher'} than the previous scan`}>
                        <Feather
                          name={delta < 0 ? 'arrow-down-right' : 'arrow-up-right'}
                          size={16}
                          color={delta < 0 ? colors.risk.low.fg : colors.risk.high.fg}
                        />
                        <Text style={[styles.deltaText, { color: delta < 0 ? colors.risk.low.fg : colors.risk.high.fg }]}>
                          {Math.abs(delta)} pts
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <RiskTrendChart points={trend} emptyText="Your scans will be plotted here" />

                  <Pressable
                    onPress={latest ? () => onOpenScan(latest, disclaimer) : onStartScan}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
                  >
                    <View style={styles.thumb}>
                      <Feather name="eye" size={20} color={colors.roseLight} />
                    </View>
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle}>{latest ? 'See full result' : 'Take your first scan'}</Text>
                      <Text style={type.small}>{latest ? 'Analysed area and next steps' : 'One eyelid photo · about a minute'}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#8A9692" />
                  </Pressable>
                </View>
              </FadeIn>

              <FadeIn delay={80}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>This week</Text>
                  {latest ? (
                    <Pressable onPress={onOpenHistory} accessibilityRole="button" hitSlop={10}>
                      <Text style={styles.link}>History</Text>
                    </Pressable>
                  ) : null}
                </View>
                <WeekPath scanDates={scanDates} streakWeeks={streak} />
              </FadeIn>

              <FadeIn delay={160}>
                <View style={styles.plan}>
                  <PlanRow
                    icon="book-open"
                    iconBg={colors.primaryTint}
                    iconColor={colors.primary}
                    caption="COURSES"
                    captionColor={colors.primary}
                    title="Food and habits for healthy iron"
                    onPress={onOpenCourses}
                  />
                  {latest ? (
                    <PlanRow
                      icon="eye"
                      iconBg={colors.roseTint}
                      iconColor="#C2553D"
                      caption={nextScanLabel(latest.scanDate)}
                      captionColor={colors.roseInk}
                      title="Weekly scan"
                      onPress={onStartScan}
                      last
                    />
                  ) : (
                    <PlanRow
                      icon="user"
                      iconBg={colors.roseTint}
                      iconColor="#C2553D"
                      caption={profile?.sex != null ? 'DONE' : 'ADD YOUR SEX'}
                      captionColor={colors.roseInk}
                      title="Complete your profile"
                      onPress={onOpenProfile}
                      last
                    />
                  )}
                </View>
              </FadeIn>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F0',
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F0',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: NAV_CLEARANCE,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.roseInk,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 30,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 14,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 26,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bigNumber: {
    fontFamily: fonts.bold,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -2.3,
    color: colors.ink,
  },
  bigNumberEmpty: {
    color: '#B5C0BC',
  },
  numberCaption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.muted,
  },
  delta: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  resultRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 84,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#16201E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
    gap: 1,
  },
  resultTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  plan: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  planRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  planIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planText: {
    flex: 1,
    gap: 2,
  },
  planCaption: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
