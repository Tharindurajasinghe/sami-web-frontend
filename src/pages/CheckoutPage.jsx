// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user }  = useAuth();
  const { t, lang } = useLang();
  const navigate  = useNavigate();

  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);
  const [placed,  setPlaced]  = useState(false);

  if (items.length === 0 && !placed) { navigate('/cart'); return null; }

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) { toast.error(t('addressRequired')); return; }
    if (!phone.trim())   { toast.error(t('phoneRequired'));   return; }
    setLoading(true);
    try {
      await orderApi.create({
        items: items.map(i => ({
          itemId: i._id, name: i.name, nameSi: i.nameSi || '',
          price: i.finalPrice, qty: i.qty,
        })),
        total, address: address.trim(), phone: phone.trim(), message: msg.trim(),
      });
      clearCart();
      setPlaced(true);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

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

  return (
    <div className="main-content page-container">
      <h1 className="section-title">{t('checkoutTitle')}</h1>
      <div className="grid md:grid-cols-2 gap-6">

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryAddress')}</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  className="input-field pl-10 resize-none"
                  placeholder={lang === 'si' ? 'ඔබේ ලිපිනය ලියන්න...' : 'Enter your delivery address...'}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
                  className="input-field pl-10 resize-none"
                  placeholder={lang === 'si' ? 'පණිවිඩයක් තිබේ නම්...' : 'Any special instructions...'}/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? '...' : t('placeOrder')}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg text-gray-800 mb-4">{t('orderItems')}</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => {
              const name = lang === 'si' && item.nameSi ? item.nameSi : item.name;
              return (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{name} ×{item.qty}</span>
                  <span className="font-medium text-gray-800 whitespace-nowrap">Rs. {(item.finalPrice * item.qty).toFixed(2)}</span>
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
