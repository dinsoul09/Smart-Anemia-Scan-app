import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Messages from '../assets/Messages.svg';
import ButtonShape from '../assets/ButtonShape.svg';
import UserProfile from '../assets/UserProfile.svg';

import HelpCenterComponent from './mainMenu/HelpCenter/HelpCenterComponent';
import ScanComponent from './mainMenu/Scan/ScanComponent';
import ProfileScreen from './ProfileScreen';


const TABS = [
  {
    key: 'messages',
    title: 'Help Center',
    icon: ({ color, size }) => (  
      <Messages width={size} height={size} color={color} />
    ),
  },
  {
    key: 'scan',
    title: 'New Scan',
    icon: ({ color, size }) => (
      <ButtonShape width={size} height={size} fill={color} />
    ),
  },
  {
    key: 'profile',
    title: 'Your Profile',
    icon: ({ color, size }) => (
      <UserProfile width={size} height={size} color={color} />
    ),
  },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('messages');
  const insets = useSafeAreaInsets();

  const activeTitle = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    return tab ? tab.title : '';
  }, [activeTab]);

  const isProfileTab = activeTab === 'profile';
  const isScanTab = activeTab === 'scan';

  const renderBodyContent = () => {
    if (activeTab === 'profile') {
      return <ProfileScreen />;
    }
    if (activeTab === 'scan') {
      return <ScanComponent onGoBack={() => setActiveTab('messages')} />;
    }
    return <HelpCenterComponent />;
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
      <StatusBar barStyle="light-content" backgroundColor="#00BBD3" />

      {!isScanTab ? (
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          style={[styles.header, isProfileTab && styles.headerCompact]}
        >
          <View style={[styles.headerTextWrap, isProfileTab && styles.headerTextWrapCompact]}>
            <Text style={[styles.headerTitle, isProfileTab && styles.headerTitleCompact]}>{activeTitle}</Text>
            {activeTab === 'messages' ? (
              <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
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
    paddingHorizontal: 32,
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
  },
  navItemActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
     borderColor: '#D3DDE3',
  },
});