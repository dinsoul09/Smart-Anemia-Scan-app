import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { sendEmailCode, verifyRecoveryCode, resetPassword } from '../api/authApi';
import { Button, TextField, IconButton, CodeInput, Banner, FieldMessage, useFeedback } from './ui';
import { FIELD_TEXT, MIN_PASSWORD, apiMessageKeys, apiTexts, isValidEmail } from '../utils/apiErrors';
import { colors, fonts, radii, spacing, type } from '../theme';

const CODE_LENGTH = 5;
const RESEND_SECONDS = 60;
const STEPS = ['email', 'code', 'reset'];

function StepDots({ step }) {
  const index = STEPS.indexOf(step);
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <View key={s} style={[styles.dot, i <= index && styles.dotActive]} />
      ))}
    </View>
  );
}

// Three-step password recovery: email → 5-digit code → new password.
export default function ForgotPasswordScreen({ initialEmail = '', onBack, onDone }) {
  const { showToast, handleRequestError } = useFeedback();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(initialEmail.trim());
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  // Typing mistakes show under the field; failed requests the person can fix get a banner;
  // network/server problems get the app-wide sheet (useFeedback)
  const [emailError, setEmailError] = useState('');
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [triedReset, setTriedReset] = useState(false);
  const [serverPasswordError, setServerPasswordError] = useState('');
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (step !== 'code' || resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  const goTo = (next) => {
    setBanner(null);
    setStep(next);
  };

  const handleBack = () => {
    if (step === 'reset') goTo('code');
    else if (step === 'code') {
      setCode('');
      setCodeInvalid(false);
      goTo('email');
    } else onBack?.();
  };

  // Sends (or re-sends) the code; returns true when it went out
  const requestCode = async (retry) => {
    setLoading(true);
    setBanner(null);
    try {
      await sendEmailCode(email.trim());
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (err) {
      if (handleRequestError(err, retry)) return false;
      const keys = apiMessageKeys(err);
      if (keys.includes('emailRequired') || keys.includes('emailInvalid')) {
        setEmailError(FIELD_TEXT[keys.includes('emailRequired') ? 'emailRequired' : 'emailInvalid']);
        if (step !== 'email') goTo('email');
      } else if (keys.includes('userNotFound')) {
        setEmailError('No account with this email. Check the spelling or sign up.');
      } else {
        setBanner({ title: 'Couldn’t send the code', text: apiTexts(err)[0] || 'Check the email and try again.' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError(FIELD_TEXT.emailRequired);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(FIELD_TEXT.emailInvalid);
      return;
    }
    if (await requestCode(handleSendCode)) {
      setCode('');
      setCodeInvalid(false);
      goTo('code');
    }
  };

  const handleResend = async () => {
    setCode('');
    setCodeInvalid(false);
    if (await requestCode(handleResend)) {
      showToast({ title: 'New code sent', text: `Check ${email.trim()}` });
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setBanner(null);
    try {
      const ok = await verifyRecoveryCode(email.trim(), code);
      if (ok) {
        setCodeInvalid(false);
        goTo('reset');
      } else {
        setCodeInvalid(true);
      }
    } catch (err) {
      if (!handleRequestError(err, handleVerifyCode)) setCodeInvalid(true);
    } finally {
      setLoading(false);
    }
  };

  const passwordLongEnough = newPassword.length >= MIN_PASSWORD;
  const passwordsMatch = newPassword === confirmPassword;
  // Don't flag a mismatch while the user is still typing the repeat
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch
    && (triedReset || confirmPassword.length >= newPassword.length);

  const handleReset = async () => {
    setTriedReset(true);
    setServerPasswordError('');
    if (!passwordLongEnough || !passwordsMatch) return;

    setLoading(true);
    setBanner(null);
    try {
      await resetPassword({ email: email.trim(), code, newPassword, confirmPassword });
      onDone?.(email.trim());
    } catch (err) {
      if (handleRequestError(err, handleReset)) return;
      const keys = apiMessageKeys(err);
      if (keys.includes('wrongCode')) {
        setCodeInvalid(true);
        goTo('code');
      } else if (keys.includes('passwordLength')) {
        setServerPasswordError(FIELD_TEXT.passwordLength);
      } else if (keys.includes('passwordMismatch')) {
        setServerPasswordError(FIELD_TEXT.passwordMismatch);
      } else {
        setBanner({ title: 'Couldn’t update the password', text: apiTexts(err)[0] || 'Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendLabel = `${Math.floor(resendIn / 60)}:${String(resendIn % 60).padStart(2, '0')}`;
  const newPasswordError = (triedReset && !passwordLongEnough) || serverPasswordError === FIELD_TEXT.passwordLength;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <IconButton icon="chevron-left" accessibilityLabel="Back" round onPress={handleBack} style={styles.back} />
            <StepDots step={step} />
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.iconTile}>
            <Feather name={step === 'email' ? 'lock' : step === 'code' ? 'mail' : 'key'} size={28} color={colors.primary} />
            {step === 'code' ? <View style={styles.iconBadge} /> : null}
          </View>

          {step === 'email' ? (
            <>
              <View style={styles.intro}>
                <Text style={type.title} accessibilityRole="header">Forgot your password?</Text>
                <Text style={type.bodyMuted}>
                  Enter the email you signed up with. We'll send you a {CODE_LENGTH}-digit code.
                </Text>
              </View>

              {banner ? <Banner {...banner} /> : null}

              <TextField
                label="Email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError('');
                  if (banner) setBanner(null);
                }}
                error={emailError}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                onSubmitEditing={handleSendCode}
                returnKeyType="send"
              />

              <Button title="Send code" onPress={handleSendCode} loading={loading} style={styles.action} />
            </>
          ) : step === 'code' ? (
            <>
              <View style={styles.intro}>
                <Text style={type.title} accessibilityRole="header">Check your email</Text>
                <Text style={type.bodyMuted}>
                  We sent a {CODE_LENGTH}-digit code to <Text style={styles.emailStrong}>{email.trim()}</Text>
                </Text>
              </View>

              <CodeInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (codeInvalid) setCodeInvalid(false);
                  if (banner) setBanner(null);
                }}
                length={CODE_LENGTH}
                error={codeInvalid}
              />

              {codeInvalid ? (
                <Banner
                  title="Wrong or expired code"
                  text="Check the latest email, or send a new code."
                  actionLabel={resendIn > 0 ? null : 'Send a new code'}
                  onAction={handleResend}
                />
              ) : banner ? (
                <Banner {...banner} />
              ) : null}

              <View style={styles.resendRow}>
                <Text style={type.caption}>No email? Check Spam.</Text>
                {resendIn > 0 ? (
                  <Text style={styles.resendWait}>
                    New code in <Text style={styles.resendTimer}>{resendLabel}</Text>
                  </Text>
                ) : (
                  <Pressable onPress={handleResend} disabled={loading} accessibilityRole="button" hitSlop={10}>
                    <Text style={styles.link}>Send a new code</Text>
                  </Pressable>
                )}
              </View>

              <Button
                title="Verify code"
                onPress={handleVerifyCode}
                loading={loading}
                disabled={code.length < CODE_LENGTH}
                style={styles.action}
              />
            </>
          ) : (
            <>
              <View style={styles.intro}>
                <Text style={type.title} accessibilityRole="header">Create a new password</Text>
                <Text style={type.bodyMuted}>You'll use it to log in from now on.</Text>
              </View>

              {banner ? <Banner {...banner} /> : null}

              <View style={styles.form}>
                <View style={styles.field}>
                  <TextField
                    label="New password"
                    value={newPassword}
                    onChangeText={(v) => {
                      setNewPassword(v);
                      setServerPasswordError('');
                      if (banner) setBanner(null);
                    }}
                    error={newPasswordError}
                    secure
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  {newPassword.length > 0 || triedReset ? (
                    <FieldMessage ok={passwordLongEnough && !newPasswordError}>{FIELD_TEXT.passwordLength}</FieldMessage>
                  ) : (
                    <Text style={type.caption}>{FIELD_TEXT.passwordLength}</Text>
                  )}
                </View>

                <TextField
                  label="Repeat password"
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setServerPasswordError('');
                    if (banner) setBanner(null);
                  }}
                  error={
                    showMismatch || serverPasswordError === FIELD_TEXT.passwordMismatch
                      ? FIELD_TEXT.passwordMismatch
                      : null
                  }
                  secure
                  autoComplete="password-new"
                  textContentType="newPassword"
                  onSubmitEditing={handleReset}
                />
              </View>

              <Button title="Update password" onPress={handleReset} loading={loading} style={styles.action} />
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
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 48,
    height: 48,
    backgroundColor: colors.block,
  },
  headerSpacer: {
    width: 48,
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
    backgroundColor: colors.ink,
  },
  iconTile: {
    width: 72,
    height: 72,
    borderRadius: radii.xxl,
    backgroundColor: colors.block,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  iconBadge: {
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
  intro: {
    gap: 8,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  emailStrong: {
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  resendWait: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  resendTimer: {
    fontFamily: fonts.semibold,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.primary,
  },
  // Pinned to the bottom, but lifted off the edge so it sits under the thumb
  action: {
    marginTop: 'auto',
    marginBottom: 32,
  },
});
