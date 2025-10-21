import React, { useState, useEffect } from 'react';

const WordForm = ({ onSubmit, editingWord, onCancel }) => {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    example: '',
    level: 'A1',
  });

  useEffect(() => {
    if (editingWord) {
      setFormData(editingWord);
    }
  }, [editingWord]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ word: '', meaning: '', example: '', level: 'A1' });
  };

  return (
    <form onSubmit={handleSubmit} className="word-form">
      <h2>{editingWord ? 'Edit Word' : 'Add New Word'}</h2>
      
      <div className="form-group">
        <label>Word (English)</label>
        <input
          type="text"
          name="word"
          value={formData.word}
          onChange={handleChange}
          placeholder="Enter English word"
          required
        />
      </div>

      <div className="form-group">
        <label>Meaning (Turkish)</label>
        <input
          type="text"
          name="meaning"
          value={formData.meaning}
          onChange={handleChange}
          placeholder="Enter Turkish meaning"
          required
        />
      </div>

      <div className="form-group">
        <label>Example Sentence</label>
        <input
          type="text"
          name="example"
          value={formData.example}
          onChange={handleChange}
          placeholder="Enter example sentence"
        />
      </div>

      <div className="form-group">
        <label>Level</label>
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="A1">A1 - Beginner</option>
          <option value="A2">A2 - Elementary</option>
          <option value="B1">B1 - Intermediate</option>
          <option value="B2">B2 - Upper Intermediate</option>
          <option value="C1">C1 - Advanced</option>
          <option value="C2">C2 - Proficient</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {editingWord ? 'Update' : 'Add'} Word
        </button>
        {editingWord && (
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default WordForm;
