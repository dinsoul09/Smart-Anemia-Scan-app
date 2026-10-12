import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Access token saved at sign-in/sign-up; null when the user is logged out
export const getAccessToken = async (): Promise<string | null> => {
  const token = Platform.OS === 'web' ? localStorage.getItem('userToken') : await SecureStore.getItemAsync('userToken');
  return token && token !== 'undefined' && token !== 'null' ? token : null;
};
