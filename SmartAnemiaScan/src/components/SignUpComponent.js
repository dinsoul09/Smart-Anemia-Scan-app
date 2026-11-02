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
import { Button, TextField, IconButton, CodeInput, Banner, FieldMessage, useFeedback } from './ui';
import { domainAcceptsMail, suggestEmail } from '../utils/emailCheck';
import { FIELD_TEXT, MIN_PASSWORD, apiMessageKeys, apiTexts, isValidEmail, validateFullName, cleanName } from '../utils/apiErrors';
import { colors, fonts, radii, spacing, type } from '../theme';

const CODE_LENGTH = 5;
const RESEND_SECONDS = 60;
// Store page for the "Update the app" banner; the link is hidden until the app is published
const STORE_URL = null;

// Two-step progress bar under the header: form, then email code
function StepDots({ step }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${step} of 2`}>
      <View style={[styles.dot, styles.dotActive]} />
      <View style={[styles.dot, step === 2 && styles.dotActive]} />
    </View>
  );
}

export default function SignUpScreen({ initialEmail = '', initialPassword = '', onBackToLogin, onSuccess }) {
  const { showToast, handleRequestError } = useFeedback();
  const [step, setStep] = useState('form'); // 'form' or 'verification'
  const [formData, setFormData] = useState({
    fullName: '',
    email: initialEmail,
    birthDate: '',
    password: initialPassword,
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Typing mistakes under each field; request problems the person can fix in a banner:
  // 'emailTaken' | 'policyOutdated' | { title, text }
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState(null);

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
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
    if (banner) setBanner(null);
  };

  // Server texts that belong to a field go under that field
  const applyFieldKeys = (keys) => {
    const next = {};
    if (keys.includes('emailRequired')) next.email = FIELD_TEXT.emailRequired;
    else if (keys.includes('emailInvalid')) next.email = FIELD_TEXT.emailInvalid;
    if (keys.includes('passwordLength')) next.password = FIELD_TEXT.passwordLength;
    if (keys.includes('passwordMismatch')) next.confirmPassword = FIELD_TEXT.passwordMismatch;
    if (keys.includes('policyRequired')) next.consent = FIELD_TEXT.policyRequired;
    setFieldErrors(next);
    return Object.keys(next).length > 0;
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

  const validateForm = () => {
    const errors = {};
    const nameError = validateFullName(formData.fullName);
    if (nameError) errors.fullName = nameError;
    if (!formData.email.trim()) errors.email = FIELD_TEXT.emailRequired;
    else if (!isValidEmail(formData.email)) errors.email = FIELD_TEXT.emailInvalid;
    if (!formData.birthDate) errors.birthDate = 'Enter your date of birth';
    else if (!isValidDate(formData.birthDate)) errors.birthDate = 'Use the format DD / MM / YYYY';
    if (!formData.password) errors.password = 'Enter a password';
    else if (formData.password.length < MIN_PASSWORD) errors.password = FIELD_TEXT.passwordLength;
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = FIELD_TEXT.passwordMismatch;
    }
    if (!consentAccepted) errors.consent = FIELD_TEXT.policyRequired;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    setBanner(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Don't send a code to a domain that can't receive mail (typos like "gmail.coa")
      if (!(await domainAcceptsMail(formData.email))) {
        setFieldErrors({ email: 'This email domain doesn’t exist. Check the address.' });
        return;
      }

      // Pre-validate with the backend; it also sends the code
      await verifyRegistration({
        email: formData.email.trim(),
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
      if (handleRequestError(error, handleNextStep)) return;
      const keys = apiMessageKeys(error);
      if (keys.includes('emailTaken')) setBanner('emailTaken');
      else if (keys.includes('policyOutdated')) setBanner('policyOutdated');
      else if (!applyFieldKeys(keys)) {
        setBanner({ title: 'Check your details', text: apiTexts(error).join('\n') || 'Please try again.' });
      }
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
        fullName: cleanName(formData.fullName),
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
      if (handleRequestError(error, handleFinalSignUp)) return;
      const keys = apiMessageKeys(error);

      if (keys.includes('policyOutdated')) {
        // Fetch the current version so a retry after updating sends the right one
        loadLegal();
        setBanner('policyOutdated');
      } else if (keys.includes('emailTaken')) {
        setStep('form');
        setBanner('emailTaken');
      } else if (applyFieldKeys(keys)) {
        // Something in the form itself was rejected: show it there
        setStep('form');
      } else {
        // Anything else at this step is about the code
        setCodeError('wrong');
        setCode('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendEmailCode(formData.email.trim());
      setResendIn(RESEND_SECONDS);
      setCodeError('');
      setCode('');
      showToast({ title: 'New code sent', text: `Check ${formData.email.trim()}` });
    } catch (error) {
      console.error('Failed to resend code:', error);
      if (handleRequestError(error, handleResend)) return;
      setBanner({ title: 'Couldn’t send a new code', text: apiTexts(error)[0] || 'Please try again in a minute.' });
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

  const emailSuggestion = suggestEmail(formData.email);

  const backToForm = () => {
    setStep('form');
    setCodeError('');
    setBanner(null);
  };

  const renderBanner = () => {
    if (banner === 'emailTaken') {
      return (
        <Banner
          tone="info"
          title="This email already has an account"
          text="Log in instead, or reset the password if you forgot it."
          actionLabel="Log in instead"
          onAction={onBackToLogin}
        />
      );
    }
    if (banner === 'policyOutdated') {
      return (
        <Banner
          tone="warning"
          icon="rotate-ccw"
          title="Update the app to continue"
          text="The privacy policy changed. The new version has it."
          actionLabel={STORE_URL ? 'Open the store' : null}
          onAction={() => Linking.openURL(STORE_URL)}
        />
      );
    }
    return banner ? <Banner {...banner} /> : null;
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

              {renderBanner()}

              <View style={styles.form}>
                <TextField
                  label="Full name"
                  value={formData.fullName}
                  onChangeText={(v) => updateFormData('fullName', v)}
                  error={fieldErrors.fullName}
                  placeholder="Karim Abrakhmanov"
                  autoComplete="name"
                  textContentType="name"
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChangeText={(v) => updateFormData('email', v)}
                  error={fieldErrors.email}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {emailSuggestion ? (
                  <Text style={styles.suggestion}>
                    Did you mean{' '}
                    <Text
                      style={styles.suggestionLink}
                      onPress={() => updateFormData('email', emailSuggestion)}
                      accessibilityRole="link"
                      suppressHighlighting
                    >
                      {emailSuggestion}
                    </Text>
                    ?
                  </Text>
                ) : null}
                <TextField
                  label="Date of birth"
                  value={formData.birthDate}
                  onChangeText={handleBirthDateChange}
                  error={fieldErrors.birthDate}
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
                    error={fieldErrors.password}
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
                    error={fieldErrors.confirmPassword}
                    placeholder="Repeat"
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                </View>

                <Pressable
                  style={styles.consentRow}
                  onPress={() => {
                    setConsentAccepted((v) => !v);
                    if (fieldErrors.consent) setFieldErrors((prev) => ({ ...prev, consent: null }));
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: consentAccepted }}
                >
                  <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked, fieldErrors.consent && styles.checkboxError]}>
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
                {fieldErrors.consent ? <FieldMessage>{fieldErrors.consent}</FieldMessage> : null}
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
                <Text style={styles.changeEmail} onPress={backToForm} accessibilityRole="link" suppressHighlighting>
                  Wrong email? Change it
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
              </View>

              {codeError ? (
                <Banner
                  title="Wrong or expired code"
                  text="Check the latest email, or send a new code."
                  actionLabel={resendIn > 0 ? null : 'Send a new code'}
                  onAction={handleResend}
                />
              ) : (
                renderBanner()
              )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  suggestion: {
    ...type.caption,
    fontSize: 14,
    marginTop: -6,
  },
  suggestionLink: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  changeEmail: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
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
  checkboxError: {
    borderColor: '#C9503E',
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
    marginBottom: 24,
    gap: 12,
  },
  changeEmail: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
