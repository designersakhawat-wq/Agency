import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_ADMIN_USER = {
  name: 'Md Sakhawat Hossain',
  email: 'admin@sakhawat.design',
  role: 'ADMIN',
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sakhawat_admin_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sakhawat_admin_user');
      if (saved) return JSON.parse(saved);
      if (localStorage.getItem('sakhawat_admin_token')) return DEFAULT_ADMIN_USER;
      return null;
    } catch (e) {
      return localStorage.getItem('sakhawat_admin_token') ? DEFAULT_ADMIN_USER : null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me').catch(() => null);
          if (res && res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('sakhawat_admin_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          if (err?.status === 401) {
            console.warn('Session expired:', err.message);
            logout();
          }
        }
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('sakhawat_admin_token', jwtToken);
      localStorage.setItem('sakhawat_admin_user', JSON.stringify(userData || DEFAULT_ADMIN_USER));
      setToken(jwtToken);
      setUser(userData || DEFAULT_ADMIN_USER);
      setLoading(false);
      return userData || DEFAULT_ADMIN_USER;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sakhawat_admin_token');
    localStorage.removeItem('sakhawat_admin_user');
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sakhawat_admin_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isAdmin: true,
        loading: false,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
