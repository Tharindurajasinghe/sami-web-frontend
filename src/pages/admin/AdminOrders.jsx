// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api.js';
import { useLang } from '../../context/LanguageContext.jsx';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';

const STATUSES = ['pending', 'confirmed', 'rejected', 'complete'];

export default function AdminOrders() {
  const { t, lang } = useLang();
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [updating,    setUpdating]    = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [rejectingId, setRejectingId] = useState(null); // ← NEW: which order is being rejected
  const [rejectMsg,   setRejectMsg]   = useState('');   // ← NEW: rejection message text

  const load = () => {
    setLoading(true);
    adminApi.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleStatus = async (id, status, rejectionMsg = '') => {
    setUpdating(id);
    try {
      await adminApi.updateStatus(id, status, rejectionMsg); // ← NEW: pass rejectionMsg
      toast.success(lang === 'si' ? 'තත්වය යාවත්කාලීන කළා' : 'Status updated');
      // ← NEW: reset rejection state after success
      setRejectingId(null);
      setRejectMsg('');
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  // ← NEW: cancel rejection input
  const cancelReject = () => {
    setRejectingId(null);
    setRejectMsg('');
  };

  const fmt      = (iso) => new Date(iso).toLocaleString(lang === 'si' ? 'si-LK' : 'en-LK');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const filterLabels = {
    all:       lang === 'si' ? 'සියල්ල' : 'All',
    pending:   t('pending'),
    confirmed: t('confirmed'),
    rejected:  t('rejected'),
    complete:  t('complete'),
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">{t('manageOrders')}</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors">
          <RefreshCw size={15}/>{lang === 'si' ? 'නැවුම් කරන්න' : 'Refresh'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {filterLabels[s]}
            <span className="ml-1 text-xs opacity-75">
              ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={32} className="animate-spin text-orange-400"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p>{t('noOrders2')}</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id} className="card p-5">

              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">{t('orderId')}</p>
                  <p className="font-mono text-sm text-gray-700">{order._id}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmt(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status}/>
              </div>

              {/* Customer info */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3 text-sm space-y-1">
                <p><span className="font-semibold text-gray-600">{t('customerPhone')}:</span> {order.userPhone}</p>
                 {order.customerName && (
    <p><span className="font-semibold text-gray-600">Customer Name:</span> {order.customerName}</p>
  )}
                <p><span className="font-semibold text-gray-600">{t('yourPhone')}:</span> {order.phone}</p>
                <p><span className="font-semibold text-gray-600">{t('deliveryAddr')}:</span> {order.address}</p>
                {order.message && <p><span className="font-semibold text-gray-600">{t('customerMsg')}:</span> {order.message}</p>}
              </div>

              {/* Items */}
              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">{t('orderItems')}</p>
                {order.items.map((item, i) => {
                  const name = lang === 'si' && item.nameSi ? item.nameSi : item.name;
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{name} ×{item.qty}</span>
                      <span className="font-medium">Rs. {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-orange-200 mt-2 pt-2 flex justify-between font-bold text-orange-700">
                  <span>{t('orderTotal')}</span><span>Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* ── NEW: show existing rejection message if already rejected ── */}
              {order.status === 'rejected' && order.rejectionMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    {lang === 'si' ? 'ප්‍රතික්ෂේප කිරීමේ හේතුව:' : 'Rejection reason sent to customer:'}
                  </p>
                  <p className="text-sm text-red-700">{order.rejectionMsg}</p>
                </div>
              )}

              {/* Status buttons */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">{t('updateStatus')}</p>

                {/* ── NEW: rejection input — shown when admin clicks Reject ── */}
                {rejectingId === order._id ? (
                  <div className="space-y-2">
                    <input
                      value={rejectMsg}
                      onChange={e => setRejectMsg(e.target.value)}
                      className="input-field text-sm py-2"
                      placeholder={
                        lang === 'si'
                          ? 'ප්‍රතික්ෂේප කිරීමේ හේතුව ලියන්න... (අමතර)'
                          : 'Reason for rejection... (optional)'
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={updating === order._id}
                        onClick={() => handleStatus(order._id, 'rejected', rejectMsg)}
                        className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-40">
                        {updating === order._id ? '...' : (lang === 'si' ? 'තහවුරු කරන්න' : 'Confirm Reject')}
                      </button>
                      <button
                        onClick={cancelReject}
                        className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal status buttons */
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { s: 'confirmed', cls: 'bg-blue-500  hover:bg-blue-600'  },
                      { s: 'rejected',  cls: 'bg-red-500   hover:bg-red-600'   },
                      { s: 'complete',  cls: 'bg-green-500 hover:bg-green-600' },
                    ].map(({ s, cls }) => (
                      <button key={s}
                        disabled={order.status === s || updating === order._id}
                        onClick={() => {
                          if (s === 'rejected') {
                            // ← NEW: show input instead of immediately rejecting
                            setRejectingId(order._id);
                            setRejectMsg('');
                          } else {
                            handleStatus(order._id, s);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${cls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                        {updating === order._id ? '...' : filterLabels[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
