import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Match backend port
  timeout: 5000,
});

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/api/contact', messageData);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Message submission failed');
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 
                     error.response.data.details || 
                     'Server error');
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please try again later.');
    } else {
      throw new Error('Request failed: ' + error.message);
    }
  }
};