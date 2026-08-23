import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Feature card data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🧾',
    title: 'Smart Rate Calculation',
    desc: 'AI-powered pricing based on distance, weight, and delivery complexity. Get instant quotes with zero hidden fees.',
    accent: 'from-blue-500 to-indigo-600'
  },
  {
    icon: '📍',
    title: 'Real-Time GPS Tracking',
    desc: 'Live location updates, ETA predictions, and automated customer notifications throughout the delivery journey.',
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    icon: '🚴‍♂️',
    title: 'Intelligent Dispatch',
    desc: 'Machine learning algorithms assign orders to the optimal delivery agent based on proximity and workload.',
    accent: 'from-purple-500 to-violet-600'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast Processing',
    desc: 'Sub-second order processing with automatic route optimization and instant confirmation notifications.',
    accent: 'from-amber-500 to-orange-600'
  },
];

/* ── How it works steps ─────────────────────────────────────────────────── */
const WORKFLOW = [
  { 
    step: '01', 
    icon: '📝', 
    title: 'Place Order',  
    desc: 'Enter pickup & delivery details to get instant pricing',
    color: 'text-blue-600 dark:text-blue-400'
  },
  { 
    step: '02', 
    icon: '🎯', 
    title: 'Smart Assignment',      
    desc: 'AI automatically assigns to the best available agent',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  { 
    step: '03', 
    icon: '🚚', 
    title: 'Real-Time Updates', 
    desc: 'Track every milestone with live GPS and notifications',
    color: 'text-purple-600 dark:text-purple-400'
  },
  { 
    step: '04', 
    icon: '✅', 
    title: 'Delivered',       
    desc: 'Proof of delivery with photos and digital signatures',
    color: 'text-orange-600 dark:text-orange-400'
  },
];

/* ── Role cards ─────────────────────────────────────────────────────────── */
const USER_ROLES = [
  { 
    icon: '🛍️', 
    role: 'Customers', 
    desc: 'Small businesses and individuals who need reliable last-mile delivery services',
    features: ['Instant Quotes', 'Live Tracking', 'Flexible Scheduling', 'Multiple Payment Options'],
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
  },
  { 
    icon: '🚴‍♂️', 
    role: 'Delivery Agents',    
    desc: 'Professional drivers and riders who fulfill delivery orders efficiently',
    features: ['Route Optimization', 'Earnings Dashboard', 'Performance Analytics', 'Mobile App'],
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
  },
  { 
    icon: '⚙️', 
    role: 'Administrators',    
    desc: 'System managers who oversee operations and configure business rules',
    features: ['Fleet Management', 'Analytics Dashboard', 'Rate Configuration', 'User Management'],
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
  },
];

const STATS = [
  { value: '50K+', label: 'Deliveries Completed', icon: '📦' },
  { value: '1.2K+', label: 'Active Agents', icon: '🚴‍♂️' },
  { value: '99.2%', label: 'Success Rate', icon: '✅' },
  { value: '4.8★', label: 'Average Rating', icon: '⭐' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">

      {/* ── Enhanced Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-purple-400/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-400/10 to-blue-400/20 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-bl from-purple-400/15 via-pink-400/10 to-indigo-400/15 blur-2xl animate-pulse delay-500" />
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)]" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-neutral-700 dark:text-neutral-200 rounded-full px-6 py-3 text-sm font-semibold mb-8 shadow-lg ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400">Live System</span>
              </div>
              <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-600"></span>
              <span>🚀 Enterprise-Grade Delivery Platform</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              <span className="block">Logistics Platform</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>

            {/* Compelling Subheading */}
            <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed mb-12 font-medium">
              Advanced delivery management with <span className="text-blue-600 dark:text-blue-400 font-semibold">AI-powered routing</span>, 
              real-time tracking, and intelligent dispatch. 
              <span className="block mt-2 text-lg">Trusted by businesses for mission-critical deliveries.</span>
            </p>

            {/* Enhanced CTA Buttons */}
            {user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  to={user.role === 'admin' ? '/admin/orders' : user.role === 'agent' ? '/agent/orders' : '/customer/orders'}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Open Dashboard</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Start Free Trial</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1m5 4v6m4-6v6m4-6v6" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Trust Indicators / Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium flex items-center justify-center gap-1">
                    <span className="text-lg">{stat.icon}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Enhanced Features Grid ────────────────────────────────────────── */}
      <section className="relative py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>✨</span> Platform Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Everything You Need for
              <span className="block text-blue-600 dark:text-blue-400">Modern Logistics</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Built with enterprise-grade architecture and designed for businesses that demand reliability, speed, and scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enhanced How it Works ─────────────────────────────────────────── */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
              <span>🚀</span> Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              From Order to Delivery
              <span className="block text-blue-600 dark:text-blue-400">In Four Steps</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Our streamlined workflow ensures every delivery is tracked, optimized, and completed efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WORKFLOW.map((step, i) => (
              <div key={i} className="relative">
                {/* Connection Line */}
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 z-10" />
                )}
                
                <div className="relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                    {step.step}
                  </div>
                  
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className={`text-lg font-bold mb-3 ${step.color}`}>
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enhanced Roles Section ────────────────────────────────────────── */}
      <section className="relative py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>👥</span> Built for Everyone
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Tailored Experience
              <span className="block text-emerald-600 dark:text-emerald-400">For Every User</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Role-based dashboards and features designed specifically for customers, delivery agents, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {USER_ROLES.map((role, i) => (
              <div
                key={i}
                className={`relative rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group ${role.gradient}`}
              >
                <div className="relative p-8">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${role.iconBg} text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                      {role.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      {role.role}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                      {role.desc}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {role.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enhanced CTA Section ──────────────────────────────────────────── */}
      {!user && (
        <section className="relative py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform
              <span className="block">Your Delivery Operations?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of businesses already using DeliverySync to streamline their logistics and delight their customers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Start Free Trial</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 bg-transparent border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-300"
              >
                <span>Sign In</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1m5 4v6m4-6v6m4-6v6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Enhanced Footer ───────────────────────────────────────────────── */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 border-t border-neutral-800 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg">
                  📦
                </div>
                <div>
                  <div className="text-xl font-bold text-white">DeliverySync</div>
                  <div className="text-sm text-neutral-400">Enterprise Logistics Platform</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-neutral-400">
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              <div className="text-center sm:text-right">
                <p>Built with React, Express & PostgreSQL</p>
                <p className="mt-1">
                  <a
                    href="https://github.com/Siyabojewar/LastMile_Delivery"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View on GitHub →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
