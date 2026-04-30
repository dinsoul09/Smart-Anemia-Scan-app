import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';
import { getProfileInfo } from '../api/ProfileApi';

function AnimatedCard({ children, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen({ onStartScan }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadProfile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadProfile = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else if (SecureStore.getItemAsync) {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (!token || token === 'undefined' || token === 'null') {
        setLoading(false);
        return;
      }

      const data = await getProfileInfo(token);
      setProfile(data.profile);
    } catch (err) {
      console.error('HomeScreen profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scans = profile?.anemiaScans || [];
  const totalScans = scans.length;
  const latestScan = scans.length > 0
    ? scans.reduce((latest, scan) =>
        new Date(scan.scanDate) > new Date(latest.scanDate) ? scan : latest
      )
    : null;

  // ── Streak helpers ──────────────────────────────────────────────────────
  // Returns the Monday of the ISO week that contains `date`
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun … 6 Sat
    const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + diff);
    return d;
  };

  // Set of week-start timestamps that have at least one scan
  const weeksWithScan = useMemo(() => {
    const set = new Set();
    scans.forEach((s) => set.add(getWeekStart(new Date(s.scanDate)).getTime()));
    return set;
  }, [scans]);

  // Count consecutive weeks ending with the current week that have a scan
  const streakWeeks = useMemo(() => {
    let count = 0;
    let weekStart = getWeekStart(new Date());
    while (weeksWithScan.has(weekStart.getTime())) {
      count += 1;
      weekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return count;
  }, [weeksWithScan]);

  // Next milestone in the series
  const MILESTONES = [1, 4, 8, 12, 16, 26, 52];
  const nextMilestone = MILESTONES.find((m) => m > streakWeeks) || 52;

  // Progress towards next milestone (0–1)
  const streakProgress = streakWeeks === 0 ? 0 : Math.min(streakWeeks / nextMilestone, 1);
  const streakProgressPct = Math.round(streakProgress * 100);

  // Which days of the CURRENT week (Mon=0 … Sun=6) have a scan
  const thisWeekDays = useMemo(() => {
    const today = new Date();
    const monday = getWeekStart(today);
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    sunday.setHours(23, 59, 59, 999);
    const active = new Set();
    scans.forEach((s) => {
      const d = new Date(s.scanDate);
      if (d >= monday && d <= sunday) {
        // day index: Mon=0 … Sun=6
        const dow = d.getDay(); // 0 Sun … 6 Sat
        active.add(dow === 0 ? 6 : dow - 1);
      }
    });
    return active;
  }, [scans]);

  // SVG ring circumference
  const RING_R = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R;

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BBD3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Start Scan Card */}
      <AnimatedCard delay={100}>
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanCard}
        >
          <View style={styles.scanCardContent}>
            <View style={styles.scanCardTextWrap}>
              <Text style={styles.scanCardTitle}>Start Eye Scan</Text>
              <Text style={styles.scanCardSubtitle}>Quick & painless detection</Text>
            </View>
            <View style={styles.scanCardIconWrap}>
              <Feather name="maximize" size={28} color="#FFFFFF" />
            </View>
          </View>

          <TouchableOpacity
            style={styles.beginScanButton}
            onPress={onStartScan}
            activeOpacity={0.8}
          >
            <Text style={styles.beginScanButtonText}>Begin Scan Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </AnimatedCard>

      {/* Monitoring Streak Card */}
      <AnimatedCard delay={175}>
        <View style={styles.streakCard}>
          {/* Header Row */}
          <View style={styles.streakHeader}>
            <View style={styles.streakHeaderLeft}>
              <View style={styles.streakIconWrap}>
                <Feather name="calendar" size={18} color="#00BBD3" />
              </View>
              <View>
                <Text style={styles.streakTitle}>Monitoring Streak</Text>
                <Text style={styles.streakSubtitle}>Consistent health tracking</Text>
              </View>
            </View>
            <View style={styles.streakAvatarWrap}>
              <Feather name="user" size={18} color="#00BBD3" />
            </View>
          </View>

          {/* Body: Ring + Stats */}
          <View style={styles.streakBody}>
            {/* Circular Progress */}
            <View style={styles.streakRingContainer}>
              <Svg width={100} height={100} viewBox="0 0 100 100">
                <Defs>
                  <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#33E4DB" />
                    <Stop offset="1" stopColor="#00BBD3" />
                  </SvgLinearGradient>
                </Defs>
                {/* Track */}
                <Circle
                  cx="50" cy="50" r={RING_R}
                  stroke="#E9F6FE" strokeWidth="8" fill="none"
                />
                {/* Fill — only render when there is progress */}
                {streakProgress > 0 && (
                  <Circle
                    cx="50" cy="50" r={RING_R}
                    stroke="url(#ringGrad)" strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${streakProgress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    transform="rotate(-90 50 50)"
                  />
                )}
              </Svg>
              <View style={styles.streakRingLabel}>
                <Text style={styles.streakRingNumber}>{streakWeeks}</Text>
                <Text style={styles.streakRingUnit}>weeks</Text>
              </View>
            </View>

            {/* Right side stats */}
            <View style={styles.streakStats}>
              <View style={styles.streakStatRow}>
                <Text style={styles.streakStatLabel}>Progress</Text>
                <Text style={styles.streakStatValue}>{streakProgressPct}%</Text>
              </View>
              <View style={[styles.streakProgressTrack, { marginTop: 4, marginBottom: 12 }]}>
                <LinearGradient
                  colors={['#33E4DB', '#00BBD3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.streakProgressFill, { width: `${streakProgressPct}%` }]}
                />
              </View>
              <View style={styles.streakStatRow}>
                <Text style={styles.streakStatLabel}>Next milestone:</Text>
                <Text style={[styles.streakStatValue, { color: '#00BBD3' }]}>{nextMilestone} weeks</Text>
              </View>
            </View>
          </View>

          {/* Weekly Dots */}
          <View style={styles.streakWeekRow}>
            <Text style={styles.streakWeekLabel}>This week</Text>
            <View style={styles.streakDots}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const isActive = thisWeekDays.has(i);
                return (
                  <View key={i} style={styles.streakDotCol}>
                    <View style={[styles.streakDot, isActive && styles.streakDotActive]}>
                      {isActive && <Feather name="check" size={10} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.streakDayText, isActive && styles.streakDayTextActive]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </AnimatedCard>

      {/* Health Status */}
      <AnimatedCard delay={250}>
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitleRow}>
              <Feather name="activity" size={18} color="#00BBD3" />
              <Text style={styles.healthTitle}>Health Status</Text>
            </View>
            {latestScan && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: latestScan.isAnemic ? '#FFF0F0' : '#F0FFF4' },
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: latestScan.isAnemic ? '#FF6B6B' : '#4CAF50' },
                ]}>
                  {latestScan.isAnemic ? 'Anemic' : 'Normal'}
                </Text>
              </View>
            )}
          </View>

          {latestScan ? (
            <View style={styles.healthBody}>
              <View style={styles.healthRow}>
                <Text style={styles.healthLabel}>Last Scan</Text>
                <Text style={styles.healthValue}>{formatRelativeDate(latestScan.scanDate)}</Text>
              </View>
              <View style={styles.healthRow}>
                <Text style={styles.healthLabel}>Confidence</Text>
                <Text style={styles.healthValue}>{(latestScan.confidence * 100).toFixed(1)}%</Text>
              </View>
              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <LinearGradient
                  colors={latestScan.isAnemic ? ['#FF6B6B', '#FF8E8E'] : ['#4CAF50', '#66BB6A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${(latestScan.confidence * 100).toFixed(0)}%` }]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyHealth}>
              <Feather name="info" size={24} color="#B0CED9" />
              <Text style={styles.emptyHealthText}>No scans yet. Start your first scan!</Text>
            </View>
          )}
        </View>
      </AnimatedCard>

      {/* Stats Row */}
      <AnimatedCard delay={400}>
        <View style={styles.statsRow}>
          {/* Total Scans */}
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E6FBFC' }]}>
              <Feather name="trending-up" size={20} color="#00BBD3" />
            </View>
            <Text style={styles.statValue}>{totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>

          {/* Accuracy */}
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#F0FFF4' }]}>
              <Feather name="zap" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>75%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },

  // Start Scan Card
  scanCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  scanCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanCardTextWrap: {
    flex: 1,
  },
  scanCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scanCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  scanCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginScanButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  beginScanButtonText: {
    color: '#00BBD3',
    fontSize: 16,
    fontWeight: '700',
  },

  // Health Status Card
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F9FB',
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C47',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  healthBody: {},
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#7CA0AC',
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 14,
    color: '#1A3C47',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E9F6FE',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyHealth: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyHealthText: {
    color: '#7CA0AC',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F9FB',
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3C47',
  },
  statLabel: {
    fontSize: 13,
    color: '#7CA0AC',
    fontWeight: '500',
    marginTop: 2,
  },

  // Monitoring Streak Card
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F9FB',
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6FBFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  streakTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A3C47',
  },
  streakSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7CA0AC',
    marginTop: 1,
  },
  streakAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FBFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakRingContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  streakRingLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakRingNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A3C47',
  },
  streakRingUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7CA0AC',
    marginTop: -2,
  },
  streakStats: {
    flex: 1,
  },
  streakStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakStatLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7CA0AC',
  },
  streakStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3C47',
  },
  streakProgressTrack: {
    height: 6,
    backgroundColor: '#E9F6FE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  streakWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F9FB',
    paddingTop: 14,
  },
  streakWeekLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3C47',
  },
  streakDots: {
    flexDirection: 'row',
    gap: 8,
  },
  streakDotCol: {
    alignItems: 'center',
  },
  streakDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E9F6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDotActive: {
    backgroundColor: '#00BBD3',
  },
  streakDayText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#B0CED9',
    marginTop: 3,
  },
  streakDayTextActive: {
    color: '#00BBD3',
    fontWeight: '600',
  },
});
