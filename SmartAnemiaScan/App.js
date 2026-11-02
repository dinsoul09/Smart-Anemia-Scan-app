import React, { useEffect, useState } from 'react';
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent';
import SignUpScreen from './src/components/SignUpComponent';
import MainMenuScreen from './src/components/MainMenuScreen'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthEventEmitter } from './src/api/authApi';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { fontFiles } from './src/theme';
import { AppBackground, FeedbackProvider } from './src/components/ui';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('signIn');
  // Email and password typed on the sign-in screen, carried over to sign-up
  const [signUpPrefill, setSignUpPrefill] = useState({});
  const [fontsLoaded, fontError] = useFonts(fontFiles);

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

  // Keep the splash until the Onest font is ready (or failed — then system font is used).
  if (isShowSplash || (!fontsLoaded && !fontError)) {
    return <SplashScreen fontsLoaded={fontsLoaded} />;
  }

  return (
    <SafeAreaProvider>
      <FeedbackProvider>
        <View style={styles.root}>
          <AppBackground />
          {activeScreen === 'signUp' ? (
            <SignUpScreen
              initialEmail={signUpPrefill.email}
              initialPassword={signUpPrefill.password}
              onBackToLogin={() => setActiveScreen('signIn')}
              onSuccess={() => setActiveScreen('mainMenu')}
            />
          ) : activeScreen === 'mainMenu' ? (
            <MainMenuScreen onLogout={() => setActiveScreen('signIn')} />
          ) : (
            <SignInScreen
              onSignUpPress={(prefill) => {
                setSignUpPrefill(prefill ?? {});
                setActiveScreen('signUp');
              }}
              onLoginSuccess={() => setActiveScreen('mainMenu')}
            />
          )}
        </View>
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

 
 