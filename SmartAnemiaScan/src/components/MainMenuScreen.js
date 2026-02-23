import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import Messages from '../assets/Messages.svg'
import ButtonShape from '../assets/ButtonShape.svg'
import UserProfile from '../assets/UserProfile.svg'

const TABS = [
  {
    key: 'messages',
    title: 'Help Center',
    icon: ({ color, size }) => (
      <Messages width={size} height={size} fill={color} />
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
      <UserProfile width={size} height={size} fill={color} />
    ),
  },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('profile');

  const activeTitle = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    return tab ? tab.title : '';
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00BBD3" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <View style={styles.headerArrowPlaceholder} />
        <Text style={styles.headerTitle}>{activeTitle}</Text> 
        <View style={styles.headerArrowPlaceholder} />
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.bodyText}>LEHAAAAAAAA</Text>
      </View>

      <View style={styles.bottomWrapper}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const iconColor = isActive ? '#FFFFFF' : '#00BBD3';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              {tab.icon({ color: iconColor, size: 24 })}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {
    height: 92,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerArrowPlaceholder: {
    width: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bodyText: {
    color: '#6A6E73',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomWrapper: {
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#DDE6EC',
    borderRadius: 34,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: '#00BBD3',
  },
});