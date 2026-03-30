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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signUpUser } from '../api/authApi';
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

  const handleNextStep = () => {
    // Basic validation (can be improved)
    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      setErrorVisible(true);
      return;
    }
    setStep('verification');
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
        onSuccess();
      }
    } catch (error) {
      console.error("Registration error:", error);
      const detail = error.response?.data?.detail || error.response?.data?.title || 'Registration failed. Please check your details and try again.';
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

            <Text style={styles.orText}>or sign up with</Text>

            <TouchableOpacity style={styles.googleCircle}>
              <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.googleCircle}>
                <Text style={styles.googleText}>G</Text>
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
  orText: {
    marginTop: 28,
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  googleCircle: {
    marginTop: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '200',
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