import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="app-title">📚 WordApp</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">👋 Merhaba, {user?.name}</span>
            <div className="user-stats">
              <span className="word-count">Kelime: {user?.totalWords || 0}</span>
              <span className="user-level">Seviye: {user?.level || 'A1'}</span>
            </div>
          </div>
          
          <button 
            className="logout-button"
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            🚪 Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;