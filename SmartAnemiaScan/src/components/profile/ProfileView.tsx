import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ProfileInfo } from '../../api/ProfileApi';
import { IconButton, NAV_CLEARANCE } from '../ui';
import { colors, fonts, radii, type } from '../../theme';

interface ProfileViewProps {
  profile: ProfileInfo | null;
  onEdit: () => void;
  onLogout: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy?: () => void;
}

const getSexLabel = (sex: string | null | undefined) => {
  if (sex === '0') return 'Male';
  if (sex === '1') return 'Female';
  return sex || null;
};

const formatBirthDate = (dateString: string | null | undefined, age: number | null | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  // Sign-up stores only the birth date, so derive the age when the profile has none
  const now = new Date();
  const years = age ?? now.getFullYear() - date.getFullYear() - (now < new Date(now.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0);
  return `${formatted} · ${years} y`;
};

const initials = (name: string | null | undefined, email: string | null | undefined) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || email?.[0] || '?').toUpperCase();
};

// "Aruzhan Serikovna" → "Aruzhan S."
const shortName = (name: string | null | undefined) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Your profile';
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
};

function DetailRow({ label, value, last }: { label: string; value: string | null; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.rowDivider]}>
      <Text style={type.bodyMuted}>{label}</Text>
      <Text style={[styles.detailValue, !value && styles.detailMissing]}>{value || 'Not set'}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.settingsRow, !last && styles.rowDivider, pressed && styles.pressed]}
    >
      <Feather name={icon} size={20} color={colors.primary} />
      <Text style={styles.settingsLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color={colors.subtle} />
    </Pressable>
  );
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit, onLogout, onOpenHelp, onOpenPrivacy }) => {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={[type.title, styles.title]} accessibilityRole="header">Profile</Text>

      <View style={styles.card}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile?.fullName, profile?.email)}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={type.subheading} numberOfLines={1}>{shortName(profile?.fullName)}</Text>
            <Text style={type.caption} numberOfLines={1}>{profile?.email}</Text>
          </View>
          <IconButton icon="edit-2" accessibilityLabel="Edit profile" onPress={onEdit} style={styles.editButton} size={20} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[type.section, styles.sectionTitle]}>Personal details</Text>
        <View style={styles.card}>
          <DetailRow label="Full name" value={profile?.fullName ?? null} />
          <DetailRow label="Birth date" value={formatBirthDate(profile?.birthDate, profile?.age)} />
          <DetailRow label="Sex" value={getSexLabel(profile?.sex)} last />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[type.section, styles.sectionTitle]}>Settings</Text>
        <View style={styles.card}>
          {onOpenPrivacy ? <SettingsRow icon="shield" label="Privacy & my data" onPress={onOpenPrivacy} /> : null}
          <SettingsRow icon="help-circle" label="Help & contacts" onPress={onOpenHelp} last />
        </View>
      </View>

      <Pressable onPress={onLogout} accessibilityRole="button" style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Feather name="log-out" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: NAV_CLEARANCE,
    gap: 16,
  },
  title: {
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.roseInk,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  editButton: {
    backgroundColor: colors.ground,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    paddingHorizontal: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailValue: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'right',
  },
  detailMissing: {
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
  },
  settingsLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.7,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.danger,
  },
});

export default ProfileView;
