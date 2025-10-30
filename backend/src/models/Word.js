const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  word: { 
    type: String, 
    required: true,
    trim: true
  },
  meaning: { 
    type: String, 
    required: true,
    trim: true
  },
  example: { 
    type: String,
    trim: true
  },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1' 
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Word', WordSchema);
