import axios from 'axios';

export const uploadAnemiaPhoto = async (token: string, photoUri: string) => {
  const fileName = photoUri.split('/').pop() || `eye-${Date.now()}.jpg`;
  const extension = fileName.split('.').pop()?.toLowerCase();

  let fileType = 'image/jpeg';
  if (extension === 'png') {
    fileType = 'image/png';
  }

  const formData = new FormData();

  formData.append('ImageData', {
    uri: photoUri,
    name: fileName,
    type: fileType,
  } as any);

  const response = await axios.post('/Analysis/anemia/prediction', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};