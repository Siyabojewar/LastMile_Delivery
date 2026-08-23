import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import OrderCard from '../../components/shared/OrderCard';
import EmptyState from '../../components/shared/EmptyState';
import Alert from '../../components/shared/Alert';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import { STATUS_CATEGORIES } from '../../utils/statusColors';

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

  // Split orders by status category
  const activeOrders = orders.filter(o => STATUS_CATEGORIES.active.includes(o.status));
  const completedOrders = orders.filter(o => STATUS_CATEGORIES.terminal.includes(o.status));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon="📋"
        title="My Orders"
        description="Track all your shipments and view delivery status in real-time"
        action={{ label: '+ New Order', href: '/customer/new-order' }}
      />

      <Alert message={error} className="mb-6" />

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-surface-secondary dark:bg-surface-dark-secondary rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-surface-secondary dark:bg-surface-dark-secondary rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📭"
          title="No orders yet"
          description="You haven't placed any orders. Get an instant quote and ship your first package in minutes."
          action={{ label: '📦 Place your first order', href: '/customer/new-order' }}
        />
      ) : (
        <div className="space-y-8">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  🚚
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
                    In Progress
                  </h2>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    {activeOrders.length} active {activeOrders.length === 1 ? 'delivery' : 'deliveries'}
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {activeOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    role="customer"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed Orders Section */}
          {completedOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-600 dark:text-success-400">
                  🏁
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
                    Completed
                  </h2>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    {completedOrders.length} completed {completedOrders.length === 1 ? 'delivery' : 'deliveries'}
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {completedOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    role="customer"
                    muted={true}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
