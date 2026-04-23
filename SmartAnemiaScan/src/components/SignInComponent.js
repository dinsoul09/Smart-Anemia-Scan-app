import React, { useEffect, useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';


import { LinearGradient } from 'expo-linear-gradient';
import ForgotPasswordShell from './ForgotPasswordShell';
import ForgotPasswordStepContent from './ForgotPasswordStepContent';
import ErrorModal from '../modals/ErrorModal/ErrorModal';
import SuccessModal from '../modals/SuccessModal/SuccessModal';
import * as SecureStore from 'expo-secure-store';
import { loginUser, sendEmailCode, verifyRecoveryCode, resetPassword } from '../api/authApi';


export default function SignInScreen({ onSignUpPress, onLoginSuccess }) {

  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
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

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorModalMessage('Пожалуйста, заполните все поля для входа.');
      setIsErrorModalVisible(true);
      return;
    }
    
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      console.log('Успешный вход!', userData);

      const token = userData?.tokenRecord?.accessToken

      if (token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', token);
        } else if (SecureStore.setItemAsync) {
          await SecureStore.setItemAsync('userToken', token);
        }
      }

      setSuccessModalMessage('Вы успешно вошли в систему!');
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
        setErrorModalMessage('Не удалось отправить код подтверждения. Попробуйте снова.');
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
        setErrorModalMessage('Неверный или истекший код. Попробуйте снова.');
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

        setSuccessModalMessage('Ваш пароль был успешно сброшен!');
        setIsSuccessModalVisible(true);
        
        // After success, we go back to login
        setScreenMode('login');
        setRecoveryStep('email');
        setNewPassword('');
        setConfirmPassword('');
        setCode('');
      } catch (err) {
        const detail = err.response?.data?.errors["ConfirmPassword"][0] || 'Не удалось обновить пароль. Попробуйте снова.';
        setErrorModalMessage(detail);
        setIsErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const recoveryTitle = recoveryStep === 'reset' ? '' : recoveryStep === 'code' ? 'Введите код' : 'Введите email';

  const recoveryDescription =
    recoveryStep === 'email'
      ? 'Введите ваш адрес электронной почты. Мы отправим туда код подтверждения.'
      : recoveryStep === 'code'
        ? `Мы отправили код подтверждения на ${email || 'example@mail.com'}`
        : null;

  const actionLabel = loading ? 'Processing...' : 
    (recoveryStep === 'email' 
      ? 'Отправить код' 
      : recoveryStep === 'code' 
        ? 'Проверить код'
        : 'Обновить пароль');

  const bottomNote = recoveryStep === 'code' 
    ? `Отправить код снова  ${countdownLabel}` : null;

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F3F4" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <View style={styles.headerSpacer} />

        <Text style={styles.headerTitle}>Log In</Text>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.welcome}>Добро пожаловать</Text>
        <Text style={styles.subtitle}>Начните сканирование!</Text>

        <Text style={styles.label}>Email или номер телефона</Text>
        
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="example@example.com"
          placeholderTextColor="#00BCD4"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, styles.passwordLabel]}>Пароль</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={password}
            onChangeText={setPassword}
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
         <Text style={styles.forgot}>Забыли пароль?</Text>
         </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginOuter} 
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.loginButton}>
            <Text style={styles.loginText}>
              {loading ? 'Вход...' : 'Войти'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>



        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Нет аккаунта?</Text>
          <TouchableOpacity onPress={onSignUpPress}>
            <Text style={styles.signupLink}> Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          if (onLoginSuccess) onLoginSuccess(); 
        }} 
      />
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