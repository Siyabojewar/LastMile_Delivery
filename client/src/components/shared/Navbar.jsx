import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-brand-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Last-Mile Delivery Tracker
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200">
                {user.name} <span className="ml-1 text-xs bg-blue-800 rounded px-1.5 py-0.5 capitalize">{user.role}</span>
              </span>

              {user.role === 'customer' && (
                <>
                  <Link to="/customer/orders" className="text-sm hover:text-blue-200">My Orders</Link>
                  <Link to="/customer/new-order" className="text-sm hover:text-blue-200">New Order</Link>
                </>
              )}

              {user.role === 'agent' && (
                <Link to="/agent/orders" className="text-sm hover:text-blue-200">Assigned Orders</Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/orders" className="text-sm hover:text-blue-200">Orders</Link>
                  <Link to="/admin/zones" className="text-sm hover:text-blue-200">Zones</Link>
                  <Link to="/admin/rate-cards" className="text-sm hover:text-blue-200">Rates</Link>
                  <Link to="/admin/agents" className="text-sm hover:text-blue-200">Agents</Link>
                </>
              )}

              <button onClick={handleLogout} className="text-sm bg-brand-900 hover:bg-black px-3 py-1 rounded">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
