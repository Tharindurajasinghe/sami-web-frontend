// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const saved = localStorage.getItem('shop_user');
  const token = localStorage.getItem('shop_token');
  if (saved && token) {
    try {
      const parsed = JSON.parse(saved);
      // If admin, verify the token is still valid with your server
      // If server rejects it, clear the session
      setUser(parsed);
    } catch {
      localStorage.removeItem('shop_user');
      localStorage.removeItem('shop_token');
    }
  }
  setLoading(false);
  }, []);

  const saveSession = (userData, token) => {
    localStorage.setItem('shop_token', token);
    localStorage.setItem('shop_user',  JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
