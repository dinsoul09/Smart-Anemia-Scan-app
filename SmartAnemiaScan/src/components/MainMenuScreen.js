import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Modal, Animated, PanResponder, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';
import Messages from '../assets/Messages.svg';
import ButtonShape from '../assets/ButtonShape.svg';
import UserProfile from '../assets/UserProfile.svg';
import Vector from '../assets/Vector.svg';
import Group95 from '../assets/Group95.svg';
import { uploadAnemiaPhoto } from '../api/anemiaApi';



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
  const [isScanGuideVisible, setIsScanGuideVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('');
  const cameraRef = useRef(null);
  const activeTitle = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    return tab ? tab.title : '';
  }, [activeTab]);
  const isProfileTab = activeTab === 'profile';
  const isScanTab = activeTab === 'scan';
  const guideSheetTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ensureCameraPermission = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
    };

    if (isScanTab) {
      ensureCameraPermission();
    }
  }, [isScanTab, cameraPermission?.granted, requestCameraPermission]);

  const uploadEyePhoto = async (photoUri) => {
  let token = null;

  if (Platform.OS === 'web') {
    token = localStorage.getItem('userToken');
  } else {
    token = await SecureStore.getItemAsync('userToken');
  }

  if (!token) {
    throw new Error('User token not found');
  }

  return uploadAnemiaPhoto(token, photoUri);
};

  const handleCapturePhoto = async () => {
    if (!cameraPermission?.granted) {
      Alert.alert('Camera access required', 'Please allow camera permission to take a scan photo.');
      return;
    }

    if (!cameraRef.current || isUploading) {
      return;
    }

    setIsUploading(true);
    setScanStatusText('Capturing photo...');
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) {
        throw new Error('Could not capture photo.');
      }

      setScanStatusText('Uploading photo...');
      await uploadEyePhoto(photo.uri);
      setScanStatusText('Scan uploaded successfully.');
    } catch (error) {
      setScanStatusText('Failed to upload scan. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (isUploading) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Gallery access required', 'Please allow gallery permission to select an image.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setIsUploading(true);
      setScanStatusText('Uploading photo...');
      await uploadEyePhoto(result.assets[0].uri);
      setScanStatusText('Gallery image uploaded successfully.');
    } catch (error) {
      setScanStatusText('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeGuideSheet = () => {
    Animated.timing(guideSheetTranslateY, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      guideSheetTranslateY.setValue(0);
      setIsScanGuideVisible(false);
    });
  };
  const guideSheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 6,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          guideSheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 1) {
          closeGuideSheet();
          return;
        }
        Animated.spring(guideSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
    }),
  ).current;
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
              style={styles.genderOption}
              onPress={() => setSelectedGender(option)}
              activeOpacity={0.88}
            >
               <LinearGradient
                colors={isActive ? ['#33E4DB', '#00BBD3'] : ['#FFFFFF', '#FFFFFF']}
                style={styles.genderOptionGradient}
              >
                <Text style={[styles.genderOptionText, isActive && styles.genderOptionTextActive]}>{option}</Text>
              </LinearGradient>
              
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.profileQuestion, styles.profileAgeQuestion]}>How old are you</Text>
      <TextInput
        style={styles.ageInput}
        keyboardType="number-pad"
        value={age}
        onChangeText={(value) => setAge(value.replace(/[^0-9]/g, '').slice(0, 3))}
        placeholder="Enter age"
        placeholderTextColor="#9AA3AA"
      />

      <TouchableOpacity style={styles.saveButton} onPress={() => setIsProfileSaved(true)} activeOpacity={0.9}>
        <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.saveButtonGradient}>
          <Text style={styles.saveButtonText}>Save</Text>
        </LinearGradient>
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

  const renderScanContent = () => (
    <View style={styles.scanContainer}>
      <View style={styles.scanPreview}>
        {cameraPermission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            ratio="16:9"
          />
        ) : (
          <View style={styles.cameraFallback}>
            <Text style={styles.scanHintText}>Camera permission is needed to use live scan.</Text>
          </View>
        )}
        <View style={styles.scanOverlay} />
        <TouchableOpacity
          style={styles.scanBackButton}
          activeOpacity={0.8}
          onPress={() => setActiveTab('messages')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.scanFrame}>
          <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
          <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
          <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
          <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
        </View>
        <Text style={styles.scanHintText}>Place eye and lower eyelid inside the frame</Text>
        {scanStatusText ? <Text style={styles.scanStatusText}>{scanStatusText}</Text> : null}
      </View>

      <View style={styles.scanControls}>
        <TouchableOpacity style={styles.scanGuideButton} activeOpacity={0.8} onPress={() => setIsScanGuideVisible(true)}>
          <Feather name="file-text" size={16} color="#FFFFFF" />
          <Text style={styles.scanGuideText}>Scan Guide</Text>
        </TouchableOpacity>

        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.galleryButton} activeOpacity={0.9} onPress={handlePickFromGallery}>
            <Feather name="image" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} onPress={handleCapturePhoto}>
            <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.captureButton}>
              {isUploading ? <ActivityIndicator size="large" color="#FFFFFF" /> : <View style={styles.captureButtonInner} />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBodyContent = () => {
    if (activeTab === 'profile') {
      return isProfileSaved ? renderProfileResult() : renderProfileSetup();
    }
    if (activeTab === 'scan') {
      return renderScanContent();
    }

    return renderHelpCenterContent();
  };

  return (
    <SafeAreaView style={styles.container}>
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
      {activeTab === 'messages' ? (
        <View style={styles.logoWrap}>
       <Vector width={220} height={220} />
        </View>
      ) : null}

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

      <Modal
        visible={isScanGuideVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGuideSheet}
      >
        <View style={styles.guideBackdrop}>
          <TouchableOpacity style={styles.guideBackdropPress} onPress={closeGuideSheet} />
          <Animated.View
            style={[styles.guideSheet, { transform: [{ translateY: guideSheetTranslateY }] }]}
            {...guideSheetPanResponder.panHandlers}
          >
            <View style={styles.guideHandle} />
            <Text style={styles.guideTitle}>Check your surroundings before scanning!</Text>

            <View style={styles.guideIllustration}>
              <Feather name="eye" size={46} color="#00BBD3" />
            </View>

            <Text style={styles.guideMainText}>Please check if you are too close to the camera!</Text>

            <View style={styles.guideItem}>
              <Feather name="sun" size={16} color="#00BBD3" />
              <Text style={styles.guideItemText}>Make sure you're in a well-lit area.</Text>
            </View>
            <View style={styles.guideItem}>
              <Feather name="scissors" size={16} color="#00BBD3" />
              <Text style={styles.guideItemText}>Remove glasses and move hair away from your eyes.</Text>
            </View>

            <TouchableOpacity style={styles.guideNextButton} activeOpacity={0.9} onPress={closeGuideSheet}>
              <Text style={styles.guideNextText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
  bodyScan: {
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: '#000000',
  },
  scanContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scanPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4E4E4E',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4E4E4E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scanBackButton: {
    position: 'absolute',
    top: 28,
    left: 14,
    zIndex: 3,
    elevation: 6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 187, 211, 0.42)',
    borderWidth: 1,
    borderColor: '#33E4DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 230,
    height: 230,
    borderRadius: 24,
  },
  scanCorner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: '#FFFFFF',
    borderWidth: 6,
    borderRadius: 14,
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanHintText: {
    position: 'absolute',
    bottom: 198,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  scanStatusText: {
    position: 'absolute',
    bottom: 172,
    color: '#E9F6FE',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 26,
  },
  scanControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 34,
    alignItems: 'center',
  },
  captureRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    position: 'absolute',
    left: 8,
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#33E4DB',
    backgroundColor: 'rgba(0, 187, 211, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  captureButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
  },
  scanGuideButton: {
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 187, 211, 0.3)',
    borderWidth: 1,
    borderColor: '#33E4DB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  scanGuideText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    flex: 1,
    paddingBottom: 24,
    paddingTop: 42,
  },
  profileQuestion: {
    color: '#1F1F1F',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14,
  },
  genderOptionsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  genderOption: {
     width: '31%',
    borderWidth: 1,
    borderColor: '#00BBD3',
    borderRadius: 20,
    overflow: 'hidden',
  },
  genderOptionActive: {
    borderColor: 'transparent',
  },
  genderOptionGradient: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    
  },
  genderOptionPlain: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  genderOptionText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  genderOptionTextActive: {
    color: '#FFFFFF',
  },
  profileAgeQuestion: {
    marginBottom: 12,
  },
  ageInput: {
    alignSelf: 'stretch',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#33E4DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#00BBD3',
    fontSize: 22,
    width: '100%',
    textAlign: 'left',
  },
  saveButton: {
    alignSelf: 'center',
    marginTop: 'auto',
    borderRadius: 24,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 56,
    borderRadius: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
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
    borderWidth: 3,
     borderColor: '#D3DDE3',
  },
  guideBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  guideBackdropPress: {
    flex: 1,
  },
  guideSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 28,
    marginBottom: 0,
  },
  guideHandle: {
    width: 78,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    backgroundColor: '#EAEAEA',
    marginBottom: 18,
  },
  guideTitle: {
    color: '#2D2D2D',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  guideIllustration: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#E6FBFC',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  guideMainText: {
    color: '#1E1E1E',
    fontSize: 31,
    fontWeight: '600',
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  guideItemText: {
    flex: 1,
    color: '#3C3C3C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  guideNextButton: {
    borderWidth: 1,
    borderColor: '#8EE6EC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 12,
    backgroundColor: '#F1FEFF',
  },
  guideNextText: {
    color: '#00BBD3',
    fontSize: 20,
    fontWeight: '700',
  },
});