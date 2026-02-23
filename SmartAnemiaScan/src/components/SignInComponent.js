import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import ForgotPasswordShell from './ForgotPasswordShell';
import ForgotPasswordStepContent from './ForgotPasswordStepContent';
export default function SignInScreen({ onSignUpPress, onLoginSuccess }) {
  const [passwordHidden, setPasswordHidden] = useState(true);
    const [screenMode, setScreenMode] = useState('login');
  const [recoveryStep, setRecoveryStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [codeError, setCodeError] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSendRecovery = () => {
    if (recoveryStep === 'email') {
      const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());

      if (!isEmailValid) {
        setEmailError(true);
        return;
      }

      setEmailError(false);
      setRecoveryStep('code');
      setSecondsLeft(20);
      setCodeError(false);
      return;
    }

    if (recoveryStep === 'code') {
      if (code.length < 5) {
        setCodeError(true);
        return;
      }

      setCodeError(false);
      setRecoveryStep('reset');
      return;
    }

    setScreenMode('login');
    setRecoveryStep('email');
    setEmailError(false);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const recoveryTitle = recoveryStep === 'reset' ? '' : recoveryStep === 'code' ? 'Enter code' : 'Enter email';

  const recoveryDescription =
    recoveryStep === 'email'
      ? 'Enter your email address. We will send verification code there.'
      : recoveryStep === 'code'
        ? `We\'ve sent a verification code to ${email || 'example@mail.com'}`
        : null;

  const actionLabel = recoveryStep === 'email' ? 'Send code' : recoveryStep === 'code' ? 'Verify code' : 'Create New Password';

  const bottomNote = recoveryStep === 'code' ? `Send code again  ${countdownLabel}` : null;

  if (screenMode === 'forgot') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F7F8" />
        <ForgotPasswordShell
          step={recoveryStep}
          title={recoveryTitle}
          description={recoveryDescription}
          bottomNote={bottomNote}
          actionLabel={actionLabel}
          onBack={handleRecoveryBack}
          onAction={handleSendRecovery}
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
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F3F4" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Log In</Text>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.subtitle}>Get ready to start scanning!</Text>

        <Text style={styles.label}>Email or Mobile Number</Text>
        
        <TextInput
          placeholder="example@example.com"
          placeholderTextColor="#00BCD4"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="************"
            placeholderTextColor="#00BCD4"
            style={styles.passwordInput}
            secureTextEntry={passwordHidden}
          />

          <TouchableOpacity onPress={() => setPasswordHidden((v) => !v)}>
            <Text style={styles.eyeIcon}>{passwordHidden ? '◠' : '◡'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={openForgotPassword}>
         <Text style={styles.forgot}>Forget Password</Text>
         </TouchableOpacity>

        <TouchableOpacity style={styles.loginOuter} onPress={onLoginSuccess}>
          <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.loginButton}>
            <Text style={styles.loginText}>Log In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.orText}>or sign up with</Text>

        <TouchableOpacity style={styles.googleCircle}>
          <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.googleCircle}>
          <Text style={styles.googleText}>G</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={onSignUpPress}>
            <Text style={styles.signupLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    height: 90,
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
  headerSpacer: {
    width: 18,
  },
  content: {
    paddingTop: 28,
    paddingHorizontal: 32,
  },
  welcome: {
    color: '#13CAD6',
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 42,
    color: '#5F6368',
    fontSize: 18,
  },
  label: {
    color: '#333333',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 60,
  },
  passwordLabel: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#E9F6FE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#00BCD4',
    fontSize: 20,
    fontWeight: 480,
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
    color: '#13CAD6',
    fontSize: 20,
    fontWeight: 500,
  },
  eyeIcon: {
    fontSize: 24,
    color: '#4A4A4A',
  },
  forgot: {
    marginTop: 10,
    alignSelf: 'flex-end',
    color: '#13CAD6',
    fontSize: 14,
    fontWeight: '600',
  },
  loginOuter: {
    alignItems: 'center',
    marginTop: 40,
  },
  loginButton: {
    width: 220,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 6,
    color: '#33E4DB',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  orText: {
    marginTop: 52,
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
   signupRow: {
    marginTop: 48,
     flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#444',
    fontSize: 16,
  },
  signupLink: {
    color: '#13CAD6',
    fontWeight: '700',
  },
});