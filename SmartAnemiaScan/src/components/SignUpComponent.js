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
  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
 export default function SignUpScreen({ onBackToLogin }) {
    const [passwordHidden, setPasswordHidden] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#26C7DA" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Account</Text>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Full name</Text>
        <TextInput placeholder=" "placeholderTextColor="#00BCD4" style={styles.input} />

        <Text style={styles.label}>Password</Text>
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

        <Text style={styles.label}>Email</Text>
        <TextInput placeholder="example@example.com" placeholderTextColor="#00BCD4" style={styles.input} />

        <Text style={styles.label}>Date Of Birth</Text>
        <TextInput placeholder="DD / MM /YYY" placeholderTextColor="#00BCD4" style={styles.input} />

        <TouchableOpacity style={styles.signupOuter}>
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
      </ScrollView>
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