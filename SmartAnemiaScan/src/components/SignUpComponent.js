import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { signUpUser, sendEmailCode, verifyRegistration } from '../api/authApi';
import EmailVerificationStep from './EmailVerificationStep';
import ErrorModal from '../modals/ErrorModal/ErrorModal';

export default function SignUpScreen({ onBackToLogin, onSuccess }) {
  const [step, setStep] = useState('form'); // 'form' or 'verification'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isValidDate = (str) => {
    const parts = str.split(/[\/\.\s]+/).filter(Boolean);
    return parts.length === 3 && parts[2]?.length === 4;
  };

  const handleNextStep = async () => {
    // Basic local validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.birthDate) {
      setErrorMessage('Please fill in all required fields.');
      setErrorVisible(true);
      return;
    }

    if (!isValidDate(formData.birthDate)) {
      setErrorMessage('Please enter a valid date of birth (DD / MM / YYYY).');
      setErrorVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      // STEP 1 & 2: Pre-validate with backend and send the code
      await verifyRegistration({
        email: formData.email,
        birthDate: formatDateToISO(formData.birthDate),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setStep('verification');

    } catch (error) {
      console.error('Registration validation error:', error);
      const response = error?.response;
      const status = response?.status;
      const data = response?.data;

      let detail = '';

      // 400 — model validation errors (field-level or title)
      if (status === 400) {
        if (data?.errors && typeof data.errors === 'object') {
          detail = Object.values(data.errors).flat().join('\n');
        }
        if (!detail) {
          detail = data?.detail || data?.title || 'Invalid registration data.';
        }
      }
      // 409 — email already registered
      else if (status === 409) {
        detail = 'This email is already registered. Please log in.';
      }
      // Other errors (network, 500, etc.)
      else {
        detail = data?.detail || data?.title || data?.message
          || 'Failed to validate registration. Please try again.';
      }

      // Error messages from the backend are already in English

      setErrorMessage(detail);
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateToISO = (dateStr) => {
    if (!dateStr) return null;
    // Expected format "DD / MM / YYYY" or similar
    const parts = dateStr.split(/[\/\.\s]+/).filter(Boolean);
    if (parts.length !== 3) return dateStr;
    
    const [day, month, year] = parts;
    const d = day.padStart(2, '0');
    const m = month.padStart(2, '0');
    const y = year.length === 2 ? `20${year}` : year;
    
    return `${y}-${m}-${d}`;
  };

  const handleFinalSignUp = async (code) => {
    try {
      setIsLoading(true);
      const signUpParams = {
        ...formData,
        birthDate: formatDateToISO(formData.birthDate),
        emailCode: code,
      };
      
      const result = await signUpUser(signUpParams);
      
      if (result) {
        const token = result?.tokenRecord?.accessToken;
        const refreshToken = result?.tokenRecord?.refreshToken;
        
        if (token) {
          if (Platform.OS === 'web') {
            localStorage.setItem('userToken', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          } else if (SecureStore.setItemAsync) {
            await SecureStore.setItemAsync('userToken', token);
            if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
          }
        }
        
        onSuccess();
      }
    } catch (error) {
      console.error("Registration error:", error);
      const data = error.response?.data;

      // Try to extract specific field validation errors
      let detail = '';
      if (data?.errors && typeof data.errors === 'object') {
        const allErrors = Object.values(data.errors).flat();
        if (allErrors.length > 0) {
          detail = allErrors.join('\n');
        }
      }

      if (!detail) {
        detail = data?.detail || data?.title || data?.message || '';
      }

      // Format English error messages
      if (!detail || detail === 'The verification code entered is incorrect or the code is being verified') {
        detail = 'Incorrect confirmation code or the code has expired';
      }

      setErrorMessage(detail);
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBirthDateChange = (text) => {
    // Simple mask for DD / MM / YYYY
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + ' / ' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 7) + ' / ' + cleaned.slice(4, 8);
    }
    updateFormData('birthDate', formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#26C7DA" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <TouchableOpacity onPress={step === 'verification' ? () => setStep('form') : onBackToLogin}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {step === 'form' ? 'New Account' : 'Verification'}
        </Text>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'form' ? (
          <>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              placeholder=" "
              placeholderTextColor="#00BCD4"
              style={styles.input}
              value={formData.fullName}
              onChangeText={(v) => updateFormData('fullName', v)}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="************"
                placeholderTextColor="#00BCD4"
                style={styles.passwordInput}
                secureTextEntry={passwordHidden}
                value={formData.password}
                onChangeText={(v) => {
                   updateFormData('password', v);
                   updateFormData('confirmPassword', v); // Sync with confirmPassword for simple registration
                }}
              />
              <TouchableOpacity onPress={() => setPasswordHidden((v) => !v)}>
                <Text style={styles.eyeIcon}>{passwordHidden ? '◠' : '◡'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="example@example.com"
              placeholderTextColor="#00BCD4"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(v) => updateFormData('email', v)}
            />

            <Text style={styles.label}>Date Of Birth</Text>
            <TextInput
              placeholder="DD / MM / YYYY"
              placeholderTextColor="#00BCD4"
              style={styles.input}
              value={formData.birthDate}
              onChangeText={handleBirthDateChange}
              maxLength={14}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.signupOuter} onPress={handleNextStep}>
              <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.signupButton}>
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>



            <View style={styles.loginRow}>
              <Text style={styles.loginText}>already have an account?</Text>
              <TouchableOpacity onPress={onBackToLogin}>
                <Text style={styles.loginLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ marginTop: 20 }}>
            {isLoading ? (
               <View style={{ height: 200, justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="#00BCD4" />
                  <Text style={{ textAlign: 'center', marginTop: 10, color: '#00BCD4' }}>Creating account...</Text>
               </View>
            ) : (
              <EmailVerificationStep
                email={formData.email}
                onCodeComplete={handleFinalSignUp}
                onBack={() => setStep('form')}
              />
            )}
          </View>
        )}
      </ScrollView>

      <ErrorModal
        visible={errorVisible}
        errorMessage={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({ 
container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
},
  header: {
    height:90,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 34,
    marginTop: -2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 30,
  },
  label: {
    color: '#333333',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#E9F6FE',
    borderRadius:14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#00BCD4',
    fontSize: 20,
  },
  passwordWrapper: {
    backgroundColor: '#E9F6FE',
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#00BCD4',
    fontSize: 20,
  },
  eyeIcon: {
    fontSize: 24,
    color: '#23C7D6',
    marginLeft: 8,
  },
  signupOuter: {
    alignItems: 'center',
    marginTop: 60,
  },
  signupButton: {
    width: 220,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },

  loginRow: {
    marginTop: 42,
     flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#444',
    fontSize: 16,
  },
  loginLink: {
    color: '#00BCD4',
    fontWeight: '700',
    fontSize: 16,
  },
});