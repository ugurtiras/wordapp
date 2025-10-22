const Word = require('../models/Word');

exports.getAllWords = async (req, res) => {
  try {
    const words = await Word.find().sort({ createdAt: -1 });
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new word
exports.createWord = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const word = await Word.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Word created successfully',
      data: word
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating word',
      error: error.message
    });
  }
};

exports.updateWord = async (req, res) => {
  try {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!word) return res.status(404).json({ success: false, message: 'Word not found' });
    res.json({ success: true, data: word });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteWord = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.id);
    if (!word) return res.status(404).json({ success: false, message: 'Word not found' });
    res.json({ success: true, message: 'Word deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single word
exports.getWord = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) return res.status(404).json({ success: false, message: 'Word not found' });
    res.json({ success: true, data: word });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get words by level
exports.getWordsByLevel = async (req, res) => {
  try {
    const words = await Word.find({ level: req.params.level }).sort({ createdAt: -1 });
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get words by user
exports.getWordsByUser = async (req, res) => {
  try {
    const words = await Word.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
