import axios from "axios";

export enum Sex {
  Male = 0,
  Female = 1,
}

export interface AnemiaScan {
  id: string;
  analysisId: string | null;
  userId: string | null;
  scanDate: string;
  hemoglobinLevel: number | null;
  isAnemic: boolean;
  createdAt: string;
  updatedAt: string;
  confidence: number;
  imageType: string;
  imageGridFsId: {
    timestamp: number;
    creationTime: string;
  };
  imageSystemId: string | null;
  modelVersion: string | null;
}

export interface ProfileInfo {
  id: string;
  email: string | null;
  fullName: string | null;
  birthDate: string | null;
  sex?: string | null;
  age?: number | null;
  createdAt: string;
  updatedAt: string;
  anemiaScans: AnemiaScan[];
}

export interface ProfileResponse {
  profile: ProfileInfo;
}

export interface UpdateProfileDto {
  email?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  sex?: string | null;
  age?: number | null;
  password?: string | null;
  confirmPassword?: string | null;
}

/**
 * Fetches user profile and scan history
 * @param token - Authorization Bearer token
 */
export const getProfileInfo = async (token: string): Promise<ProfileResponse> => {
  const API_URL = 'https://api-anemiascan.ru';
  axios.defaults.baseURL = API_URL;
  try {
    const response = await axios.get('/Profile/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Fetch profile error", error);
    throw error;
  }
};

/**
 * Updates user profile (used for password reset as well)
 * @param token - Authorization Bearer token (required by backend)
 * @param data - Profile update data
 */
export const updateProfile = async (token: string, data: UpdateProfileDto) => {
  const API_URL = 'https://api-anemiascan.ru';
  axios.defaults.baseURL = API_URL;
  try {
    const response = await axios.patch('/Profile', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Update profile error", error);
    throw error;
  }
};
