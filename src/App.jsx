// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar  from './components/Navbar.jsx';
import Footer  from './components/Footer.jsx';

import LoginPage         from './pages/LoginPage.jsx';
import RegisterPage      from './pages/RegisterPage.jsx';
import HomePage          from './pages/HomePage.jsx';
import CategoryItemsPage from './pages/CategoryItemsPage.jsx';
import CartPage          from './pages/CartPage.jsx';
import CheckoutPage      from './pages/CheckoutPage.jsx';
import TrackOrderPage    from './pages/TrackOrderPage.jsx';
import AdminLoginPage    from './pages/admin/AdminLoginPage.jsx';
import AdminDashboard    from './pages/admin/AdminDashboard.jsx';

// Spinner shown while auth state is loading
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
}

// Only for Checkout — requires login
// Saves the page the user tried to visit so we can redirect back after login
function LoginRequired({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)          return <Spinner/>;
  if (!user)            return <Navigate to="/login" state={{ from: location }} replace/>;
  if (user.isAdmin)     return <Navigate to="/admin" replace/>;
  return children;
}

// Admin pages guard
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.isAdmin) return <Navigate to="/admin/login" replace/>;
  return children;
}

// Redirect logged-in users away from login/register pages
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner/>;
  if (user?.isAdmin) return <Navigate to="/admin" replace/>;
  if (user)          return <Navigate to="/"      replace/>;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        {/* ── Fully public — no login needed ── */}
        <Route path="/"             element={<HomePage/>}/>
        <Route path="/category/:id" element={<CategoryItemsPage/>}/>
        <Route path="/cart"         element={<CartPage/>}/>        {/* ← now public */}
        <Route path="/track"        element={<TrackOrderPage/>}/>  {/* ← already public */}

        {/* ── Guest only — redirect away if already logged in ── */}
        <Route path="/login"    element={<GuestOnly><LoginPage/></GuestOnly>}/>
        <Route path="/register" element={<GuestOnly><RegisterPage/></GuestOnly>}/>

        {/* ── Login required — only checkout needs login ── */}
        <Route path="/checkout" element={<LoginRequired><CheckoutPage/></LoginRequired>}/>

        {/* ── Admin ── */}
        <Route path="/admin/login" element={<AdminLoginPage/>}/>
        <Route path="/admin"       element={<AdminRoute><AdminDashboard/></AdminRoute>}/>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
      <Footer/>
    </>
  );
}
