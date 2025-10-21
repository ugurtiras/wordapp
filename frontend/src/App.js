import React, { useState, useEffect } from 'react';
import './App.css';
import WordForm from './components/WordForm';
import WordList from './components/WordList';
import { wordService } from './services/api';

function App() {
  const [words, setWords] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordService.getAllWords();
      setWords(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch words. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (wordData) => {
    try {
      if (editingWord) {
        await wordService.updateWord(editingWord._id, wordData);
        setEditingWord(null);
      } else {
        await wordService.createWord(wordData);
      }
      fetchWords();
    } catch (err) {
      setError('Failed to save word');
      console.error(err);
    }
  };

  const handleDeleteWord = async (id) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      try {
        await wordService.deleteWord(id);
        fetchWords();
      } catch (err) {
        setError('Failed to delete word');
        console.error(err);
      }
    }
  };

  const handleEditWord = (word) => {
    setEditingWord(word);
  };

  const handleCancelEdit = () => {
    setEditingWord(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Word Learning App</h1>
        <p>Master new words every day</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="app-container">
        <div className="form-section">
          <WordForm
            onSubmit={handleAddWord}
            editingWord={editingWord}
            onCancel={handleCancelEdit}
          />
        </div>

        <div className="list-section">
          {loading ? (
            <div className="loading">Loading words...</div>
          ) : (
            <WordList
              words={words}
              onDelete={handleDeleteWord}
              onEdit={handleEditWord}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
