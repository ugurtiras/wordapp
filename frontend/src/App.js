import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import './ListEdit.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import WordForm from './components/WordForm';
import { wordService } from './services/api';

// Main App component wrapped with auth logic
const AppContent = () => {
  const [words, setWords] = useState([]);
  const [wordLists, setWordLists] = useState([]); // Kelime listeleri
  const [error, setError] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login');
  
  // States
  const [editingWord, setEditingWord] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState(null);
  
  // Quiz states
  const [currentQuizWord, setCurrentQuizWord] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizWords, setQuizWords] = useState([]);
  
  const { isAuthenticated, loading: authLoading, user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchWords = useCallback(async () => {
    try {
      const response = await wordService.getAllWords();
      setWords(response.data.data);
    } catch (err) {
      setError('Kelimeler yüklenirken hata oluştu');
      console.error(err);
    }
  }, []);

  const fetchWordLists = useCallback(async () => {
    try {
      const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
      const lists = JSON.parse(localStorage.getItem(userKey) || '[]');
      setWordLists(lists);
    } catch (err) {
      console.error('Word lists loading error:', err);
      setWordLists([]);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWords();
      fetchWordLists();
    }
  }, [isAuthenticated, fetchWords, fetchWordLists]);

  const createWordList = (listName, selectedWords = []) => {
    const newList = {
      id: Date.now().toString(),
      name: listName,
      words: selectedWords,
      createdAt: new Date().toISOString(),
      userId: user?.id || user?.name || user?.username
    };
    
    const updatedLists = [...wordLists, newList];
    setWordLists(updatedLists);
    const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
    
    localStorage.setItem(userKey, JSON.stringify(updatedLists));
    navigate('/');
  };

  const handleCreateEmptyList = () => {
    if (newListName.trim()) {
      createWordList(newListName.trim());
      setNewListName('');
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    navigate(`/edit-list/${list.id}`);
  };

  const handleUpdateList = (updatedName) => {
    if (updatedName.trim() && editingList) {
      const updatedLists = wordLists.map(list => 
        list.id === editingList.id 
          ? { ...list, name: updatedName.trim() }
          : list
      );
      setWordLists(updatedLists);
      const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
      localStorage.setItem(userKey, JSON.stringify(updatedLists));
      setEditingList(null);
    }
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Bu listeyi silmek istediğinizden emin misiniz?')) {
      const updatedLists = wordLists.filter(list => list.id !== listId);
      setWordLists(updatedLists);
      const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
      localStorage.setItem(userKey, JSON.stringify(updatedLists));
    }
  };

  const handleRemoveWordFromList = (listId, wordId) => {
    const updatedLists = wordLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          words: list.words.filter(word => word._id !== wordId)
        };
      }
      return list;
    });
    setWordLists(updatedLists);
    
    // editingList state'ini de güncelle
    if (editingList && editingList.id === listId) {
      const updatedEditingList = {
        ...editingList,
        words: editingList.words.filter(word => word._id !== wordId)
      };
      setEditingList(updatedEditingList);
    }
    
    const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
    localStorage.setItem(userKey, JSON.stringify(updatedLists));
  };

  const startQuiz = (list) => {
    setQuizWords(list.words);
    setCurrentQuizWord(0);
    setShowAnswer(false);
    navigate(`/quiz/${list.id}`);
  };

  const nextQuizWord = () => {
    if (currentQuizWord < quizWords.length - 1) {
      setCurrentQuizWord(currentQuizWord + 1);
      setShowAnswer(false);
    } else {
      // Quiz bitti
      navigate('/');
    }
  };

  const prevQuizWord = () => {
    if (currentQuizWord > 0) {
      setCurrentQuizWord(currentQuizWord - 1);
      setShowAnswer(false);
    }
  };

  const handleAddWord = async (newWord) => {
    if (!token) {
      setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newWord)
      });
      
      if (response.ok) {
        const addedWord = await response.json();
        
        // Kelimeler listesini güncelle
        await fetchWords();
        
        // Eğer belirli bir liste için kelime eklendiyse direkt o listeye ekle
        if (newWord.targetListId) {
          const targetList = wordLists.find(list => list.id === newWord.targetListId);
          if (targetList) {
            addWordToList(addedWord.data, targetList);
          }
        }
        
        setEditingWord(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Bilinmeyen hata' }));
        setError(`Kelime eklenirken hata: ${errorData.message || response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Bağlantı hatası. Backend çalışıyor mu kontrol edin.');
    }
  };

  const addWordToList = (word, targetList) => {
    // Kelime zaten listede var mı kontrol et
    const wordExists = targetList.words.some(w => w._id === word._id);
    
    if (!wordExists) {
      const updatedLists = wordLists.map(list => {
        if (list.id === targetList.id) {
          return {
            ...list,
            words: [...list.words, word]
          };
        }
        return list;
      });
      
      setWordLists(updatedLists);
      const userKey = `wordLists_${user?.id || user?.name || user?.username || 'default'}`;
      localStorage.setItem(userKey, JSON.stringify(updatedLists));
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await wordService.deleteWord(id);
      fetchWords();
    } catch (err) {
      setError('Kelime silinirken hata oluştu');
      console.error(err);
    }
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
      <div className="auth-container">
        {showAuthForm === 'login' ? (
          <LoginForm onSwitchToRegister={() => setShowAuthForm('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowAuthForm('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <div className="header-content">
          <div className="user-info-center">
            <p className="welcome-message">
              Merhaba {user?.name || user?.username || 'Kullanıcı'}! 
              Şu ana kadar {words.length} tane kelime öğrendin 🚀
            </p>
          </div>
          <h1 className="app-title-right"> WordApp</h1>
        </div>
        <div className="header-nav">
          <button 
            className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            🏠 Ana Sayfa
          </button>
          <button 
            className={`nav-btn ${location.pathname === '/words' ? 'active' : ''}`}
            onClick={() => navigate('/words')}
          >
            📚 Kelimelerim
          </button>
          <button 
            className="btn-logout"
            onClick={logout}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

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

      <div className="app-layout">
        {/* Sol Sidebar - Listeler */}
        <div className="sidebar">
          <h3>📚 Kelime Listelerin</h3>
          
          <div className="word-lists">
            {wordLists.length === 0 ? (
              <p className="no-lists">Henüz liste oluşturmadın</p>
            ) : (
              wordLists.map(list => (
                <div key={list.id} className="list-item">
                  <div className="list-info">
                    <h4>{list.name}</h4>
                    <span>{list.words.length} kelime</span>
                  </div>
                  
                  <div className="list-actions">
                    <button 
                      className="btn-quiz"
                      onClick={() => startQuiz(list)}
                      title="Quiz Yap"
                    >
                      Quiz Yap
                    </button>
                    <button 
                      className="btn-add-word"
                      onClick={() => {
                        setEditingWord({ 
                          word: '', 
                          meaning: '', 
                          example: '', 
                          level: 'A1',
                          targetListId: list.id
                        });
                      }}
                      title="Kelime Ekle"
                    >
                      Kelime Ekle
                    </button>
                    <button 
                      className="btn-edit-list"
                      onClick={() => handleEditList(list)}
                      title="Liste Düzenle"
                    >
                      Liste Düzenle
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage 
              newListName={newListName}
              setNewListName={setNewListName}
              handleCreateEmptyList={handleCreateEmptyList}
            />} />
            <Route path="/words" element={<WordsPage 
              words={words}
              setEditingWord={setEditingWord}
              handleDeleteWord={handleDeleteWord}
            />} />
            <Route path="/edit-list/:listId" element={<ListEditPage 
              list={editingList}
              words={words}
              onUpdateList={handleUpdateList}
              onDeleteList={handleDeleteList}
              onRemoveWordFromList={handleRemoveWordFromList}
              onAddWordToList={addWordToList}
              onBack={() => navigate('/')}
              setEditingWord={setEditingWord}
            />} />
            <Route path="/quiz/:listId" element={<QuizPage 
              words={quizWords}
              currentIndex={currentQuizWord}
              showAnswer={showAnswer}
              onShowAnswer={setShowAnswer}
              onNext={nextQuizWord}
              onPrev={prevQuizWord}
              onExit={() => {
                navigate('/');
              }}
            />} />
          </Routes>
        </div>
      </div>

      {editingWord && (
        <div className="modal-overlay">
          <WordForm
            onSubmit={handleAddWord}
            editingWord={editingWord}
            onCancel={() => setEditingWord(null)}
          />
        </div>
      )}
    </div>
  );
};

// HomePage Component
const HomePage = ({ newListName, setNewListName, handleCreateEmptyList }) => (
  <div className="home-page">
    <div className="welcome-section">
      <h2>📝 Yeni Liste Oluştur</h2>
      <p>Kelimelerinle yeni bir quiz listesi oluşturun</p>
    </div>

    <div className="create-list-form">
      <input
        type="text"
        placeholder="Liste adı (örn: A1 Kelimeleri)"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && newListName.trim()) {
            handleCreateEmptyList();
          }
        }}
        className="list-name-input"
      />
      <button 
        className="btn btn-primary"
        onClick={handleCreateEmptyList}
        disabled={!newListName.trim()}
      >
        📝 Liste Oluştur
      </button>
    </div>
  </div>
);

// WordsPage Component
const WordsPage = ({ words, setEditingWord, handleDeleteWord }) => (
  <div className="words-page">
    <div className="words-header">
      <h2>📚 Kelimelerim ({words.length})</h2>
      <button 
        className="btn btn-primary"
        onClick={() => setEditingWord({ word: '', meaning: '', example: '', level: 'A1' })}
      >
        ➕ Yeni Kelime Ekle
      </button>
    </div>
    
    <div className="words-grid">
      {words.map(word => (
        <div key={word._id} className={`word-card level-${word.level?.toLowerCase()}`}>
          <div className="word-header">
            <h3>{word.word}</h3>
            <div className="word-actions">
              <span className="level-badge">{word.level}</span>
              <button 
                className="btn-remove"
                onClick={() => handleDeleteWord(word._id)}
                title="Kelimeyi sil"
              >
                🗑️
              </button>
            </div>
          </div>
          <p className="word-meaning">{word.meaning}</p>
          {word.example && (
            <p className="word-example">💬 {word.example}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ListEditPage Component
const ListEditPage = ({ list, words, onUpdateList, onDeleteList, onRemoveWordFromList, onAddWordToList, onBack, setEditingWord }) => {
  const [listName, setListName] = useState(list.name);

  const handleSaveName = () => {
    if (listName.trim() && listName !== list.name) {
      onUpdateList(listName.trim());
    }
  };

  const handleDeleteList = () => {
    if (window.confirm('Bu listeyi silmek istediğinizden emin misiniz?')) {
      onDeleteList(list.id);
      onBack();
    }
  };

  return (
    <div className="list-edit-page">
      <div className="edit-header">
        <button className="btn-back" onClick={onBack}>
          ← Geri
        </button>
        <h2>📝 Liste Düzenle</h2>
      </div>

      {/* Liste Adı Düzenleme */}
      <div className="edit-section">
        <h3>Liste Adı</h3>
        <div className="name-edit">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="list-name-input"
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSaveName}
            disabled={!listName.trim() || listName === list.name}
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Liste İstatistikleri */}
      <div className="edit-section">
        <h3>📊 İstatistikler</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{list.words.length}</span>
            <span className="stat-label">Toplam Kelime</span>
          </div>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
            const count = list.words.filter(w => w.level === level).length;
            return count > 0 ? (
              <div key={level} className="stat-item">
                <span className="stat-number">{count}</span>
                <span className="stat-label">{level}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Listedeki Kelimeler */}
      <div className="edit-section">
        <div className="section-header">
          <h3>📚 Listedeki Kelimeler ({list.words.length})</h3>
        </div>
        <div className="words-list-edit">
          {list.words.length === 0 ? (
            <p className="empty-message">Bu listede henüz kelime yok.</p>
          ) : (
            list.words.map(word => (
              <div key={word._id} className="word-item-edit">
                <div className="word-info">
                  <span className="word-text">{word.word}</span>
                  <span className="word-meaning">{word.meaning}</span>
                  <span className={`level-badge level-${word.level?.toLowerCase()}`}>
                    {word.level}
                  </span>
                </div>
                <button 
                  className="btn-remove"
                  onClick={() => onRemoveWordFromList(list.id, word._id)}
                >
                  🗑️ Kaldır
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kelime Ekleme Bölümü */}
      <div className="edit-section">
        <div className="section-header">
          <h3>➕ Yeni Kelime Ekle</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingWord({ 
                word: '', 
                meaning: '', 
                example: '', 
                level: 'A1',
                targetListId: list.id
              });
            }}
          >
            Yeni Kelime Ekle
          </button>
        </div>
        <p className="section-description">
          Buradan eklediğiniz kelimeler hem bu listeye hem de "Kelimelerim" bölümüne eklenecektir.
        </p>
      </div>

      {/* Tehlikeli İşlemler */}
      <div className="edit-section danger-section">
        <h3>⚠️ Tehlikeli İşlemler</h3>
        <button 
          className="btn btn-danger"
          onClick={handleDeleteList}
        >
          🗑️ Listeyi Sil
        </button>
      </div>
    </div>
  );
};

// QuizPage Component  
const QuizPage = ({ words, currentIndex, showAnswer, onShowAnswer, onNext, onPrev, onExit }) => {
  if (!words || words.length === 0) return null;
  
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;
  const isFirstWord = currentIndex === 0;

  const handleCardFlip = () => {
    onShowAnswer(!showAnswer);
  };

  // Seviye rengini al
  const getLevelColor = (level) => {
    const colors = {
      'A1': '#ef4444', // Kırmızı
      'A2': '#f97316', // Turuncu  
      'B1': '#eab308', // Sarı
      'B2': '#22c55e', // Yeşil
      'C1': '#3b82f6', // Mavi
      'C2': '#8b5cf6'  // Mor
    };
    return colors[level] || '#6b7280';
  };

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <button className="btn btn-secondary" onClick={onExit}>
          ← Çıkış
        </button>
        <div className="quiz-progress">
          Kart {currentIndex + 1} / {words.length}
        </div>
        <div 
          className="quiz-level-indicator"
          style={{ backgroundColor: getLevelColor(currentWord.level) }}
        >
          {currentWord.level}
        </div>
      </div>

      <div className="flashcard-container">
        <div 
          className={`flashcard ${showAnswer ? 'flipped' : ''}`} 
          onClick={handleCardFlip}
          style={{ borderColor: getLevelColor(currentWord.level) }}
        >
          <div className="flashcard-inner">
            {/* Ön Yüz - Kelime */}
            <div 
              className="flashcard-front"
              style={{ background: `linear-gradient(135deg, ${getLevelColor(currentWord.level)} 0%, ${getLevelColor(currentWord.level)}dd 100%)` }}
            >
              <div className="card-content">
                <div className="quiz-level-badge">
                  {currentWord.level}
                </div>
                <div className="card-word">{currentWord.word}</div>
                <div className="card-hint">
                  Kartı çevirmek için tıkla
                </div>
              </div>
            </div>

            {/* Arka Yüz - Anlam */}
            <div 
              className="flashcard-back"
              style={{ background: `linear-gradient(135deg, ${getLevelColor(currentWord.level)} 0%, ${getLevelColor(currentWord.level)}aa 100%)` }}
            >
              <div className="card-content">
                <div className="quiz-level-badge">
                  {currentWord.level}
                </div>
                <div className="card-meaning">{currentWord.meaning}</div>
                {currentWord.example && (
                  <div className="card-example">
                    <span className="example-label">Örnek:</span>
                    <span className="example-text">{currentWord.example}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quiz-controls">
        <button 
          className="btn btn-secondary quiz-nav-btn"
          onClick={onPrev}
          disabled={isFirstWord}
        >
          ← Önceki
        </button>
        
        <button 
          className="btn btn-primary quiz-nav-btn"
          onClick={onNext}
        >
          {isLastWord ? 'Bitir 🏁' : 'Sonraki →'}
        </button>
      </div>
    </div>
  );
};

// Main App component with AuthProvider and Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
