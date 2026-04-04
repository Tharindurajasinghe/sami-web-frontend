// src/pages/TrackOrderPage.jsx
import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { useLang } from '../context/LanguageContext.jsx';
import OrderStatusBadge from '../components/OrderStatusBadge.jsx';

export default function TrackOrderPage() {
  const { t, lang } = useLang();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMine()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (iso) => new Date(iso).toLocaleString(lang === 'si' ? 'si-LK' : 'en-LK');

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
                {order.message && <p><span className="font-medium">{t('yourMsg')}:</span> {order.message}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
