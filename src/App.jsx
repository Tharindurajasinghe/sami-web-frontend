// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar  from './components/Navbar.jsx';
import Footer  from './components/Footer.jsx';

import HomePage          from './pages/HomePage.jsx';
import CategoryItemsPage from './pages/CategoryItemsPage.jsx';
import CartPage          from './pages/CartPage.jsx';
import CheckoutPage      from './pages/CheckoutPage.jsx';
import TrackOrderPage    from './pages/TrackOrderPage.jsx';
import AdminLoginPage    from './pages/admin/AdminLoginPage.jsx';
import AdminDashboard    from './pages/admin/AdminDashboard.jsx';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)        return <Spinner/>;
  if (!user?.isAdmin) return <Navigate to="/admin/login" replace/>;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        {/* Public — no login required */}
        <Route path="/"             element={<HomePage/>}/>
        <Route path="/category/:id" element={<CategoryItemsPage/>}/>
        <Route path="/cart"         element={<CartPage/>}/>
        <Route path="/checkout"     element={<CheckoutPage/>}/>
        <Route path="/track"        element={<TrackOrderPage/>}/>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage/>}/>
        <Route path="/admin"       element={<AdminRoute><AdminDashboard/></AdminRoute>}/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
      <Footer/>
    </>
  );
}
