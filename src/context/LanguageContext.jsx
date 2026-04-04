// src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations/index.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('shop_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('shop_lang', lang);
    document.body.classList.toggle('lang-si', lang === 'si');
  }, [lang]);

  const toggleLang = () => setLang(p => p === 'en' ? 'si' : 'en');
  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
