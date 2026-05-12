// src/components/Footer.jsx
import { Phone, Mail, MapPin, Facebook } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const { t } = useLang();
  const { user } = useAuth();
  const location = useLocation();
if (location.pathname.startsWith('/admin')) return null;
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h3 className="text-white font-bold text-lg">{t('aboutUs')}</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">{t('aboutText')}</p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{t('contactUs')}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={15} className="text-orange-400 shrink-0"/><span>+94 70 4283 858</span></li>
            <li className="flex items-center gap-2"><Facebook  size={15} className="text-orange-400 shrink-0"/><a 
              href="https://www.facebook.com/share/18E8eCJLdn/" 
              target="_blank" 
              rel="noopener noreferrer"
             className="hover:text-white underline"
               >
              Dissanayake City Center Facebook Page
              </a></li>
            <li className="flex items-center gap-2"><MapPin size={15} className="text-orange-400 shrink-0"/><span>No 68,Yudaganawa Janapadaya,Buththala</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} TAR Solutions. {t('allRightsReserved')}
      </div>
    </footer>
  );
}
