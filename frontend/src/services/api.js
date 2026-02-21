import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : 'https://portfolio-r-gzgf.onrender.com',
  timeout: 50000,
  withCredentials: true,
});

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/api/contact', messageData);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Message sending failed');
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error');
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please try again later.');
    } else {
      throw new Error('Request failed: ' + error.message);
    }
  }
};

export const sendLocation = async (locationData) => {
  try {
    const response = await api.post('/api/location', locationData);
    return response.data;
  } catch (error) {
    console.error('Location tracking error:', error);
    // Don't throw - location tracking is optional
    return null;
  }
};
