import axios from 'axios';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://portfolio-r-gzgf.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 50000,
  withCredentials: true,
});

/* ── Contact form ── */
export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/api/contact', messageData);
    if (response.data.success) return response.data;
    throw new Error(response.data.error || 'Message sending failed');
  } catch (error) {
    if (error.response) throw new Error(error.response.data.error || 'Server error');
    if (error.request) throw new Error('Cannot connect to server. Please try again later.');
    throw new Error('Request failed: ' + error.message);
  }
};

/* ── Chatbot API ── */

/**
 * Create a new chatbot session. Returns { sessionId }.
 */
export const createChatSession = async () => {
  const response = await api.post('/api/chat/session');
  return response.data; // { sessionId }
};

/**
 * Send a message to the chatbot. Returns { answer }.
 */
export const sendChatMessage = async (sessionId, message) => {
  const response = await api.post('/api/chat/message', { sessionId, message });
  return response.data; // { answer }
};

/**
 * Fetch chat history for a session. Returns { messages }.
 */
export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/api/chat/history/${sessionId}`);
  return response.data; // { messages }
};

/**
 * Silently ping the backend (and AI service) to warm up Render cold starts.
 * Fire-and-forget — never throws.
 */
export const wakeBackend = () => {
  api.get('/api/wake', { timeout: 15000 }).catch(() => {});
};
