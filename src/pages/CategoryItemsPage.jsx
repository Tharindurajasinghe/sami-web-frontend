// src/pages/CategoryItemsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { itemApi, categoryApi } from '../services/api.js';
import ItemCard from '../components/ItemCard.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function CategoryItemsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [items,    setItems]    = useState([]);
  const [category, setCategory] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([categoryApi.getAll(), itemApi.getByCategory(id)])
      .then(([cats, itms]) => {
        setCategory(cats.find(c => c._id === id) || null);
        setItems(itms);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const catName = category
    ? (lang === 'si' && category.nameSi ? category.nameSi : category.name)
    : '';

  return (
    <div className="main-content">
      <div className="bg-white border-b border-orange-100 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <h1 className="text-xl font-bold text-gray-800">{catName || t('categories')}</h1>
        </div>
      </div>

      <div className="page-container">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="animate-spin text-orange-400"/>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">📦</span>
            <p>{t('noItems')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map(item => <ItemCard key={item._id} item={item}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
