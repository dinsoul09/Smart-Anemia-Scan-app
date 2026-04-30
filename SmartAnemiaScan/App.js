import React, { useEffect, useState } from 'react';
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent';
import SignUpScreen from './src/components/SignUpComponent';
import MainMenuScreen from './src/components/MainMenuScreen'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthEventEmitter } from './src/api/authApi';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('signIn');

  useEffect(() => {
    const checkSession = async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
        } else if (SecureStore.getItemAsync) {
          token = await SecureStore.getItemAsync('userToken');
        }

        if (token && token !== 'undefined' && token !== 'null') {
          setActiveScreen('mainMenu');
        }
      } catch (e) {
        console.warn('Failed to restore session:', e);
      } finally {
        // Wait a minimum of 2 seconds for branding, then hide splash
        setTimeout(() => {
          setIsShowSplash(false);
        }, 2000);
      }
    };

    checkSession();

    const unsubscribe = AuthEventEmitter.subscribe(() => {
      setActiveScreen('signIn');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      {activeScreen === 'signUp' ? (
        <SignUpScreen
          onBackToLogin={() => setActiveScreen('signIn')}
          onSuccess={() => setActiveScreen('mainMenu')}
        />
      ) : activeScreen === 'mainMenu' ? (
        <MainMenuScreen onLogout={() => setActiveScreen('signIn')} />
      ) : (
        <SignInScreen
          onSignUpPress={() => setActiveScreen('signUp')}
          onLoginSuccess={() => setActiveScreen('mainMenu')}
        />
      )}
    </SafeAreaProvider>
  );
}

 
 