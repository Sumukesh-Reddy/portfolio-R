require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

// MongoDB Connection
mongoose.connect(process.env.REACT_APP_MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes - Simplified
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Contact Route
const Message = require('./models/message');
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = await Message.create({ name, email, message });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Location Route
const Location = require('./models/location');
app.post('/api/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const newLocation = await Location.create({ latitude, longitude });
    res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});