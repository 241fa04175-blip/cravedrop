import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#262626] shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Location */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-black flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-500/20">
              C
            </span>
            <span>Crave<span className="text-primary">Drop</span></span>
          </Link>
          <span className="hidden sm:inline text-xs text-gray-400 font-medium border-l border-[#262626] pl-3">
            <b className="text-gray-200">Bengaluru,</b> Karnataka
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
        </nav>

        {/* Right Menu */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/cart" className="flex items-center gap-1.5 text-gray-200 hover:text-primary px-2 py-1 transition-colors">
            <span>Cart</span>
            <span className="bg-primary text-black text-xs px-1.5 py-0.5 rounded font-black">{itemCount}</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] text-gray-200 hover:text-primary border border-[#2e2e2e] rounded text-sm transition-colors"
              >
                <span>{user.name}</span>
                <span className="text-xs text-gray-400">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#171717] border border-[#2e2e2e] rounded-xl shadow-2xl py-1 text-sm z-50">
                  <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold border-b border-[#262626] uppercase">
                    Role: {user.role}
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-[#262626] hover:text-primary">
                    My Profile
                  </Link>
                  {user.role === 'customer' && (
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-[#262626] hover:text-primary">
                      My Orders
                    </Link>
                  )}
                  {user.role === 'owner' && (
                    <Link to="/owner" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-[#262626] hover:text-primary">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-[#262626] hover:text-primary">
                      Dashboard
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/30 border-t border-[#262626]">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-gray-300 hover:text-primary px-2 py-1 transition-colors">Login</Link>
              <Link to="/signup" className="bg-primary text-black px-3.5 py-1.5 rounded-lg hover:bg-emerald-400 font-bold transition-all shadow-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
