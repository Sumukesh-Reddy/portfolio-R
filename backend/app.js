require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const axios = require('axios');

// Python FastAPI chatbot backend URL
const CHATBOT_API =
  process.env.CHATBOT_API_URL || 'http://localhost:8000';

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
      from: 'Portfolio Contact <onboarding@resend.dev>',
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

/* ─── Chatbot proxy routes ─── */

// Create a new chat session
app.post('/api/chat/session', async (req, res) => {
  try {
    const { data } = await axios.post(`${CHATBOT_API}/api/chat/session`);
    res.json(data);
  } catch (err) {
    console.error('Chatbot session error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

// Send a chat message
app.post('/api/chat/message', async (req, res) => {
  try {
    const { data } = await axios.post(
      `${CHATBOT_API}/api/chat/message`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(data);
  } catch (err) {
    console.error('Chatbot message error:', err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

// Fetch chat history
app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { data } = await axios.get(
      `${CHATBOT_API}/api/chat/history/${req.params.sessionId}`
    );
    res.json(data);
  } catch (err) {
    console.error('Chatbot history error:', err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Chatbot AI backend: ${CHATBOT_API}`);
});
