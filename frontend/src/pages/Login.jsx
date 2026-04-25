import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [pwd,   setPwd]     = useState('');
  const [error, setError]   = useState('');
  const [loading,setLoading]= useState(false);

  const params = new URLSearchParams(window.location.search);
  const urlErr = params.get('error');
  const errMap = { invalid:'Invalid email or password.', empty:'Please fill in all fields.', server:'Server error.' };
  const shown  = error || (urlErr && errMap[urlErr]) || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pwd) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new URLSearchParams();
      fd.append('email', email); fd.append('password', pwd);
      const res = await fetch('/login', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = data.role === 'admin' ? '/admin/products' : '/';
      } else {
        setError(errMap[data.error] || data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (accessToken) => {
    setLoading(true);
    try {
      const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { 
        headers: { Authorization: `Bearer ${accessToken}` } 
      });
      const gData = await gRes.json();
      if (!gData.email) throw new Error("Google login failed");

      const fd = new URLSearchParams();
      fd.append('email', gData.email);
      fd.append('password', 'GoogleAuth123!@#');
      const res = await fetch('/login', { method: 'POST', body: fd });
      const data = await res.json();
      console.log("Backend Login Response:", data);

      if (res.ok && data.success) {
        console.log("Login Successful! Redirecting to:", data.role);
        window.location.href = data.role === 'admin' ? '/admin/products' : '/';
      } else {
        console.log("Login failed, attempting auto-registration...");
        const regFd = new URLSearchParams();
        regFd.append('name', gData.name || 'Google User');
        regFd.append('email', gData.email);
        regFd.append('password', 'GoogleAuth123!@#');
        const regRes = await fetch('/register', { method: 'POST', body: regFd });
        const regData = await regRes.json();
        console.log("Register Response:", regData);
        if (regRes.ok && regData.success) {
          window.location.href = '/';
        } else {
          setError(regData.error || 'Registration failed.');
        }
      }
    } catch (e) {
      console.error("Google Auth Flow Error:", e);
      setError('Google Login was blocked by your browser extensions (AdBlocker). Please disable them and try again.');
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
    const REDIRECT_URI = window.location.origin + '/login';
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=email profile`;
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Logging in…' : '→ Login'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.75rem 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ margin: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR</div>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          onClick={triggerGoogleOAuth}
          className="btn btn-block btn-lg" 
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.5-.38-2.29s.13-1.57.38-2.29V6.62h-3.98A11.96 11.96 0 0 0 .255 12c0 1.93.47 3.77 1.29 5.38l3.98-3.09Z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"/></svg>
          Continue with Google
        </button>

        <div className="form-hint">Don't have an account? <Link to="/register">Register here</Link></div>
      </div>
    </div>
  );
}
