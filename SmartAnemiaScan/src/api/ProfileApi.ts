import { apiClient } from './apiClient';

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
// Sex is kept as '0' (male) / '1' (female) in the app; the backend serialises the enum by name
const SEX_CODES: Record<string, string> = { Male: '0', Female: '1', '0': '0', '1': '1' };

const normalizeSex = (sex: unknown): string | null =>
  sex === null || sex === undefined ? null : SEX_CODES[String(sex)] ?? null;

/**
 * Fetches user profile and scan history
 * @param token - Authorization Bearer token
 */
export const getProfileInfo = async (token: string): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.get('/Profile/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Since the backend's profile DTO change the fields come flat (`birthday`, `sex: "Female"`)
    // instead of under `profile`; older servers still send the wrapped shape
    const raw = response.data?.profile ?? response.data ?? {};
    return {
      profile: {
        ...raw,
        birthDate: raw.birthDate ?? raw.birthday ?? null,
        sex: normalizeSex(raw.sex),
        anemiaScans: raw.anemiaScans ?? [],
      },
    };
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
  try {
    // The backend enum accepts the numeric value; '0'/'1' strings are not guaranteed to parse
    const body = { ...data, sex: data.sex === undefined || data.sex === null ? data.sex : Number(data.sex) };
    const response = await apiClient.patch('/Profile', body, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Update profile error", error);
    throw error;
  }
};
