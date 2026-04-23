import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { getAuthUser } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, refreshCart } = useCart();
  const [user, setUser]             = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      </Link>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} id="nav-links">
        <li><Link to="/"        className={isActive('/')}        onClick={() => setMenuOpen(false)}><span className="nav-icon">🏠</span> Home</Link></li>
        <li><Link to="/shop"    className={isActive('/shop')}    onClick={() => setMenuOpen(false)}><span className="nav-icon">🛍️</span> Shop</Link></li>
        <li><Link to="/cart"    className={isActive('/cart')}    onClick={() => setMenuOpen(false)}><span className="nav-icon">🛒</span> Cart</Link></li>
        <li><Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}><span className="nav-icon">👤</span> My Orders</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/admin/products" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}><span className="nav-icon" style={{color:'var(--amber)'}}>👑</span> Admin</Link></li>
        )}
      </ul>

      <div className="navbar-actions">
        <Link to="/cart" className="cart-btn">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setUserMenuOpen(o => !o)} 
              className="user-pill" 
              style={{background:'none', border:'none', cursor:'pointer'}}
            >
              <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span className="mobile-hide">{user.name?.split(' ')[0]}</span>
              {user.role === 'admin' && <span className="mobile-hide" style={{ color: 'var(--amber)', fontSize: '0.7rem' }}>★</span>}
            </button>
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'rgba(10,18,40,0.95)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)' }}>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>My Profile</Link>
                {user.role === 'admin' && <Link to="/admin/products" onClick={() => setUserMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--amber)', textDecoration: 'none', fontSize: '0.85rem' }}>Admin Tools</Link>}
                <button onClick={() => fetch('/logout').then(() => { setUser(null); navigate('/login'); })} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--rose)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-glass btn-sm mobile-hide">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(o => !o)}>
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
}
