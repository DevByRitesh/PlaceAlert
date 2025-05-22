import axios from 'axios';

// Define base URL for API
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://placealert.onrender.com/api' 
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Just remove the token, let the auth context handle the redirect
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Emergency direct MongoDB update
export const emergencyFix = async (collectionName: string, id: string, field: string, value: any) => {
  console.log(`🚨 EMERGENCY FIX: ${collectionName}/${id} field: ${field} = ${value}`);
  
  try {
    const response = await axios.put(`${baseURL}/emergency-fix/${collectionName}/${id}`, {
      field,
      value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Emergency fix response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Emergency fix failed:', error);
    throw error;
  }
};

// Direct round update for applications
export const updateApplicationRound = async (applicationId: string, roundNumber: number) => {
  console.log(`Direct round update: application/${applicationId} round = ${roundNumber}`);
  
  try {
    const response = await api.put(`/applications/${applicationId}/direct-round-update`, {
      currentRound: roundNumber
    });
    
    console.log('Direct round update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Direct round update failed:', error);
    throw error;
  }
};

export default api;
