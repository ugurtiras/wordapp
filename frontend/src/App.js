import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Header from './components/Header';
import WordForm from './components/WordForm';
import WordList from './components/WordList';
import { wordService } from './services/api';

// Main App component wrapped with auth logic
const AppContent = () => {
  const [words, setWords] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login'); // 'login' or 'register'
  
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWords();
    }
  }, [isAuthenticated]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordService.getAllWords();
      setWords(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Kelimeler yüklenirken hata oluştu');
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
      setError('Kelime kaydedilirken hata oluştu');
      console.error(err);
    }
  };

  const handleDeleteWord = async (id) => {
    if (window.confirm('Bu kelimeyi silmek istediğinizden emin misiniz?')) {
      try {
        await wordService.deleteWord(id);
        fetchWords();
      } catch (err) {
        setError('Kelime silinirken hata oluştu');
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

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">🔄</div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="App">
        {showAuthForm === 'login' ? (
          <LoginForm onSwitchToRegister={() => setShowAuthForm('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowAuthForm('login')} />
        )}
      </div>
    );
  }

  // Main app content for authenticated users
  return (
    <div className="App">
      <Header />

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="error-close" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="app-container">
        <div className="welcome-section">
          <h2>🎯 Bugün hangi kelimeleri öğreneceksin?</h2>
          <p>Kelime dağarcığını genişletmeye devam et!</p>
        </div>

        <div className="form-section">
          <WordForm
            onSubmit={handleAddWord}
            editingWord={editingWord}
            onCancel={handleCancelEdit}
          />
        </div>

        <div className="list-section">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner">🔄</div>
              <p>Kelimeler yükleniyor...</p>
            </div>
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
};

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
