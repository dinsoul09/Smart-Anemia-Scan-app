import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

const CIRCLE = 34;

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Monday → Sunday of the current week
const currentWeek = () => {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
};

// The week as a path: past days filled, today highlighted, future days outlined,
// a rose dot under every day with a scan. `scanDates`: ISO strings.
export default function WeekPath({ scanDates, streakWeeks }) {
  const [rowWidth, setRowWidth] = useState(0);
  const today = new Date();
  const days = currentWeek();
  const todayIndex = days.findIndex((d) => sameDay(d, today));
  const scanned = days.map((d) => scanDates.some((iso) => sameDay(new Date(iso), d)));

  // The track runs between the centres of the first and last circle
  const column = rowWidth / 7;
  const trackLeft = column / 2;
  const trackWidth = rowWidth - column;
  const filled = trackWidth * (todayIndex / 6);

  return (
    <View style={styles.card}>
      <View style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
        {rowWidth ? (
          <>
            <View style={[styles.track, { left: trackLeft, width: trackWidth }]} />
            <View style={[styles.track, styles.trackFilled, { left: trackLeft, width: filled }]} />
          </>
        ) : null}
        {days.map((d, i) => {
          const isToday = i === todayIndex;
          const isFuture = i > todayIndex;
          return (
            <View
              key={d.toISOString()}
              style={styles.day}
              accessibilityLabel={`${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' })}${scanned[i] ? ', scan' : ''}`}
            >
              <Text style={[styles.weekday, isToday && styles.weekdayToday, isFuture && styles.weekdayFuture]}>
                {d.toLocaleDateString('en-GB', { weekday: 'short' })}
              </Text>
              <View style={[styles.circle, isToday ? styles.circleToday : isFuture ? styles.circleFuture : styles.circlePast]}>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday, isFuture && styles.dayNumberFuture]}>
                  {d.getDate()}
                </Text>
              </View>
              <View style={[styles.dot, scanned[i] && styles.dotScan]} />
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.rose }]} />
          <Text style={styles.legendText}>Scan</Text>
        </View>
        {streakWeeks > 0 ? (
          <Text style={styles.streak}>{streakWeeks}-week streak</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
  },
  track: {
    position: 'absolute',
    top: 37,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  trackFilled: {
    backgroundColor: colors.primary,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  weekday: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  weekdayToday: {
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  weekdayFuture: {
    color: '#8A9692',
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePast: {
    backgroundColor: colors.primaryTint,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  circleToday: {
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  circleFuture: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  dayNumber: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primaryPressed,
  },
  dayNumberToday: {
    color: '#FFFFFF',
  },
  dayNumberFuture: {
    color: '#8A9692',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotScan: {
    backgroundColor: colors.rose,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  streak: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#C2553D',
  },
});
