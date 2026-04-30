import axios from "axios";

const API_URL = 'https://api-anemiascan.ru';
axios.defaults.baseURL = API_URL;

interface LoginResponse {
  tokenRecord: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginError {
  description: string;
}

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post<LoginResponse>('/Authorization/sign-in', {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

export const sendEmailCode = async (email: string) => {
  try {
    const response = await axios.post('/Authorization/email/send-code', {
      email: email
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error("Send code error", error);
    throw error;
  }
};

export interface VerifyRegistrationData {
  email: string;
  birthDate: string | null;
  password: string;
  confirmPassword: string;
}

export const verifyRegistration = async (data: VerifyRegistrationData): Promise<void> => {
  // Throws on 400 / 409 — caller handles error display
  await axios.post('/Authorization/email/verify-registration/', data, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export interface SignUpData {
  email: string;
  emailCode: string;
  fullName: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export const signUpUser = async (data: SignUpData) => {
  try {
    const response = await axios.post('/Authorization/sign-up', data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Sign up error", error);
    throw error;
  }
};

export const verifyRecoveryCode = async (email: string, code: string) => {
  try {
    const response = await axios.post('/Authorization/verification-code', {
      email,
      code
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error("Verify code error", error);
    throw error;
  }
};

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post('/Authorization/update-password', data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Reset password error", error);
    throw error;
  }
};

export const signOut = async (token: string): Promise<void> => {
  try {
    await axios.post('/Authorization/sign-out', null, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Silently ignore — we still clear local token regardless
    console.warn('Sign-out API call failed (will still clear local token):', error);
  }
};