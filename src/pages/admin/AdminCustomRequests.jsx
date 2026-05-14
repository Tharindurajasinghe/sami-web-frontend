// src/pages/admin/AdminCustomRequests.jsx
import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api.js';
import { useLang } from '../../context/LanguageContext.jsx';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';

const STATUSES = ['pending', 'confirmed', 'rejected', 'complete'];

export default function AdminCustomRequests() {
  const { t, lang } = useLang();

  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [filter,     setFilter]     = useState('all');
  // msgId = which request has the message input open; msgText = typed text
  const [msgId,      setMsgId]      = useState(null);
  const [msgText,    setMsgText]    = useState('');
  const [pendingStatus, setPendingStatus] = useState(null); // status waiting for msg confirm

  const load = () => {
    setLoading(true);
    adminApi.getCustomRequests()
      .then(setRequests).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openMsg = (id, status) => {
    setMsgId(id);
    setPendingStatus(status);
    setMsgText('');
  };

  const cancelMsg = () => { setMsgId(null); setMsgText(''); setPendingStatus(null); };

  const handleStatus = async (id, status, adminMsg = '') => {
    setUpdating(id);
    try {
      await adminApi.updateCustomReqStatus(id, status, adminMsg);
      toast.success(lang === 'si' ? 'තත්වය යාවත්කාලීන කළා' : 'Status updated');
      cancelMsg();
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  const fmt      = (iso) => new Date(iso).toLocaleString(lang === 'si' ? 'si-LK' : 'en-LK');
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const label = {
    all:       lang === 'si' ? 'සියල්ල'        : 'All',
    pending:   lang === 'si' ? 'බලා සිටිනු'     : 'Pending',
    confirmed: lang === 'si' ? 'තහවුරු කළා'     : 'Confirmed',
    rejected:  lang === 'si' ? 'ප්‍රතික්ෂේප'   : 'Rejected',
    complete:  lang === 'si' ? 'සම්පූර්ණ'       : 'Complete',
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList size={20} className="text-orange-500"/>
          {lang === 'si' ? 'බඩු ලැයිස්තු ඇණවුම්' : 'Custom Item Lists'}
        </h2>
        <button onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors">
          <RefreshCw size={15}/>{lang === 'si' ? 'නැවුම් කරන්න' : 'Refresh'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={"px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
              (filter === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
            {label[s]}
            <span className="ml-1 text-xs opacity-75">
              ({s === 'all' ? requests.length : requests.filter(r => r.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={32} className="animate-spin text-orange-400"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList size={48} className="mx-auto mb-3 text-orange-200"/>
          <p>{lang === 'si' ? 'ලැයිස්තු නොමැත.' : 'No requests yet.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req._id} className="card p-5">

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">{t('orderId')}</p>
                  <p className="font-mono text-sm text-gray-700">{req._id}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmt(req.createdAt)}</p>
                </div>
                <OrderStatusBadge status={req.status}/>
              </div>

              {/* Customer info */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3 text-sm space-y-1">
                {req.customerName && (
                  <p><span className="font-semibold text-gray-600">
                    {lang === 'si' ? 'නම:' : 'Customer:'}</span> {req.customerName}
                  </p>
                )}
                <p><span className="font-semibold text-gray-600">{t('customerPhone')}:</span> {req.userPhone}</p>
                {req.phone    && <p><span className="font-semibold text-gray-600">{t('yourPhone')}:</span> {req.phone}</p>}
                {req.address  && <p><span className="font-semibold text-gray-600">{t('deliveryAddr')}:</span> {req.address}</p>}
                {req.location?.lat && req.location?.lng && (
                  <p><span className="font-semibold text-gray-600">
                    {lang === 'si' ? 'ස්ථානය:' : 'Location:'}
                  </span>{' '}
                    <a href={`https://www.google.com/maps?q=${req.location.lat},${req.location.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium">
                      📍 {lang === 'si' ? 'Google Maps හි බලන්න' : 'View on Google Maps'}
                    </a>
                  </p>
                )}
              </div>

              {/* Item list */}
              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {lang === 'si' ? 'ලැයිස්තුව' : 'Item List'}
                </p>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{req.itemList}</pre>
              </div>

              {/* Existing admin message */}
              {req.adminMsg && (
                <div className={"rounded-xl p-3 mb-4 border " +
                  (req.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                  <p className={"text-xs font-semibold mb-1 " +
                    (req.status === 'rejected' ? 'text-red-600' : 'text-green-700')}>
                    {lang === 'si' ? 'ඔබේ පණිවිඩය (ගනුදෙනුකරුට):' : 'Your message sent to customer:'}
                  </p>
                  <p className={"text-sm " + (req.status === 'rejected' ? 'text-red-700' : 'text-green-800')}>
                    {req.adminMsg}
                  </p>
                </div>
              )}

              {/* Action buttons / message input */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">{t('updateStatus')}</p>

                {msgId === req._id ? (
                  // Message input shown before confirming any status change
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      className="input-field text-sm resize-none"
                      placeholder={
                        lang === 'si'
                          ? 'ගනුදෙනුකරුට පණිවිඩයක් ලියන්න... (අමතර)'
                          : 'Message to customer... (optional)'
                      }
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        disabled={updating === req._id}
                        onClick={() => handleStatus(req._id, pendingStatus, msgText)}
                        className={"px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40 " +
                          (pendingStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                           pendingStatus === 'confirmed' ? 'bg-blue-500 hover:bg-blue-600' :
                           'bg-green-500 hover:bg-green-600')}>
                        {updating === req._id ? '...' : (lang === 'si' ? 'තහවුරු කරන්න' : 'Confirm')}
                      </button>
                      <button onClick={cancelMsg}
                        className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium">
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { s: 'confirmed', cls: 'bg-blue-500  hover:bg-blue-600'  },
                      { s: 'rejected',  cls: 'bg-red-500   hover:bg-red-600'   },
                      { s: 'complete',  cls: 'bg-green-500 hover:bg-green-600' },
                    ].map(({ s, cls }) => (
                      <button key={s}
                        disabled={req.status === s || updating === req._id}
                        onClick={() => openMsg(req._id, s)}
                        className={"px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed " + cls}>
                        {label[s]}
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