const Word = require('../models/Word');

exports.getAllWords = async (req, res) => {
  try {
    const words = await Word.find().sort({ createdAt: -1 });
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWord = async (req, res) => {
  try {
    const word = await Word.create(req.body);
    res.status(201).json({ success: true, data: word });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
