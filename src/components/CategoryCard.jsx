// src/components/CategoryCard.jsx
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const { lang } = useLang();
  const name = lang === 'si' && category.nameSi ? category.nameSi : category.name;

  return (
    <div onClick={() => navigate(`/category/${category._id}`)}
      className="card cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-95">
      <div className="h-40 bg-orange-50 flex items-center justify-center overflow-hidden">
        {category.image
          ? <img src={category.image} alt={name} className="w-full h-full object-cover"/>
          : <span className="text-5xl">🛍️</span>}
      </div>
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-base">{name}</h3>
        <ChevronRight size={18} className="text-orange-400"/>
      </div>
    </div>
  );
}
