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
    // Если CORS блокирует, сюда даже не придет вменяемый error.response
    console.error("CORS or Network error", error);
    throw error;
  }
};