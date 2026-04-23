import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { id: 1, name: 'Rice',          icon: '🍚' },
  { id: 2, name: 'Dals & Lentils',icon: '🫘' },
  { id: 3, name: 'Millets',       icon: '🌽' },
  { id: 4, name: 'Wheat & Flour', icon: '🌾' },
  { id: 5, name: 'Oils',          icon: '🫒' },
  { id: 6, name: 'Spices',        icon: '🌶️' },
];

function BulkCalculator() {
  const [qty, setQty] = useState(10);
  const BASE_PRICE    = 85;

  const discPct = qty >= 80 ? 20 : qty >= 50 ? 15 : qty >= 25 ? 10 : qty >= 10 ? 5 : 0;
  const original = qty * BASE_PRICE;
  const savings  = original * (discPct / 100);
  const total    = original - savings;

  return (
    <section className="section" id="bulk-section">
      <div className="bulk-calc-card">
        <h2>📦 Bulk Order Calculator</h2>
        <p>Ideal for hostels, mess halls, restaurants &amp; households buying monthly stock.</p>

        <div className="slider-group">
          <div className="slider-label">
            Quantity
            <span className="slider-val">{qty} kg</span>
          </div>
          <input type="range" min="5" max="100" value={qty} onChange={e => setQty(Number(e.target.value))} />
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.7rem',color:'var(--text-muted)',marginTop:'4px' }}>
            <span>5 kg</span><span>100 kg</span>
          </div>
        </div>

        <div className="bulk-result">
          <div className="bulk-result-item">
            <div className="bulk-result-num">{discPct}%</div>
            <div className="bulk-result-label">Discount</div>
            {discPct > 0 && <span className="discount-badge">{discPct}% OFF</span>}
          </div>
          <div className="bulk-result-item">
            <div className="bulk-result-num">₹{total.toFixed(2)}</div>
            <div className="bulk-result-label">Final Price</div>
          </div>
          <div className="bulk-result-item">
            <div className="bulk-result-num text-green">₹{savings.toFixed(2)}</div>
            <div className="bulk-result-label">You Save</div>
          </div>
        </div>

        <div style={{ marginTop:'1.5rem',display:'flex',justifyContent:'flex-end' }}>
          <Link to="/shop" className="btn btn-primary">Shop Now →</Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.getFeatured()
      .then(data => setFeatured(Array.isArray(data) ? data : []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="hero container">
        <div className="hero-text animate-in">
          <div className="hero-badge stagger-1">🌱 Farm to Table · 100% Traceable</div>
          <h1 className="stagger-2">
            Premium Grains,<br />
            <span className="gradient-text">Straight from</span><br />
            Indian Farms
          </h1>
          <p className="stagger-3">Rice, dals, millets and organic staples sourced directly from farmers across India. Freshness guaranteed. Bulk discounts for hostels &amp; restaurants.</p>
          <div className="hero-cta stagger-3">
            <Link to="/shop" className="btn btn-primary btn-lg">🛍️ Shop Now</Link>
            <a href="#bulk-section" className="btn btn-glass btn-lg">📦 Bulk Orders</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">50+</div>
                <div className="stat-label">Products</div>
              </div>
              <div style={{ width:1, height:30, background:'rgba(255,255,255,0.1)' }} />
              <div className="stat-item">
                <div className="stat-num">18</div>
                <div className="stat-label">States</div>
              </div>
              <div style={{ width:1, height:30, background:'rgba(255,255,255,0.1)' }} />
              <div className="stat-item">
                <div className="stat-num">100%</div>
                <div className="stat-label">Organic</div>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-icon">🌾</div>
            <div>
              <div style={{ fontWeight:700,fontSize:'0.9rem',color:'#fff' }}>Freshness Guaranteed</div>
              <div style={{ color:'var(--text-muted)',fontSize:'0.75rem' }}>Every batch has a freshness score</div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-icon">🏬</div>
            <div>
              <div style={{ fontWeight:700,fontSize:'0.9rem',color:'#fff' }}>20% Bulk Discount</div>
              <div style={{ color:'var(--text-muted)',fontSize:'0.75rem' }}>Orders over 80 kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by <span>Category</span></h2>
          <Link to="/shop" className="btn btn-glass btn-sm">View All →</Link>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section animate-in stagger-2">
        <div className="section-header">
          <h2 className="section-title">Featured <span>Products</span></h2>
          <Link to="/shop" className="btn btn-glass btn-sm">See All →</Link>
        </div>
        {loading && <div className="spinner" />}
        {!loading && featured.length === 0 && (
          <div style={{ textAlign:'center',padding:'3rem',color:'var(--text-muted)' }}>
            No products yet. Add from Admin panel.
          </div>
        )}
        {!loading && featured.length > 0 && (
          <div className="product-grid">
            {featured.map((p, idx) => <ProductCard key={p.id} product={p} className={`stagger-${(idx % 3) + 1}`} />)}
          </div>
        )}
      </section>

      {/* Bulk Calculator */}
      <BulkCalculator />

      {/* Why Anaaj */}
      <section className="section" style={{ paddingBottom:'5rem' }}>
        <div className="section-header">
          <h2 className="section-title">Why <span>Anaaj?</span></h2>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'1.25rem' }}>
          {[
            { icon:'🌱', title:'Farm-Direct Sourcing', desc:'Every product traces back to a specific farm with origin state data.' },
            { icon:'🔬', title:'Freshness Score',      desc:'Each batch scored 0–100 for freshness. You see exactly what you get.' },
            { icon:'📦', title:'Bulk Discounts',       desc:'Save up to 20% on orders above 80 kg — perfect for hostels & restaurants.' },
            { icon:'⭐', title:'Verified Reviews',     desc:'Real ratings from verified buyers. One review per purchase enforced.' },
          ].map(w => (
            <div key={w.title} className="glass" style={{ padding:'1.75rem' }}>
              <div style={{ fontSize:'2rem',marginBottom:'0.75rem' }}>{w.icon}</div>
              <div style={{ fontWeight:600,marginBottom:'0.4rem' }}>{w.title}</div>
              <div style={{ fontSize:'0.85rem',color:'var(--text-secondary)' }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop:'0.5px solid rgba(255,255,255,0.07)',padding:'2rem',textAlign:'center',color:'var(--text-muted)',fontSize:'0.8rem',position:'relative',zIndex:1 }}>
        © 2026 Anaaj — The Ecommerce · Built with ☕ Java + JDBC + React · Java Mini Project
      </footer>
    </>
  );
}
