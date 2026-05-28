import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Session restoration failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.auth.login(credentials);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        profileImage: response.profileImage
      });
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.auth.register(userData);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const isOrganizer = () => user?.role === 'ORGANIZER';
  const isParticipant = () => user?.role === 'PARTICIPANT';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isOrganizer, isParticipant, setUser }}>
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
