import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getProfileInfo, updateProfile, ProfileInfo, Sex } from '../api/ProfileApi';

import ScanList from './ScanList';
import SuccessModal from '../modals/SuccessModal/SuccessModal';
import ErrorModal from '../modals/ErrorModal/ErrorModal';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Edit states
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState('');

  // Modals
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      setLoading(true);
      
      let savedToken: string | null = null;
      
      // Check if SecureStore is available (broken on web sometimes)
      if ((Platform.OS as any) === 'web') {
        savedToken = localStorage.getItem('userToken');
        console.log('Got token from localStorage (Web)');
      } else if (Platform.OS !== 'web' && SecureStore.getItemAsync) {
        savedToken = await SecureStore.getItemAsync('userToken');
        console.log('Got token from SecureStore (Native)');
      }



      const isTokenValid = savedToken && 
                          savedToken !== 'undefined' && 
                          savedToken !== 'null';

      console.log('Token found:', isTokenValid ? 'YES' : 'NO');
      
      if (!isTokenValid) {
         setLoading(false);
         return; 
      }
      
      setToken(savedToken);

      const data = await getProfileInfo(savedToken);
      console.log('Profile data fetched:', data);
      setProfile(data.profile);
      setFullName(data.profile.fullName || '');
      setBirthDate(data.profile.birthDate || '');
      setSex(data.profile.sex ?? null);
      setAge(data.profile.age?.toString() || '');
    } catch (err: any) {
      console.error('Profile load error:', err);
      setErrorMessage(err.message || 'Failed to load profile');
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!token) return;

    try {
      setLoading(true);
      await updateProfile(token, {
        fullName,
        birthDate,
        sex,
        age: age ? parseInt(age, 10) : null,
      });
      
      // Update local state and show success
      if (profile) {
        setProfile({ 
          ...profile, 
          fullName, 
          birthDate, 
          sex, 
          age: age ? parseInt(age, 10) : null 
        });
      }
      setIsEditing(false);
      setSuccessVisible(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };


  if (loading && !profile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BBD3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isEditing ? (
        <View style={styles.profileContent}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#7CA0AC"
          />

          <Text style={styles.label}>Birth Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#7CA0AC"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter age"
            placeholderTextColor="#7CA0AC"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Sex</Text>
          <View style={styles.sexSelection}>
            <TouchableOpacity 
              style={[styles.sexOption, sex === Sex.Male && styles.sexOptionActive]} 
              onPress={() => setSex(Sex.Male)}
            >
              <Text style={[styles.sexOptionText, sex === Sex.Male && styles.sexOptionTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sexOption, sex === Sex.Female && styles.sexOptionActive]} 
              onPress={() => setSex(Sex.Female)}
            >
              <Text style={[styles.sexOptionText, sex === Sex.Female && styles.sexOptionTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButtonWrap} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
             <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileContent}>
          <View style={styles.profileInfoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{profile?.fullName || '-'}</Text>
            </View>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{profile?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.infoLabel}>Birth Date</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{profile?.birthDate || '-'}</Text>
            </View>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{profile?.age || '-'}</Text>
            </View>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.infoLabel}>Sex</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>
                {profile?.sex === Sex.Male ? 'Male' : profile?.sex === Sex.Female ? 'Female' : '-'}
              </Text>
            </View>
          </View>

          <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.scansHeader}>
            <Text style={styles.scansHeaderText}>Your scans</Text>
          </LinearGradient>

          <ScanList scans={profile?.anemiaScans || []} />

          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <SuccessModal
        visible={successVisible}
        message="Profile updated successfully!"
        onClose={() => setSuccessVisible(false)}
      />
      <ErrorModal
        visible={errorVisible}
        errorMessage={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  profileContent: {
    paddingBottom: 20,
  },
  label: {
    color: '#1F1F1F',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D2DEE4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#1A3C47',
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#F8FEFF',
  },
  saveButtonWrap: {
    marginTop: 24,
  },
  saveButton: {
    alignSelf: 'center',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 60,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#7CA0AC',
    fontSize: 15,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    color: '#000000',
    fontSize: 20,
    fontWeight: '500',
  },
  valueBadge: {
    borderWidth: 1,
    borderColor: '#86DDE8',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 16,
    minWidth: 110,
    alignItems: 'center',
  },
  valueText: {
    color: '#1A3C47',
    fontSize: 14,
    fontWeight: '500',
  },
  scansHeader: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  scansHeaderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#00BBD3',
    fontSize: 15,
    fontWeight: '500',
  },
  sexSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sexOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D2DEE4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FEFF',
    marginHorizontal: 5,
  },
  sexOptionActive: {
    borderColor: '#00BBD3',
    backgroundColor: '#E0F7F9',
  },
  sexOptionText: {
    color: '#1A3C47',
    fontSize: 16,
    fontWeight: '500',
  },
  sexOptionTextActive: {
    color: '#00BBD3',
    fontWeight: '700',
  },
});

export default ProfileScreen;
