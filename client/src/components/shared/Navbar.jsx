import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const ROLE_META = {
  admin: { 
    color: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700', 
    icon: '🛡', 
    label: 'Admin',
    gradient: 'from-purple-600 to-purple-700'
  },
  agent: { 
    color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700', 
    icon: '🚴', 
    label: 'Agent',
    gradient: 'from-amber-600 to-amber-700'
  },
  customer: { 
    color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700', 
    icon: '📦', 
    label: 'Customer',
    gradient: 'from-emerald-600 to-emerald-700'
  },
};

/**
 * Professional desktop nav link with sophisticated active state indicator
 */
function NavItem({ to, children, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-surface-primary dark:focus-visible:ring-offset-surface-dark-primary',
          isActive
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-600 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-brand-600 before:rounded-r-full before:content-[\'\']'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/50',
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
      { to: '/customer/orders',    label: 'My Orders', icon: '📋' },
      { to: '/customer/new-order', label: 'New Order', icon: '➕' },
    ] :
    user?.role === 'agent' ? [
      { to: '/agent/orders', label: 'Assigned Orders', icon: '🚚' },
    ] :
    user?.role === 'admin' ? [
      { to: '/admin/orders',     label: 'Orders', icon: '📋' },
      { to: '/admin/zones',      label: 'Zones', icon: '🗺' },
      { to: '/admin/rate-cards', label: 'Rate Cards', icon: '💰' },
      { to: '/admin/agents',     label: 'Agents', icon: '🚴' },
    ] : [];

  const roleMeta = user ? ROLE_META[user.role] : null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isLanding
        ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50'
        : 'bg-white dark:bg-neutral-900 shadow-lg border-b border-neutral-200 dark:border-neutral-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-lg ring-1 ring-blue-500/20 group-hover:shadow-xl transition-all duration-200">
              📦
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-neutral-900 dark:text-white transition-colors">
                <span className="hidden sm:inline">DeliverySync</span>
                <span className="sm:hidden">DS</span>
              </span>
              <span className="text-xs font-medium leading-tight text-neutral-600 dark:text-neutral-400 transition-colors">
                Last-Mile Delivery
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ────────────────────────────────────────── */}
          {user && (
            <div className="hidden md:flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-1.5 ring-1 ring-neutral-200 dark:ring-neutral-700">
              {navLinks.map(l => (
                <NavItem key={l.to} to={l.to} icon={l.icon}>{l.label}</NavItem>
              ))}
            </div>
          )}

          {/* ── Right side ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {/* User profile section */}
                <div className="hidden sm:flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 ring-1 ring-neutral-200 dark:ring-neutral-700">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner ring-1 ${roleMeta?.color}`}>
                      {roleMeta?.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-md leading-tight ${roleMeta?.color}`}>
                        {roleMeta?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400
                             hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                             px-3 py-2 rounded-xl transition-all duration-200 ring-1 ring-transparent 
                             hover:ring-red-200 dark:hover:ring-red-800"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                  </svg>
                  <span className="hidden lg:inline">Sign out</span>
                </button>

                {/* Mobile hamburger */}
                <button
                  className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 
                             hover:text-neutral-900 dark:hover:text-white 
                             hover:bg-neutral-100 dark:hover:bg-neutral-700
                             transition-colors ring-1 ring-neutral-200 dark:ring-neutral-700"
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
              /* Guest navigation */
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary 
                             hover:text-text-primary dark:hover:text-text-dark-primary 
                             hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary 
                             px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary text-sm px-4 py-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-surface-primary/95 dark:bg-surface-dark-primary/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2 animate-slide-up">
            {/* User info section */}
            <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-surface-secondary dark:bg-surface-dark-secondary rounded-xl ring-1 ring-border-light dark:ring-border-dark">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ring-1 ${roleMeta?.color}`}>
                {roleMeta?.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary leading-tight">
                  {user.name}
                </p>
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-md mt-0.5 inline-block ${roleMeta?.color}`}>
                  {roleMeta?.label}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800'
                      : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary'
                  }`
                }
              >
                <span className="text-base">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left text-sm font-medium px-4 py-3
                         rounded-xl text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 
                         transition-all duration-200 mt-4 border-t border-border-light dark:border-border-dark pt-6
                         ring-1 ring-transparent hover:ring-error-200 dark:hover:ring-error-800"
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
