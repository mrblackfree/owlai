import axios from 'axios';

// Fix the API URL by removing '/api' from the end of the base URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';

console.log('API URL:', apiUrl);

export const api = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Setting withCredentials to false to avoid CORS issues
  withCredentials: false,
  timeout: 10000,
});

// Add a request interceptor for debugging purposes
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    // Log errors but don't expose them directly
    console.error('API Error:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to add authorization header to requests
export const addAuthHeader = async (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};