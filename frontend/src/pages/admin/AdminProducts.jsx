import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthUser } from '../../api';
import { showToast } from '../../components/Toast';
import FreshnessBar from '../../components/FreshnessBar';

const EMPTY_FORM = { name:'', price:'', unit:'kg', stock:'', categoryId:'1', originState:'', freshnessScore:'90', description:'', imageUrl:'', isOrganic:false };

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="logo">🌾 Anaaj Admin</div>
      <ul className="admin-nav">
        <li><Link to="/admin/products" className="active">📦 Products</Link></li>
        <li><Link to="/admin/orders">🧾 Orders</Link></li>
        <li><Link to="/">🏠 Home</Link></li>
        <li><Link to="/shop">🛍️ Shop</Link></li>
        <li><a href="/logout" style={{ color:'var(--rose)' }}>⏻ Logout</a></li>
      </ul>
    </aside>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);  // null = add new
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErr, setFormErr]   = useState('');

  useEffect(() => {
    getAuthUser().then(u => {
      if (!u || u.role !== 'admin') navigate('/');
      else load();
    });
  }, []);

  const load = () => {
    Promise.all([api.adminProducts(), api.adminStats()])
      .then(([p, s]) => { setProducts(Array.isArray(p) ? p : []); setStats(s); })
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormErr('');
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, price: p.price, unit: p.unit, stock: p.stock,
      categoryId: p.categoryId, originState: p.originState||'',
      freshnessScore: p.freshnessScore, description: p.description||'',
      imageUrl: p.imageUrl||'', isOrganic: !!(p.isOrganic || p.organic)
    });
    setFormErr(''); setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price) { setFormErr('Name and price are required.'); return; }
    try {
      const payload = { ...form, id: editing };
      const res = editing ? await api.adminEditProduct(payload) : await api.adminAddProduct(payload);
      if (res.success) { showToast(editing ? 'Product updated!' : 'Product added!', 'success'); setModal(false); load(); }
      else setFormErr(res.error || 'Save failed.');
    } catch (e) { setFormErr('Network error.'); }
  };

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await api.adminDeleteProduct(id);
    if (res.success) { showToast('Deleted!', 'info'); load(); }
    else showToast(res.error || 'Delete failed', 'error');
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) });

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem' }}>
          <div className="admin-page-title" style={{ marginBottom:0 }}>📦 Products</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stat-cards">
            <div className="stat-card"><div className="stat-card-val">{stats.totalOrders}</div><div className="stat-card-lbl">Total Orders</div></div>
            <div className="stat-card"><div className="stat-card-val">₹{Number(stats.totalRevenue||0).toFixed(0)}</div><div className="stat-card-lbl">Total Revenue</div></div>
          </div>
        )}

        {/* Table */}
        {loading ? <div className="spinner" /> : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Origin</th><th>Freshness</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {!products.length && (
                  <tr><td colSpan={8} style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>No products. Add one!</td></tr>
                )}
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.categoryName || p.categoryId}</td>
                    <td>₹{Number(p.price).toFixed(2)}</td>
                    <td>{p.stock} {p.unit}</td>
                    <td>{p.originState||'—'}</td>
                    <td><FreshnessBar score={p.freshnessScore||0} /></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-glass btn-sm" onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(p.id, p.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem' }}>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="Basmati Rice" {...f('name')} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" type="number" step="0.01" placeholder="85.00" {...f('price')} />
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginTop:'0.75rem' }}>
              <div><label className="form-label">Unit</label>
                <select className="form-input status-select" style={{ width:'100%' }} {...f('unit')}>
                  {['kg','500g','1kg','5kg','litre'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div><label className="form-label">Stock</label><input className="form-input" type="number" {...f('stock')} /></div>
              <div><label className="form-label">Category ID</label><input className="form-input" type="number" {...f('categoryId')} /></div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.75rem' }}>
              <div><label className="form-label">Origin State</label><input className="form-input" placeholder="Punjab" {...f('originState')} /></div>
              <div><label className="form-label">Freshness (0-100)</label><input className="form-input" type="number" min="0" max="100" {...f('freshnessScore')} /></div>
            </div>
            <div style={{ marginTop:'0.75rem' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} {...f('description')} />
            </div>
            <div style={{ marginTop:'0.75rem' }}>
              <label className="form-label">Image filename (in /images/)</label>
              <input className="form-input" placeholder="rice.jpg" {...f('imageUrl')} />
            </div>
            <label style={{ display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'0.8rem',color:'var(--text-secondary)',marginTop:'0.75rem' }}>
              <input type="checkbox" style={{ accentColor:'var(--green)' }}
                checked={form.isOrganic}
                onChange={e => setForm(p => ({ ...p, isOrganic: e.target.checked }))}
              /> 🌿 Organic
            </label>
            {formErr && <div className="alert alert-error" style={{ marginTop:'0.75rem' }}>{formErr}</div>}
            <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'1.25rem' }}>
              <button className="btn btn-glass" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
