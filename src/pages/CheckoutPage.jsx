// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, CheckCircle, Loader2, Navigation, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user }    = useAuth();
  const { t, lang } = useLang();
  const navigate    = useNavigate();

  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);
  const [placed,  setPlaced]  = useState(false);

  // ── Location state ─────────────────────────────────────────────────────────
  const [location,     setLocation]     = useState(null);  // { lat, lng } or null
  const [locLoading,   setLocLoading]   = useState(false); // spinner while getting GPS
  const [locError,     setLocError]     = useState('');    // error message if denied

  // ── Bug 1 fix: hard auth guard inside the page component ──────────────────
  // App.jsx wraps /checkout in <LoginRequired> which handles the redirect,
  // but this second guard protects against any edge-case where a guest
  // reaches this component directly (e.g. stale render, SSR, direct URL).
  if (!user) {
    navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
    return null;
  }

  // If cart is empty and order has not just been placed, go back to cart
  if (items.length === 0 && !placed) { navigate('/cart'); return null; }

  // ── Get GPS location ───────────────────────────────────────────────────────
  const handleGetLocation = () => {
    // Already got location — button should be disabled, but guard anyway
    if (location) return;

    // Browser doesn't support geolocation
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
      // Success
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success(
          lang === 'si' ? 'ස්ථානය සාර්ථකව ලැබිණ!' : 'Location captured successfully!'
        );
      },
      // Error
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
      // Options — high accuracy, 10 second timeout
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) { toast.error(t('addressRequired')); return; }
    if (!phone.trim())   { toast.error(t('phoneRequired'));   return; }
    setLoading(true);
    try {
      await orderApi.create({
        items: items.map(i => ({
          itemId: i._id,
          name:   i.name,
          nameSi: i.nameSi || '',
          // Calculate final price manually — i.finalPrice is undefined when
          // item comes from localStorage (Mongoose virtuals don't survive JSON)
          price: i.discount > 0
            ? +(i.price - (i.price * i.discount) / 100).toFixed(2)
            : i.price,
          qty: i.qty,
        })),
        total,
        address:  address.trim(),
        phone:    phone.trim(),
        message:  msg.trim(),
        location: location || null,   // ← send GPS coords or null if not shared
      });
      clearCart();
      setPlaced(true);
    } catch (err) {
      // If the token expired mid-session, send the user back to login
      if (err.message === 'Not authenticated' || err.message === 'Invalid or expired token') {
        toast.error('Your session expired. Please log in again.');
        navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
      } else {
        toast.error(err.message);
      }
    } finally { setLoading(false); }
  };

  // ── Order placed success screen ────────────────────────────────────────────
  if (placed) {
    return (
      <div className="main-content page-container text-center py-20">
        <CheckCircle size={70} className="mx-auto text-green-500 mb-4"/>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('orderSuccess')}</h2>
        <p className="text-gray-500 mb-6">
          {lang === 'si' ? 'ඔබේ ඇණවුම ලැබී ඇත. ස්තූතියි!' : 'Your order has been received. Thank you!'}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('/track')} className="btn-primary">{t('trackOrder')}</button>
          <button onClick={() => navigate('/')}      className="btn-secondary">{t('continueShopping')}</button>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────────────────
  return (
    <div className="main-content page-container">
      <h1 className="section-title">{t('checkoutTitle')}</h1>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">

        {/* ── Form ── */}
        <div className="card p-4 md:p-6">
          <form onSubmit={handleOrder} className="space-y-4">

            {/* Delivery address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryAddress')}</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  className="input-field pl-10 resize-none"
                  placeholder={lang === 'si' ? 'ඔබේ ලිපිනය ලියන්න...' : 'Enter your delivery address...'}/>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="input-field pl-10"/>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
                  className="input-field pl-10 resize-none"
                  placeholder={lang === 'si' ? 'පණිවිඩයක් තිබේ නම්...' : 'Any special instructions...'}/>
              </div>
            </div>

            {/* ── GPS Location button ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {lang === 'si' ? 'ස්ථානය (අමතර)' : 'Location (optional)'}
              </label>

              {location ? (
                // ── Success state — button locked, green ──
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border-2 border-green-400 text-green-700 font-semibold text-sm">
                  <CheckCheck size={18} className="shrink-0"/>
                  <span>
                    {lang === 'si' ? 'ස්ථානය සාර්ථකව ලැබිණ!' : 'Location captured!'}
                  </span>
                  <span className="ml-auto text-xs text-green-500 font-normal">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </div>
              ) : (
                // ── Idle / loading state ──
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

              {/* Error message if permission denied or GPS failed */}
              {locError && (
                <p className="mt-2 text-xs text-red-500 leading-relaxed">{locError}</p>
              )}

              {/* Helper text */}
              {!location && !locError && (
                <p className="mt-1.5 text-xs text-gray-400">
                  {lang === 'si'
                    ? 'ඔබ්බේ නිවසේ ස්ථානය යවන්නෙ නම් ක්ලික් කරන්න. නිශ්චිත ලිපිනයක් ඇත්නම් ඉහත ලිව්ව ඇති.'
                    : 'Tap to share your GPS location to help us find you. Optional — only needed if your address is hard to find.'}
                </p>
              )}
            </div>

            {/* Place order button */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-3 py-3">
              {loading ? '...' : t('placeOrder')}
            </button>

          </form>
        </div>

        {/* ── Order summary ── */}
        <div className="card p-4 md:p-6 h-fit">
          <h2 className="font-bold text-base md:text-lg text-gray-800 mb-3">{t('orderItems')}</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => {
              const name = lang === 'si' && item.nameSi ? item.nameSi : item.name;
              const finalPrice = item.discount > 0
                ? +(item.price - (item.price * item.discount) / 100).toFixed(2)
                : item.price;
              return (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{name} x{item.qty}</span>
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    Rs. {(finalPrice * item.qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-orange-100 pt-3 flex justify-between font-bold text-orange-600 text-lg">
            <span>{t('total')}</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
