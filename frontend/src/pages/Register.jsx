import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const urlErr = params.get('error');
  const errMap = { empty:'Please fill in required fields.', shortpwd:'Password must be at least 6 characters.', duplicate:'Email already exists.', server:'Server error.' };
  const shown  = error || (urlErr && errMap[urlErr]) || '';

  const handleSubmit = (e) => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      e.preventDefault(); setError('Name, email and password are required.'); return;
    }
    if (form.password.length < 6) {
      e.preventDefault(); setError('Password must be at least 6 characters.'); return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      e.preventDefault(); setError('Please enter a valid email.'); return;
    }
    setLoading(true);
  };

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  });

  return (
    <div className="form-page" style={{ padding:'5rem 1rem' }}>
      <div className="form-card" style={{ maxWidth:'480px' }}>
        <div style={{ textAlign:'center',marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'0.5rem' }}>🌾</div>
          <div className="form-title">Create Account</div>
          <div className="form-subtitle">Join Anaaj — Farm-fresh grains at your doorstep</div>
        </div>

        {shown && <div className="alert alert-error">{shown}</div>}

        <form action="/register" method="POST" onSubmit={handleSubmit} noValidate>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" name="name" placeholder="Ravi Kumar" {...f('name')} required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" name="phone" placeholder="9876543210" {...f('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" {...f('email')} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password * <span style={{ color:'var(--text-muted)',fontWeight:400 }}>(min. 6 chars)</span></label>
            <input className="form-input" type="password" name="password" placeholder="Create a strong password" {...f('password')} required autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-input" name="address" placeholder="Door no, Street, City, State — PIN" {...f('address')} />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div className="form-hint">Already have an account? <Link to="/login">Login here</Link></div>
      </div>
    </div>
  );
}
