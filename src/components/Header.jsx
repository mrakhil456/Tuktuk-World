import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useNavigate, useLocation } from 'react-router-dom';

import {
  Search,
  ShoppingCart,
  UserRound,
  ShieldCheck,
  LogOut
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

export default function Header() {
  const { user, logout, cart } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(
      new URLSearchParams(location.search).get('q') || ''
    );
  }, [location.search]);

  const submit = (e) => {
    e.preventDefault();

    navigate(
      `/shop${
        query.trim()
          ? `?q=${encodeURIComponent(query.trim())}`
          : ''
      }`
    );
  };

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="top-strip">
        Pet essentials, everyday favorites & fast shopping — welcome to Tuktuk World.
      </div>

      <div className="bar">
        <Link className="logo" to="/">
          <span className="logo-main">tuktuk</span>
          <span className="logo-world">world</span>
        </Link>

        <form className="global-search" onSubmit={submit}>
          <Search size={18} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            aria-label="Search products"
          />

          <button type="submit">Search</button>
        </form>

        <nav className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/shop">Shop</Link>

          {user && <Link to="/orders">Orders</Link>}

          {user?.role === 'admin' && (
            <Link to="/admin">
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </nav>

        <div className="header-actions">
          <Link className="cart-link" to="/cart">
            <ShoppingCart size={19} />
            Cart
            <span>
              {cart.reduce((a, x) => a + x.qty, 0)}
            </span>
          </Link>

          {user ? (
            <button className="ghost-btn" onClick={signOut}>
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <Link className="login-link" to="/login">
              <UserRound size={17} />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}