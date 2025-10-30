const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

if (!mongoUri) {
  console.error('❌ MONGO_URI environment variable not found!');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DATABASE')));
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB...');
console.log('URI starts with:', mongoUri.substring(0, 20) + '...');

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));  // ← YENİ
app.use('/api/words', require('./routes/words'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));