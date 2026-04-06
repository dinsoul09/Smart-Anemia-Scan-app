import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
  iconName: React.ComponentProps<typeof Feather>['name'];
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, iconName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Feather name={iconName} size={18} color="#00BBD3" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueBadge}>
        <Text style={styles.valueText}>{value || '-'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '500',
  },
  valueBadge: {
    backgroundColor: '#F0F9FB',
    borderWidth: 1,
    borderColor: '#86DDE8',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  valueText: {
    color: '#1A3C47',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileField;
