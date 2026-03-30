import axios from "axios";

const API_URL = 'https://api-anemiascan.ru';
axios.defaults.baseURL = API_URL;

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('/Authorization/sign-in', {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
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