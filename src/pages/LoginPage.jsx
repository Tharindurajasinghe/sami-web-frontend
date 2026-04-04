// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function LoginPage() {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { saveSession } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const { token, user } = await authApi.login(phone.trim(), password);
      saveSession(user, token);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-30 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-bold text-2xl">Dissanayaka City Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('loginTitle')}</h1>
        </div>

        <div className="card p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="input-field pl-10" placeholder="0771234567"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10" placeholder="••••••"/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? '...' : t('loginBtn')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-orange-600 font-semibold hover:underline">{t('registerBtn')}</Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/admin/login" className="text-sm text-gray-500 hover:text-orange-600 flex items-center justify-center gap-1">
            <ShieldCheck size={14}/>{t('adminLogin')}
          </Link>
        </p>
        <div className="text-center mt-3">
          <button onClick={toggleLang} className="text-sm text-orange-600 font-medium hover:underline">
            {lang === 'en' ? 'සිංහලට හරවන්න' : 'Switch to English'}
          </button>
        </div>
      </div>
    </div>
  );
}
