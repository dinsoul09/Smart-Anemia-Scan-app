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
const CONTACT_CHANNELS = [
  { key: 'whatsapp', label: 'Whatsapp', value: '+7 777 333 4446', symbol: '☎' },
  { key: 'email', label: 'Email', value: 'help@smartanemiascan.app', symbol: '@' },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('profile');
const [expandedChannel, setExpandedChannel] = useState(null);
  const activeTitle = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    return tab ? tab.title : '';
  }, [activeTab]);
   const handleToggleChannel = (channelKey) => {
    setExpandedChannel((prev) => (prev === channelKey ? null : channelKey));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00BBD3" />

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.header}>
        <View style={styles.headerArrowPlaceholder} />
            <Text style={styles.headerTitle}>{activeTitle}</Text> 
        <View style={styles.headerArrowPlaceholder} />
      </LinearGradient>

      <View style={styles.body}>
         <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact Us</Text>
        </LinearGradient>

        {CONTACT_CHANNELS.map((channel) => {
          const isExpanded = expandedChannel === channel.key;

          return (
            <View key={channel.key} style={styles.channelSection}>
              <TouchableOpacity
                style={styles.channelRow}
                onPress={() => handleToggleChannel(channel.key)}
                activeOpacity={0.8}
              >
                <View style={styles.channelIconWrap}>
                  <Text style={styles.channelIconText}>{channel.symbol}</Text>
                </View>
                <Text style={styles.channelLabel}>{channel.label}</Text>
                <Text style={styles.channelArrow}>{isExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>

              {isExpanded ? (
                <View style={styles.channelCard}>
                  <Text style={styles.channelCardText}>{channel.value}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.bottomWrapper}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const isCenterTab = tab.key === 'scan';
          const iconColor = '#00BBD3';
          return (
            <TouchableOpacity
              key={tab.key}
               style={[styles.navItem, isCenterTab && styles.navItemCenter, isActive && styles.navItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              {tab.icon({ color: iconColor, size: isCenterTab ? 34 : 24 })}
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
    backgroundColor: '#FFFFFF', 
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
    fontSize: 28,
    fontWeight: '600',
  },
  body: {
    flex: 1,
   
    paddingHorizontal: 24,
     paddingTop: 20,
  },
  contactButton: {
    alignSelf: 'center',
    minWidth: 142,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  channelSection: {
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BBD3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  channelLabel: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
  },
  channelArrow: {
    color: '#00BBD3',
    fontSize: 26,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  channelCard: {
    marginTop: 10,
    marginLeft: 52,
    backgroundColor: '#D9E6EF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  channelCardText: {
    color: '#00BBD3',
    fontSize: 17,
    fontWeight: '500',
  },
  bottomWrapper: {
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#E9F6FE',
    borderRadius: 34,
    paddingVertical: 10,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
     outlineStyle: 'none',
  },
  navItemCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  navItemActive: {
   backgroundColor: '#00BBD3',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E9F6FE', 
  },
});