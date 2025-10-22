import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Actions
const AuthActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActions.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AuthActions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case AuthActions.CLEAR_ERROR:
      return { ...state, error: null };
    
    case AuthActions.UPDATE_USER:
      return { ...state, user: action.payload };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: AuthActions.LOGIN_SUCCESS,
          payload: { token, user: userData }
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AuthActions.SET_LOADING, payload: false });
      }
    } else {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { token, user }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      
      const response = await authService.register(userData);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { token, user }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    dispatch({ type: AuthActions.LOGOUT });
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: AuthActions.UPDATE_USER, payload: updatedUser });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AuthActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;