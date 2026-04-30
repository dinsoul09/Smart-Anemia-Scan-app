import React, { useEffect, useState } from 'react';
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent';
import SignUpScreen from './src/components/SignUpComponent';
import MainMenuScreen from './src/components/MainMenuScreen'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthEventEmitter } from './src/api/authApi';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('signIn');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    const unsubscribe = AuthEventEmitter.subscribe(() => {
      setActiveScreen('signIn');
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

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

 
 