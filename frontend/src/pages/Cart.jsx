import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function Cart() {
  const [cart,    setCart]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [authed,  setAuthed]  = useState(true);

  const loadCart = async () => {
    try {
      const authRes = await fetch('/api/profile');
      if (!authRes.ok) { setAuthed(false); setLoading(false); return; }
      const data = await api.getCart();
      setCart(data);
    } catch { setCart({ items: [], total: 0, count: 0 }); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCart(); }, []);

  const update = async (productId, qty) => {
    await api.updateCart(productId, qty);
    loadCart();
  };
  const remove = async (productId) => {
    await api.removeItem(productId);
    showToast('Item removed', 'info');
    loadCart();
  };

  if (loading) return <div className="spinner" style={{ marginTop:'5rem' }} />;

  if (!authed) return (
    <div className="cart-container" style={{ textAlign:'center',paddingTop:'4rem' }}>
      <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>🔐</div>
      <p>Please log in to view your cart.</p>
      <Link to="/login" className="btn btn-primary mt-2">Login</Link>
    </div>
  );

  const items = cart?.items || [];

  if (!items.length) return (
    <div className="cart-container" style={{ textAlign:'center',paddingTop:'4rem' }}>
      <div style={{ fontSize:'4rem',marginBottom:'1rem' }}>🛒</div>
      <p style={{ fontSize:'1.1rem',marginBottom:'1.5rem' }}>Your cart is empty!</p>
      <Link to="/shop" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop:'2rem' }}>
      <h1 style={{ fontSize:'2rem',fontWeight:900,marginBottom:'2rem',letterSpacing:'-0.03em' }}>🛒 Shopping Cart</h1>

      <div className="cart-page-layout">
        <div className="cart-items-list">
          {items.map(item => (
            <div key={item.productId} className="cart-item-row">
              <div className="cart-thumb">
                <img 
                  src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `/images/${item.imageUrl}`) : 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200'} 
                  alt={item.productName} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200' }}
                />
              </div>
              <div style={{ flex:1 }}>
                <div className="cart-item-name">{item.productName}</div>
                <div className="cart-item-price">₹{Number(item.unitPrice).toFixed(2)} / {item.unit || 'kg'}</div>
              </div>
              
              <div className="qty-control">
                <button className="qty-btn" onClick={() => update(item.productId, item.quantity - 1)}>−</button>
                <span className="qty-val">{item.quantity}</span>
                <button className="qty-btn" onClick={() => update(item.productId, item.quantity + 1)}>+</button>
              </div>

              <div className="cart-line-total">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
              
              <button className="remove-item-btn" onClick={() => remove(item.productId)} title="Remove item">
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary-premium">
          <h2 style={{ fontSize:'1.2rem',fontWeight:800,marginBottom:'1.5rem' }}>Order Summary</h2>
          
          <div className="summary-row">
            <span style={{ color:'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontWeight:600 }}>₹{Number(cart.total).toFixed(2)}</span>
          </div>
          <div className="summary-row" style={{ marginTop:'0.5rem' }}>
            <span style={{ color:'var(--text-muted)' }}>Delivery</span>
            <span style={{ color:'var(--green)', fontWeight:700 }}>FREE</span>
          </div>
          
          <div style={{ height:'1px', background:'rgba(255,255,255,0.1)', margin:'1.5rem 0' }} />
          
          <div className="summary-row">
            <span style={{ fontSize:'1.1rem', fontWeight:800 }}>Total</span>
            <span style={{ fontSize:'1.4rem',fontWeight:900,color:'var(--blue)' }}>₹{Number(cart.total).toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary btn-block btn-lg" style={{ marginTop:'2rem' }}>
            Proceed to Checkout →
          </Link>
          <Link to="/shop" className="btn btn-glass btn-block mt-1" style={{ fontSize:'0.8rem', opacity:0.6 }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
