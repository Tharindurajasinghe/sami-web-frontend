// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Package, LogOut, Globe, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  // Hide navbar entirely for admin (admin has its own top bar)
  if (user?.isAdmin) return null;
const handleLogout = () => {
  const msg = lang === 'si'
    ? 'ඔබට සැබවින්ම පිටවීමට අවශ්‍යද?'
    : 'Are you sure you want to logout?';
  if (window.confirm(msg)) {
    logout();
    navigate('/');
  }
};
  

  const isLoggedIn = !!user;

  return (
    <>
      {/* ── Desktop navbar ───────────────────────────────────────── */}
      <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">
              {lang === 'si' ? 'වෙළඳසැල' : 'Shop'}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home size={16}/>} label={t('home')}/>
            {isLoggedIn && (
              <NavLink to="/track" icon={<Package size={16}/>} label={t('trackOrder')}/>
            )}
            {/* Cart — always visible, clicking prompts login if guest */}
            <Link to={isLoggedIn ? '/cart' : '/login'}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium text-sm">
              <ShoppingCart size={16}/>
              <span>{t('cart')}</span>
              {count > 0 && (
                <span className="cart-badge absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>
              )}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors text-sm font-semibold">
              <Globe size={16}/><span>{lang === 'en' ? 'සිං' : 'EN'}</span>
            </button>

            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
        Hi, {user.firstName}
      </span>
              <button onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-medium">
                <LogOut size={16}/><span>{t('logout')}</span>
              </button>
              </div>
            ) : (
              <Link to="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors text-sm font-semibold">
                <LogIn size={16}/><span>{t('loginBtn')}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-50 shadow-lg">
        <div className="flex items-center justify-around h-16">

          <MobileLink to="/" icon={<Home size={22}/>} label={t('home')}/>

          {/* Cart */}
          <Link to={isLoggedIn ? '/cart' : '/login'}
            className="flex flex-col items-center gap-0.5 text-gray-500 px-3 py-1">
            <div className="relative">
              <ShoppingCart size={22}/>
              {count > 0 && (
                <span className="cart-badge absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>
              )}
            </div>
            <span className="text-xs">{t('cart')}</span>
          </Link>

          {isLoggedIn ? (
            <>
              <MobileLink to="/track" icon={<Package size={22}/>} label={t('trackOrder')}/>
              <button onClick={handleLogout}
                className="flex flex-col items-center gap-0.5 text-gray-500 px-3 py-1">
                <LogOut size={22}/><span className="text-xs">{t('logout')}</span>
              </button>
            </>
          ) : (
            <Link to="/login"
              className="flex flex-col items-center gap-0.5 text-orange-500 px-3 py-1">
              <LogIn size={22}/><span className="text-xs">{t('loginBtn')}</span>
            </Link>
          )}

        </div>
      </nav>
    </>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium text-sm">
      {icon}<span>{label}</span>
    </Link>
  );
}
function MobileLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-0.5 text-gray-500 px-3 py-1">
      {icon}<span className="text-xs">{label}</span>
    </Link>
  );
}
