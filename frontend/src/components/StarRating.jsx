export default function StarRating({ rating = 0, max = 5, size = '0.75rem' }) {
  return (
    <div className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < Math.round(rating) ? '' : 'empty'}`} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}
