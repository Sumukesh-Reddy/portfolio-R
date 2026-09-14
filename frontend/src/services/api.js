import axios from 'axios';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : process.env.REACT_APP_BACKEND_URL || 'https://portfolio-r-1.onrender.com';

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
export const createChatSession = async (retries = 3) => {
  try {
    const response = await api.post('/api/chat/session');
    return response.data; // { sessionId }
  } catch (error) {
    // Only retry on 502 (server waking up on Render), NEVER on 429 (rate limit) or 4xx
    if (error.response?.status === 502 && retries > 0) {
      console.warn(`Server waking up, retrying session init... (${retries} left)`);
      await new Promise(r => setTimeout(r, 3000));
      return createChatSession(retries - 1);
    }
    
    const message =
      error.response?.data?.error ||
      (error.response?.status === 429
        ? 'AI service rate limit reached or quota exhausted. Please try again shortly.'
        : 'Could not connect to AI. Please try again later.');
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.response = error.response;
    throw customError;
  }
};

/**
 * Send a message to the chatbot. Returns { answer }.
 */
export const sendChatMessage = async (sessionId, message, retries = 2) => {
  try {
    const response = await api.post('/api/chat/message', { sessionId, message });
    return response.data; // { answer }
  } catch (error) {
    // Only retry on 502 (server waking up), NEVER on 429
    if (error.response?.status === 502 && retries > 0) {
      console.warn(`Server waking up, retrying send message... (${retries} left)`);
      await new Promise(r => setTimeout(r, 3000));
      return sendChatMessage(sessionId, message, retries - 1);
    }

    const messageText =
      error.response?.data?.error ||
      (error.response?.status === 429
        ? 'AI rate limit reached. Please wait a moment before sending another message.'
        : 'Failed to get a response from AI.');
    const customError = new Error(messageText);
    customError.status = error.response?.status;
    customError.response = error.response;
    throw customError;
  }
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

/* ── Admin Dashboard API ── */

export const requestAdminOtp = async (email) => {
  const response = await api.post('/api/admin/request-otp', { email });
  return response.data;
};

export const verifyAdminOtp = async (email, otp) => {
  const response = await api.post('/api/admin/verify-otp', { email, otp });
  return response.data;
};

export const getAllSessions = async (token) => {
  const response = await api.get('/api/admin/sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
