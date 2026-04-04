// src/components/ItemCard.jsx
import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';

export default function ItemCard({ item }) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const name       = lang === 'si' && item.nameSi ? item.nameSi : item.name;
  const hasDiscount = item.discount > 0;

  const handleAdd = () => {
    if (!item.available) return;
    addItem(item);
    toast.success(lang === 'si' ? 'කූඩයට එකතු කළා!' : 'Added to cart!');
  };

  return (
    <div className="card flex flex-col">
      <div className="h-44 bg-orange-50 flex items-center justify-center overflow-hidden relative">
        {item.image
          ? <img src={item.image} alt={name} className="w-full h-full object-cover"/>
          : <span className="text-5xl">📦</span>}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{item.discount}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 mb-2 leading-tight">{name}</h3>
        <div className="mb-2">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-sm">Rs. {item.price.toFixed(2)}</span>
              <span className="text-orange-600 font-bold text-lg">Rs. {item.finalPrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-orange-600 font-bold text-lg">Rs. {item.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mb-4">
          {item.available
            ? <><CheckCircle size={14} className="text-green-500"/><span className="text-green-600 text-xs font-medium">{t('available')}</span></>
            : <><XCircle    size={14} className="text-red-400"  /><span className="text-red-500   text-xs font-medium">{t('notAvailable')}</span></>}
        </div>
        <button onClick={handleAdd} disabled={!item.available}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-auto text-sm">
          <ShoppingCart size={16}/>
          {item.available ? t('addToCart') : t('outOfStock')}
        </button>
      </div>
    </div>
  );
}
