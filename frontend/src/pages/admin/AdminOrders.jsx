import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthUser } from '../../api';
import { showToast } from '../../components/Toast';
import OrderTimeline from '../../components/OrderTimeline';

const STATUSES = ['Confirmed','Packed','Shipped','Delivered'];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getAuthUser().then(u => {
      if (!u || u.role !== 'admin') navigate('/');
      else {
        setCurrentUser(u);
        api.adminOrders()
          .then(data => { setOrders(Array.isArray(data) ? data : []); })
          .catch(err => { console.error('Failed to load orders:', err); setOrders([]); })
          .finally(() => setLoading(false));
      }
    });
  }, []);

  const updateStatus = async (orderId, status) => {
    const res = await api.adminUpdateStatus(orderId, status);
    if (res.success) {
      showToast(`Order #${orderId} → ${status}`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } else showToast(res.error || 'Update failed', 'error');
  };

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">🌾 Anaaj Admin</div>
        <ul className="admin-nav">
          <li><Link to="/admin/products">📦 Products</Link></li>
          <li><Link to="/admin/orders" className="active">🧾 Orders</Link></li>
          {(currentUser?.email?.includes('maazimdad') || currentUser?.email === 'admin@anaaj.com') && (
            <li><Link to="/admin/users">👥 Master Users</Link></li>
          )}
          <li><Link to="/">🏠 Home</Link></li>
          <li>
            <a href="#" style={{ color:'var(--rose)' }} onClick={(e) => { e.preventDefault(); fetch('/logout').then(() => navigate('/login')); }}>
              ⏻ Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="admin-content">
        <div className="admin-page-title">🧾 All Orders</div>

        {/* Status filter */}
        <div className="filter-row" style={{ marginBottom:'1.5rem' }}>
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >{s === 'all' ? 'All' : s}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* Desktop Table */}
            <div className="data-table-wrap desktop-only">
              <table className="data-table">
                <thead><tr>
                  <th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th>
                  <th>Date</th><th>Address</th><th>Update Status</th>
                </tr></thead>
                <tbody>
                  {!displayed.length && (
                    <tr><td colSpan={7} style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>No orders found.</td></tr>
                  )}
                  {displayed.map(order => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>{order.userName || '—'}</td>
                      <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                      <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                      <td style={{ whiteSpace:'nowrap',fontSize:'0.8rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td style={{ fontSize:'0.8rem',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}
                          title={order.deliveryAddress||''}>
                        {order.deliveryAddress?.slice(0,40)}…
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="mobile-only" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {!displayed.length && (
                <div style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>No orders found.</div>
              )}
              {displayed.map(order => (
                <div key={order.id} className="glass" style={{ padding:'1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                    <strong style={{ fontSize:'1rem' }}>#{order.id}</strong>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>
                    👤 {order.userName || '—'} · ₹{Number(order.totalAmount).toFixed(2)}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.75rem' }}>
                    📅 {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    {order.deliveryAddress && <span> · 📍 {order.deliveryAddress.slice(0,30)}…</span>}
                  </div>
                  <OrderTimeline status={order.status} />
                  <div style={{ marginTop:'0.75rem' }}>
                    <label style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>
                      Update Status
                    </label>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ width:'100%', padding:'0.75rem 1rem', fontSize:'0.9rem' }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
