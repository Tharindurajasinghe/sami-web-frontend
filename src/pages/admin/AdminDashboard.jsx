// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, ShoppingBag, Users, LogOut, Globe } from 'lucide-react';
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
  const [tab, setTab] = useState('orders');
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

  // Short labels for the mobile bottom nav
  const tabLabelShort = {
    orders:     lang === 'si' ? 'ඇණවුම්'   : 'Orders',
    categories: lang === 'si' ? 'ප්‍රවර්ග' : 'Categories',
    items:      lang === 'si' ? 'භාණ්ඩ'    : 'Items',
    users:      lang === 'si' ? 'පරිශීලක'  : 'Users',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="bg-gray-800 text-white px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">D</span>
          </div>
          {/* Desktop: show dashboard title */}
          <span className="font-bold hidden sm:block">{t('adminDashboard')}</span>
          {/* Mobile: show current active tab name */}
          <span className="font-semibold text-sm sm:hidden text-orange-300">
            {tabLabelShort[tab]}
          </span>
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
          {/* No hamburger menu — mobile uses bottom nav instead */}
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar — desktop only ────────────────────────────────────── */}
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

        {/* ── Main content ──────────────────────────────────────────────── */}
        {/* pb-24 on mobile so content doesn't hide behind the bottom nav */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 sm:pb-6">
          {tab === 'orders'     && <AdminOrders/>}
          {tab === 'categories' && <AdminCategories/>}
          {tab === 'items'      && <AdminItems/>}
          {tab === 'users'      && <AdminUsers/>}
        </main>
      </div>

      {/* ── Mobile bottom nav — hidden on desktop (sm+) ───────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex items-center h-16">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                tab === key ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active top indicator bar */}
              {tab === key && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"/>
              )}
              <Icon size={21}/>
              <span className="text-xs font-medium leading-tight">{tabLabelShort[key]}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
