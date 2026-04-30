import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  AppState,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getProfileInfo, updateProfile, ProfileInfo, UpdateProfileDto } from '../api/ProfileApi';

import ProfileView from './profile/ProfileView';
import ProfileEdit from './profile/ProfileEdit';
import SuccessModal from '../modals/SuccessModal/SuccessModal';
import ErrorModal from '../modals/ErrorModal/ErrorModal';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Modals
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProfile();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadProfile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      setLoading(true);
      
      let savedToken: string | null = null;
      
      if ((Platform.OS as any) === 'web') {
        savedToken = localStorage.getItem('userToken');
      } else if (Platform.OS !== 'web' && SecureStore.getItemAsync) {
        savedToken = await SecureStore.getItemAsync('userToken');
      }

      const isTokenValid = savedToken && 
                          savedToken !== 'undefined' && 
                          savedToken !== 'null';

      if (!isTokenValid) {
         setLoading(false);
         return; 
      }
      
      setToken(savedToken);

      const data = await getProfileInfo(savedToken!);
      setProfile(data.profile);
    } catch (err: any) {
      console.error('Profile load error:', err);
      setErrorMessage(err.message || 'Failed to load profile');
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: UpdateProfileDto) => {
    if (!token) return;

    try {
      setLoading(true);
      await updateProfile(token, data);
      
      // Update local state and show success
      if (profile) {
        setProfile({ 
          ...profile, 
          ...data,
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
    <View style={styles.container}>
      {isEditing ? (
        <ProfileEdit 
          profile={profile} 
          onSave={handleSave} 
          onCancel={() => setIsEditing(false)} 
          loading={loading}
        />
      ) : (
        <ProfileView 
          profile={profile} 
          onEdit={() => setIsEditing(true)} 
        />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
});

export default ProfileScreen;
