import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthForm.css';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasLetter: false
  });
  
  const { register, loading, error, clearError } = useAuth();

  const validatePassword = (password) => {
    const validation = {
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password on change
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    if (!validatePassword(formData.password)) {
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      console.log('Registration successful');
    }
  };

  const isFormValid = () => {
    return formData.name && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword &&
           Object.values(passwordValidation).every(Boolean);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Kayıt Ol</h2>
        <p className="auth-subtitle">Kelime öğrenme yolculuğuna başla!</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Ad Soyad</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Adınız Soyadınız"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ornek@email.com"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {formData.password && (
              <div className="password-requirements">
                <div className={`requirement ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                  ✓ En az 6 karakter
                </div>
                <div className={`requirement ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                  ✓ En az bir rakam
                </div>
                <div className={`requirement ${passwordValidation.hasLetter ? 'valid' : 'invalid'}`}>
                  ✓ En az bir harf
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={loading}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="error-text">Şifreler eşleşmiyor</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>
        
        <p className="auth-switch">
          Zaten hesabın var mı?{' '}
          <button 
            className="link-button" 
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;