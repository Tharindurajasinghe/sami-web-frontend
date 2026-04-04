// src/pages/admin/AdminUsers.jsx
import { useState } from 'react';
import { Search, Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api.js';
import { useLang } from '../../context/LanguageContext.jsx';

export default function AdminUsers() {
  const { t, lang } = useLang();
  const [phone,    setPhone]    = useState('');
  const [found,    setFound]    = useState(null);   // user | false | null
  const [loading,  setLoading]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true); setFound(null);
    try {
      const user = await adminApi.findUser(phone.trim());
      setFound(user);
    } catch (err) {
      if (err.message.toLowerCase().includes('not found')) setFound(false);
      else toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('confirmDelete'))) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(phone.trim());
      toast.success(t('deleted'));
      setFound(null); setPhone('');
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('manageUsers')}</h2>

      <div className="card p-6 max-w-md">
        <h3 className="font-semibold text-gray-700 mb-4">{t('searchUser')}</h3>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="input-field pl-10" placeholder="0771234567"/>
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-4">
            {loading ? '...' : t('search')}
          </button>
        </form>

        {found === false && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl p-3">
            <UserX size={18}/><p className="text-sm font-medium">{t('userNotFound')}</p>
          </div>
        )}

        {found && found.phone && (
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('phoneNumber')}</p>
                <p className="font-semibold text-gray-800">{found.phone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'si' ? 'ලියාපදිංචි:' : 'Registered:'}{' '}
                  {new Date(found.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={handleDelete} disabled={deleting}
                className="btn-danger flex items-center gap-1.5 text-sm">
                <Trash2 size={15}/>{deleting ? '...' : t('deleteUser')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
