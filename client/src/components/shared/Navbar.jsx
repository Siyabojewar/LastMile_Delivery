import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
  admin:    { color: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200', icon: '🛡', label: 'Admin' },
  agent:    { color: 'bg-amber-100  text-amber-700  ring-1 ring-amber-200',  icon: '🚴', label: 'Agent' },
  customer: { color: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', icon: '📦', label: 'Customer' },
};

/**
 * Desktop nav link — uses an underline indicator for the active state
 * rather than just a translucent background, making it much clearer at a glance.
 */
function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'relative text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          isActive
            ? 'text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-white after:content-[\'\']'
            : 'text-blue-100 hover:text-white hover:bg-white/10',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/' && !user;

  function handleLogout() {
    logout();
    navigate('/login');
    setMobileOpen(false);
  }

  const navLinks =
    user?.role === 'customer' ? [
      { to: '/customer/orders',    label: '📋 My Orders' },
      { to: '/customer/new-order', label: '➕ New Order' },
    ] :
    user?.role === 'agent' ? [
      { to: '/agent/orders', label: '🚚 Assigned Orders' },
    ] :
    user?.role === 'admin' ? [
      { to: '/admin/orders',     label: '📋 Orders' },
      { to: '/admin/zones',      label: '🗺 Zones' },
      { to: '/admin/rate-cards', label: '💰 Rate Cards' },
      { to: '/admin/agents',     label: '🚴 Agents' },
    ] : [];

  const roleMeta = user ? ROLE_META[user.role] : null;

  return (
    <nav className={`shadow-card-md sticky top-0 z-40 transition-colors duration-200 ${
      isLanding
        ? 'bg-brand-800/90 backdrop-blur-md border-b border-white/10'
        : 'bg-hero-gradient'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight shrink-0
                       hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-base
                             shadow-inner-sm ring-1 ring-white/30">
              📦
            </span>
            <span className="hidden sm:block">Last-Mile Delivery Tracker</span>
            <span className="sm:hidden font-bold">LMDT</span>
          </Link>

          {/* ── Desktop nav links ────────────────────────────────────────── */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(l => (
                <NavItem key={l.to} to={l.to}>{l.label}</NavItem>
              ))}
            </div>
          )}

          {/* ── Right side ───────────────────────────────────────────────── */}
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* User pill */}
              <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5
                              ring-1 ring-white/20 backdrop-blur-sm">
                <span className="text-sm leading-none">{roleMeta?.icon}</span>
                <div className="leading-tight">
                  <p className="text-white text-xs font-bold leading-none truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <span className={`text-[10px] font-bold capitalize rounded-md px-1.5 py-0.5 mt-0.5 inline-block ${roleMeta?.color}`}>
                    {roleMeta?.label}
                  </span>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200
                           hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Sign out
              </button>

              {/* Hamburger */}
              <button
                className="md:hidden p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10
                           transition-colors ring-1 ring-white/10"
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
              <Link to="/login"    className="text-xs font-semibold text-blue-100 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">Sign in</Link>
              <Link to="/register" className="text-xs font-bold bg-white text-brand-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-card transition-all hover:-translate-y-px">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-white/10 bg-brand-800/95 backdrop-blur-sm px-4 py-3 space-y-1 animate-slide-up">
          {/* User info row */}
          <div className="flex items-center gap-3 px-2 py-2.5 mb-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
              {roleMeta?.icon}
            </div>
            <div>
              <p className="text-white text-sm font-bold">{user.name}</p>
              <span className={`text-[10px] font-bold capitalize rounded-md px-1.5 py-0.5 ${roleMeta?.color}`}>
                {roleMeta?.label}
              </span>
            </div>
          </div>
          {/* Nav links */}
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left text-sm font-semibold px-3 py-2.5
                       rounded-xl text-red-300 hover:bg-white/10 transition-colors mt-1 border-t border-white/10 pt-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
