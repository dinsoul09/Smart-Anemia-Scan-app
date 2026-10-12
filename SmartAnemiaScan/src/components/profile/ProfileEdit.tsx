import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ProfileInfo, UpdateProfileDto } from '../../api/ProfileApi';
import { Button, IconButton, NAV_CLEARANCE, TextField } from '../ui';
import { colors, fonts, radii, type } from '../../theme';

interface ProfileEditProps {
  profile: ProfileInfo | null;
  onSave: (data: UpdateProfileDto) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const SEX_OPTIONS = [
  { value: '1', label: 'Female' },
  { value: '0', label: 'Male' },
];

const formatBirthDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString.replace('Z', '');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onCancel, loading }) => {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [birthDate, setBirthDate] = useState(formatBirthDate(profile?.birthDate));
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState<string | null>(profile?.sex ?? null);

  const handleSave = async () => {
    const updatedData: UpdateProfileDto = {
      fullName,
      birthDate,
      age: age ? parseInt(age, 10) : null,
      sex,
    };
    await onSave(updatedData);
  };

  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 6) {
      formatted = formatted.slice(0, 7) + '-' + cleaned.slice(6, 8);
    }
    setBirthDate(formatted);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onCancel} />
          <Text style={styles.headerTitle} accessibilityRole="header">Edit profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={type.bodyMuted}>Sex and age choose the haemoglobin scale for your results.</Text>

        <View style={styles.form}>
          <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Full name" autoComplete="name" />
          <TextField
            label="Birth date"
            value={birthDate}
            onChangeText={handleBirthDateChange}
            placeholder="YYYY-MM-DD"
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextField
            label="Age"
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            placeholder="Age"
            keyboardType="number-pad"
            maxLength={3}
          />

          <View style={styles.sexBlock}>
            <Text style={type.label}>Sex</Text>
            <View style={styles.segmented} accessibilityRole="radiogroup">
              {SEX_OPTIONS.map((option) => {
                const active = sex === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSex(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.segment, active && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" variant="secondary" onPress={onCancel} disabled={loading} style={styles.flex} />
          <Button title="Save" onPress={handleSave} loading={loading} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: NAV_CLEARANCE,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  headerSpacer: {
    width: 44,
  },
  form: {
    gap: 14,
  },
  sexBlock: {
    gap: 8,
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  segmentTextActive: {
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});

export default ProfileEdit;
