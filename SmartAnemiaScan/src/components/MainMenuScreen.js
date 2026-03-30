import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Messages from '../assets/Messages.svg';
import ButtonShape from '../assets/ButtonShape.svg';
import UserProfile from '../assets/UserProfile.svg';
import Vector from '../assets/Vector.svg';
import Group95 from '../assets/Group95.svg';
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
  { key: 'whatsapp', label: 'Whatsapp', value: '+7 777 333 4446' },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('messages');
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
       
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{activeTitle}</Text>
          <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
        </View> 
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
                <Group95 width={24} height={24} />
                </View>
                <Text style={styles.channelLabel}>{channel.label}</Text>
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#00BBD3" />
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
      
        <View style={styles.logoWrap}>
        <Vector width={220} height={220} />
      </View>

      <View style={styles.bottomWrapper}>
        {TABS.map((tab) => {
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
    height: 125,
    paddingHorizontal: 15,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackButton: {
    marginTop: 30,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: 22,
  },
  
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
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
  contactButton: {
    alignSelf: 'center',
    minWidth: 150,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  channelSection: {
    marginBottom: 20,
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
  
  channelLabel: {
    flex: 1,
    color: '#000000',
   
    fontSize: 25,
    fontWeight: '400',
    
  },
  channelCard: {
    marginTop: 10,
    marginLeft: 62,
    backgroundColor: '#E9F6FE',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  channelCardText: {
    color: '#13CAD6',
    fontSize: 20,
    fontWeight: '500',
  },
  logoWrap: {
    backgroundColor: '#Ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150,
   

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
    borderWidth: 2,
     borderColor: '#C7D9E5',
  },
});