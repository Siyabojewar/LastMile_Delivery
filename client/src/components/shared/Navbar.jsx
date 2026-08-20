import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
  admin:    'bg-purple-100 text-purple-700',
  agent:    'bg-amber-100 text-amber-700',
  customer: 'bg-emerald-100 text-emerald-700',
};

const ROLE_ICONS = {
  admin:    '🛡',
  agent:    '🚴',
  customer: '📦',
};

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${
          isActive
            ? 'bg-white/20 text-white'
            : 'text-blue-100 hover:text-white hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
    setMobileOpen(false);
  }

  const navLinks =
    user?.role === 'customer' ? [
      { to: '/customer/orders',    label: 'My Orders' },
      { to: '/customer/new-order', label: 'New Order' },
    ] :
    user?.role === 'agent' ? [
      { to: '/agent/orders', label: 'Assigned Orders' },
    ] :
    user?.role === 'admin' ? [
      { to: '/admin/orders',     label: 'Orders' },
      { to: '/admin/zones',      label: 'Zones' },
      { to: '/admin/rate-cards', label: 'Rate Cards' },
      { to: '/admin/agents',     label: 'Agents' },
    ] : [];

  return (
    <nav className="bg-brand-700 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight shrink-0"
          >
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base leading-none">
              📦
            </span>
            <span className="hidden sm:block">Last-Mile Delivery Tracker</span>
            <span className="sm:hidden">LMDT</span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <NavItem key={l.to} to={l.to}>{l.label}</NavItem>
              ))}
            </div>
          )}

          {/* Right side */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* User pill — desktop */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                <span className="text-base leading-none">{ROLE_ICONS[user.role]}</span>
                <div className="leading-tight">
                  <p className="text-white text-xs font-semibold leading-none">{user.name}</p>
                  <span className={`text-[10px] font-bold capitalize rounded px-1 py-0.5 mt-0.5 inline-block ${ROLE_COLORS[user.role]}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout — desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex btn-ghost text-blue-100 hover:text-white hover:bg-white/10 text-sm px-3 py-1.5"
              >
                Sign out
              </button>

              {/* Hamburger — mobile */}
              <button
                className="md:hidden p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10"
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
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-ghost text-blue-100 hover:text-white hover:bg-white/10 btn-sm">Sign in</Link>
              <Link to="/register" className="btn bg-white text-brand-700 hover:bg-blue-50 btn-sm shadow-sm">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-white/10 bg-brand-800 px-4 py-3 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-2 px-2 py-2 mb-2 border-b border-white/10">
            <span className="text-base">{ROLE_ICONS[user.role]}</span>
            <div>
              <p className="text-white text-sm font-semibold">{user.name}</p>
              <span className={`text-[10px] font-bold capitalize rounded px-1.5 py-0.5 ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left text-sm font-medium px-3 py-2 rounded-lg text-red-300 hover:bg-white/10 mt-2 border-t border-white/10 pt-3"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
