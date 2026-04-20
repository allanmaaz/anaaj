import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { showToast } from './Toast';
import FreshnessBar from './FreshnessBar';
import StarRating from './StarRating';

const CATEGORY_EMOJI = {
  'Rice': '🍚', 'Dals & Lentils': '🫘', 'Millets': '🌽',
  'Wheat & Flour': '🌾', 'Oils': '🫒', 'Spices': '🌶️',
};
function getEmoji(name) { return CATEGORY_EMOJI[name] || '🌾'; }

export default function ProductCard({ product: p }) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await addToCart(p.id, 1);
    if (result.success) showToast('Added to cart! 🛒', 'success');
    else {
      showToast(result.error || 'Failed', 'error');
      if (result.error === 'Unauthorized — please log in') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        <div className="product-card-image">
          {p.imageUrl
            ? <img src={`/images/${p.imageUrl}`} alt={p.name} loading="lazy" />
            : getEmoji(p.categoryName)}
          {(p.organic || p.isOrganic) && <span className="organic-badge">🌿 Organic</span>}
        </div>
        <div className="product-card-body">
          <div className="product-name">{p.name}</div>
          <div className="product-origin">📍 {p.originState || 'India'}</div>
          <FreshnessBar score={p.freshnessScore || 85} />
          <div className="stars">
            <StarRating rating={p.avgRating || 0} />
            <span className="rating-count">
              ({p.avgRating ? Number(p.avgRating).toFixed(1) : '—'})
            </span>
          </div>
          <div className="product-footer">
            <div>
              <span className="product-price">₹{Number(p.price).toFixed(2)}</span>
              <span className="product-unit"> /{p.unit || 'kg'}</span>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart} title="Add to cart">+</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
