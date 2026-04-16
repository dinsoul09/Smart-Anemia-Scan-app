import axios from 'axios';
import { Platform } from 'react-native';

export const uploadAnemiaPhoto = async (token: string, photoUri: string) => {
  const fileName = photoUri.split('/').pop() || `eye-${Date.now()}.jpg`;
  const extension = fileName.split('.').pop()?.toLowerCase();

  let fileType = 'image/jpeg';
  if (extension === 'png') {
    fileType = 'image/png';
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, convert the URI (data URL or blob URL) to a File object
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: fileType });
    formData.append('ImageData', file);
  } else {
    // On native (iOS/Android), use the RN-style object
    formData.append('ImageData', {
      uri: photoUri,
      name: fileName,
      type: fileType,
    } as any);
  }

  const res = await axios.post('/Analysis/anemia/prediction', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};