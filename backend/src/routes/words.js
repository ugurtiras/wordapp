const express = require('express');
const router = express.Router();
const { getAllWords, createWord, updateWord, deleteWord } = require('../controllers/wordController');

router.route('/')
  .get(getAllWords)
  .post(createWord);

router.route('/:id')
  .put(updateWord)
  .delete(deleteWord);

module.exports = router;
