import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import MenuItemCard from '../components/MenuItemCard.jsx';
import CartSidebar from '../components/CartSidebar.jsx';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function Restaurant({ restaurantId }) {
  const { id } = useParams();
  const resolvedId = restaurantId || id;
  const { itemCount, itemTotal } = useCart();

  const [restaurant, setRestaurant] = useState(null), [menuItems, setMenuItems] = useState([]), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [dietFilter, setDietFilter] = useState('all'), [activeCategory, setActiveCategory] = useState(''), [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        setError('');
        const [restRes, menuRes] = await Promise.all([
          api.get(`/restaurants/${resolvedId}`),
          api.get(`/restaurants/${resolvedId}/menu`)
        ]);
        setRestaurant(restRes.data);
        setMenuItems(menuRes.data);
        if (menuRes.data.length > 0) setActiveCategory(menuRes.data[0].category);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Restaurant not found' : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAndMenu();
  }, [resolvedId]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading menu...</div>;

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">404 - Not Found</h2>
        <p className="text-xs text-gray-400 mb-4">{error || 'Restaurant not found'}</p>
        <Link to="/" className="px-4 py-1.5 bg-primary text-black text-xs font-bold rounded">Back to Home</Link>
      </div>
    );
  }

  const dietaryItems = dietFilter === 'veg' ? menuItems.filter((i) => i.isVeg) : dietFilter === 'nonveg' ? menuItems.filter((i) => !i.isVeg) : menuItems;
  const filteredItems = [...dietaryItems].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
  });
  const categories = [...new Set(menuItems.map((i) => i.category))];
  const groupedItems = categories.reduce((acc, cat) => {
    const itemsInCat = filteredItems.filter((i) => i.category === cat);
    if (itemsInCat.length > 0) acc[cat] = itemsInCat;
    return acc;
  }, {});

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-24 md:pb-12 text-gray-100">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Category Strip */}
        <aside className="md:col-span-3 sticky top-20 bg-[#121212] border border-[#262626] rounded-xl p-3 overflow-x-auto md:overflow-visible flex md:flex-col gap-1.5 shadow-sm">
          <label className="text-xs font-semibold text-gray-300 pb-2 md:border-b border-[#262626]">
            <span className="block mb-1 text-gray-400">Food preference</span>
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)} className="w-full border border-[#333333] rounded px-2 py-1.5 text-xs font-medium bg-[#1a1a1a] text-gray-200 outline-none focus:border-primary">
              <option value="all">All items</option>
              <option value="veg">Veg only</option>
              <option value="nonveg">Non-veg only</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-300 pt-1">
            <span className="block mb-1 text-gray-400">Sort items</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-[#333333] rounded px-2 py-1.5 text-xs font-medium bg-[#1a1a1a] text-gray-200 outline-none focus:border-primary">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              {cat}
            </a>
          ))}
        </aside>

        {/* Center Menu List */}
        <div className="md:col-span-6 space-y-6">
          {Object.entries(groupedItems).length === 0 ? (
            <div className="bg-[#121212] p-6 rounded-xl border border-[#262626] text-center text-xs text-gray-400">
              No dishes found matching your food preference.
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} id={`cat-${category}`} className="bg-[#121212] rounded-xl border border-[#262626] p-4 shadow-sm">
                <h3 className="font-bold text-white text-sm mb-3 pb-2 border-b border-[#262626]">{category} ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} restaurant={restaurant} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Right Desktop Cart Sidebar */}
        <aside className="hidden md:block md:col-span-3 sticky top-20">
          <CartSidebar />
        </aside>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {itemCount > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-black p-3.5 flex items-center justify-between font-bold text-sm shadow-xl z-40">
          <div>{itemCount} {itemCount === 1 ? 'item' : 'items'} | {formatPrice(itemTotal)}</div>
          <Link to="/cart" className="bg-black text-white px-3 py-1 rounded text-xs uppercase font-extrabold">View cart</Link>
        </div>
      )}
    </div>
  );
}
