import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput } from 'react-native';
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
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const PROFILE_RESULTS = [
  {
    key: 'blood',
    title: 'Anemia : Yes/No ',
    result: 'Anemia probability:',
    date: 'Added Manually 10 Febraury 20XX',
  },
  {
    key: 'urine',
    title: 'Anemia : Yes/No ',
    result: 'Anemia probability:',
    date: 'Added Manually 10 Febraury 20XX',
  },
  {
    key: 'lipid',
   title: 'Anemia : Yes/No ',
    result: 'Anemia probability:',
    date: 'Added Manually 10 Febraury 20XX',
  },
];

export default function MainMenuScreen() {
  const [activeTab, setActiveTab] = useState('messages');
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [selectedGender, setSelectedGender] = useState('Male');
  const [age, setAge] = useState('26');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const activeTitle = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    return tab ? tab.title : '';
  }, [activeTab]);
  const isProfileTab = activeTab === 'profile';
   const handleToggleChannel = (channelKey) => {
    setExpandedChannel((prev) => (prev === channelKey ? null : channelKey));
  };
const renderHelpCenterContent = () => (
    <>
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
              <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} colors={['#33E4DB', '#00BBD3']}/>
            </TouchableOpacity>

            {isExpanded ? (
              <View style={styles.channelCard}>
                <Text style={styles.channelCardText}>{channel.value}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );

  const renderProfileSetup = () => (
    <View style={styles.profileContent}>
      <Text style={styles.profileQuestion}>What is your gender</Text>
      <View style={styles.genderOptionsWrap}>
        {GENDER_OPTIONS.map((option) => {
          const isActive = selectedGender === option;

          return (
            <TouchableOpacity
              key={option}
              style={[styles.genderOption, isActive && styles.genderOptionActive]}
              onPress={() => setSelectedGender(option)}
            >
               {isActive ? (
                <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.genderOptionGradient}>
                  <Text style={[styles.genderOptionText, styles.genderOptionTextActive]}>{option}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.genderOptionPlain}>
                  <Text style={styles.genderOptionText}>{option}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.profileQuestion, styles.profileAgeQuestion]}>How old are you</Text>
      <TextInput
        style={styles.ageInput}
        keyboardType="number-pad"
        value={age}
        onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ''))}
        placeholder="Enter age"
        placeholderTextColor="#7CA0AC"
      />

      <TouchableOpacity style={styles.saveButton} onPress={() => setIsProfileSaved(true)}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileResult = () => (
    <View style={styles.profileContent}>
      <View style={styles.profileInfoRow}>
        <Text style={styles.profileLabel}>Gender</Text>
        <View style={styles.profileValueBadge}>
          <Text style={styles.profileValueText}>{selectedGender || '-'}</Text>
        </View>
      </View>

      <View style={styles.profileInfoRow}>
        <Text style={styles.profileLabel}>Age</Text>
        <View style={styles.profileValueBadge}>
          <Text style={styles.profileValueText}>{age || '-'}</Text>
        </View>
      </View>

      <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.scansButton}>
        <Text style={styles.scansButtonText}>Your scans</Text>
      </LinearGradient>

      {PROFILE_RESULTS.map((item) => (
        <View key={item.key} style={styles.resultCard}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultText}>{item.result}</Text>
          <Text style={styles.resultDate}>{item.date}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsProfileSaved(false)}>
        <Text style={styles.editProfileButtonText}>Edit profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBodyContent = () => {
    if (activeTab === 'profile') {
      return isProfileSaved ? renderProfileResult() : renderProfileSetup();
    }

    return renderHelpCenterContent();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00BBD3" />

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

      <View style={styles.body}>
         {renderBodyContent()}
      </View>
      {activeTab === 'messages' ? (
        <View style={styles.logoWrap}>
       <Vector width={220} height={220} />
        </View>
      ) : null}

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
  profileContent: {
    paddingBottom: 24,
  },
  profileQuestion: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 14,
  },
  genderOptionsWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  genderOption: {
    borderWidth: 1,
    borderColor: '#00BBD3',
    borderRadius: 18,
    overflow: 'hidden',
  },
  genderOptionActive: {
    borderColor: 'transparent',
  },
  genderOptionGradient: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    
  },
  genderOptionPlain: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  genderOptionText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  genderOptionTextActive: {
    color: '#FFFFFF',
  },
  profileAgeQuestion: {
    marginBottom: 10,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: '#D2DEE4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#1A3C47',
    fontSize: 16,
    marginBottom: 36,
  },
  saveButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#00BBD3',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 56,
    
  },
  saveButtonText: {
    color: '#00BBD3',
    fontSize: 22,
    fontWeight: '500',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileLabel: {
    flex: 1,
    color: '#000000',
    fontSize: 20,
    fontWeight: '500',
  },
  profileValueBadge: {
    borderWidth: 1,
    borderColor: '#86DDE8',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: 'center',
  },
  profileValueText: {
    color: '#1A3C47',
    fontSize: 14,
    fontWeight: '500',
  },
  scansButton: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  scansButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  resultCard: {
    borderWidth: 1,
    borderColor: '#86DDE8',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  resultTitle: {
    color: '#00BBD3',
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultText: {
    color: '#1A3C47',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 5,
  },
  resultDate: {
    color: '#7CA0AC',
    fontSize: 11,
    fontWeight: '400',
  },
  editProfileButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  editProfileButtonText: {
    color: '#00BBD3',
    fontSize: 15,
    fontWeight: '500',

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