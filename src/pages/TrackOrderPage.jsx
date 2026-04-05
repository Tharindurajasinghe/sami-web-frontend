// src/pages/TrackOrderPage.jsx
import { useEffect, useState } from 'react';
import { Loader2, Package, LogIn } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { useLang } from '../context/LanguageContext.jsx';
import OrderStatusBadge from '../components/OrderStatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function TrackOrderPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {           // ← don't call API if not logged in
      setLoading(false);
      return;
    }
    orderApi.getMine()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);              // ← re-run when user changes (login/logout)

  const fmt = (iso) => new Date(iso).toLocaleString(lang === 'si' ? 'si-LK' : 'en-LK');

  // ── Guest view ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="main-content page-container text-center py-20">
        <Package size={60} className="mx-auto mb-4 text-orange-200"/>
        <p className="text-gray-800 font-semibold text-lg mb-1">
          ඇණවුම් ලුහුබැදීමට ලොගින් විය යුතුයි.
        </p>
        <p className="text-gray-500 mb-6">
          To track your order please login to the system.
        </p>
        <Link
          to="/login"
          state={{ from: { pathname: '/track' } }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <LogIn size={16}/> {t('loginBtn')}
        </Link>
      </div>
    );
  }

  // ── Logged-in view ───────────────────────────────────────────────────────
  return (
    <div className="main-content page-container">
      <h1 className="section-title">{t('trackingTitle')}</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={36} className="animate-spin text-orange-400"/>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={60} className="mx-auto mb-3 text-orange-200"/>
          <p>{t('noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5">

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">{t('orderId')}</p>
                  <p className="font-mono text-sm text-gray-700">{order._id}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmt(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status}/>
              </div>

              {/* Items */}
              <div className="bg-orange-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">{t('orderItems')}</p>
                <ul className="space-y-1">
                  {order.items.map((item, i) => {
                    const name = lang === 'si' && item.nameSi ? item.nameSi : item.name;
                    return (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{name} ×{item.qty}</span>
                        <span className="font-medium text-gray-800">Rs. {(item.price * item.qty).toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-orange-200 mt-2 pt-2 flex justify-between font-bold text-orange-700">
                  <span>{t('orderTotal')}</span>
                  <span>Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">{t('deliveryAddr')}:</span> {order.address}</p>
                <p><span className="font-medium">{t('phone')}:</span> {order.phone}</p>
                {order.message && (
                  <p><span className="font-medium">{t('yourMsg')}:</span> {order.message}</p>
                )}
              </div>

              {/* ── Rejection message from admin ── */}
              {order.status === 'rejected' && order.rejectionMsg && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    {lang === 'si' ? 'ප්‍රතික්ෂේප කිරීමේ හේතුව:' : 'Reason for rejection:'}
                  </p>
                  <p className="text-sm text-red-700">{order.rejectionMsg}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
