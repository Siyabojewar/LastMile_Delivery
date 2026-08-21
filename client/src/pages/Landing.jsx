import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Feature card data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🧾',
    title: 'Instant Rate Quotes',
    desc: 'Get a precise delivery charge before committing — based on actual weight, volumetric weight, pickup zone, and drop zone. No surprises.',
  },
  {
    icon: '📍',
    title: 'Live Order Tracking',
    desc: 'Follow your shipment through every status — Picked Up, In Transit, Out for Delivery, Delivered — with a full timestamped timeline.',
  },
  {
    icon: '🚴',
    title: 'Reliable Agent Network',
    desc: 'Deliveries are auto-assigned to the nearest available agent using zone-matching and haversine distance, with manual override for admins.',
  },
  {
    icon: '💳',
    title: 'Prepaid & COD Support',
    desc: 'Choose between prepaid or Cash on Delivery. COD surcharges are configured per order type by the admin and shown in your quote.',
  },
];

/* ── How it works steps ─────────────────────────────────────────────────── */
const STEPS = [
  { n: '1', icon: '📝', label: 'Create account',  desc: 'Sign up as a customer in under a minute — no admin approval needed.' },
  { n: '2', icon: '🧾', label: 'Get a quote',      desc: 'Enter pickup and drop details to see the exact charge before placing the order.' },
  { n: '3', icon: '📦', label: 'Place your order', desc: 'Confirm the quote and your shipment enters the delivery pipeline immediately.' },
  { n: '4', icon: '📍', label: 'Track live',       desc: 'Watch real-time status updates and get email notifications on every change.' },
];

/* ── Role pills ─────────────────────────────────────────────────────────── */
const ROLES = [
  { icon: '📦', role: 'Customer', desc: 'Place orders, get instant quotes, track shipments, reschedule failed deliveries.' },
  { icon: '🚴', role: 'Agent',    desc: 'View assigned deliveries, update status at each stage, log delivery notes.' },
  { icon: '🛡', role: 'Admin',    desc: 'Manage zones, rate cards, agents, and oversee every order in the system.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 -z-10" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full
                        bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full
                        bg-brand-900/40 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 text-white rounded-full
                          px-4 py-1.5 text-sm font-semibold mb-6 ring-1 ring-white/20">
            <span>📦</span> Last-Mile Delivery Management Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white
                         leading-tight tracking-tight mb-6">
            Fast, Reliable<br />
            <span className="text-blue-200">Last-Mile Delivery</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-10">
            A complete delivery management platform for customers, agents, and administrators.
            Get instant rate quotes, track shipments in real time, and manage your entire
            delivery network from one dashboard.
          </p>

          {/* CTAs */}
          {user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user.role === 'admin' ? '/admin/orders' : user.role === 'agent' ? '/agent/orders' : '/customer/orders'}
                className="btn bg-white text-brand-700 hover:bg-blue-50 btn-lg shadow-card-lg
                           hover:shadow-card-lg hover:-translate-y-px font-extrabold"
              >
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn bg-white text-brand-700 hover:bg-blue-50 btn-lg shadow-card-lg
                           hover:-translate-y-px font-extrabold"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white/40 text-white hover:bg-white/10 btn-lg
                           font-semibold"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Scroll hint */}
          <p className="mt-10 text-blue-300 text-sm">↓ See how it works</p>
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Everything you need to manage deliveries</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Built for courier operations of any scale — no hardcoded rates, no fixed zones, everything admin-configurable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6
                         hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center
                              justify-center text-2xl mb-4 shadow-card ring-1 ring-brand-200">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-surface-50 to-brand-50/30 border-y border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Ship in four steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                {/* Step number + connector */}
                <div className="relative flex items-center justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center
                                  justify-center text-xl font-extrabold shadow-card-md ring-4 ring-brand-100">
                    {s.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full
                                   border-2 border-brand-600 text-brand-700 text-[10px]
                                   font-extrabold flex items-center justify-center shadow-card">
                    {s.n}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{s.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {/* Arrow connector (hidden on last) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles section ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Role-based access</p>
          <h2 className="text-3xl font-extrabold text-gray-900">One platform, three roles</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Each role has a tailored view and the exact permissions it needs — nothing more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map(r => (
            <div key={r.role}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6
                         hover:shadow-card-md transition-shadow duration-200">
              <div className="text-3xl mb-3 select-none">{r.icon}</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">{r.role}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      {!user && (
        <section className="bg-hero-gradient">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Ready to ship?
            </h2>
            <p className="text-blue-200 mb-8">
              Create a free customer account and place your first order in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn bg-white text-brand-700 hover:bg-blue-50 btn-lg shadow-card-lg
                           font-extrabold hover:-translate-y-px"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white/40 text-white hover:bg-white/10 btn-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center
                             justify-center text-sm shadow-card">📦</span>
            <span className="font-extrabold text-gray-800 text-sm">Last-Mile Delivery Tracker</span>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            Built with React, Express &amp; PostgreSQL ·{' '}
            <a
              href="https://github.com/Siyabojewar/LastMile_Delivery"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-brand-500"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
