import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [pwd,   setPwd]     = useState('');
  const [error, setError]   = useState('');
  const [loading,setLoading]= useState(false);

  // Show URL-level errors (from Tomcat redirects)
  const params = new URLSearchParams(window.location.search);
  const urlErr = params.get('error');
  const errMap = { invalid:'Invalid email or password.', empty:'Please fill in all fields.', server:'Server error.' };
  const shown  = error || (urlErr && errMap[urlErr]) || '';

  const handleSubmit = (e) => {
    if (!email.trim() || !pwd) { e.preventDefault(); setError('Please fill in all fields.'); return; }
    setLoading(true);
    // Native form submit → POST /login (Tomcat servlet handles it)
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div style={{ textAlign:'center',marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'0.5rem' }}>🌾</div>
          <div className="form-title">Welcome back</div>
          <div className="form-subtitle">Log in to your Anaaj account</div>
        </div>

        {shown && <div className="alert alert-error">{shown}</div>}

        <form action="/login" method="POST" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              className="form-input" type="email" id="email" name="email"
              placeholder="you@example.com" required
              value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input" type="password" id="password" name="password"
              placeholder="Your password" required
              value={pwd} onChange={e => setPwd(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Logging in…' : '→ Login'}
          </button>
        </form>

        <div className="form-hint">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
        <div className="form-hint" style={{ marginTop:'0.5rem' }}>
          <span style={{ color:'var(--text-muted)',fontSize:'0.75rem' }}>
            Demo admin: admin@anaaj.com / admin123
          </span>
        </div>
      </div>
    </div>
  );
}
