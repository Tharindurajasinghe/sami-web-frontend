// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ClipboardList, X, MapPin, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi }      from '../services/api.js';
import { customRequestApi } from '../services/api.js';
import CategoryCard    from '../components/CategoryCard.jsx';
import SeasonalBanner  from '../components/SeasonalBanner.jsx';
import { useLang }     from '../context/LanguageContext.jsx';
import { useAuth }     from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const { t, lang } = useLang();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  // ── custom-list modal state ─────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [itemList,  setItemList]  = useState('');
  const [address,   setAddress]   = useState('');
  const [phone,     setPhone]     = useState('');
  const [sending,   setSending]   = useState(false);

  useEffect(() => {
    categoryApi.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Pre-fill phone when user is known
  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const openModal = () => {
    if (!user) { navigate('/login'); return; }
    setItemList('');
    setAddress('');
    setPhone(user?.phone || '');
    setShowModal(true);
  };

  const handleSend = async () => {
    if (!itemList.trim()) {
      toast.error(lang === 'si' ? 'ලැයිස්තුව හිස් ය.' : 'Item list cannot be empty.');
      return;
    }
    setSending(true);
    try {
      await customRequestApi.submit(itemList, address, phone);
      toast.success(lang === 'si' ? 'ඔබේ ලැයිස්තුව යවන ලදී!' : 'Your list has been sent!');
      setShowModal(false);
      navigate('/track');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="main-content">
      <SeasonalBanner user={user} lang={lang} />

      {/* ── Custom list button ──────────────────────────────────────────────── */}
      <div className="page-container">
        <div className="flex justify-center mb-6">
          <button
            onClick={openModal}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-base shadow-md transition-all"
          >
            <ClipboardList size={22}/>
            <span>
              {lang === 'si'
                ? 'ඔබේ බඩු ලැයිස්තුව ඇතුල් කරන්න'
                : 'Add Your Shopping List'}
            </span>
          </button>
        </div>

        {/* Categories */}
        <h2 className="section-title">{t('categories')}</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="animate-spin text-orange-400"/>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🛒</span>
            <p>{t('noCategories')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => <CategoryCard key={cat._id} category={cat}/>)}
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <ClipboardList size={20} className="text-orange-500"/>
                <h2 className="font-bold text-gray-800 text-base">
                  {lang === 'si' ? 'ඔබේ බඩු ලැයිස්තුව' : 'Your Shopping List'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20}/>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto">

              {/* Item list textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'si' ? 'බඩු ලැයිස්තුව *' : 'Item List *'}
                </label>
                <textarea
                  rows={6}
                  value={itemList}
                  onChange={e => setItemList(e.target.value)}
                  className="input-field resize-none text-sm"
                  placeholder={
                    lang === 'si'
                      ? 'උදා:\n2kg සහල්\n1 පොල් තෙල් බෝතලය\nකිරි පැකට් 3\nපාන් 1'
                      : 'e.g.\n2kg rice\n1 bottle coconut oil\n3 milk packets\n1 bread loaf'
                  }
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={13} className="inline mr-1 text-gray-400"/>
                  {lang === 'si' ? 'ලිපිනය (අමතර)' : 'Delivery Address (optional)'}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-field resize-none text-sm"
                  placeholder={lang === 'si' ? 'ඔබේ ලිපිනය...' : 'Your address...'}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={13} className="inline mr-1 text-gray-400"/>
                  {lang === 'si' ? 'දුරකථන අංකය (අමතර)' : 'Phone Number (optional)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-orange-100 flex gap-3">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Send size={16}/>
                {sending
                  ? (lang === 'si' ? 'යවමින්...' : 'Sending...')
                  : (lang === 'si' ? 'ඇණවුම යවන්න' : 'Send Request')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    
  );
}