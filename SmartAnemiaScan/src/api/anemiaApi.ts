import axios from 'axios';
import { Platform } from 'react-native';

// The backend stores the original bytes in GridFS on a remote cluster, and that upload is what
// dominates the request (~1.6 s per megabyte measured locally). The model resizes its own input,
// so a downscaled copy gives the same prediction for a fraction of the transfer.
const MAX_UPLOAD_SIDE = 768;
const UPLOAD_QUALITY = 0.85;

const downscaleForUpload = async (blob: Blob, fileName: string): Promise<File> => {
  // A conjunctiva mask must arrive exactly as built: an 800×1067 PNG with a hard 0/255 alpha edge.
  // Resampling would soften the edge, and JPEG would drop the transparency the backend checks for.
  if (blob.type === 'image/png') {
    return new File([blob], fileName, { type: 'image/png' });
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const largestSide = Math.max(bitmap.width, bitmap.height);

    if (largestSide <= MAX_UPLOAD_SIDE) {
      bitmap.close();
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
    }

    const scale = MAX_UPLOAD_SIDE / largestSide;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2d context unavailable');
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const resized: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', UPLOAD_QUALITY)
    );
    if (!resized) {
      throw new Error('Canvas produced no blob');
    }

    return new File([resized], fileName.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    // A failed optimisation must never block a scan: fall back to the original bytes.
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  }
};

// `name` is needed for blob: URLs on web, whose last segment is an id without an extension
export const uploadAnemiaPhoto = async (token: string, photoUri: string, name?: string) => {
  const fileName = name || photoUri.split('/').pop() || `eye-${Date.now()}.jpg`;
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
    formData.append('ImageData', await downscaleForUpload(blob, fileName));
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
