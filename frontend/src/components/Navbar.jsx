import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { getAuthUser } from '../api';

export default function Navbar() {
  const { cartCount, refreshCart } = useCart();
  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location = useLocation();

  useEffect(() => {
    refreshCart();
    getAuthUser().then(setUser);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">🌾</div>
        Anaaj
        <span className="brand-tag">Beta</span>
      </Link>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} id="nav-links">
        <li><Link to="/"        className={isActive('/')}        onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/shop"    className={isActive('/shop')}    onClick={() => setMenuOpen(false)}>Shop</Link></li>
        <li><Link to="/cart"    className={isActive('/cart')}    onClick={() => setMenuOpen(false)}>Cart</Link></li>
        <li><Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>My Orders</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/admin/products" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Admin</Link></li>
        )}
      </ul>

      <div className="navbar-actions">
        <Link to="/cart" className="cart-btn">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <a href="/logout" className="user-pill">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
            {user.name?.split(' ')[0]}
            {user.role === 'admin' && <span style={{ color: 'var(--amber)', fontSize: '0.7rem' }}>★</span>}
          </a>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
        )}
      </div>

      <div
        className="hamburger"
        onClick={() => setMenuOpen(o => !o)}
        style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer', padding: '4px' }}
      >
        <span style={{ width: '22px', height: '2px', background: 'var(--text-secondary)', borderRadius: '2px', display: 'block' }} />
        <span style={{ width: '22px', height: '2px', background: 'var(--text-secondary)', borderRadius: '2px', display: 'block' }} />
        <span style={{ width: '22px', height: '2px', background: 'var(--text-secondary)', borderRadius: '2px', display: 'block' }} />
      </div>
    </nav>
  );
}
