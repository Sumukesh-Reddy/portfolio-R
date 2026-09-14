require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const axios = require('axios');
const crypto = require('crypto');

// In-memory store for simple OTP auth
const otpStore = new Map(); // email -> { otp, expires }
const sessionStore = new Set(); // valid tokens
const ADMIN_EMAIL = 'sumukeshmopuram1@gmail.com';

const CHATBOT_API =
  process.env.CHATBOT_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://portfolio-r-1.onrender.com'
    : 'http://localhost:8000');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://sumukesh-portfolio.vercel.app',
    'http://localhost:3000',
    'https://www.sumukesh.app',
    'https://sumukesh.app'
  ],
  credentials: true
}));

app.use(express.json());

// Validate required env vars
if (!process.env.RESEND_API_KEY) {
  console.warn('\n================================================================');
  console.warn('WARNING: RESEND_API_KEY environment variable is not set.');
  console.warn('Contact form emails will fail until this is configured.');
  console.warn('Get your API key from https://resend.com');
  console.warn('================================================================\n');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Contact route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'portfolio <onboarding@sumukesh.app>',
      to: ['sumukeshmopuram1@gmail.com'],
      replyTo: email,
      subject: `New Message from ${name} - Portfolio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📬 New Portfolio Contact</h2>
          </div>
          <div style="background: #f8fafc; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 80px; vertical-align: top;">NAME</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 13px; vertical-align: top;">EMAIL</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-size: 15px;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 13px; vertical-align: top;">MESSAGE</td>
                <td style="padding: 10px 0;">
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #334155; font-size: 15px; line-height: 1.6;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <a href="mailto:${email}?subject=Re: Your Portfolio Message" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #fff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                Reply to ${name} →
              </a>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again.'
      });
    }

    console.log('Email sent via Resend, id:', data.id);
    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Contact route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again.'
    });
  }
});

/* ─── Wake-up ping (warms Render free-tier cold start) ─── */
app.get('/api/wake', async (req, res) => {
  try {
    await axios.get(`${CHATBOT_API}/`, { timeout: 10000 });
    res.json({ status: 'awake' });
  } catch (err) {
    // Still respond OK – the ping was sent; AI may just be starting up
    res.json({ status: 'waking' });
  }
});

/* ─── Admin Dashboard Routes ─── */

app.post('/api/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== ADMIN_EMAIL) {
      // Fake success to prevent enumeration
      return res.json({ success: true });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    const { error } = await resend.emails.send({
      from: 'portfolio <onboarding@sumukesh.app>',
      to: [ADMIN_EMAIL],
      subject: `Admin Login OTP - Portfolio`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>Admin Login</h2>
              <p>Your one-time password is: <strong style="font-size: 24px;">${otp}</strong></p>
              <p>It expires in 10 minutes.</p>
             </div>`
    });

    if (error) {
      console.error('Failed to send OTP:', error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  
  otpStore.delete(email);

  const token = crypto.randomBytes(32).toString('hex');
  sessionStore.add(token);

  res.json({ token });
});

app.get('/api/admin/sessions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (!sessionStore.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data } = await axios.get(`${CHATBOT_API}/api/admin/sessions`);
    res.json(data);
  } catch (err) {
    console.error('Admin sessions proxy error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

/* ─── Chatbot proxy routes ─── */

// High-speed in-memory cache for queries
const responseCache = new Map(); // normalizedQuery -> answer
const MAX_CACHE_SIZE = 100;

const getCachedAnswer = (query) => {
  const key = (query || '').trim().toLowerCase();
  return responseCache.get(key);
};

const setCachedAnswer = (query, answer) => {
  const key = (query || '').trim().toLowerCase();
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, answer);
};

// Check for instant fast-path matches (returns in <5ms without waiting for upstream network)
const getFastPathAnswer = (message) => {
  const q = (message || '').trim().toLowerCase();

  // Instant response for Education chip / questions
  if (q === "tell me about sumukesh's education" || q === "education" || q.includes("where did he study") || q.includes("degree")) {
    return "Sumukesh is currently pursuing his **B.Tech in Computer Science and Engineering (CSE)** at **IIIT Sri City** (2023–2027).\n\n" +
      "• **Degree**: B.Tech in CSE, IIIT Sri City (2023–2027)\n" +
      "• **Intermediate (MPC)**: Sri Chaitanya Junior College (2023)\n" +
      "• **Core Focus**: Data Structures & Algorithms, Full-Stack Web Development, and Applied AI.";
  }

  // Instant response for Projects chip / questions
  if (q === "what projects has sumukesh built?" || q === "projects" || q.includes("what projects") || q.includes("show me his projects")) {
    return "Here are some of the key projects Sumukesh has built:\n\n" +
      "1. **ORBIT AI – Enterprise Knowledge Assistant**\n" +
      "   • Conversational RAG assistant using LangChain, FastAPI, and Gemini API for document search with source citations.\n\n" +
      "2. **Plum OPD Claim Adjudication Tool**\n" +
      "   • Automated insurance claim adjudication system utilizing Gemini API & OCR for medical document processing.\n\n" +
      "3. **ShelterSeek**\n" +
      "   • Full-stack hotel booking platform with real-time room tracking and role-based host/admin dashboards (Node.js, Express, MongoDB).\n\n" +
      "4. **VachoLink**\n" +
      "   • Modern real-time chat application with live status indicators and socket connections (React, Socket.io).\n\n" +
      "5. **Sorting Algorithm Visualizer** & **Task Management TODO App**.";
  }

  // Instant response for Skills chip / questions
  if (q === "what are sumukesh's technical skills?" || q === "skills" || q.includes("what skills") || q.includes("tech stack")) {
    return "Sumukesh's technical skillset includes:\n\n" +
      "• **Languages**: Core Java (90%), C (85%), Python (75%), JavaScript (80%), SQL (70%)\n" +
      "• **Web Development**: React, Node.js, Express, HTML5/CSS3, Socket.IO, SpringBoot\n" +
      "• **Databases**: MongoDB, MySQL\n" +
      "• **AI & ML**: Machine Learning, NLP, Neural Networks, LangChain, Gemini API\n" +
      "• **Tools**: Git, Docker, Render, VS Code, TensorFlow, Pandas/NumPy";
  }

  // Instant response for Contact chip / questions
  if (q === "how can i contact sumukesh?" || q === "contact" || q.includes("contact sumukesh") || q.includes("email him")) {
    return "You can get in touch with Sumukesh directly:\n\n" +
      "• **Email**: [sumukeshreddy.m23@iiits.in](mailto:sumukeshreddy.m23@iiits.in) or [sumukeshmopuram1@gmail.com](mailto:sumukeshmopuram1@gmail.com)\n" +
      "• **Phone**: +91-8790787664\n" +
      "• **LinkedIn & GitHub**: Links available in the header and footer\n" +
      "• You can also use the **Contact Form** right below on this page to send a direct message!";
  }

  // Instant response for Achievements chip / questions
  if (q === "what are sumukesh's key achievements?" || q === "achievements" || q.includes("key achievements")) {
    return "Sumukesh's key achievements and activities:\n\n" +
      "• Active problem solver and competitor on **LeetCode** and **Codeforces**.\n" +
      "• Coursera professional certifications in Full-Stack Web Development, Java, and Machine Learning.\n" +
      "• Developed production-grade AI applications like ORBIT AI and full-stack platforms like ShelterSeek.";
  }

  // Instant response for Greetings
  if (q === "hi" || q === "hello" || q === "hey" || q === "who are you") {
    return "Hello! I am **Sumukesh's AI Assistant**. Ask me anything about his **projects**, **technical skills**, **education**, or **contact details**!";
  }

  return null;
};

// Fallback knowledge base answering other questions about Sumukesh
const getFallbackAnswer = (message) => {
  const fast = getFastPathAnswer(message);
  if (fast) return fast;

  const q = (message || '').toLowerCase();
  if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('study') || q.includes('school') || q.includes('iiit')) {
    return "Sumukesh is pursuing his **B.Tech in Computer Science and Engineering (CSE)** at **IIIT Sri City** (2023–2027).\n\n" +
      "• **Degree**: B.Tech in CSE, IIIT Sri City (2023–2027)\n" +
      "• **Intermediate (MPC)**: Sri Chaitanya Junior College (2023)\n" +
      "• Strong foundation in Data Structures, Algorithms, OOPs, and Operating Systems.";
  }
  
  if (q.includes('project') || q.includes('built') || q.includes('work') || q.includes('app') || q.includes('portfolio')) {
    return "Here are key projects built by Sumukesh:\n" +
      "• **ORBIT AI**: RAG enterprise knowledge assistant (FastAPI, LangChain, Gemini)\n" +
      "• **Plum OPD AI**: Automated claims adjudication with Gemini & OCR\n" +
      "• **ShelterSeek**: Full-stack hotel booking platform (Node.js, Express, MongoDB)\n" +
      "• **VachoLink**: Real-time chat application with live status (React, Socket.io)";
  }
  
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('tool')) {
    return "Sumukesh's core skillset:\n" +
      "• **Languages**: Core Java, Python, C, JavaScript, SQL\n" +
      "• **Web**: React, Node.js, Express, HTML5/CSS3, Socket.IO\n" +
      "• **Databases**: MongoDB, MySQL\n" +
      "• **AI & ML**: LangChain, Gemini API, NLP, Machine Learning";
  }
  
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('hire') || q.includes('message')) {
    return "Contact Sumukesh at **sumukeshreddy.m23@iiits.in** or **sumukeshmopuram1@gmail.com**, phone: **+91-8790787664**, or use the Contact Form below.";
  }

  return "I'm Sumukesh's AI assistant! Sumukesh is a CSE student at IIIT Sri City skilled in Full Stack Web Development (React, Node.js, MongoDB) and AI (Gemini, LangChain). Feel free to ask about his **projects**, **skills**, **education**, or **contact info**!";
};

// Create a new chat session - NEVER fails, ensures chatbot always opens!
app.post('/api/chat/session', async (req, res) => {
  try {
    const { data } = await axios.post(`${CHATBOT_API}/api/chat/session`, {}, { timeout: 4000 });
    if (data && data.sessionId) {
      return res.json(data);
    }
  } catch (err) {
    console.warn(`Upstream AI session init (${CHATBOT_API}) failed [HTTP ${err.response?.status || err.message}]. Using local session.`);
  }

  // Graceful session creation: Never show an error banner to user on chat open!
  const localSessionId = 'session_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
  res.json({ sessionId: localSessionId, isFallback: true });
});

// Send a chat message with fast-path & in-memory cache
app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message } = req.body;

  // 1. Check instant fast-path (<5ms)
  const fastAnswer = getFastPathAnswer(message);
  if (fastAnswer) {
    return res.json({ answer: fastAnswer, isFastPath: true });
  }

  // 2. Check in-memory cache (<5ms)
  const cached = getCachedAnswer(message);
  if (cached) {
    return res.json({ answer: cached, isCached: true });
  }

  // 3. Query upstream AI service with a tight 8s timeout to avoid slow hangs
  try {
    const { data } = await axios.post(
      `${CHATBOT_API}/api/chat/message`,
      req.body,
      { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    if (data && data.answer) {
      setCachedAnswer(message, data.answer);
      return res.json(data);
    }
  } catch (err) {
    console.warn(`Upstream AI message failed [HTTP ${err.response?.status || err.message}]. Using instant portfolio fallback.`);
  }

  // 4. Return intelligent fallback if upstream AI is slow or rate-limited
  const answer = getFallbackAnswer(message);
  setCachedAnswer(message, answer);
  res.json({ answer, isFallback: true });
});

// Fetch chat history
app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { data } = await axios.get(
      `${CHATBOT_API}/api/chat/history/${req.params.sessionId}`,
      { timeout: 8000 }
    );
    res.json(data);
  } catch (err) {
    res.json({ messages: [] });
  }
});

const alive = setInterval(async () => {
  try {
    // Ping Python AI service using configured CHATBOT_API
    await axios.get(`${CHATBOT_API}/api/wakeup`, { timeout: 10000 });
    console.log('Pinged AI service to keep it awake');

    // Ping Node backend itself
    const nodeUrl = process.env.NODE_BACKEND_URL || 'https://portfolio-r-vscy.onrender.com';
    await axios.get(`${nodeUrl}/api/wake`, { timeout: 10000 });
    console.log('Pinged Node backend to keep it awake');
  } catch (err) {
    console.error('Failed to ping services:', err.message);
  }
}, 5 * 60 * 1000); // every 5 minutes

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Chatbot AI backend: ${CHATBOT_API}`);
});
