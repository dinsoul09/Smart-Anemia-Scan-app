import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { signUpUser, sendEmailCode, verifyRegistration, getLegal } from '../api/authApi';
import ErrorModal from '../modals/ErrorModal/ErrorModal';
import { Button, TextField, IconButton, CodeInput } from './ui';
import { colors, fonts, radii, spacing, type } from '../theme';

const CODE_LENGTH = 5;
const RESEND_SECONDS = 60;

// Two-step progress bar under the header: form, then email code
function StepDots({ step }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${step} of 2`}>
      <View style={[styles.dot, styles.dotActive]} />
      <View style={[styles.dot, step === 2 && styles.dotActive]} />
    </View>
  );
}

export default function SignUpScreen({ onBackToLogin, onSuccess }) {
  const [step, setStep] = useState('form'); // 'form' or 'verification'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [legal, setLegal] = useState(null); // { policyVersion, policyUrl } from GET /Legal

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const loadLegal = async () => {
    try {
      setLegal(await getLegal());
    } catch (error) {
      // Without it the backend assumes the current policy version was shown
      console.warn('Failed to load legal info:', error);
    }
  };

  useEffect(() => {
    loadLegal();
  }, []);

  // Countdown before a new code can be requested
  useEffect(() => {
    if (step !== 'verification' || resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  const openPolicy = () => {
    if (legal?.policyUrl) Linking.openURL(legal.policyUrl);
  };

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const showError = (message) => {
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const isValidDate = (str) => {
    const parts = str.split(/[\/\.\s]+/).filter(Boolean);
    return parts.length === 3 && parts[2]?.length === 4;
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

  const handleNextStep = async () => {
    // Basic local validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.birthDate) {
      showError('Please fill in all required fields.');
      return;
    }

    if (!isValidDate(formData.birthDate)) {
      showError('Please enter a valid date of birth (DD / MM / YYYY).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    if (!consentAccepted) {
      showError('Please accept the Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // Pre-validate with the backend; it also sends the code
      await verifyRegistration({
        email: formData.email,
        birthDate: formatDateToISO(formData.birthDate),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setCode('');
      setCodeError('');
      setResendIn(RESEND_SECONDS);
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

      showError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSignUp = async () => {
    if (code.length < CODE_LENGTH) return;

    try {
      setIsLoading(true);
      setCodeError('');
      const signUpParams = {
        ...formData,
        birthDate: formatDateToISO(formData.birthDate),
        emailCode: code,
        consentAccepted,
        policyVersion: legal?.policyVersion ?? null,
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
      console.error('Registration error:', error);
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
        // SASException responses carry the text in `description`
        detail = data?.description || data?.detail || data?.title || data?.message || '';
      }

      // Policy changed while the user was on this screen: fetch the current version for the retry
      if (error.response?.status === 400 && data?.description) {
        loadLegal();
      }

      if (!detail || detail === 'The verification code entered is incorrect or the code is being verified') {
        // A wrong code is shown under the boxes, not in a modal
        setCodeError('Wrong code. Check it and try again.');
        setCode('');
      } else {
        showError(detail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendEmailCode(formData.email);
      setResendIn(RESEND_SECONDS);
      setCodeError('');
    } catch (error) {
      console.error('Failed to resend code:', error);
      showError('Could not send a new code. Please try again.');
    }
  };

  const handleBirthDateChange = (text) => {
    // Simple mask for DD / MM / YYYY
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + ' / ' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 7) + ' / ' + cleaned.slice(4, 8);
    }
    updateFormData('birthDate', formatted);
  };

  const backToForm = () => {
    setStep('form');
    setCodeError('');
  };

  const resendLabel = `${Math.floor(resendIn / 60)}:${String(resendIn % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <IconButton
              icon="chevron-left"
              accessibilityLabel="Back"
              onPress={step === 'verification' ? backToForm : onBackToLogin}
            />
            <StepDots step={step === 'form' ? 1 : 2} />
            <View style={styles.headerSpacer} />
          </View>

          {step === 'form' ? (
            <>
              <View style={styles.intro}>
                <Text style={type.title} accessibilityRole="header">Create account</Text>
                <Text style={type.bodyMuted}>Your scans and history stay linked to it.</Text>
              </View>

              <View style={styles.form}>
                <TextField
                  label="Full name"
                  value={formData.fullName}
                  onChangeText={(v) => updateFormData('fullName', v)}
                  placeholder="Aruzhan Serikovna"
                  autoComplete="name"
                  textContentType="name"
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChangeText={(v) => updateFormData('email', v)}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <TextField
                  label="Date of birth"
                  value={formData.birthDate}
                  onChangeText={handleBirthDateChange}
                  placeholder="DD / MM / YYYY"
                  keyboardType="number-pad"
                  maxLength={14}
                />
                <View style={styles.passwordRow}>
                  <TextField
                    style={styles.flex}
                    label="Password"
                    value={formData.password}
                    onChangeText={(v) => updateFormData('password', v)}
                    placeholder="Password"
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  <TextField
                    style={styles.flex}
                    label="Repeat password"
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateFormData('confirmPassword', v)}
                    placeholder="Repeat"
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                </View>

                <Pressable
                  style={styles.consentRow}
                  onPress={() => setConsentAccepted((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: consentAccepted }}
                >
                  <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}>
                    {consentAccepted ? <Feather name="check" size={14} color={colors.onPrimary} /> : null}
                  </View>
                  <Text style={styles.consentText}>
                    I agree to the{' '}
                    <Text style={styles.consentLink} onPress={legal?.policyUrl ? openPolicy : undefined}>
                      Privacy Policy
                    </Text>
                    {' '}and understand the app gives a screening estimate, not a diagnosis.
                  </Text>
                </Pressable>
              </View>

              <Button title="Continue" iconRight="arrow-right" onPress={handleNextStep} loading={isLoading} />

              <View style={styles.footerRow}>
                <Text style={type.caption}>Already have an account?</Text>
                <Pressable onPress={onBackToLogin} accessibilityRole="button" hitSlop={10}>
                  <Text style={styles.link}>Log in</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.mailIcon}>
                <Feather name="mail" size={34} color={colors.primary} />
                <View style={styles.mailBadge} />
              </View>

              <View style={styles.intro}>
                <Text style={type.title} accessibilityRole="header">Confirm your email</Text>
                <Text style={type.bodyMuted}>
                  Enter the {CODE_LENGTH}-digit code we sent to{' '}
                  <Text style={styles.emailStrong}>{formData.email}</Text>
                </Text>
              </View>

              <View style={styles.codeBlock}>
                <CodeInput
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (codeError) setCodeError('');
                  }}
                  length={CODE_LENGTH}
                  error={!!codeError}
                />
                {codeError ? (
                  <View style={styles.codeErrorRow} accessibilityLiveRegion="polite">
                    <Feather name="alert-circle" size={18} color={colors.danger} />
                    <Text style={styles.codeErrorText}>{codeError}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.resendBlock}>
                {resendIn > 0 ? (
                  <Text style={styles.resendWait}>
                    New code available in <Text style={styles.resendTimer}>{resendLabel}</Text>
                  </Text>
                ) : (
                  <Pressable onPress={handleResend} accessibilityRole="button" style={styles.resendButton}>
                    <Feather name="rotate-ccw" size={18} color={colors.primary} />
                    <Text style={styles.resendText}>Send a new code</Text>
                  </Pressable>
                )}
                <Text style={type.caption}>No email? Check the Spam folder.</Text>
              </View>

              <View style={styles.verifyActions}>
                <Button
                  title="Confirm"
                  onPress={handleFinalSignUp}
                  loading={isLoading}
                  disabled={code.length < CODE_LENGTH}
                />
                <Pressable onPress={backToForm} accessibilityRole="button" style={styles.changeEmail}>
                  <Text style={styles.link}>Wrong email? Change it</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: colors.ground,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.form,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 44,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.disabled,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  intro: {
    gap: 6,
  },
  form: {
    gap: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 6,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9FB3AD',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#3E4A46',
  },
  consentLink: {
    fontFamily: fonts.semibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  footerRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mailIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.xxl,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  mailBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.rose,
    borderWidth: 3,
    borderColor: colors.ground,
  },
  emailStrong: {
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  codeBlock: {
    gap: 12,
  },
  codeErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeErrorText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.danger,
  },
  resendBlock: {
    gap: 6,
  },
  resendWait: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    minHeight: 44,
    textAlignVertical: 'center',
    paddingTop: 12,
  },
  resendTimer: {
    fontFamily: fonts.semibold,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  resendButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.primary,
  },
  verifyActions: {
    marginTop: 'auto',
    gap: 12,
  },
  changeEmail: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
