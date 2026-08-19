import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/assigned')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Assigned Orders</h1>
      <Alert message={error} />
      {orders.length === 0 && !error && (
        <div className="card text-center py-12 text-gray-500">No orders assigned to you yet.</div>
      )}
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/agent/orders/${order.id}`} className="card block hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">#{order.id.slice(-8)}</p>
                <p className="font-medium">
                  {order.customer?.name} — {order.dropAddress}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Pickup: {order.pickupAddress} ({order.pickupPincode})
                </p>
                {order.scheduledDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <StatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
