require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://sumukesh-portfolio.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your app password (not regular password)
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Contact Route - Send Email
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Email options
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'sumukeshreddy.m23@iiits.in', // Your email where you want to receive messages
      replyTo: email,
      subject: `New Message from ${name} - Portfolio Contact`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Contact Form Submission</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This message was sent from your portfolio website.
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email. Please try again later.' 
    });
  }
});

// Optional: Auto-reply to sender
app.post('/api/contact-with-auto-reply', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Email to yourself
    const adminMailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'sumukeshreddy.m23@iiits.in',
      replyTo: email,
      subject: `New Message from ${name}`,
      html: `<h2>New Message</h2><p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`
    };

    // Auto-reply to sender
    const autoReplyOptions = {
      from: `"Sumukesh Reddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #6366f1;">Thank You for Reaching Out!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting me through my portfolio. I've received your message and will get back to you as soon as possible.</p>
          <p>For your reference, here's a copy of your message:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 4px;">
            ${message}
          </div>
          <p>Best regards,<br>Sumukesh Reddy</p>
        </div>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Location route (if you still want to keep it)
const axios = require('axios');
app.post('/api/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Get location details from coordinates
    const geoResponse = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    
    const address = geoResponse.data.display_name;
    
    // Send location email to yourself
    const mailOptions = {
      from: `"Portfolio Visitor" <${process.env.EMAIL_USER}>`,
      to: 'sumukeshreddy.m23@iiits.in',
      subject: 'New Visitor Location',
      html: `
        <h2>New Visitor Location</h2>
        <p><strong>Coordinates:</strong> ${latitude}, ${longitude}</p>
        <p><strong>Location:</strong> ${address}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="https://www.google.com/maps?q=${latitude},${longitude}">View on Google Maps</a></p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, address });
  } catch (error) {
    console.error('Location error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});