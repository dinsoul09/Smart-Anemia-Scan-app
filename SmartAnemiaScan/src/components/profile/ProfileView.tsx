import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ProfileField from './ProfileField';
import ScanList from '../ScanList';
import { ProfileInfo } from '../../api/ProfileApi';

interface ProfileViewProps {
  profile: ProfileInfo | null;
  onEdit: () => void;
}

const SCROLLBAR_WIDTH = 6;
const THUMB_MIN_HEIGHT = 40;

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const contentHeightRef = useRef(0);
  const containerHeightRef = useRef(0);

  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(THUMB_MIN_HEIGHT);
  const [isThumbVisible, setIsThumbVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSexLabel = (sex: string | null | undefined) => {
    if (sex === '0') return 'Male';
    if (sex === '1') return 'Female';
    return sex;
  };

  const formatBirthDate = (dateString: string | null | undefined) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString.replace('Z', '');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const computeThumb = useCallback(() => {
    const content = contentHeightRef.current;
    const container = containerHeightRef.current;
    if (content <= container || container === 0) return;

    const ratio = container / content;
    const newThumbHeight = Math.max(ratio * container, THUMB_MIN_HEIGHT);
    const trackHeight = container - newThumbHeight;
    const scrollRatio = scrollOffsetRef.current / (content - container);
    const newThumbTop = scrollRatio * trackHeight;

    setThumbHeight(newThumbHeight);
    setThumbTop(Math.max(0, Math.min(newThumbTop, trackHeight)));
  }, []);

  const showThumb = useCallback(() => {
    setIsThumbVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsThumbVisible(false), 1500);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
    contentHeightRef.current = e.nativeEvent.contentSize.height;
    containerHeightRef.current = e.nativeEvent.layoutMeasurement.height;
    computeThumb();
    showThumb();
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    containerHeightRef.current = e.nativeEvent.layout.height;
    computeThumb();
  };

  // PanResponder for the draggable thumb
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setIsThumbVisible(true);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const container = containerHeightRef.current;
        const content = contentHeightRef.current;
        if (content <= container || container === 0) return;

        const thumbH = Math.max((container / content) * container, THUMB_MIN_HEIGHT);
        const trackHeight = container - thumbH;

        // Calculate new thumb position from current offset + delta
        const currentScrollRatio = scrollOffsetRef.current / (content - container);
        const currentThumbTop = currentScrollRatio * trackHeight;
        const newThumbTop = Math.max(0, Math.min(currentThumbTop + gestureState.dy, trackHeight));

        const newScrollRatio = newThumbTop / trackHeight;
        const newOffset = newScrollRatio * (content - container);

        scrollOffsetRef.current = newOffset;
        scrollViewRef.current?.scrollTo({ y: newOffset, animated: false });
        computeThumb();
      },
      onPanResponderRelease: () => {
        hideTimerRef.current = setTimeout(() => setIsThumbVisible(false), 1500);
      },
    })
  ).current;

  return (
    <View style={styles.wrapper} onLayout={handleContainerLayout}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Section Header with Edit button */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="user" size={20} color="#00BBD3" />
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <TouchableOpacity style={styles.editIconButton} onPress={onEdit} activeOpacity={0.7}>
            <LinearGradient
              colors={['#33E4DB', '#00BBD3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editIconGradient}
            >
              <Feather name="edit-3" size={15} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <ProfileField label="Full Name" value={profile?.fullName} iconName="user" />
          <ProfileField label="Email" value={profile?.email} iconName="mail" />
          <ProfileField label="Birth Date" value={formatBirthDate(profile?.birthDate)} iconName="calendar" />
          <ProfileField label="Age" value={profile?.age} iconName="hash" />
          <ProfileField label="Sex" value={getSexLabel(profile?.sex)} iconName="users" />
        </View>

        {/* Scans Section */}
        <View style={styles.scansSection}>
          <LinearGradient
            colors={['#33E4DB', '#00BBD3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scansHeader}
          >
            <Feather name="activity" size={20} color="#FFFFFF" style={styles.headerIcon} />
            <Text style={styles.scansHeaderText}>Your scan history</Text>
          </LinearGradient>

          <ScanList scans={profile?.anemiaScans || []} />
        </View>
      </ScrollView>

      {/* Custom Draggable Scrollbar */}
      {isThumbVisible && (
        <View style={styles.scrollbarTrack} pointerEvents="box-none">
          <View
            style={[styles.scrollbarThumb, { top: thumbTop, height: thumbHeight }]}
            {...panResponder.panHandlers}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingRight: SCROLLBAR_WIDTH + 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#1A3C47',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  editIconButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editIconGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F0F9FB',
  },
  scansSection: {
    marginTop: 10,
  },
  scansHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignSelf: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  scansHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Custom scrollbar styles
  scrollbarTrack: {
    position: 'absolute',
    right: 3,
    top: 0,
    bottom: 0,
    width: SCROLLBAR_WIDTH,
    borderRadius: SCROLLBAR_WIDTH / 2,
    backgroundColor: 'rgba(0, 187, 211, 0.1)',
  },
  scrollbarThumb: {
    position: 'absolute',
    right: 0,
    width: SCROLLBAR_WIDTH,
    borderRadius: SCROLLBAR_WIDTH / 2,
    backgroundColor: '#00BBD3',
    opacity: 0.75,
  },
});

export default ProfileView;
