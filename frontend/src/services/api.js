import axios from 'axios';

const PRIMARY_URL = 'https://portfolio-r-vscy.onrender.com';
const SECONDARY_URL = 'https://portfolio-r-1.onrender.com';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : process.env.REACT_APP_BACKEND_URL || PRIMARY_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
});

// Helper that tries PRIMARY_URL, and if unreachable or 502/404, tries SECONDARY_URL
const requestWithFailover = async (method, path, data = null, config = {}) => {
  try {
    if (method === 'get') return await api.get(path, config);
    return await api.post(path, data, config);
  } catch (err) {
    if (process.env.NODE_ENV === 'production' && (!err.response || err.response.status >= 500 || err.response.status === 404)) {
      try {
        const altUrl = api.defaults.baseURL === PRIMARY_URL ? SECONDARY_URL : PRIMARY_URL;
        console.warn(`Backend at ${api.defaults.baseURL} unreachable, trying ${altUrl}...`);
        const altApi = axios.create({ baseURL: altUrl, timeout: 30000, withCredentials: true });
        if (method === 'get') return await altApi.get(path, config);
        return await altApi.post(path, data, config);
      } catch (altErr) {
        throw err;
      }
    }
    throw err;
  }
};

/* ── Contact form ── */
export const sendMessage = async (messageData) => {
  try {
    const response = await requestWithFailover('post', '/api/contact', messageData);
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
 * NEVER throws - guarantees chatbot opens without red errors.
 */
export const createChatSession = async () => {
  try {
    const response = await requestWithFailover('post', '/api/chat/session');
    if (response.data?.sessionId) {
      return response.data;
    }
  } catch (error) {
    console.warn('Session init warning (using client fallback session):', error.message);
  }
  // Local fallback session: ensures chatbot is always interactive immediately
  const localId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  return { sessionId: localId, isFallback: true };
};

/**
 * Send a message to the chatbot. Returns { answer }.
 */
export const sendChatMessage = async (sessionId, message, retries = 1) => {
  try {
    const response = await requestWithFailover('post', '/api/chat/message', { sessionId, message });
    return response.data; // { answer }
  } catch (error) {
    if (error.response?.status === 502 && retries > 0) {
      console.warn(`Server waking up, retrying send message... (${retries} left)`);
      await new Promise(r => setTimeout(r, 2000));
      return sendChatMessage(sessionId, message, retries - 1);
    }

    // Friendly fallback response answering about Sumukesh if network/backend is offline
    const q = (message || '').toLowerCase();
    let fallbackText = "I'm Sumukesh's AI assistant. Sumukesh is a B.Tech CSE student at IIIT Sri City skilled in Full Stack Development (React, Node.js, Express, MongoDB) and AI (Gemini, LangChain). Feel free to ask about his **projects** (ORBIT AI, ShelterSeek, VachoLink), **skills**, **education**, or **contact info**!";

    if (q.includes('education') || q.includes('college') || q.includes('degree')) {
      fallbackText = "Sumukesh is pursuing his **B.Tech in Computer Science and Engineering (CSE)** at **IIIT Sri City** (2023–2027), with a strong foundation in Data Structures, Algorithms, and Full-Stack Engineering.";
    } else if (q.includes('project') || q.includes('built')) {
      fallbackText = "Key projects built by Sumukesh:\n• **ORBIT AI**: Enterprise RAG knowledge assistant (FastAPI, LangChain, Gemini)\n• **Plum OPD AI**: Automated medical claim adjudication tool (Gemini, OCR, React)\n• **ShelterSeek**: Full-stack hotel booking platform (Node.js, Express, MongoDB)\n• **VachoLink**: Real-time chat application with live status (React, Socket.io)";
    } else if (q.includes('skill') || q.includes('tech')) {
      fallbackText = "Sumukesh's core skills:\n• **Languages**: Core Java, Python, C, JavaScript, SQL\n• **Web**: React, Node.js, Express, HTML/CSS, Socket.IO\n• **Databases**: MongoDB, MySQL\n• **AI**: Machine Learning, NLP, Gemini API, LangChain";
    } else if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
      fallbackText = "You can contact Sumukesh at **sumukeshreddy.m23@iiits.in** or **sumukeshmopuram1@gmail.com**, phone: **+91-8790787664**, or via the contact form on this page.";
    }

    return { answer: fallbackText, isFallback: true };
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
