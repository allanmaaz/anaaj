import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAuthUser } from '../api';
import { showToast } from '../components/Toast';

export default function Checkout() {
  const [cart,    setCart]    = useState(null);
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAuthUser(), api.getCart()])
      .then(([user, cart]) => {
        if (!user) { navigate('/login?return=/checkout'); return; }
        if (!cart.items?.length) { navigate('/cart'); return; }
        setCart(cart);
        setAddress(user.address || '');
      });
  }, []);

  const place = async () => {
    setError('');
    if (!address.trim()) { setError('Please enter a delivery address.'); return; }
    setPlacing(true);
    try {
      const data = await api.placeOrder(address.trim());
      if (data.success) navigate(`/order-success/${data.orderId}`);
      else setError(data.error || 'Failed to place order.');
    } catch { setError('Network error. Please try again.'); }
    finally { setPlacing(false); }
  };

  if (!cart) return <div className="spinner" style={{ marginTop:'5rem' }} />;

  return (
    <div style={{ maxWidth:'700px',margin:'2rem auto',padding:'0 1rem',position:'relative',zIndex:1 }}>
      <h1 style={{ fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem' }}>🚚 Checkout</h1>

      {/* Order Summary */}
      <div className="glass" style={{ padding:'1.25rem',marginBottom:'1.5rem' }}>
        <div style={{ fontWeight:600,fontSize:'0.85rem',marginBottom:'0.75rem',color:'var(--text-secondary)' }}>ORDER SUMMARY</div>
        {cart.items.map(item => (
          <div key={item.productId} className="summary-row" style={{ fontSize:'0.85rem' }}>
            <span style={{ color:'var(--text-secondary)' }}>{item.productName} × {item.quantity}</span>
            <span>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row summary-total" style={{ marginTop:'0.5rem' }}>
          <span>Total</span>
          <span style={{ color:'var(--blue)',fontWeight:700 }}>₹{Number(cart.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Address */}
      <div className="glass" style={{ padding:'1.5rem',marginBottom:'1.5rem' }}>
        <div style={{ fontWeight:600,marginBottom:'1rem' }}>Delivery Address</div>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Enter your full delivery address&#10;Door no., Street, City, State — PIN"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </div>

      <div className="alert alert-warn" style={{ marginBottom:'1rem' }}>
        ⚠️ Payment is simulated for this demo. No real money will be charged.
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn btn-primary btn-block btn-lg" onClick={place} disabled={placing}>
        {placing ? 'Placing order…' : '✅ Place Order'}
      </button>
      <a href="/cart" className="btn btn-glass btn-block mt-1">← Back to Cart</a>
    </div>
  );
}
