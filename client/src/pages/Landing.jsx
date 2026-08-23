import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Rate Quotes',
    desc: 'Get precise delivery charges based on actual weight, volumetric weight, pickup zone, and drop zone — before you commit.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: '📍',
    title: 'Live Order Tracking',
    desc: 'Follow every shipment through Picked Up → In Transit → Out for Delivery → Delivered with full timestamped history.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: '🚴‍♂️',
    title: 'Smart Agent Dispatch',
    desc: 'Orders auto-assigned to the nearest available agent using zone-matching and distance calculation. Manual override available.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: '💳',
    title: 'Prepaid & COD Support',
    desc: 'Full support for prepaid and Cash on Delivery orders. COD surcharges are admin-configurable and shown in every quote.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

const STEPS = [
  { n: '01', icon: '📝', title: 'Create account',   desc: 'Sign up as a customer in under a minute — no admin approval needed.' },
  { n: '02', icon: '🧾', title: 'Get a quote',       desc: 'Enter pickup and drop details to see the exact charge upfront.' },
  { n: '03', icon: '📦', title: 'Place your order',  desc: 'Confirm the quote and your shipment enters the pipeline immediately.' },
  { n: '04', icon: '📍', title: 'Track live',        desc: 'Real-time status updates and email notifications at every stage.' },
];

const ROLES = [
  {
    icon: '📦',
    role: 'Customer',
    color: 'border-l-4 border-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
    desc: 'Place orders, get instant quotes, track shipments, and reschedule failed deliveries — all from one dashboard.',
    perks: ['Instant price quotes', 'Live tracking timeline', 'Email notifications', 'COD & prepaid support'],
  },
  {
    icon: '🚴‍♂️',
    role: 'Delivery Agent',
    color: 'border-l-4 border-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    desc: 'View your assigned deliveries, update status at each stage, and log delivery notes from the field.',
    perks: ['Auto-assigned orders', 'Status update controls', 'Delivery note logging', 'Zone-based matching'],
  },
  {
    icon: '🛡️',
    role: 'Administrator',
    color: 'border-l-4 border-purple-500',
    iconBg: 'bg-purple-50 text-purple-600',
    desc: 'Configure zones, rate cards, and agents. Oversee every order in the system with full control.',
    perks: ['Zone & rate management', 'Agent management', 'Full order oversight', 'Auto-assign controls'],
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#1a1560] to-[#24243e]">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-28 sm:py-36 text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 rounded-full px-5 py-2 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Last-Mile Delivery Platform
          </div>

          {/* Main headline — Space Grotesk applied via h1 */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-7">
            Deliveries that run
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
              like clockwork.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
            DeliverySync is a complete delivery management system for customers, agents, and admins.
            Instant quotes, real-time tracking, and intelligent dispatch — in one platform.
          </p>

          {/* CTA buttons */}
          {user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user.role === 'admin' ? '/admin/orders' : user.role === 'agent' ? '/agent/orders' : '/customer/orders'}
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl shadow-2xl hover:bg-blue-50 transition-all duration-200 text-base"
              >
                Go to Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl shadow-2xl hover:bg-blue-50 transition-all duration-200 text-base"
              >
                Create free account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 text-base backdrop-blur-sm"
              >
                Sign in
              </Link>
            </div>
          )}


        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Platform Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to ship.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No hardcoded rates, no fixed zones — every parameter is admin-configurable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl mb-5 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              How it works
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Ship in four steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-0px)] w-full h-px bg-gradient-to-r from-gray-300 to-transparent z-10" />
                )}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-7 hover:border-blue-200 hover:shadow-md transition-all duration-200 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Role-based access
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              One platform, three roles.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each role has a tailored dashboard with exactly the tools and permissions it needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ROLES.map((r) => (
              <div
                key={r.role}
                className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${r.color}`}
              >
                <div className="p-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 ${r.iconBg}`}>
                    {r.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{r.role}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{r.desc}</p>
                  <ul className="space-y-2">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      {!user && (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1560] to-[#0f0c29] py-24">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">Ready to ship?</h2>
            <p className="text-blue-200 text-lg mb-10 leading-relaxed">
              Create a free account and place your first order in minutes. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl shadow-2xl hover:bg-blue-50 transition-all duration-200 text-base"
              >
                Create free account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 text-base"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg shadow-md">
                📦
              </div>
              <span className="text-white font-bold text-base">DeliverySync</span>
            </div>
            <a
              href="https://github.com/Siyabojewar/LastMile_Delivery"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
