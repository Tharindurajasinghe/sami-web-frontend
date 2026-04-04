// src/pages/admin/AdminLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';

export default function AdminLoginPage() {
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { saveSession } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.adminLogin(phone.trim(), password);
      saveSession({ ...user, isAdmin: true }, token);
      navigate('/admin');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck size={30} className="text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-white">{t('adminDashboard')}</h1>
          <p className="text-gray-400 text-sm mt-1">{lang === 'si' ? 'පරිපාලක ප්‍රවේශය' : 'Admin Access Only'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="input-field pl-10" placeholder="Admin phone"/>
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
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '...' : t('loginBtn')}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <button onClick={toggleLang} className="text-sm text-orange-400 font-medium hover:underline">
            {lang === 'en' ? 'සිංහලෙන් කියවන්න' : 'Switch to English'}
          </button>
        </div>
      </div>
    </div>
  );
}
