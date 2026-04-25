import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ProfileInfo, Sex, UpdateProfileDto } from '../../api/ProfileApi';

interface ProfileEditProps {
  profile: ProfileInfo | null;
  onSave: (data: UpdateProfileDto) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onCancel, loading }) => {
  const formatBirthDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString.replace('Z', '');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [birthDate, setBirthDate] = useState(formatBirthDate(profile?.birthDate));
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState<string | null>(profile?.sex ?? null);

  const handleSave = async () => {
    const updatedData: UpdateProfileDto = {
      fullName,
      birthDate,
      age: age ? parseInt(age, 10) : null,
      sex: sex,
    };
    await onSave(updatedData);
  };

  const handleBirthDateChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 6) {
      formatted = formatted.slice(0, 7) + '-' + cleaned.slice(6, 8);
    }
    setBirthDate(formatted);
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: React.ComponentProps<typeof Feather>['name'],
    keyboardType: 'default' | 'numeric' = 'default',
    maxLength?: number
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <Feather name={icon} size={16} color="#00BBD3" style={styles.inputIcon} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0CED9"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Update Personal Data</Text>
          <Text style={styles.headerSubtitle}>Keep your profile information accurate</Text>
        </View>

        <View style={styles.card}>
          {renderInput('Full Name', fullName, setFullName, 'Enter full name', 'user')}
          {renderInput('Birth Date', birthDate, handleBirthDateChange, 'YYYY-MM-DD', 'calendar', 'numeric', 10)}
          {renderInput('Age', age, (text) => setAge(text.replace(/[^0-9]/g, '')), 'Enter age', 'hash', 'numeric')}

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Feather name="users" size={16} color="#00BBD3" style={styles.inputIcon} />
              <Text style={styles.inputLabel}>Sex</Text>
            </View>
            <View style={styles.sexSelector}>
              <TouchableOpacity
                style={[styles.sexOption, sex === '0' && styles.sexOptionActive]}
                onPress={() => setSex('0')}
                activeOpacity={0.7}
              >
                <Feather
                  name="shield"
                  size={14}
                  color={sex === '0' ? '#FFFFFF' : '#00BBD3'}
                  style={styles.sexIcon}
                />
                <Text style={[styles.sexText, sex === '0' && styles.sexTextActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexOption, sex === '1' && styles.sexOptionActive]}
                onPress={() => setSex('1')}
                activeOpacity={0.7}
              >
                <Feather
                  name="heart"
                  size={14}
                  color={sex === '1' ? '#FFFFFF' : '#00BBD3'}
                  style={styles.sexIcon}
                />
                <Text style={[styles.sexText, sex === '1' && styles.sexTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <LinearGradient
              colors={['#33E4DB', '#00BBD3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C47',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7CA0AC',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F9FB',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A3C47',
  },
  textInput: {
    backgroundColor: '#F8FEFF',
    borderWidth: 1,
    borderColor: '#D2DEE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A3C47',
    fontWeight: '500',
  },
  sexSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sexOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FEFF',
    borderWidth: 1,
    borderColor: '#D2DEE4',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  sexOptionActive: {
    backgroundColor: '#00BBD3',
    borderColor: '#00BBD3',
  },
  sexIcon: {
    marginRight: 8,
  },
  sexText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BBD3',
  },
  sexTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7CA0AC',
  },
  saveButton: {
    flex: 2,
  },
  saveButtonGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileEdit;
