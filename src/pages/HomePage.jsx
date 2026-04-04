// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { categoryApi } from '../services/api.js';
import CategoryCard    from '../components/CategoryCard.jsx';
import SeasonalBanner  from '../components/SeasonalBanner.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const { t, lang } = useLang();
  const { user }    = useAuth();

  useEffect(() => {
    categoryApi.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-content">
      {/* Seasonal Hero Banner */}
      <SeasonalBanner user={user} lang={lang} />

      {/* Categories */}
      <div className="page-container">
        <h2 className="section-title">{t('categories')}</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="animate-spin text-orange-400"/>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🛒</span>
            <p>{t('noCategories')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => <CategoryCard key={cat._id} category={cat}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
