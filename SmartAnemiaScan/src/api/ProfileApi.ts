import axios from "axios";

export interface UpdateProfileDto {
  email?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

/**
 * Updates user profile (used for password reset as well)
 * @param token - Authorization Bearer token (required by backend)
 * @param data - Profile update data
 */
export const updateProfile = async (token: string, data: UpdateProfileDto) => {
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
