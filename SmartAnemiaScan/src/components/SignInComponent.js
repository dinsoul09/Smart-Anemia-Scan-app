import React, { useEffect, useMemo, useState } from 'react';

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

import ForgotPasswordShell from './ForgotPasswordShell';
import ForgotPasswordStepContent from './ForgotPasswordStepContent';
import ErrorModal from '../modals/ErrorModal/ErrorModal';
import SuccessModal from '../modals/SuccessModal/SuccessModal';
import * as SecureStore from 'expo-secure-store';
import { loginUser, sendEmailCode, verifyRecoveryCode, resetPassword } from '../api/authApi';
import { Button, TextField, BrandMark, EyeIllustration } from './ui';
import { colors, fonts, radii, spacing, type } from '../theme';


export default function SignInScreen({ onSignUpPress, onLoginSuccess }) {

  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [emailError, setEmailError] = useState(false);
    const [codeError, setCodeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenMode, setScreenMode] = useState('login');
  const [recoveryStep, setRecoveryStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(20);

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  // Only a real login should open the main menu when the success modal closes,
  // not a finished password reset.
  const [successOpensApp, setSuccessOpensApp] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorModalMessage('Please fill in all fields to log in.');
      setIsErrorModalVisible(true);
      return;
    }
    
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      console.log('Successful login!', userData);

      const token = userData?.tokenRecord?.accessToken;
      const refreshToken = userData?.tokenRecord?.refreshToken;

      if (token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', token);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        } else if (SecureStore.setItemAsync) {
          await SecureStore.setItemAsync('userToken', token);
          if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
      }

      setSuccessOpensApp(true);
      setSuccessModalMessage('You have successfully logged in!');
      setIsSuccessModalVisible(true);
    } catch (err) {
      setErrorModalMessage(err.description);
      setIsErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (screenMode !== 'forgot' || recoveryStep !== 'code' || secondsLeft <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screenMode, recoveryStep, secondsLeft]);

  const countdownLabel = useMemo(() => {
    const formattedSeconds = String(Math.max(secondsLeft, 0)).padStart(2, '0');
    return `00:${formattedSeconds}`;
  }, [secondsLeft]);

  const openForgotPassword = () => {
    setScreenMode('forgot');
    setRecoveryStep('email');
    setEmailError(false);
    setCode('');
    setCodeError(false);
    setSecondsLeft(20);
  };

  const handleRecoveryBack = () => {
    if (recoveryStep === 'reset') {
      setRecoveryStep('code');
      return;
    }

    if (recoveryStep === 'code') {
      setRecoveryStep('email');
      setCode('');
      setEmailError(false);
      setCodeError(false);
      setSecondsLeft(20);
      return;
    }

    setScreenMode('login');
  };

  const handleSendRecovery = async () => {
    if (recoveryStep === 'email') {
      const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());

      if (!isEmailValid) {
        setEmailError(true);
        return;
      }

      setLoading(true);
      try {
        await sendEmailCode(email);
        setEmailError(false);
        setRecoveryStep('code');
        setSecondsLeft(60); // Standard 1 min reset
        setCodeError(false);
      } catch (err) {
        setErrorModalMessage('Failed to send confirmation code. Please try again.');
        setIsErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (recoveryStep === 'code') {
      if (code.length < 5) {
        setCodeError(true);
        return;
      }

      setLoading(true);
      try {
        const isValid = await verifyRecoveryCode(email, code);
        if (isValid) {
          setCodeError(false);
          setRecoveryStep('reset');
        } else {
          setCodeError(true);
        }
      } catch (err) {
        setCodeError(true);
        setErrorModalMessage('Invalid or expired code. Please try again.');
        setIsErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (recoveryStep === 'reset') {
      setLoading(true);
      try {
        await resetPassword({
          email: email,
          code: code,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        });

        setSuccessOpensApp(false);
        setSuccessModalMessage('Your password has been successfully reset! You can log in now.');
        setIsSuccessModalVisible(true);
        
        // After success, we go back to login
        setScreenMode('login');
        setRecoveryStep('email');
        setNewPassword('');
        setConfirmPassword('');
        setCode('');
      } catch (err) {
        const detail = err.response?.data?.errors["ConfirmPassword"][0] || 'Failed to update password. Please try again.';
        setErrorModalMessage(detail);
        setIsErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const recoveryTitle = recoveryStep === 'reset' ? '' : recoveryStep === 'code' ? 'Enter Code' : 'Enter Email';

  const recoveryDescription =
    recoveryStep === 'email'
      ? 'Enter your email address. We will send a confirmation code there.'
      : recoveryStep === 'code'
        ? `We sent a confirmation code to ${email || 'example@mail.com'}`
        : null;

  const actionLabel = loading ? 'Processing...' : 
    (recoveryStep === 'email' 
      ? 'Send Code' 
      : recoveryStep === 'code' 
        ? 'Verify Code'
        : 'Update Password');

  const bottomNote = recoveryStep === 'code' 
    ? `Send code again  ${countdownLabel}` : null;

  if (screenMode === 'forgot') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
        <ForgotPasswordShell
          step={recoveryStep}
          title={recoveryTitle}
          description={recoveryDescription}
          bottomNote={bottomNote}
          actionLabel={actionLabel}
          loading={loading}
          onBack={handleRecoveryBack}
          onAction={loading ? null : handleSendRecovery}
        >
          <ForgotPasswordStepContent
            step={recoveryStep}
            email={email}
            onEmailChange={(value) => {
              setEmail(value);
              if (emailError) {
                setEmailError(false);
              }
            }}
            emailError={emailError}
            code={code}
            onCodeChange={setCode}
            codeError={codeError}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />
        </ForgotPasswordShell>
        <ErrorModal
          visible={isErrorModalVisible}
          errorMessage={errorModalMessage}
          onClose={() => setIsErrorModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.rings} pointerEvents="none">
              <View style={[styles.ring, { width: 156, height: 156, borderRadius: 78, top: 72, left: '50%', marginLeft: -78 }]} />
              <View style={[styles.ring, { width: 248, height: 248, borderRadius: 124, top: 26, left: '50%', marginLeft: -124, opacity: 0.8 }]} />
              <View style={[styles.ring, { width: 344, height: 344, borderRadius: 172, top: -22, left: '50%', marginLeft: -172, opacity: 0.6 }]} />
            </View>

            <View style={styles.brandRow}>
              <BrandMark size={30} inverted />
              <Text style={styles.brandName}>SmartAnemiaScan</Text>
            </View>

            <View style={styles.eye}>
              <EyeIllustration />
              <View style={styles.lidTag}>
                <View style={styles.lidDot} />
                <Text style={styles.lidTagText}>Lower eyelid</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Anemia screening{'\n'}from one eyelid photo</Text>
          </View>

          <View style={styles.intro}>
            <Text style={type.title} accessibilityRole="header">Welcome back</Text>
            <Text style={type.bodyMuted}>Log in to keep tracking your eyelid scans.</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Email or phone"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secure
              autoComplete="password"
              textContentType="password"
              labelAccessory={
                <Pressable onPress={openForgotPassword} accessibilityRole="button" hitSlop={10}>
                  <Text style={styles.link}>Forgot?</Text>
                </Pressable>
              }
            />
          </View>

          <Button title={loading ? 'Logging in…' : 'Log in'} onPress={handleLogin} loading={loading} />

          <View style={styles.signupRow}>
            <Text style={type.caption}>New here?</Text>
            <Pressable onPress={onSignUpPress} accessibilityRole="button" hitSlop={10}>
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorModal
        visible={isErrorModalVisible}
        errorMessage={errorModalMessage}
        onClose={() => setIsErrorModalVisible(false)}
      />
      <SuccessModal
        visible={isSuccessModalVisible}
        message={successModalMessage}
        onClose={() => {
          setIsSuccessModalVisible(false);
          if (successOpensApp && onLoginSuccess) onLoginSuccess();
        }}
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
    gap: 20,
  },
  hero: {
    height: 330,
    borderRadius: radii.hero,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },
  rings: {
    ...StyleSheet.absoluteFillObject,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eye: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  lidTag: {
    position: 'absolute',
    top: 162,
    left: '50%',
    marginLeft: 47,
    height: 28,
    paddingHorizontal: 11,
    borderRadius: radii.pill,
    backgroundColor: colors.roseTint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lidDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D8604A',
  },
  lidTagText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.roseInkDark,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  intro: {
    gap: 6,
  },
  form: {
    gap: 14,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  signupRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
});
