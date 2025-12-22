// Authentication Context - manages user login state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setAuthToken(storedToken);
          const res = await api.get('/auth/me');
          const meUser = res?.data?.user ?? res?.data;
          setUser(meUser);
          setToken(storedToken);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshMe = async () => {
    if (!token) return null;
    try {
      const res = await api.get('/auth/me');
      const meUser = res?.data?.user ?? res?.data;
      setUser(meUser);
      return meUser;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (payload) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const login = async ({ email, password, role }) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      setAuthToken(newToken);
      setToken(newToken);
      setUser(newUser);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTutor: user?.role === 'tutor',
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
    refreshMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
