import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Messages from '../assets/Messages.svg';
import ButtonShape from '../assets/ButtonShape.svg';
import UserProfile from '../assets/UserProfile.svg';

import HomeScreen from './HomeScreen';
import HelpCenterComponent from './mainMenu/HelpCenter/HelpCenterComponent';
import ScanComponent from './mainMenu/Scan/ScanComponent';
import ProfileScreen from './ProfileScreen';


const TABS = [
  {
    key: 'home',
    title: 'Smart Anemia Scan',
    subtitle: 'Eye-based anemia detection',
    icon: ({ color, size }) => (
      <Feather name="home" size={size} color={color} />
    ),
  },
  {
    key: 'scan',
    title: 'New Scan',
    subtitle: null,
    icon: ({ color, size }) => (
      <ButtonShape width={size} height={size} fill={color} />
    ),
  },
  {
    key: 'profile',
    title: 'Your Profile',
    subtitle: null,
    icon: ({ color, size }) => (
      <UserProfile width={size} height={size} color={color} />
    ),
  },
  {
    key: 'help',
    title: 'Help Center',
    subtitle: 'How Can We Help You?',
    icon: ({ color, size }) => (
      <Feather name="help-circle" size={size} color={color} />
    ),
  },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const insets = useSafeAreaInsets();

  const activeTabData = useMemo(() => {
    return TABS.find((item) => item.key === activeTab) || TABS[0];
  }, [activeTab]);

  const isProfileTab = activeTab === 'profile';
  const isScanTab = activeTab === 'scan';
  const isHomeTab = activeTab === 'home';

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

  const showCompactHeader = isProfileTab;

  return (
    <View
      style={[
        styles.container,
        isScanTab
          ? { paddingTop: 0, paddingBottom: 0 }
          : { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#00BBD3" />

      {!isScanTab ? (
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          style={[styles.header, showCompactHeader && styles.headerCompact]}
        >
          <View style={[styles.headerTextWrap, showCompactHeader && styles.headerTextWrapCompact]}>
            <Text style={[styles.headerTitle, showCompactHeader && styles.headerTitleCompact]}>
              {activeTabData.title}
            </Text>
            {activeTabData.subtitle ? (
              <Text style={styles.headerSubtitle}>{activeTabData.subtitle}</Text>
            ) : null}
          </View>
          <View style={styles.headerArrowPlaceholder} />
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
    height: 125,
    paddingHorizontal: 15,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
   headerCompact: {
    height: 95,
  },
  headerBackButton: {
    marginTop: 30,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: 22,
  },
   headerTextWrapCompact: {
    marginTop: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  headerTitleCompact: {
    fontSize: 28,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 14,
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
});