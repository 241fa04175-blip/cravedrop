import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      await register(name, email, password);
      // New signups are customers, redirect to Home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-transparent px-4 py-8">
      <div className="w-full max-w-md bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Sign up to start ordering from CraveDrop</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-4 p-3 text-sm text-red-300 bg-red-950/50 border border-red-500/40 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] text-gray-100 placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] text-gray-100 placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] text-gray-100 placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-primary text-gray-950 text-sm font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-sm"
          >
            {submitting ? 'Please wait...' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

