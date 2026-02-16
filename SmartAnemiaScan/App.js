import React, { useEffect, useState } from 'react';
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent';
import SignUpScreen from './src/components/SignUpComponent';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('signIn');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer); // очищаем таймер
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  if (activeScreen === 'signUp') {
    return (
      <SignUpScreen onBackToLogin={() => setActiveScreen('signIn')} />
    );
  }

  return (
    <SignInScreen onSignUpPress={() => setActiveScreen('signUp')} />
  );
}

 
 