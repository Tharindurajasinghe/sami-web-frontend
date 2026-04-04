// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, ShoppingBag, Users, LogOut, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import AdminCategories from './AdminCategories.jsx';
import AdminItems      from './AdminItems.jsx';
import AdminOrders     from './AdminOrders.jsx';
import AdminUsers      from './AdminUsers.jsx';

const TABS = [
  { key: 'orders',     icon: ShoppingBag },
  { key: 'categories', icon: LayoutGrid  },
  { key: 'items',      icon: Package     },
  { key: 'users',      icon: Users       },
];

export default function AdminDashboard() {
  const [tab,      setTab]      = useState('orders');
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabLabel = {
    orders:     t('manageOrders'),
    categories: t('manageCategories'),
    items:      t('manageItems'),
    users:      t('manageUsers'),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-800 text-white px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">S</span>
          </div>
          <span className="font-bold hidden sm:block">{t('adminDashboard')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors">
            <Globe size={14}/>{lang === 'en' ? 'සිං' : 'EN'}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm transition-colors">
            <LogOut size={14}/><span className="hidden sm:inline">{t('logout')}</span>
          </button>
          <button className="sm:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden sm:flex flex-col w-56 bg-white border-r border-gray-200 py-4 px-3 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {TABS.map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                tab === key ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon size={18}/>{tabLabel[key]}
            </button>
          ))}
        </aside>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-lg">
            {TABS.map(({ key, icon: Icon }) => (
              <button key={key} onClick={() => { setTab(key); setMenuOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors ${
                  tab === key ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Icon size={18}/>{tabLabel[key]}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {tab === 'orders'     && <AdminOrders/>}
          {tab === 'categories' && <AdminCategories/>}
          {tab === 'items'      && <AdminItems/>}
          {tab === 'users'      && <AdminUsers/>}
        </main>
      </div>
    </div>
  );
}
