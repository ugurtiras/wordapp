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

// Public routes (authentication gerekmez)
router.get('/', getAllWords);
router.get('/level/:level', getWordsByLevel);
router.get('/:id', getWord);

// Protected routes (authentication gerekir)
router.post('/', protect, createWord);
router.put('/:id', protect, updateWord);
router.delete('/:id', protect, deleteWord);
router.get('/user/:userId', protect, getWordsByUser);

module.exports = router;
