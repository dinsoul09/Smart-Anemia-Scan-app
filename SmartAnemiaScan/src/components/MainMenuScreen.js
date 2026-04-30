import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import ButtonShape from '../assets/ButtonShape.svg';
import UserProfile from '../assets/UserProfile.svg';

import HomeScreen from './HomeScreen';
import HelpCenterComponent from './mainMenu/HelpCenter/HelpCenterComponent';
import ScanComponent from './mainMenu/Scan/ScanComponent';
import ProfileScreen from './ProfileScreen';
import * as SecureStore from 'expo-secure-store';
import { signOut } from '../api/authApi';


const TABS = [
  {
    key: 'home',
    title: 'AnemiaCheck',
    subtitle: 'Eye-based anemia detection',
    headerIcon: 'eye',
    icon: ({ color, size }) => (
      <Feather name="home" size={size} color={color} />
    ),
  },
  {
    key: 'scan',
    title: 'New Scan',
    subtitle: null,
    headerIcon: 'camera',
    icon: ({ color, size }) => (
      <ButtonShape width={size} height={size} fill={color} />
    ),
  },
  {
    key: 'profile',
    title: 'Your Profile',
    subtitle: 'Manage your account',
    headerIcon: 'settings',
    icon: ({ color, size }) => (
      <UserProfile width={size} height={size} color={color} />
    ),
  },
  {
    key: 'help',
    title: 'Help Center',
    subtitle: 'How can we help you?',
    headerIcon: 'help-circle',
    icon: ({ color, size }) => (
      <Feather name="help-circle" size={size} color={color} />
    ),
  },
];

export default function MainMenuScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const insets = useSafeAreaInsets();

  const activeTabData = useMemo(() => {
    return TABS.find((item) => item.key === activeTab) || TABS[0];
  }, [activeTab]);

  const isScanTab = activeTab === 'scan';

  const renderBodyContent = () => {
    if (activeTab === 'home') {
      return <HomeScreen onStartScan={() => setActiveTab('scan')} />;
    }
    if (activeTab === 'profile') {
      return <ProfileScreen />;
    }
    if (activeTab === 'scan') {
      return <ScanComponent onGoBack={() => setActiveTab('home')} />;
    }
    return <HelpCenterComponent />;
  };
  const handleLogout = async () => {
    setShowSettings(false);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
        localStorage.removeItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
        await SecureStore.deleteItemAsync('userToken');
      }

      if (token) {
        await signOut(token);
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
    if (onLogout) onLogout();
  };

  const handleHeaderIconPress = () => {
    if (activeTab === 'profile') {
      setShowSettings(true);
    }
  };


  return (
    <View
      style={[
        styles.container,
        isScanTab
          ? { paddingTop: 0, paddingBottom: 0 }
          : { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <Pressable style={styles.settingsPanel} onPress={() => {}}>
            <TouchableOpacity style={styles.settingsClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.settingsCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.settingsTitleRow}>
              <Text style={styles.settingsPanelTitle}>⚙  Settings</Text>
            </View>
            <Text style={styles.settingsPanelSubtitle}>Manage your account</Text>
            <View style={styles.settingsDivider} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.logoutIcon}>↪</Text>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {!isScanTab ? (
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{activeTabData.title}</Text>
            {activeTabData.subtitle ? (
              <Text style={styles.headerSubtitle}>{activeTabData.subtitle}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.headerIconCircle}
            onPress={handleHeaderIconPress}
            activeOpacity={activeTab === 'profile' ? 0.7 : 1}
          >
            <Feather name={activeTabData.headerIcon} size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      ) : null}

      <View style={[styles.body, isScanTab && styles.bodyScan]}>
         {renderBodyContent()}
      </View>


      {!isScanTab ? (
        <View style={styles.bottomWrapper}>
        { 
        TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const isCenterTab = tab.key === 'scan';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.navItem, isCenterTab && styles.navItemCenter, isActive && styles.navItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
             {tab.icon({ color: '#00BBD3', size: isCenterTab ? 36 : 23 })}
            </TouchableOpacity>
          );
        })
        }
      </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  header: {
    height: 108,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  headerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  body: {
    flex: 1,
    backgroundColor: '#Ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bodyScan: {
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: '#000000',
  },

  bottomWrapper: {
     marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: '#E9F6FE',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    outlineStyle: 'none',
  },
  navItemCenter: {
    width: 52,
    height: 52,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
     borderColor: '#D3DDE3',
  },

  // Settings Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  settingsClose: {
    position: 'absolute',
    top: 14,
    right: 16,
    padding: 4,
  },
  settingsCloseText: {
    fontSize: 18,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  settingsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  settingsPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C47',
    letterSpacing: 0.2,
  },
  settingsPanelSubtitle: {
    fontSize: 13,
    color: '#8899A6',
    fontWeight: '400',
    marginBottom: 20,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 10,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: 0.2,
  },
});