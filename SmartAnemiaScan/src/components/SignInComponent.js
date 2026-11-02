import React, { useState } from 'react';

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
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import ForgotPasswordScreen from './ForgotPasswordScreen';
import * as SecureStore from 'expo-secure-store';
import { loginUser } from '../api/authApi';
import { getProfileInfo } from '../api/ProfileApi';
import { Button, TextField, Banner, useFeedback } from './ui';
import { FIELD_TEXT, apiMessageKeys } from '../utils/apiErrors';
import { colors, fonts, radii, spacing, type } from '../theme';

// Multicolour Google "G" — no icon font has it
function GoogleLogo({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </Svg>
  );
}

function SocialButton({ label, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.social, pressed && styles.socialPressed]}
    >
      {icon}
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

export default function SignInScreen({ onSignUpPress, onLoginSuccess }) {
  const { showToast, handleRequestError } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [screenMode, setScreenMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Typing mistakes go under the field; a wrong email/password pair goes in a banner above the form
  const [fieldErrors, setFieldErrors] = useState({});
  const [wrongCredentials, setWrongCredentials] = useState(false);
  // Shown in the same place after a finished password reset
  const [loginNotice, setLoginNotice] = useState('');

  const handleLogin = async () => {
    setLoginNotice('');
    const missing = {
      email: email.trim() ? null : FIELD_TEXT.emailRequired,
      password: password ? null : FIELD_TEXT.passwordRequired,
    };
    if (missing.email || missing.password) {
      setFieldErrors(missing);
      setWrongCredentials(false);
      return;
    }

    setFieldErrors({});
    setWrongCredentials(false);
    setLoading(true);
    try {
      const userData = await loginUser(email.trim(), password);
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

      onLoginSuccess?.();
      greet(token);
    } catch (err) {
      if (handleRequestError(err, handleLogin)) return;
      const keys = apiMessageKeys(err);
      if (keys.includes('emailRequired') || keys.includes('emailInvalid')) {
        setFieldErrors({ email: FIELD_TEXT[keys.includes('emailRequired') ? 'emailRequired' : 'emailInvalid'] });
      } else {
        // The backend answers a wrong pair with a 500 and a description, so any other answer means the same
        setWrongCredentials(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // "Welcome back, Karim" toast once the name is known; the app is already open by then
  const greet = async (token) => {
    let firstName = '';
    try {
      const data = token ? await getProfileInfo(token) : null;
      firstName = (data?.profile?.fullName || '').trim().split(/\s+/)[0];
    } catch {
      // The toast still shows, just without the name
    }
    showToast({ title: firstName ? `Welcome back, ${firstName}` : 'Welcome back', text: 'You’re logged in' });
  };

  // The backend has no Google/Apple sign-in yet
  const socialSoon = (provider) =>
    showToast({ tone: 'error', title: `${provider} sign-in is coming soon`, text: 'For now, use your email and password' });

  const openForgotPassword = () => {
    setWrongCredentials(false);
    setFieldErrors({});
    setScreenMode('forgot');
  };

  const editEmail = (value) => {
    setEmail(value);
    if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: null }));
    if (wrongCredentials) setWrongCredentials(false);
  };

  const editPassword = (value) => {
    setPassword(value);
    if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: null }));
    if (wrongCredentials) setWrongCredentials(false);
  };

  if (screenMode === 'forgot') {
    return (
      <ForgotPasswordScreen
        initialEmail={email}
        onBack={() => setScreenMode('login')}
        onDone={(recoveredEmail) => {
          setEmail(recoveredEmail);
          setPassword('');
          setLoginNotice('Password updated. Log in with your new password.');
          setScreenMode('login');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account-circle-outline" size={44} color={colors.primary} />
            </View>
            <Text style={styles.title} accessibilityRole="header">Log in or sign up</Text>
          </View>

          {wrongCredentials ? (
            <Banner title="Wrong email or password" text="Check both and try again, or reset your password." />
          ) : loginNotice ? (
            <View style={styles.notice} accessibilityLiveRegion="polite">
              <Feather name="check-circle" size={20} color={colors.risk.low.fg} />
              <Text style={styles.noticeText}>{loginNotice}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              value={email}
              onChangeText={editEmail}
              error={fieldErrors.email || wrongCredentials}
              placeholder="Email"
              accessibilityLabel="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
              clearable
            />
            <TextField
              value={password}
              onChangeText={editPassword}
              error={fieldErrors.password || wrongCredentials}
              placeholder="Password"
              accessibilityLabel="Password"
              secure
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={handleLogin}
            />
          </View>

          <Button title="Continue" onPress={handleLogin} loading={loading} />

          <Text style={styles.forgot}>
            Forgot your password?{' '}
            <Text style={styles.link} onPress={openForgotPassword} accessibilityRole="link" suppressHighlighting>
              Reset it here
            </Text>
          </Text>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socials}>
            <SocialButton label="Continue with Google" icon={<GoogleLogo />} onPress={() => socialSoon('Google')} />
            <SocialButton
              label="Continue with Apple"
              icon={<FontAwesome name="apple" size={22} color={colors.ink} />}
              onPress={() => socialSoon('Apple')}
            />
          </View>

          <Text style={styles.footer}>
            New here? Enter your email and a password — we’ll{' '}
            <Text
              style={styles.link}
              onPress={() => onSignUpPress?.({ email: email.trim(), password })}
              accessibilityRole="link"
              suppressHighlighting
            >
              create your account
            </Text>{' '}
            next.
          </Text>
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
    paddingTop: 40,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 22,
    marginBottom: 8,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: '#C9D8D3',
    backgroundColor: colors.block,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.ink,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.risk.low.bg,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.risk.low.fg,
  },
  form: {
    gap: 12,
  },
  link: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  forgot: {
    ...type.caption,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 4,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  orText: {
    ...type.caption,
    fontSize: 14,
  },
  socials: {
    gap: 12,
  },
  social: {
    height: 52,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialPressed: {
    backgroundColor: '#EEF3F1',
  },
  socialText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  footer: {
    ...type.caption,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
});
