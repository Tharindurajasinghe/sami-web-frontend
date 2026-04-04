// src/components/OrderStatusBadge.jsx
import { useLang } from '../context/LanguageContext.jsx';

export default function OrderStatusBadge({ status }) {
  const { t } = useLang();
  const map = {
    pending:   { cls: 'status-pending',   label: t('pending') },
    confirmed: { cls: 'status-confirmed', label: t('confirmed') },
    rejected:  { cls: 'status-rejected',  label: t('rejected') },
    complete:  { cls: 'status-complete',  label: t('complete') },
  };
  const { cls, label } = map[status] || map.pending;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
