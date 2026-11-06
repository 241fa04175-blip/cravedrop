import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import StatusSteps from '../components/StatusSteps.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function OrderTracking() {
  const fallbackImage = '/images/foods/fallback.jpg', { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [rating, setRating] = useState(5), [comment, setComment] = useState(''), [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = async () => {
    try { const res = await api.get(`/orders/${id}`); setOrder(res.data); }
    catch (err) {
      if (err.isAuthError) {
        navigate(`/login?redirect=/orders/${id}`);
        return;
      }
      setError(err.response?.data?.message || 'Failed to load order');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);
  useEffect(() => {
    if (!order || !['placed', 'preparing', 'out_for_delivery'].includes(order.orderStatus)) return;
    const interval = setInterval(() => { fetchOrder(); }, 10000);
    return () => clearInterval(interval);
  }, [order?.orderStatus]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try { const res = await api.patch(`/orders/${id}/cancel`); setOrder(res.data.order); }
    catch (err) { alert(err.response?.data?.message || 'Could not cancel order'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await api.post(`/orders/${id}/review`, { rating, comment });
      setOrder(res.data.order);
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-center text-xs text-gray-400">Loading order...</div>;
  if (error || !order) return (
    <div className="max-w-md mx-auto p-8 text-center text-xs">
      <p className="text-sm text-red-400 mb-2">{error || 'Order not found'}</p>
      <Link to="/orders" className="font-bold text-emerald-400 hover:underline">Back to My Orders</Link>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
        <div>
          <h1 className="text-lg font-bold text-white">Track Order #{order._id.slice(-6).toUpperCase()}</h1>
          <div className="flex items-center gap-2 mt-1"><img src={order.restaurant?.image || fallbackImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }} alt="" className="w-7 h-7 rounded-md object-cover" /><p className="text-xs text-gray-400">From <span className="font-semibold text-gray-200">{order.restaurant?.name}</span></p></div>
        </div>
        <Link to="/orders" className="text-xs text-emerald-400 font-bold hover:underline">All Orders →</Link>
      </div>

      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs flex justify-between items-center text-emerald-300">
        <span className="font-semibold">{order.orderStatus === 'delivered' ? 'Food has arrived' : order.orderStatus === 'cancelled' ? 'Order cancelled' : 'Order in progress'}</span>
        <span className="text-gray-400">{order.estimatedDeliveryAt ? `ETA: ${new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
      </div>

      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4">
        <StatusSteps currentStatus={order.orderStatus} />
        {order.orderStatus === 'placed' && (
          <div className="text-center pt-3 border-t border-[#262626] mt-2">
            <button type="button" onClick={handleCancel} className="text-xs text-red-400 font-bold hover:underline">Cancel order</button>
          </div>
        )}
      </div>

      {order.orderStatus !== 'cancelled' && (
        ['out_for_delivery', 'delivered'].includes(order.orderStatus) && order.deliveryPartner?.name ? (
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-950 uppercase text-[11px] bg-emerald-500 px-2 py-1 rounded">Rider</span>
              <div><p className="font-bold text-white text-sm">{order.deliveryPartner.name}</p><p className="text-gray-400">{order.deliveryPartner.vehicleNumber}</p></div>
            </div>
            <a href={`tel:${order.deliveryPartner.phone}`} className="px-3 py-1.5 bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 rounded font-bold hover:bg-emerald-900/50">Call ({order.deliveryPartner.phone})</a>
          </div>
        ) : ['placed', 'preparing'].includes(order.orderStatus) ? (
          <div className="bg-[#141414] border border-blue-500/30 rounded-2xl p-3 text-xs text-blue-300 flex items-center gap-2">
            <span className="font-bold uppercase text-[10px] bg-blue-900 text-blue-200 border border-blue-400/30 px-1.5 py-0.5 rounded">Info</span><span>A delivery partner will be assigned once your order is out for delivery.</span>
          </div>
        ) : null
      )}

      {order.orderStatus === 'delivered' && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-xs">
          <h3 className="font-bold text-gray-200 uppercase tracking-wide mb-2">Order Feedback</h3>
          {order.isReviewed ? (
            <p className="bg-emerald-950/50 border border-emerald-500/30 p-3 rounded text-emerald-300 font-semibold">★ You rated this {order.rating} / 5 stars {order.reviewComment ? `("${order.reviewComment}")` : ''}. Thank you!</p>
          ) : (
            <form onSubmit={handleReview} className="space-y-3">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-300 mr-2">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} className={`text-xl ${s <= rating ? 'text-amber-400' : 'text-gray-600'}`}>★</button>
                ))}
              </div>
              <input type="text" placeholder="Write a short review (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#333] text-gray-100 rounded outline-none focus:border-primary" />
              <button type="submit" disabled={submittingReview} className="px-4 py-1.5 bg-primary text-gray-950 font-bold rounded shadow-xs hover:bg-emerald-400 disabled:opacity-50">{submittingReview ? 'Submitting...' : 'Submit review'}</button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-gray-200 uppercase tracking-wide border-b border-[#262626] pb-1.5">Items Ordered</h3>
          <div className="divide-y divide-[#262626]">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-1.5 flex justify-between text-gray-300">
                <span>{it.name} × {it.quantity}</span>
                <span className="font-semibold text-white">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-[#262626] text-gray-400">
            <p className="font-semibold text-gray-200">Delivery Address:</p>
            <p className="mt-0.5">{order.address}</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 space-y-2">
          <h3 className="font-bold text-gray-200 uppercase tracking-wide border-b border-[#262626] pb-1.5">Summary & Payment</h3>
          <p className="flex justify-between text-gray-400"><span>Payment Method</span><span className="font-bold uppercase text-white">{order.paymentMethod}</span></p>
          <p className="flex justify-between text-gray-400"><span>Payment Status</span><span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{order.paymentStatus}</span></p>
          <div className="border-t border-[#262626] pt-2 space-y-1 text-gray-400">
            <p className="flex justify-between"><span>Item Total</span><span className="text-gray-200">{formatPrice(order.itemTotal)}</span></p>
            <p className="flex justify-between"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatPrice(order.deliveryFee)}</span></p>
            <p className="flex justify-between"><span>Tax (5%)</span><span className="text-gray-200">{formatPrice(order.tax)}</span></p>
            {order.discount > 0 && <p className="flex justify-between text-emerald-400 font-bold"><span>Discount</span><span>-{formatPrice(order.discount)}</span></p>}
          </div>
          <div className="border-t border-[#262626] pt-2 flex justify-between font-bold text-sm text-white">
            <span>Grand Total</span><span className="text-emerald-400">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
