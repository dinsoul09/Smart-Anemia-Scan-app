import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  AppState,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { getProfileInfo, updateProfile, ProfileInfo, UpdateProfileDto } from '../api/ProfileApi';

import ProfileView from './profile/ProfileView';
import ProfileEdit from './profile/ProfileEdit';
import { getLegal } from '../api/authApi';
import { useFeedback } from './ui';
import { apiTexts } from '../utils/apiErrors';
// @ts-ignore — platform-specific JS module (scanReminder.native.js / scanReminder.web.js)
import { isReminderOn, setReminderOn, remindersSupported, REMINDER_SCHEDULE } from '../utils/scanReminder';
import { colors } from '../theme';

interface ProfileScreenProps {
  onLogout: () => void;
  onOpenHelp: () => void;
}

const ProfileScreen = ({ onLogout, onOpenHelp }: ProfileScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { showToast, handleRequestError } = useFeedback();
  const [policyUrl, setPolicyUrl] = useState<string | null>(null);
  const [reminderOn, setReminderState] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  useEffect(() => {
    isReminderOn()
      .then(setReminderState)
      .catch(() => setReminderState(false));
  }, []);

  const toggleReminder = async () => {
    if (!remindersSupported) {
      showToast({ tone: 'error', title: 'Reminders work in the mobile app', text: 'Open SmartAnemiaScan on your phone to turn them on' });
      return;
    }
    const want = !reminderOn;
    setReminderBusy(true);
    try {
      const applied = await setReminderOn(want);
      setReminderState(applied);
      if (want && !applied) {
        showToast({ tone: 'error', title: 'Notifications are off', text: 'Allow notifications for the app in Settings' });
      } else if (applied) {
        showToast({ title: 'Reminder on', text: `We’ll remind you ${REMINDER_SCHEDULE}` });
      }
    } catch (err) {
      console.error('Reminder error:', err);
      showToast({ tone: 'error', title: 'Couldn’t change the reminder', text: 'Try again in a moment' });
    } finally {
      setReminderBusy(false);
    }
  };

  useEffect(() => {
    getLegal()
      .then((legal) => setPolicyUrl(legal.policyUrl))
      .catch(() => setPolicyUrl(null));
  }, []);

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
      if (!handleRequestError(err, loadProfile)) {
        showToast({ tone: 'error', title: 'Couldn’t load your profile', text: 'Reopen the tab to try again' });
      }
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
      showToast({ title: 'Profile saved', text: 'Your changes are up to date' });
    } catch (err: any) {
      if (!handleRequestError(err, () => handleSave(data))) {
        showToast({ tone: 'error', title: 'Couldn’t save your profile', text: apiTexts(err)[0] || 'Check the fields and try again' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
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
          onLogout={onLogout}
          onOpenHelp={onOpenHelp}
          onOpenPrivacy={policyUrl ? () => Linking.openURL(policyUrl) : undefined}
          onOpenLanguage={() => showToast({ title: 'More languages are coming', text: 'For now the app is in English' })}
          reminderOn={reminderOn}
          reminderBusy={reminderBusy}
          reminderSchedule={REMINDER_SCHEDULE}
          onToggleReminder={toggleReminder}
        />
      )}
    </SafeAreaView>
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
