import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getAuthUser } from '../api';
import { useCart } from '../context/CartContext';
import { showToast } from '../components/Toast';
import FreshnessBar from '../components/FreshnessBar';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [user,    setUser]      = useState(null);
  const [qty,     setQty]       = useState(1);
  const [rating,  setRating]    = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.getProduct(id), getAuthUser()])
      .then(([data, u]) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
        setUser(u);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop:'5rem' }} />;
  if (!product) return (
    <div className="section" style={{ textAlign:'center',paddingTop:'5rem',color:'var(--text-muted)' }}>
      Product not found. <Link to="/shop" className="text-blue">← Browse Shop</Link>
    </div>
  );

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, qty);
    if (result.success) showToast(`Added ${qty}×${product.name} to cart!`, 'success');
    else showToast(result.error || 'Failed', 'error');
  };

  const handleReview = async () => {
    if (!rating) { showToast('Select a star rating', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await api.addReview(product.id, rating, comment);
      if (res.success) {
        showToast('Review submitted! 🙏', 'success');
        // Refresh
        const data = await api.getProduct(id);
        setReviews(data.reviews || []);
        setUser(u => u); // keep user
        setRating(0); setComment('');
      } else {
        showToast(res.error || 'Failed to submit', 'error');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="section" style={{ paddingTop:'1.5rem' }}>
      <Link to="/shop" style={{ fontSize:'0.8rem',color:'var(--blue)',textDecoration:'none',display:'block',marginBottom:'1.5rem' }}>
        ← Back to Shop
      </Link>

      <div className="product-detail-grid">
        {/* Image */}
        <div className="product-detail-image">
          {product.imageUrl
            ? <img src={`/images/${product.imageUrl}`} alt={product.name} />
            : '🌾'}
        </div>

        {/* Info */}
        <div>
          {(product.isOrganic || product.organic) && (
            <span className="organic-badge" style={{ position:'static',marginBottom:'0.5rem',display:'inline-block' }}>🌿 Organic</span>
          )}
          <h1 style={{ fontSize:'1.8rem',fontWeight:700,letterSpacing:'-0.5px',marginTop:'0.5rem' }}>
            {product.name}
          </h1>
          <div className="stars" style={{ margin:'0.5rem 0' }}>
            <StarRating rating={product.avgRating || 0} size="1rem" />
            <span className="rating-count">
              ({product.avgRating ? Number(product.avgRating).toFixed(1) : 'No reviews'})
            </span>
          </div>
          <div className="product-detail-price">
            ₹{Number(product.price).toFixed(2)}
            <span className="product-unit" style={{ fontSize:'1rem' }}> /{product.unit || 'kg'}</span>
          </div>

          <div className="product-detail-meta">
            <div className="meta-chip">📍 {product.originState || 'India'}</div>
            <div className="meta-chip">📦 {product.stock > 0 ? `${product.stock} ${product.unit} in stock` : 'Out of stock'}</div>
            <div className="meta-chip">🏷️ {product.categoryName || 'Grain'}</div>
          </div>

          {product.description && (
            <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',lineHeight:1.75,marginBottom:'1.5rem' }}>
              {product.description}
            </p>
          )}

          <div style={{ marginBottom:'1.5rem' }}>
            <FreshnessBar score={product.freshnessScore || 85} />
          </div>

          <div style={{ display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap' }}>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(100, q + 1))}>+</button>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 style={{ fontSize:'1.3rem',fontWeight:700,marginBottom:'1.25rem' }}>Customer Reviews</h2>

        {user ? (
          <div className="glass" style={{ padding:'1.5rem',marginBottom:'1.5rem' }}>
            <h3 style={{ fontSize:'1rem',fontWeight:600,marginBottom:'1rem' }}>Write a Review</h3>
            <div className="star-select-row">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  className={`star-btn ${s <= rating ? 'active' : ''}`}
                  onClick={() => setRating(s)}
                >★</button>
              ))}
            </div>
            <textarea
              className="form-input mb-2"
              rows={2}
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleReview}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <p style={{ color:'var(--text-muted)',marginBottom:'1rem',fontSize:'0.85rem' }}>
            <Link to="/login" className="text-blue">Log in</Link> to write a review.
          </p>
        )}

        {reviews.length === 0 && (
          <div style={{ color:'var(--text-muted)',fontSize:'0.85rem',padding:'1rem 0' }}>
            No reviews yet. Be the first!
          </div>
        )}
        {reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <span className="reviewer-name">{r.userName || 'User'}</span>
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="stars" style={{ margin:'0.3rem 0' }}>
              <StarRating rating={r.rating} />
            </div>
            {r.comment && <p className="review-text">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
