import React, { useState } from 'react';
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

export default function SignInScreen() {
  const [passwordHidden, setPasswordHidden] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F3F4" />

      <LinearGradient colors={['#26C7DA', '#10B7CC']} style={styles.header}>
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

        <TouchableOpacity>
          <Text style={styles.forgot}>Forget Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginOuter}>
          <LinearGradient colors={['#26C7DA', '#10B7CC']} style={styles.loginButton}>
            <Text style={styles.loginText}>Log In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.orText}>or sign up with</Text>

        <TouchableOpacity style={styles.googleCircle}>
          <Text style={styles.googleText}>G</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don’t have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F3F4',
  },
  header: {
    height: 85,
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
    fontSize: 36,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 18,
  },
  content: {
    paddingTop: 28,
    paddingHorizontal: 32,
  },
  welcome: {
    color: '#00BCD4',
    fontSize: 38,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 42,
    color: '#5F6368',
    fontSize: 20,
  },
  label: {
    color: '#333333',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
  },
  passwordLabel: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#D7E6EE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#00BCD4',
    fontSize: 30,
  },
  passwordWrapper: {
    backgroundColor: '#D7E6EE',
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
    fontSize: 30,
  },
  eyeIcon: {
    fontSize: 24,
    color: '#4A4A4A',
  },
  forgot: {
    marginTop: 10,
    alignSelf: 'flex-end',
    color: '#00BCD4',
    fontSize: 14,
    fontWeight: '600',
  },
  loginOuter: {
    alignItems: 'center',
    marginTop: 40,
  },
  loginButton: {
    width: 192,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
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
    backgroundColor: '#22C0D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
  },
  signupText: {
    marginTop: 48,
    textAlign: 'center',
    color: '#444',
    fontSize: 16,
  },
  signupLink: {
    color: '#00BCD4',
    fontWeight: '700',
  },
});