import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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
});
