// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!user)          return <Navigate to="/login"  replace/>;
  if (user.isAdmin)   return <Navigate to="/admin"  replace/>;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.isAdmin) return <Navigate to="/admin/login" replace/>;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        {/* Public */}
        <Route path="/login"       element={<LoginPage/>}/>
        <Route path="/register"    element={<RegisterPage/>}/>
        <Route path="/admin/login" element={<AdminLoginPage/>}/>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>

        {/* Customer */}
        <Route path="/"             element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
        <Route path="/category/:id" element={<ProtectedRoute><CategoryItemsPage/></ProtectedRoute>}/>
        <Route path="/cart"         element={<ProtectedRoute><CartPage/></ProtectedRoute>}/>
        <Route path="/checkout"     element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>}/>
        <Route path="/track"        element={<ProtectedRoute><TrackOrderPage/></ProtectedRoute>}/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
      <Footer/>
    </>
  );
}
