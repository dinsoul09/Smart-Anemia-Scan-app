import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ProfileField from './ProfileField';
import ScanList from '../ScanList';
import { ProfileInfo, Sex } from '../../api/ProfileApi';

interface ProfileViewProps {
  profile: ProfileInfo | null;
  onEdit: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit }) => {
  const getSexLabel = (sex: Sex | null | undefined) => {
    if (sex === Sex.Male) return 'Male';
    if (sex === Sex.Female) return 'Female';
    return '-';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Profile Section */}
      <View style={styles.sectionHeader}>
        <Feather name="user" size={20} color="#00BBD3" />
        <Text style={styles.sectionTitle}>Personal Details</Text>
      </View>

      <View style={styles.detailsCard}>
        <ProfileField label="Full Name" value={profile?.fullName} iconName="user" />
        <ProfileField label="Email" value={profile?.email} iconName="mail" />
        <ProfileField label="Birth Date" value={profile?.birthDate} iconName="calendar" />
        <ProfileField label="Age" value={profile?.age} iconName="hash" />
        <ProfileField label="Sex" value={getSexLabel(profile?.sex)} iconName="users" />
      </View>

      {/* Scans Header */}
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

      {/* Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.8}>
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.editButtonGradient}
        >
          <Feather name="edit-3" size={18} color="#FFFFFF" style={styles.editIcon} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#1A3C47',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
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
  editButton: {
    marginTop: 24,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
  },
  editIcon: {
    marginRight: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ProfileView;
