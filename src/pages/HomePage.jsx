// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Loader2, ClipboardList, X, MapPin, Phone, Send, Navigation, CheckCheck, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi }      from '../services/api.js';
import { customRequestApi } from '../services/api.js';
import CategoryCard    from '../components/CategoryCard.jsx';
import SeasonalBanner  from '../components/SeasonalBanner.jsx';
import { useLang }     from '../context/LanguageContext.jsx';
import { useAuth }     from '../context/AuthContext.jsx';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const { t, lang } = useLang();
  const { user }    = useAuth();

  // ── custom-list modal state ─────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [sent,      setSent]      = useState(false); // success screen inside modal
  const [name,      setName]      = useState('');
  const [itemList,  setItemList]  = useState('');
  const [address,   setAddress]   = useState('');
  const [phone,     setPhone]     = useState('');
  const [sending,   setSending]   = useState(false);

  // ── Location state ──────────────────────────────────────────────────────
  const [location,   setLocation]   = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError,   setLocError]   = useState('');

  useEffect(() => {
    categoryApi.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openModal = () => {
    // No login required — open directly
    setName('');
    setItemList('');
    setAddress('');
    setPhone('');
    setLocation(null);
    setLocError('');
    setSent(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSent(false);
  };

  // ── GPS ─────────────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (location) return;
    if (!navigator.geolocation) {
      setLocError(
        lang === 'si'
          ? 'ඔබේ දුරකථනය ස්ථාන සේවා සඳහා සහය නොදක්වයි.'
          : 'Your device does not support location services.'
      );
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success(lang === 'si' ? 'ස්ථානය සාර්ථකව ලැබිණ!' : 'Location captured successfully!');
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError(
            lang === 'si'
              ? 'ස්ථාන අවසරය ප්‍රතික්ෂේප කළා. දුරකථනයේ සිටුවම් වලින් ස්ථාන සේවා සක්‍රිය කරන්න.'
              : 'Location permission denied. Please enable location services in your phone settings.'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocError(
            lang === 'si'
              ? 'ස්ථානය හඳුනාගත නොහැකි විය. නැවත උත්සාහ කරන්න.'
              : 'Location unavailable. Please try again.'
          );
        } else {
          setLocError(
            lang === 'si'
              ? 'ස්ථානය ලබාගැනීමේ දෝෂයකි. නැවත උත්සාහ කරන්න.'
              : 'Could not get location. Please try again.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSend = async () => {
    if (!name.trim()) {
      toast.error(lang === 'si' ? 'නම ඇතුළත් කරන්න.' : 'Name is required.');
      return;
    }
    if (!phone.trim()) {
      toast.error(lang === 'si' ? 'දුරකථන අංකය ඇතුළත් කරන්න.' : 'Phone number is required.');
      return;
    }
    if (!itemList.trim()) {
      toast.error(lang === 'si' ? 'ලැයිස්තුව හිස් ය.' : 'Item list cannot be empty.');
      return;
    }
    setSending(true);
    try {
      await customRequestApi.submit(itemList, address, phone, location, name.trim());
      setSent(true);
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
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100 shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardList size={20} className="text-orange-500"/>
                <h2 className="font-bold text-gray-800 text-base">
                  {lang === 'si' ? 'ඔබේ බඩු ලැයිස්තුව' : 'Your Shopping List'}
                </h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20}/>
              </button>
            </div>

            {/* ── Success screen ── */}
            {sent ? (
              <div className="px-5 py-10 text-center flex flex-col items-center gap-3">
                <CheckCircle size={60} className="text-green-500"/>
                <h3 className="font-bold text-gray-800 text-lg">
                  {lang === 'si' ? 'ලැයිස්තුව යවන ලදී!' : 'List Sent Successfully!'}
                </h3>
                <p className="text-sm text-gray-500">
                  {lang === 'si'
                    ? 'ඔබේ ඇණවුම ලැබී ඇත. ඔබේ දුරකථන අංකය භාවිතා කර ලුහුබැදීමේ පිටුවෙන් තත්වය බලන්න.'
                    : 'Your request has been received. Use your phone number on the Track Order page to check the status.'}
                </p>
                <button onClick={closeModal} className="btn-primary mt-2">
                  {lang === 'si' ? 'හරි' : 'OK'}
                </button>
              </div>
            ) : (
              <>
                {/* Modal body */}
                <div className="px-5 py-4 space-y-4 overflow-y-auto">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User size={13} className="inline mr-1 text-gray-400"/>
                      {lang === 'si' ? 'ඔබේ නම *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-field text-sm"
                      placeholder={lang === 'si' ? 'ඔබේ නම...' : 'Your name...'}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone size={13} className="inline mr-1 text-gray-400"/>
                      {lang === 'si' ? 'දුරකථන අංකය *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input-field text-sm"
                      placeholder="0771234567"
                    />
                  </div>

                  {/* Item list textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'si' ? 'බඩු ලැයිස්තුව *' : 'Item List *'}
                    </label>
                    <textarea
                      rows={5}
                      value={itemList}
                      onChange={e => setItemList(e.target.value)}
                      className="input-field resize-none text-sm"
                      placeholder={
                        lang === 'si'
                          ? 'ඔබගේ බඩු ලයිස්තුව මෙහි ඇතුළත් කරන්න.\nඋදා:\n2kg සහල්\nපොල් තෙල් බෝතලය'
                          : 'e.g.\n2kg rice\n1 bottle coconut oil'
                      }
                    />
                    {/* Minimum order warning */}
                    <div className="mt-2 bg-red-50 border border-red-300 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Deliver පහසුකම ලබා ගැනීමට බඩු ලැයිස්තුවේ අවම වටිනාකම රු. 2500/= ට වැඩි විය යුතුය.
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Delivery is available only for orders above Rs. 2500/=
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin size={13} className="inline mr-1 text-gray-400"/>
                      {lang === 'si' ? 'ලිපිනය' : 'Delivery Address'}
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="input-field resize-none text-sm"
                      placeholder={lang === 'si' ? 'ඔබේ ලිපිනය...' : 'Your address...'}
                    />
                  </div>

                  {/* GPS Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'si' ? 'ස්ථානය (අමතර)' : 'Location (optional)'}
                    </label>

                    {location ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border-2 border-green-400 text-green-700 font-semibold text-sm">
                        <CheckCheck size={18} className="shrink-0"/>
                        <span>{lang === 'si' ? 'ස්ථානය සාර්ථකව ලැබිණ!' : 'Location captured!'}</span>
                        <span className="ml-auto text-xs text-green-500 font-normal">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-600 font-semibold text-sm hover:bg-orange-100 hover:border-orange-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {locLoading ? (
                          <>
                            <Loader2 size={18} className="animate-spin shrink-0"/>
                            {lang === 'si' ? 'ස්ථානය ලබාගනිමින්...' : 'Getting location...'}
                          </>
                        ) : (
                          <>
                            <Navigation size={18} className="shrink-0"/>
                            {lang === 'si' ? '📍 මගේ ස්ථානය යොදන්න' : '📍 Share My Location'}
                          </>
                        )}
                      </button>
                    )}

                    {locError && (
                      <p className="mt-2 text-xs text-red-500 leading-relaxed">{locError}</p>
                    )}
                    {!location && !locError && (
                      <p className="mt-1.5 text-xs text-gray-400">
                        {lang === 'si'
                          ? 'ඔබේ නිවසේ ස්ථානය යවන්නෙ නම් ක්ලික් කරන්න.'
                          : 'Tap to share your GPS location to help us find you. Optional.'}
                      </p>
                    )}
                  </div>

                </div>

                {/* Modal footer */}
                <div className="px-5 py-4 border-t border-orange-100 flex gap-3 shrink-0">
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
                  <button onClick={closeModal} className="btn-secondary">
                    {t('cancel')}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}