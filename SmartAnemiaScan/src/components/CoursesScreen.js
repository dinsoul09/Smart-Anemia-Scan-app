import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getScanHistory } from '../api/anemiaApi';
import { getAccessToken } from '../api/tokenStorage';
import { Button, FadeIn, NAV_CLEARANCE } from './ui';
import { colors, fonts, radii, type } from '../theme';

// Courses tab. The catalog (GET /courses) is still empty on the backend, so below the
// first-scan prompt this shows an empty state until the course screens are built.
export default function CoursesScreen({ onStartScan }) {
  // null while unknown, so the first-scan card does not flash for users who have scans
  const [hasScans, setHasScans] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const page = await getScanHistory(token, 1, 1);
        setHasScans(page.total > 0);
      } catch {
        setHasScans(true);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={type.title} accessibilityRole="header">Courses</Text>
          <Text style={type.bodyMuted}>Daily food and habit plans for healthy iron levels</Text>
        </View>

        {hasScans === false ? (
          <FadeIn>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.scanIcon}>
                  <Feather name="eye" size={26} color="#C2553D" />
                </View>
                <Text style={styles.cardTitle}>Scan first, then we'll suggest a course</Text>
              </View>
              <Text style={type.bodyMuted}>
                If a scan shows signs of anemia, the course that fits you appears here.
              </Text>
              <Button title="Take first scan" size="md" onPress={onStartScan} />
            </View>
          </FadeIn>
        ) : null}

        <FadeIn delay={hasScans === false ? 80 : 0}>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="book-open" size={28} color={colors.primary} />
            </View>
            <Text style={type.subheading}>Courses are on the way</Text>
            <Text style={[type.bodyMuted, styles.center]}>
              The first recovery courses are being prepared. They will appear here as soon as they are ready.
            </Text>
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: NAV_CLEARANCE,
    gap: 16,
  },
  intro: {
    gap: 2,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: 20,
    gap: 14,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  center: {
    textAlign: 'center',
  },
});
