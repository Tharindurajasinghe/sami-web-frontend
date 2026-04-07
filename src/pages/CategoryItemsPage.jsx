// src/pages/CategoryItemsPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { itemApi, categoryApi } from '../services/api.js';
import ItemCard from '../components/ItemCard.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function CategoryItemsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('default');
  const [activeLetter, setActiveLetter] = useState('');

  const itemsRef = useRef(null); // 👈 for smooth scroll

  useEffect(() => {
    Promise.all([categoryApi.getAll(), itemApi.getByCategory(id)])
      .then(([cats, itms]) => {
        setCategory(cats.find(c => c._id === id) || null);
        setItems(itms);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const availableLetters = new Set(
    items.map(i => i.name.charAt(0).toUpperCase()).filter(Boolean)
  );

  const displayedItems = items
    .filter(i => {
      if (!activeLetter) return true;
      return i.name.charAt(0).toUpperCase() === activeLetter;
    })
    .sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (sort === 'za') return b.name.localeCompare(a.name);
      return 0;
    });

  const catName = category
    ? (lang === 'si' && category.nameSi ? category.nameSi : category.name)
    : '';

  return (
    <div className="main-content">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {catName || t('categories')}
          </h1>
        </div>
      </div>

      <div className="page-container pr-2 sm:pr-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="animate-spin text-orange-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">📦</span>
            <p>{t('noItems')}</p>
          </div>
        ) : (
          <div className="relative flex gap-2">

            {/* LEFT CONTENT */}
            <div className="flex-1" ref={itemsRef}>

              {/* Sort Bar */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-sm font-medium text-gray-600">
                  {lang === 'si' ? 'අනුපිළිවෙල:' : 'Sort:'}
                </span>

                <div className="flex gap-2">
                  {[
                    { val: 'default', label: lang === 'si' ? 'පෙරනිමි' : 'Default' },
                    { val: 'az', label: 'A → Z' },
                    { val: 'za', label: 'Z → A' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setSort(opt.val);
                        setActiveLetter('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        sort === opt.val
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Active Letter Badge */}
                {activeLetter && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded-lg text-sm">
                      {activeLetter}
                    </span>
                    <button
                      onClick={() => setActiveLetter('')}
                      className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Items */}
              {displayedItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p>
                    {lang === 'si'
                      ? `"${activeLetter}" අකුරෙන් ආරම්භ වන භාණ්ඩ නොමැත.`
                      : `No items starting with "${activeLetter}".`}
                  </p>
                  <button
                    onClick={() => setActiveLetter('')}
                    className="mt-3 text-orange-500 text-sm underline"
                  >
                    {lang === 'si' ? 'සියල්ල පෙන්වන්න' : 'Show all'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {displayedItems.map(item => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT ALPHABET (MOBILE ONLY) */}
            <div className="sm:hidden sticky top-24 self-start flex flex-col items-center w-6 flex-shrink-0">
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => {
                    setActiveLetter(prev => prev === letter ? '' : letter);
                    setSort('default');

                    // 👇 Smooth scroll to items
                    itemsRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                  className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded leading-none transition-all duration-150 ${
                    !availableLetters.has(letter)
                      ? 'text-gray-200 cursor-default'
                      : activeLetter === letter
                      ? 'text-orange-500 scale-110'
                      : 'text-gray-400 hover:text-orange-400'
                  }`}
                  disabled={!availableLetters.has(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}