// src/pages/TrackOrderPage.jsx
import { useEffect, useState } from 'react';
import { Loader2, Package, LogIn, ClipboardList } from 'lucide-react';
import { orderApi, customRequestApi } from '../services/api.js';
import { useLang } from '../context/LanguageContext.jsx';
import OrderStatusBadge from '../components/OrderStatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function TrackOrderPage() {
  const { t, lang } = useLang();
  const { user }    = useAuth();

  const [tab,      setTab]      = useState('orders');
  const [orders,   setOrders]   = useState([]);
  const [lists,    setLists]    = useState([]);
  const [loadingO, setLoadingO] = useState(true);
  const [loadingL, setLoadingL] = useState(true);

  useEffect(() => {
    if (!user) { setLoadingO(false); setLoadingL(false); return; }
    orderApi.getMine()
      .then(setOrders).catch(console.error).finally(() => setLoadingO(false));
    customRequestApi.getMine()
      .then(setLists).catch(console.error).finally(() => setLoadingL(false));
  }, [user]);

  const fmt = (iso) => new Date(iso).toLocaleString(lang === 'si' ? 'si-LK' : 'en-LK');

  if (!user) {
    return (
      <div className="main-content page-container text-center py-20">
        <Package size={60} className="mx-auto mb-4 text-orange-200"/>
        <p className="text-gray-800 font-semibold text-lg mb-1">
          ඇණවුම් ලුහුබැදීමට ලොගින් විය යුතුයි.
        </p>
        <p className="text-gray-500 mb-6">To track your order please login to the system.</p>
        <Link to="/login" state={{ from: { pathname: '/track' } }}
          className="btn-primary inline-flex items-center gap-2">
          <LogIn size={16}/> {t('loginBtn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content page-container">
      <h1 className="section-title">{t('trackingTitle')}</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('orders')}
          className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors " +
            (tab === 'orders' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300')}>
          <Package size={15}/>
          {lang === 'si' ? 'ඇණවුම්' : 'Cart Orders'}
          <span className="text-xs opacity-75">({orders.length})</span>
        </button>
        <button onClick={() => setTab('lists')}
          className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors " +
            (tab === 'lists' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300')}>
          <ClipboardList size={15}/>
          {lang === 'si' ? 'බඩු ලැයිස්තු' : 'Item Lists'}
          <span className="text-xs opacity-75">({lists.length})</span>
        </button>
      </div>

      {tab === 'orders' && (
        loadingO ? (
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
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">{t('orderId')}</p>
                    <p className="font-mono text-sm text-gray-700">{order._id}</p>
                    <p className="text-xs text-gray-400 mt-1">{fmt(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status}/>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t('orderItems')}</p>
                  <ul className="space-y-1">
                    {order.items.map((item, i) => {
                      const name = lang === 'si' && item.nameSi ? item.nameSi : item.name;
                      return (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{name} x{item.qty}</span>
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
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">{t('deliveryAddr')}:</span> {order.address}</p>
                  <p><span className="font-medium">{t('phone')}:</span> {order.phone}</p>
                  {order.message && <p><span className="font-medium">{t('yourMsg')}:</span> {order.message}</p>}
                </div>
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
        )
      )}

      {tab === 'lists' && (
        loadingL ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="animate-spin text-orange-400"/>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList size={60} className="mx-auto mb-3 text-orange-200"/>
            <p>{lang === 'si' ? 'ලැයිස්තු නොමැත.' : 'No lists submitted yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lists.map(req => (
              <div key={req._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">{t('orderId')}</p>
                    <p className="font-mono text-sm text-gray-700">{req._id}</p>
                    <p className="text-xs text-gray-400 mt-1">{fmt(req.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={req.status}/>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {lang === 'si' ? 'ඔබේ ලැයිස්තුව' : 'Your List'}
                  </p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{req.itemList}</pre>
                </div>
                {req.address && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{t('deliveryAddr')}:</span> {req.address}
                  </p>
                )}
                {req.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{t('phone')}:</span> {req.phone}
                  </p>
                )}
                {req.adminMsg && (
                  <div className={"mt-3 rounded-xl p-3 border " +
                    (req.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200')}>
                    <p className={"text-xs font-semibold mb-1 " +
                      (req.status === 'rejected' ? 'text-red-600' : 'text-blue-600')}>
                      {lang === 'si' ? 'ශාලාවේ පිළිතුර:' : 'Message from shop:'}
                    </p>
                    <p className={"text-sm " + (req.status === 'rejected' ? 'text-red-700' : 'text-blue-700')}>
                      {req.adminMsg}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}