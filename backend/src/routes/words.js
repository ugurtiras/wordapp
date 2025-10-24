const express = require('express');
const router = express.Router();
const {
  getAllWords,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  getWordsByLevel,
  getWordsByUser
} = require('../controllers/wordController');
const { protect } = require('../middleware/auth');

// Protected routes (authentication gerekir)
router.get('/', protect, getAllWords);
router.get('/level/:level', protect, getWordsByLevel);
router.get('/:id', protect, getWord);
router.post('/', protect, createWord);
router.put('/:id', protect, updateWord);
router.delete('/:id', protect, deleteWord);
router.get('/user/:userId', protect, getWordsByUser);

module.exports = router;
