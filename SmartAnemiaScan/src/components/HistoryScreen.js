import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScanHistory } from '../api/anemiaApi';
import { getAccessToken } from '../api/tokenStorage';
import { Button, FadeIn, NAV_CLEARANCE } from './ui';
import { Feather } from '@expo/vector-icons';
import ScanRow from './scan/ScanRow';
import { assessScan, colors, fonts, radii, type } from '../theme';

const PAGE_SIZE = 20;
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'high', label: 'High' },
];

const monthTitle = (iso) => {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('en-GB', sameYear ? { month: 'long' } : { month: 'long', year: 'numeric' });
};

export default function HistoryScreen({ onOpenScan, onStartScan }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [disclaimer, setDisclaimer] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPage = useCallback(async (nextPage) => {
    const token = await getAccessToken();
    if (!token) return;
    const res = await getScanHistory(token, nextPage, PAGE_SIZE);
    setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
    setTotal(res.total);
    setPage(nextPage);
    setDisclaimer(res.disclaimer);
  }, []);

  const reload = useCallback(async () => {
    try {
      setError('');
      await loadPage(1);
    } catch (err) {
      console.error('History load error:', err);
      setError('Could not load your scans. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = async () => {
    if (loadingMore || items.length >= total) return;
    setLoadingMore(true);
    try {
      await loadPage(page + 1);
    } catch (err) {
      console.error('History load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const sections = useMemo(() => {
    const visible = filter === 'all' ? items : items.filter((s) => assessScan(s).risk === filter);
    const groups = [];
    visible.forEach((scan) => {
      const title = monthTitle(scan.scanDate);
      const last = groups[groups.length - 1];
      if (last && last.title === title) last.data.push(scan);
      else groups.push({ title, data: [scan] });
    });
    return groups;
  }, [items, filter]);

  const oldest = items[items.length - 1];
  const subtitle = total === 0
    ? 'No scans yet'
    : `${total} ${total === 1 ? 'scan' : 'scans'}${oldest && items.length >= total ? ` since ${monthTitle(oldest.scanDate)}` : ''}`;

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.titleBlock}>
        <Text style={type.title} accessibilityRole="header">History</Text>
        <Text style={type.bodyMuted}>{subtitle}</Text>
      </View>
      {total > 0 ? (
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <SectionList
        sections={sections}
        keyExtractor={(scan) => scan.id}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => <Text style={styles.month}>{section.title}</Text>}
        renderItem={({ item }) => <ScanRow scan={item} onPress={() => onOpenScan(item, disclaimer)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); reload(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          total === 0 && !error ? (
            <FadeIn style={styles.empty}>
              {/* A stack of placeholder rows previews what the list will look like */}
              <View style={styles.ghostStack}>
                <View style={[styles.ghostRow, styles.ghostBack]}>
                  <View style={styles.ghostIcon} />
                  <View style={styles.ghostLines}>
                    <View style={[styles.ghostLine, { width: 110 }]} />
                    <View style={[styles.ghostLineSmall, { width: 70 }]} />
                  </View>
                </View>
                <View style={[styles.ghostRow, styles.ghostMiddle]}>
                  <View style={styles.ghostIcon} />
                  <View style={styles.ghostLines}>
                    <View style={[styles.ghostLine, { width: 130 }]} />
                    <View style={[styles.ghostLineSmall, { width: 80 }]} />
                  </View>
                </View>
                <View style={styles.ghostFront}>
                  <View style={styles.ghostFrontIcon}>
                    <Feather name="eye" size={26} color="#C2553D" />
                  </View>
                  <View style={styles.ghostLines}>
                    <Text style={type.bodyStrong}>Your first scan</Text>
                    <Text style={type.caption}>Date and result will show here</Text>
                  </View>
                  <View style={styles.soonPill}>
                    <Text style={styles.soonText}>Soon</Text>
                  </View>
                </View>
              </View>
              <View style={styles.emptyText}>
                <Text style={styles.emptyTitle}>Your scans will live here</Text>
                <Text style={[type.bodyMuted, styles.center]}>
                  Each scan is saved with its date and result, so you can see how things change week by week.
                </Text>
              </View>
              <Button title="Take first scan" iconRight="arrow-right" onPress={onStartScan} />
            </FadeIn>
          ) : filter !== 'all' ? (
            <Text style={[type.bodyMuted, styles.emptyFilter]}>No scans with this result yet.</Text>
          ) : null
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.more} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ground,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: NAV_CLEARANCE,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 4,
  },
  titleBlock: {
    gap: 2,
    paddingHorizontal: 4,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  chipTextActive: {
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  month: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  separator: {
    height: 8,
  },
  empty: {
    gap: 22,
    paddingTop: 8,
  },
  ghostStack: {
    height: 172,
  },
  ghostRow: {
    position: 'absolute',
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
  },
  ghostBack: {
    left: 18,
    right: 18,
    top: 0,
    opacity: 0.45,
  },
  ghostMiddle: {
    left: 9,
    right: 9,
    top: 44,
    opacity: 0.75,
  },
  ghostIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.divider,
  },
  ghostLines: {
    flex: 1,
    gap: 8,
  },
  ghostLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.divider,
  },
  ghostLineSmall: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEF2F0',
  },
  ghostFront: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 92,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 12,
    paddingRight: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ghostFrontIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.ground,
  },
  soonText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
  },
  emptyText: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  center: {
    textAlign: 'center',
  },
  emptyFilter: {
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.danger,
    paddingHorizontal: 4,
  },
  more: {
    marginTop: 16,
  },
});
