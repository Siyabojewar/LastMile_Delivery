import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/mine')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link to="/customer/new-order" className="btn-primary">+ New Order</Link>
      </div>
      <Alert message={error} />
      {orders.length === 0 && !error && (
        <div className="card text-center py-12 text-gray-500">
          No orders yet. <Link to="/customer/new-order" className="text-brand-600 font-medium">Place your first order</Link>
        </div>
      )}
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/customer/orders/${order.id}`} className="card block hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">#{order.id.slice(-8)}</p>
                <p className="font-medium text-gray-900">{order.pickupAddress} → {order.dropAddress}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.orderType} · {order.paymentType} · ₹{Number(order.totalCharge).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
