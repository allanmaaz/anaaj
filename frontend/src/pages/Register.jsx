import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const urlErr = params.get('error');
  const errMap = { empty:'Please fill in required fields.', shortpwd:'Password must be at least 6 characters.', duplicate:'Email already exists.', server:'Server error.' };
  const shown  = error || (urlErr && errMap[urlErr]) || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email and password are required.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      setError('Please enter a valid email.'); return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const fd = new URLSearchParams();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      
      const res = await fetch('/register', { method: 'POST', body: fd });
      const data = await res.json();
      
      if (res.ok && data.success) {
        window.location.href = '/';
      } else {
        setError(errMap[data.error] || data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Callback Handler
  const handleGoogleAuth = async (accessToken) => {
    setLoading(true);
    try {
      const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
      const gData = await gRes.json();
      if (!gData.email) throw new Error("Google signup failed");

      let fd = new URLSearchParams();
      fd.append('email', gData.email);
      fd.append('password', 'GoogleAuth123!@#');
      let res = await fetch('/login', { method: 'POST', body: fd });
      let data = await res.json();

      if (res.ok && data.success) {
        window.location.href = data.role === 'admin' ? '/admin/products' : '/';
      } else {
        fd = new URLSearchParams();
        fd.append('name', gData.name || 'Google User');
        fd.append('email', gData.email);
        fd.append('password', 'GoogleAuth123!@#');
        let regRes = await fetch('/register', { method: 'POST', body: fd });
        let regData = await regRes.json();
        if (regRes.ok && regData.success) {
          window.location.href = '/'; 
        } else {
          setError(regData.error || 'Google Registration failed.');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Google Authentication process failed.');
    } finally {
      setLoading(false);
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) handleGoogleAuth(token);
    }
  }, []);

  const triggerGoogleOAuth = () => {
    const CLIENT_ID = '425942372396-s2epalih2s7vn4vi88q88jcssma1ogr1.apps.googleusercontent.com';
    const REDIRECT_URI = window.location.origin + '/register';
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=email profile`;
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

        <form onSubmit={handleSubmit} noValidate>
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

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.75rem 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ margin: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' }}>OR</div>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          type="button" 
          className="btn btn-block btn-lg" 
          style={{ 
            background: 'rgba(255,255,255,0.06)', 
            color: 'var(--text-primary)', 
            border: '0.5px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onClick={triggerGoogleOAuth}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"/>
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"/>
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.5-.38-2.29s.13-1.57.38-2.29V6.62h-3.98A11.96 11.96 0 0 0 .255 12c0 1.93.47 3.77 1.29 5.38l3.98-3.09Z"/>
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"/>
          </svg>
          Sign Up with Google
        </button>

        <div className="form-hint">Already have an account? <Link to="/login">Login here</Link></div>
      </div>
    </div>
  );
}
