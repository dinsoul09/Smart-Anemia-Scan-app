import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { uploadAnemiaPhoto } from '../../../api/anemiaApi';
import { getAccessToken } from '../../../api/tokenStorage';
import { IconButton } from '../../ui';
import { colors, fonts, radii } from '../../../theme';
import ConjunctivaMaskEditor from './ConjunctivaMaskEditor';
import { maskConjunctiva, prepareScanPhoto } from '../../../utils/conjunctivaMask';
import { validateOutline } from '../../../utils/conjunctivaMask.shared';

// The backend allows a limited number of scans per minute and answers 429 with Retry-After in seconds
const getUploadErrorText = (error, fallback) => {
  if (error?.response?.status !== 429) {
    return fallback;
  }

  const retryAfter = Number(error.response.headers?.['retry-after']);
  return retryAfter > 0
    ? `Too many scans in a row. Please try again in ${retryAfter} s.`
    : 'Too many scans in a row. Please wait a minute and try again.';
};

// Almond eye outline with the lower lid dashed in rose and mint corner marks
function EyeFrame() {
  return (
    <Svg width={330} height={200} viewBox="0 0 330 200">
      <Path d="M14 96C80 14 250 14 316 96C250 178 80 178 14 96Z" stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
      <Path d="M52 132C110 186 220 186 278 132" stroke={colors.roseLight} strokeWidth={3} strokeDasharray="8 8" strokeLinecap="round" fill="none" />
      <Path
        d="M8 40V18a10 10 0 0 1 10-10h22M290 8h22a10 10 0 0 1 10 10v22M322 160v22a10 10 0 0 1-10 10h-22M40 192H18a10 10 0 0 1-10-10v-22"
        stroke={colors.mint}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Camera step of the scan: capture or pick a photo, outline the conjunctiva, upload.
// The finished prediction goes to `onResult`; the parent shows the result screen.
export default function ScanComponent({ onGoBack, onOpenGuide, onResult }) {
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('');
  const [facing, setFacing] = useState('back');
  // Photo waiting for the user to outline the conjunctiva; only the outlined area is uploaded
  const [photoToMask, setPhotoToMask] = useState(null);
  const [maskErrorText, setMaskErrorText] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    const ensureCameraPermission = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
    };
    ensureCameraPermission();
  }, [cameraPermission?.granted, requestCameraPermission]);

  const uploadEyePhoto = async (photoUri, fileName) => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('User token not found');
    }

    return uploadAnemiaPhoto(token, photoUri, fileName);
  };

  const handleConfirmMask = async (points) => {
    const outlineError = validateOutline(photoToMask, points);
    if (outlineError) {
      setMaskErrorText(outlineError);
      return;
    }

    setMaskErrorText('');
    setIsUploading(true);
    try {
      const masked = await maskConjunctiva(photoToMask, points);
      const predictionData = await uploadEyePhoto(masked.uri, masked.fileName);
      setPhotoToMask(null);
      setScanStatusText('');
      // Let the editor modal slide away before the result screen replaces the camera
      setTimeout(() => onResult(predictionData), 400);
    } catch (error) {
      if (error?.response?.status === 400) {
        // The backend rejected the image format (outline size, resolution): its text is meant for the user.
        // Keep the photo so they can fix the outline, or retake if the photo itself is the problem.
        setMaskErrorText(error.response.data?.description || 'Please adjust the outline and try again.');
      } else {
        setPhotoToMask(null);
        setScanStatusText(getUploadErrorText(error, 'Failed to upload scan. Please try again.'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const closeMaskEditor = () => {
    setPhotoToMask(null);
    setMaskErrorText('');
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

      setPhotoToMask(await prepareScanPhoto(photo.uri));
      setScanStatusText('');
    } catch (error) {
      setScanStatusText('Could not capture photo. Please try again.');
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
      setPhotoToMask(await prepareScanPhoto(result.assets[0].uri));
      setScanStatusText('');
    } catch (error) {
      setScanStatusText('Could not open the image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.cameraBg} />
      <View style={styles.preview}>
        {cameraPermission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing={facing} ratio="16:9" />
        ) : (
          <View style={styles.cameraFallback}>
            <Text style={styles.fallbackText}>Allow camera access to scan your eyelid.</Text>
          </View>
        )}
      </View>

      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <IconButton icon="x" tone="glass" round accessibilityLabel="Close camera" onPress={onGoBack} />
        <Pressable onPress={onOpenGuide} accessibilityRole="button" style={styles.guidePill}>
          <Feather name="info" size={18} color="#FFFFFF" />
          <Text style={styles.guidePillText}>How to scan</Text>
        </Pressable>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={[styles.frameArea, { top: insets.top + 112 }]} pointerEvents="none">
        <View style={styles.lidHint}>
          <Feather name="arrow-down" size={18} color={colors.roseInkDark} />
          <Text style={styles.lidHintText}>Pull your lower eyelid down</Text>
        </View>
        <EyeFrame />
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.panelHint} accessibilityLiveRegion="polite">
          {scanStatusText || 'Place your eye and lower eyelid inside the frame'}
        </Text>
        <View style={styles.controls}>
          <IconButton
            icon="image"
            tone="glass"
            accessibilityLabel="Choose from gallery"
            onPress={handlePickFromGallery}
            style={styles.sideButton}
          />
          <Pressable
            onPress={handleCapturePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            disabled={isUploading}
            style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}
          >
            {isUploading ? <ActivityIndicator color="#FFFFFF" /> : <View style={styles.shutterInner} />}
          </Pressable>
          <IconButton
            icon="refresh-cw"
            tone="glass"
            accessibilityLabel="Switch camera"
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
            style={styles.sideButton}
          />
        </View>
      </View>

      <ConjunctivaMaskEditor
        photo={photoToMask}
        isSubmitting={isUploading}
        errorText={maskErrorText}
        onRetake={closeMaskEditor}
        onConfirm={handleConfirmMask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cameraBg,
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cameraPreview,
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: '#B8C6C2',
    textAlign: 'center',
  },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarSpacer: {
    width: 44,
  },
  guidePill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidePillText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  frameArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 18,
  },
  lidHint: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.roseTint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lidHintText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.roseInkDark,
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingHorizontal: 32,
    backgroundColor: colors.cameraBg,
    gap: 22,
  },
  panelHint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B8C6C2',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: {
    opacity: 0.8,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
});
