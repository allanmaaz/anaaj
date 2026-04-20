import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getAuthUser } from '../api';
import { showToast } from '../components/Toast';
import OrderTimeline from '../components/OrderTimeline';

export default function Profile() {
  const [user,   setUser]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading,setLoading]= useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', address:'' });

  useEffect(() => {
    Promise.all([getAuthUser(), api.getOrders()])
      .then(([u, o]) => {
        if (!u) { setLoading(false); return; }
        setUser(u);
        setForm({ name: u.name||'', phone: u.phone||'', address: u.address||'' });
        setOrders(Array.isArray(o) ? o : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    const res = await api.updateProfile(form);
    if (res.success) {
      showToast('Profile updated!', 'success');
      setUser(u => ({ ...u, ...form }));
      setEditOpen(false);
    } else showToast(res.error || 'Update failed', 'error');
  };

  if (loading) return <div className="spinner" style={{ marginTop:'5rem' }} />;
  if (!user) return (
    <div style={{ textAlign:'center',paddingTop:'5rem',color:'var(--text-muted)' }}>
      <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>🔐</div>
      <p>Please log in to view your profile.</p>
      <Link to="/login" className="btn btn-primary mt-2">Login</Link>
    </div>
  );

  return (
    <div className="section" style={{ paddingTop:'1.5rem' }}>
      <div className="profile-layout">
        {/* Profile card */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-role-badge">{user.role}</div>
            <button className="btn btn-glass btn-block mt-2" onClick={() => setEditOpen(o => !o)}>
              ✏️ Edit Profile
            </button>
          </div>

          {editOpen && (
            <div className="glass" style={{ marginTop:'1rem',padding:'1.25rem' }}>
              <div style={{ fontWeight:600,marginBottom:'1rem',fontSize:'0.9rem' }}>Edit Profile</div>
              {['name','phone','address'].map(field => (
                <div key={field} className="form-group">
                  <label className="form-label">{field.charAt(0).toUpperCase()+field.slice(1)}</label>
                  {field === 'address'
                    ? <textarea className="form-input" rows={2} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                    : <input className="form-input" type="text" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />}
                </div>
              ))}
              <button className="btn btn-primary btn-block" onClick={saveProfile}>Save Changes</button>
            </div>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 style={{ fontSize:'1.3rem',fontWeight:700,marginBottom:'1.25rem' }}>📦 Order History</h2>
          {!orders.length && (
            <div style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>
              <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>📭</div>
              No orders yet. <Link to="/shop" className="text-blue">Shop now!</Link>
            </div>
          )}
          {orders.map(order => (
            <div key={order.id} className="glass" style={{ padding:'1.25rem',marginBottom:'1rem' }}>
              <div className="flex-between" style={{ marginBottom:'0.5rem' }}>
                <div>
                  <strong>#{order.id}</strong>
                  <span className={`status-badge status-${order.status}`} style={{ marginLeft:'0.5rem' }}>{order.status}</span>
                </div>
                <span style={{ fontSize:'0.8rem',color:'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </span>
              </div>
              <OrderTimeline status={order.status} />
              <div className="flex-between" style={{ fontSize:'0.85rem',paddingTop:'0.5rem',borderTop:'0.5px solid rgba(255,255,255,0.07)' }}>
                <span>Total: <strong style={{ color:'var(--text-primary)' }}>₹{Number(order.totalAmount).toFixed(2)}</strong></span>
                <span style={{ color:'var(--text-muted)',fontSize:'0.78rem' }}>
                  {order.deliveryAddress?.slice(0, 50)}…
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
