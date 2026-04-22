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
        api.adminOrders().then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
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
          {currentUser?.email?.includes('maazimdad') && (
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
          <div className="data-table-wrap">
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
        )}
      </main>
    </div>
  );
}
