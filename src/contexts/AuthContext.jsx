import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check loading

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/profile/me/');
          setUser(data);
        } catch (error) {
          console.error("Session expired or invalid token");
          logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/token/', { email, password });
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    const userProfile = await api.get('/profile/me/');
    setUser(userProfile.data);
    return userProfile.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = { user, login, logout, isAuthenticated: !!user };

  // Show a full page loader while checking auth status on page load
  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><LoadingSpinner /></div> : children}
    </AuthContext.Provider>
  );
};