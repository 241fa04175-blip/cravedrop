import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function CartSidebar() {
  const { restaurant, items, itemCount, itemTotal, increaseQty, decreaseQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 text-center shadow-sm">
        <h3 className="font-bold text-white text-base mb-1">Cart Empty</h3>
        <p className="text-xs text-gray-400 mb-4">
          Your order will appear here as you add items.
        </p>
        <div className="w-16 h-1 bg-[#262626] mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 shadow-sm">
      <div className="border-b border-[#262626] pb-3 mb-3">
        <h3 className="font-bold text-white text-sm">{restaurant?.name || 'Your Order'}</h3>
        <p className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="truncate text-gray-200 font-medium">{item.name}</span>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center border border-[#383838] bg-[#1a1a1a] rounded shrink-0 font-semibold">
              <button
                type="button"
                onClick={() => decreaseQty(item.menuItemId)}
                className="px-2 py-0.5 text-gray-400 hover:text-white hover:bg-[#262626]"
              >
                -
              </button>
              <span className="px-1.5 text-primary text-xs font-black">{item.quantity}</span>
              <button
                type="button"
                onClick={() => increaseQty(item.menuItemId)}
                className="px-2 py-0.5 text-gray-400 hover:text-white hover:bg-[#262626]"
              >
                +
              </button>
            </div>

            <div className="font-semibold text-white w-14 text-right shrink-0">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal Bill */}
      <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-sm font-bold text-white mb-4">
        <span>Subtotal</span>
        <span>{formatPrice(itemTotal)}</span>
      </div>

      {/* Checkout Button */}
      <Link
        to="/cart"
        className="block w-full py-2.5 px-4 bg-primary text-black font-extrabold text-center text-sm rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
      >
        Checkout ({formatPrice(itemTotal)})
      </Link>
    </div>
  );
}
