// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Helper — calculate final price from plain object (localStorage loses virtuals)
function calcFinalPrice(item) {
  if (item.discount > 0) {
    return +(item.price - (item.price * item.discount) / 100).toFixed(2);
  }
  return item.price;
}

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="main-content page-container text-center py-20">
        <ShoppingBag size={60} className="mx-auto text-orange-200 mb-4"/>
        <p className="text-gray-400 text-lg mb-6">{t('emptyCart')}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('continueShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="main-content page-container">
      {/* Delivery info notice */}
<div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-sm text-gray-700 space-y-1">
  <h2>{t('Conditiontitile')}</h2>
  <p>📍 {t('con1')}</p>
  <p>💵 {t('con2')}</p>
  <p>🛵 {t('con3')}</p>
  <p>➕ {t('con4')}</p>
  <p>🛒 {t('con5')}</p>
</div>
      <h1 className="section-title">{t('yourCart')}</h1>

      {/* On mobile: stack vertically. On desktop: 3-col grid */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">

        {/* Items list */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => {
            const name       = lang === 'si' && item.nameSi ? item.nameSi : item.name;
            const finalPrice = calcFinalPrice(item);
            return (
              <div key={item._id} className="card p-3 md:p-4 flex gap-3 md:gap-4">

                {/* Thumbnail */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={name} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{"📦"}</div>}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm md:text-base leading-tight truncate">
                    {name}
                  </p>
                  <p className="text-orange-600 font-bold text-sm md:text-base mt-0.5">
                    Rs. {finalPrice.toFixed(2)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 active:scale-95 transition-all">
                      <Minus size={14}/>
                    </button>
                    <span className="font-semibold text-sm w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 active:scale-95 transition-all">
                      <Plus size={14}/>
                    </button>
                    {/* Subtotal inline */}
                    <span className="ml-2 text-xs text-gray-400">
                      = Rs. {(finalPrice * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-red-400 hover:text-red-600 self-start p-1 flex-shrink-0">
                  <Trash2 size={18}/>
                </button>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        {/* Mobile: normal flow below items. Desktop: sticky sidebar */}
        <div className="card p-4 md:p-5 h-fit md:sticky md:top-20">
          <h2 className="font-bold text-base md:text-lg text-gray-800 mb-3">{t('total')}</h2>

          {/* Item breakdown */}
          <div className="space-y-1.5 mb-3">
            {items.map(item => {
              const name       = lang === 'si' && item.nameSi ? item.nameSi : item.name;
              const finalPrice = calcFinalPrice(item);
              return (
                <div key={item._id} className="flex justify-between text-xs md:text-sm text-gray-600">
                  <span className="truncate mr-2">{name} x{item.qty}</span>
                  <span className="font-medium whitespace-nowrap">
                    Rs. {(finalPrice * item.qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grand total */}
          <div className="border-t border-orange-100 pt-3 flex justify-between font-bold text-gray-800 text-base md:text-lg mb-4">
            <span>{t('total')}</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
          <div><p className="text-xs p-2 text-gray-500 mt-1">* {t('del')}</p></div>
          

          {/* Checkout — login required */}
          {user ? (
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3">
              {t('checkout')}
            </button>
          ) : (
            <div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 text-center">
                <p className="text-sm text-gray-700 font-medium mb-0.5">
                  ඇණවුම දැමීම සදහා ලොගින් විය යුතුය.
                </p>
                <p className="text-xs text-gray-500">
                  To checkout you should be login to the system.
                </p>
              </div>
              <Link
                to="/login"
                state={{ from: { pathname: '/checkout' } }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <LogIn size={16}/> {t('loginBtn')}
              </Link>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="btn-secondary w-full mt-2">
            {t('continueShopping')}
          </button>
        </div>

      </div>
    </div>
  );
}
