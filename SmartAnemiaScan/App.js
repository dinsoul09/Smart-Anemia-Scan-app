import React, { useEffect, useState } from "react";
import SplashScreen from './Splash.ScreenView';
import SignInScreen from './src/components/SignInComponent'

export default function App() { 

  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : (
        <SignInScreen />
      )}
    </>
  );
}


 
 