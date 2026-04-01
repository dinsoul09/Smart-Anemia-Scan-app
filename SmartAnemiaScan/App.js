import React, { useEffect, useState } from 'react';
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent';
import SignUpScreen from './src/components/SignUpComponent';
import MainMenuScreen from './src/components/MainMenuScreen'; 
export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('signIn');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  if (activeScreen === 'signUp') {
    return (
      <SignUpScreen
        onBackToLogin={() => setActiveScreen('signIn')}
        onSuccess={() => setActiveScreen('mainMenu')}
      />
    );
  }

  if (activeScreen === 'mainMenu') {
    return <MainMenuScreen />;
  }

  return (
       <SignInScreen
          onSignUpPress={() => setActiveScreen('signUp')}
          onLoginSuccess={() => setActiveScreen('mainMenu')}
        />
  );
}

 
 