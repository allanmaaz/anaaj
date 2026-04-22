import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthUser } from '../../api';
import { showToast } from '../../components/Toast';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getAuthUser().then(u => {
      if (!u || u.role !== 'admin' || !u.email?.includes('maazimdad')) {
        navigate('/admin/products');
      } else {
        setCurrentUser(u);
        api.adminUsers().then(data => {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        });
      }
    });
  }, [navigate]);

  const updateRole = async (targetId, newRole) => {
    const res = await api.adminUpdateUserRole(targetId, newRole);
    if (res.success) {
      showToast(`User ${targetId} is now ${newRole.toUpperCase()}!`, 'success');
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, role: newRole } : u));
    } else {
      showToast(res.error || 'Failed to update role', 'error');
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo" style={{ marginBottom:'1rem' }}>🌾 Anaaj Admin</div>
        <ul className="admin-nav">
          <li><Link to="/admin/products">📦 Products</Link></li>
          <li><Link to="/admin/orders">🧾 Orders</Link></li>
          {currentUser?.email?.includes('maazimdad') && (
            <li><Link to="/admin/users" className="active">👥 Master Users</Link></li>
          )}
          <hr style={{ margin: '1rem 0', borderColor: 'rgba(255,255,255,0.05)' }} />
          <li><Link to="/">🏠 Live App</Link></li>
          <li>
            <a href="#" style={{ color:'var(--rose)' }} onClick={(e) => { e.preventDefault(); fetch('/logout').then(() => navigate('/login')); }}>
              ⏻ Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="admin-content">
        <div className="admin-page-title" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>👥 Master Directory <span style={{fontSize:'0.75rem', fontWeight:'500', marginLeft:'8px', background:'rgba(79,142,247,0.15)', color:'var(--blue)', padding:'4px 8px', borderRadius:'10px', whiteSpace:'nowrap'}}>Super Admin Access</span></div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Comprehensive database of all registered users, roles, and real-world contact info.</p>

        {loading ? <div className="spinner" /> : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>ID</th><th>Name</th><th>Email (Verified Google)</th><th>Phone</th><th>Role</th><th>Registered On</th>
              </tr></thead>
              <tbody>
                {!users.length && (
                  <tr><td colSpan={6} style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>No users found.</td></tr>
                )}
                {users.map(user => (
                  <tr key={user.id} style={{ background: user.email?.includes('maazimdad') ? 'rgba(79,142,247,0.06)' : 'transparent' }}>
                    <td><strong>U-{user.id}</strong></td>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.phone || <i style={{opacity:0.5}}>Not Set</i>}</td>
                    <td>
                      <select 
                        className="status-select" 
                        value={user.role} 
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={user.email === currentUser?.email}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ fontSize:'0.85rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
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
