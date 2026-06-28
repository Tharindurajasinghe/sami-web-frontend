// src/context/AuthContext.jsx
// Only handles admin authentication. Customers no longer need to log in.
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
        // Only restore admin sessions
        if (parsed?.isAdmin) {
          setUser(parsed);
        } else {
          // Clear any old customer sessions
          localStorage.removeItem('shop_user');
          localStorage.removeItem('shop_token');
        }
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
