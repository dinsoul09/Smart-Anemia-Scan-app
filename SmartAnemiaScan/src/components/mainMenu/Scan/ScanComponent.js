import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';
import { uploadAnemiaPhoto } from '../../../api/anemiaApi';
import ScanGuideModal from './ScanGuideModal';
import ScanResultModal from './ScanResultModal';

export default function ScanComponent({ onGoBack }) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('');
  const [isScanGuideVisible, setIsScanGuideVisible] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  useEffect(() => {
    const ensureCameraPermission = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
    };
    ensureCameraPermission();
  }, [cameraPermission?.granted, requestCameraPermission]);

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
      const predictionData = await uploadEyePhoto(photo.uri);
      setPredictionResult(predictionData);
      setIsResultModalVisible(true);
      setScanStatusText('');
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
      const predictionData = await uploadEyePhoto(result.assets[0].uri);
      setPredictionResult(predictionData);
      setIsResultModalVisible(true);
      setScanStatusText('');
    } catch (error) {
      setScanStatusText('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.scanContainer}>
      <View style={styles.scanPreview}>
        {cameraPermission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
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
          onPress={onGoBack}
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

          <TouchableOpacity 
             style={styles.scanFlipButton} 
             activeOpacity={0.8} 
             onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Feather name="refresh-cw" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScanGuideModal
        visible={isScanGuideVisible}
        onClose={() => setIsScanGuideVisible(false)}
      />

      <ScanResultModal
        visible={isResultModalVisible}
        result={predictionResult}
        onClose={() => setIsResultModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  scanFlipButton: {
    position: 'absolute',
    right: 8,
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#33E4DB',
    backgroundColor: 'rgba(0, 187, 211, 0.42)',
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
});
