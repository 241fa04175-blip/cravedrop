import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';
import formatDate from '../utils/formatDate.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Orders() {
  const fallbackImage = '/images/foods/fallback.jpg';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { loadCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/mine');
        setOrders(res.data);
      } catch (err) {
        if (err.isAuthError) {
          navigate('/login?redirect=/orders');
          return;
        }
        setError('Failed to fetch your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    const targetRest = {
      id: order.restaurant?._id || order.restaurant,
      name: order.restaurant?.name || 'Restaurant'
    };
    const cartItems = order.items.map((it) => ({
      menuItemId: it.menuItem?._id || it.menuItem,
      name: it.name,
      price: it.price,
      isVeg: it.isVeg,
      quantity: it.quantity
    }));

    const ok = loadCart(targetRest, cartItems);
    if (ok) navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse bg-[#141414] border border-[#262626] rounded-2xl p-4 h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <div className="flex justify-center gap-2"><button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-gray-950 text-xs font-bold rounded hover:bg-emerald-400">Retry</button><Link to="/login?redirect=/orders" className="px-4 py-2 border border-primary text-emerald-400 text-xs font-bold rounded">Sign in again</Link></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-1">No orders yet</h2>
        <p className="text-xs text-gray-400 mb-6">Looks like you haven't placed any orders yet. Discover top restaurants now.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-primary text-gray-950 text-xs font-bold rounded shadow-xs hover:bg-emerald-400">
          Find food
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-white mb-6 pb-2 border-b border-[#262626]">Past Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const restName = order.restaurant?.name || 'Restaurant';
          const itemsSummary = order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ');

          return (
            <div key={order._id} className="bg-[#141414] border border-[#262626] rounded-2xl p-4 hover:border-[#383838] transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#262626]">
                <div>
                  <div className="flex items-center gap-2"><img src={order.restaurant?.image || fallbackImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }} alt="" className="w-9 h-9 rounded-lg object-cover" /><h3 className="font-bold text-white text-sm">{restName}</h3></div>
                  <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="py-2.5">
                <p className="text-xs text-gray-300 line-clamp-1">{itemsSummary}</p>
                {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.estimatedDeliveryAt && <p className="mt-2 text-xs font-semibold text-emerald-400">Expected by {new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                <span className="text-xs font-bold text-white">Total: {formatPrice(order.grandTotal)}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleReorder(order)} className="px-3 py-1 border border-primary text-emerald-400 text-xs font-bold rounded hover:bg-emerald-950/40">
                    Reorder
                  </button>
                  <Link to={`/orders/${order._id}`} className="px-3 py-1 bg-primary text-gray-950 text-xs font-bold rounded hover:bg-emerald-400">
                    Track order
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
