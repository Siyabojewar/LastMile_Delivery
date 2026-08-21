import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';

// Customer pages
import CustomerOrders from './pages/customer/CustomerOrders';
import NewOrder from './pages/customer/NewOrder';
import TrackOrder from './pages/customer/TrackOrder';

// Agent pages
import AgentOrders from './pages/agent/AgentOrders';
import AgentOrderDetail from './pages/agent/AgentOrderDetail';

// Admin pages
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminZones from './pages/admin/AdminZones';
import AdminRateCards from './pages/admin/AdminRateCards';
import AdminAgents from './pages/admin/AdminAgents';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  if (user.role === 'admin')    return <Navigate to="/admin/orders" replace />;
  if (user.role === 'agent')    return <Navigate to="/agent/orders" replace />;
  if (user.role === 'customer') return <Navigate to="/customer/orders" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-page-gradient dark:bg-gray-900">
      <Navbar />
      <main className={`flex-1 w-full animate-fade-in ${
        isLanding
          ? '' // landing handles its own layout + padding
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }`}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Root redirect */}
          <Route path="/" element={<RoleHome />} />

          {/* Customer */}
          <Route path="/customer/orders" element={
            <ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>
          } />
          <Route path="/customer/new-order" element={
            <ProtectedRoute roles={['customer']}><NewOrder /></ProtectedRoute>
          } />
          <Route path="/customer/orders/:id" element={
            <ProtectedRoute roles={['customer']}><TrackOrder /></ProtectedRoute>
          } />

          {/* Agent */}
          <Route path="/agent/orders" element={
            <ProtectedRoute roles={['agent']}><AgentOrders /></ProtectedRoute>
          } />
          <Route path="/agent/orders/:id" element={
            <ProtectedRoute roles={['agent']}><AgentOrderDetail /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>
          } />
          <Route path="/admin/orders/:id" element={
            <ProtectedRoute roles={['admin']}><AdminOrderDetail /></ProtectedRoute>
          } />
          <Route path="/admin/zones" element={
            <ProtectedRoute roles={['admin']}><AdminZones /></ProtectedRoute>
          } />
          <Route path="/admin/rate-cards" element={
            <ProtectedRoute roles={['admin']}><AdminRateCards /></ProtectedRoute>
          } />
          <Route path="/admin/agents" element={
            <ProtectedRoute roles={['admin']}><AdminAgents /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global footer — hidden on landing (it has its own) */}
      {!isLanding && (
        <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-500 border-t border-surface-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          DeliverySync
        </footer>
      )}
    </div>
  );
}
