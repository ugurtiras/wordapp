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
    
    // editingWord'den targetListId'yi koru
    const dataToSubmit = {
      ...formData,
      ...(editingWord?.targetListId && { targetListId: editingWord.targetListId })
    };
    
    onSubmit(dataToSubmit);
    setFormData({ word: '', meaning: '', example: '', level: 'A1' });
  };

  return (
    <form onSubmit={handleSubmit} className="word-form">
      <h2>{editingWord?.word ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}</h2>
      
      <div className="form-group">
        <label>İngilizce Kelime</label>
        <input
          type="text"
          name="word"
          value={formData.word}
          onChange={handleChange}
          placeholder="İngilizce kelimeyi girin"
          required
        />
      </div>

      <div className="form-group">
        <label>Türkçe Anlamı</label>
        <input
          type="text"
          name="meaning"
          value={formData.meaning}
          onChange={handleChange}
          placeholder="Türkçe anlamını girin"
          required
        />
      </div>

      <div className="form-group">
        <label>Örnek Cümle</label>
        <input
          type="text"
          name="example"
          value={formData.example}
          onChange={handleChange}
          placeholder="Örnek cümle girin"
        />
      </div>

      <div className="form-group">
        <label>Seviye</label>
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="A1">A1 - Başlangıç</option>
          <option value="A2">A2 - Temel</option>
          <option value="B1">B1 - Orta Alt</option>
          <option value="B2">B2 - Orta Üst</option>
          <option value="C1">C1 - İleri</option>
          <option value="C2">C2 - Uzman</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {editingWord?.word ? 'Güncelle' : 'Kelime Ekle'}
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          İptal
        </button>
      </div>
    </form>
  );
};

export default WordForm;
