import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
  admin:    { pill: 'bg-purple-600 text-white', icon: '🛡', label: 'Admin',    border: 'border-purple-300' },
  agent:    { pill: 'bg-amber-500 text-white',  icon: '🚴', label: 'Agent',    border: 'border-amber-300' },
  customer: { pill: 'bg-emerald-600 text-white',icon: '📦', label: 'Customer', border: 'border-emerald-300' },
};

function NavItem({ to, children, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50',
          isActive
            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-600 before:rounded-r-full before:content-[\'\']'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        ].join(' ')
      }
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/' && !user;

  function handleLogout() {
    logout();
    navigate('/login');
    setMobileOpen(false);
  }

  const navLinks =
    user?.role === 'customer' ? [
      { to: '/customer/orders',    label: 'My Orders',  icon: '📋' },
      { to: '/customer/new-order', label: 'New Order',  icon: '➕' },
    ] :
    user?.role === 'agent' ? [
      { to: '/agent/orders', label: 'Assigned Orders', icon: '🚚' },
    ] :
    user?.role === 'admin' ? [
      { to: '/admin/orders',     label: 'Orders',     icon: '📋' },
      { to: '/admin/zones',      label: 'Zones',      icon: '🗺' },
      { to: '/admin/rate-cards', label: 'Rate Cards', icon: '💰' },
      { to: '/admin/agents',     label: 'Agents',     icon: '🚴' },
    ] : [];

  const roleMeta = user ? ROLE_META[user.role] : null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isLanding
        ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60'
        : 'bg-white shadow-sm border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-bold shadow-md group-hover:shadow-lg transition-all duration-200">
              📦
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none text-gray-900">DeliverySync</span>
              <span className="text-[11px] font-medium leading-tight text-gray-500">Last-Mile Delivery</span>
            </div>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-2xl p-1.5 ring-1 ring-gray-200">
              {navLinks.map(l => (
                <NavItem key={l.to} to={l.to} icon={l.icon}>{l.label}</NavItem>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2 ring-1 ring-gray-200">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[120px]">{user.name}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full leading-tight ${roleMeta?.pill}`}>
                    {roleMeta?.icon} {roleMeta?.label}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all duration-200"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                  </svg>
                  <span className="hidden lg:inline">Sign out</span>
                </button>

                <button
                  className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileOpen(o => !o)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-gray-50 rounded-xl ring-1 ring-gray-200">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleMeta?.pill}`}>
                {roleMeta?.icon} {roleMeta?.label}
              </span>
            </div>

            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-base">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left text-sm font-medium px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-gray-200 pt-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
