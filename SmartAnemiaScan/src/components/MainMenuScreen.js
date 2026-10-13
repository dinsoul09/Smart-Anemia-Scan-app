import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import HomeScreen from './HomeScreen';
import HistoryScreen from './HistoryScreen';
import CoursesScreen from './CoursesScreen';
import ProfileScreen from './ProfileScreen';
import HelpCenterComponent from './mainMenu/HelpCenter/HelpCenterComponent';
import ScanComponent from './mainMenu/Scan/ScanComponent';
import ScanGuideScreen, { shouldSkipScanGuide } from './scan/ScanGuideScreen';
import ResultScreen from './scan/ResultScreen';
import LabHemoglobinScreen from './scan/LabHemoglobinScreen';
import { BottomNav } from './ui';
import { signOut } from '../api/authApi';
import { colors } from '../theme';

// Logged-in part of the app: four tabs under a bottom bar, plus full-screen steps
// (scan guide → camera → result, help) that cover the bar while open.
export default function MainMenuScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  // null | { name: 'guide' | 'camera' | 'help' } | { name: 'result' | 'labHemoglobin', scan, disclaimer, canScanAgain, justSaved }
  const [overlay, setOverlay] = useState(null);
  // Bumped after a new scan so tabs reload their data
  const [dataVersion, setDataVersion] = useState(0);

  const startScan = async () => {
    setOverlay({ name: (await shouldSkipScanGuide()) ? 'camera' : 'guide' });
  };

  const showScanResult = (prediction) => {
    setDataVersion((v) => v + 1);
    setOverlay({ name: 'result', scan: prediction, disclaimer: prediction?.disclaimer, canScanAgain: true });
  };

  const showHistoryItem = (scan, disclaimer) => {
    setOverlay({ name: 'result', scan, disclaimer, canScanAgain: false });
  };

  const handleLogout = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }

      if (token) {
        await signOut(token);
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
    if (onLogout) onLogout();
  };

  if (overlay?.name === 'guide') {
    return <ScanGuideScreen onBack={() => setOverlay(null)} onOpenCamera={() => setOverlay({ name: 'camera' })} />;
  }
  if (overlay?.name === 'camera') {
    return (
      <ScanComponent
        onGoBack={() => setOverlay(null)}
        onOpenGuide={() => setOverlay({ name: 'guide' })}
        onResult={showScanResult}
      />
    );
  }
  if (overlay?.name === 'result') {
    return (
      <ResultScreen
        scan={overlay.scan}
        disclaimer={overlay.disclaimer}
        justSaved={overlay.justSaved}
        onClose={() => setOverlay(null)}
        onScanAgain={overlay.canScanAgain ? startScan : undefined}
        onAddLab={() => setOverlay({ ...overlay, name: 'labHemoglobin', justSaved: false })}
      />
    );
  }
  if (overlay?.name === 'labHemoglobin') {
    const backToResult = (patch = {}) =>
      setOverlay({ ...overlay, name: 'result', ...patch });
    return (
      <LabHemoglobinScreen
        scan={overlay.scan}
        onClose={() => backToResult()}
        onSaved={(res) => {
          // Tabs reload so History shows the new value
          setDataVersion((v) => v + 1);
          backToResult({
            scan: { ...overlay.scan, labHemoglobin: res.labHemoglobin, labMeasuredAt: res.labMeasuredAt },
            justSaved: true,
          });
        }}
        onNotFound={() => {
          setDataVersion((v) => v + 1);
          setOverlay(null);
        }}
      />
    );
  }
  if (overlay?.name === 'help') {
    return <HelpCenterComponent onBack={() => setOverlay(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        {activeTab === 'home' ? (
          <HomeScreen
            key={dataVersion}
            onStartScan={startScan}
            onOpenScan={showHistoryItem}
            onOpenHistory={() => setActiveTab('history')}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenCourses={() => setActiveTab('courses')}
          />
        ) : activeTab === 'history' ? (
          <HistoryScreen key={dataVersion} onOpenScan={showHistoryItem} onStartScan={startScan} />
        ) : activeTab === 'courses' ? (
          <CoursesScreen key={dataVersion} onStartScan={startScan} />
        ) : (
          <ProfileScreen onLogout={handleLogout} onOpenHelp={() => setOverlay({ name: 'help' })} />
        )}
      </View>
      <BottomNav active={activeTab} onChange={setActiveTab} onScan={startScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  body: {
    flex: 1,
  },
});
