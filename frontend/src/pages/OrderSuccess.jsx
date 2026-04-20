import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline';

export default function OrderSuccess() {
  const { orderId } = useParams();

  useEffect(() => {
    // Celebration animation
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(container);
    const emojis = ['🌾','🫘','🍚','✅','⭐','🎉'];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;font-size:${20+Math.random()*20}px;
        left:${Math.random()*100}vw;top:-40px;
        animation:fall ${2+Math.random()*2}s ease-in forwards;
        animation-delay:${Math.random()*1.5}s;
      `;
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      container.appendChild(el);
    }
    const style = document.createElement('style');
    style.textContent = '@keyframes fall{to{transform:translateY(105vh) rotate(360deg);opacity:0}}';
    document.head.appendChild(style);
    const timer = setTimeout(() => container.remove(), 4000);
    return () => { clearTimeout(timer); container.remove(); };
  }, []);

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h1 style={{ fontSize:'1.8rem',fontWeight:800,marginBottom:'0.5rem' }}>Order Placed!</h1>
      <p style={{ color:'var(--text-secondary)',marginBottom:'0.5rem' }}>
        Thank you for your purchase. Your grain order is being prepared.
      </p>
      <div style={{ margin:'1rem 0',padding:'0.75rem 1.5rem',background:'rgba(79,142,247,0.1)',borderRadius:'var(--radius-sm)',border:'1px solid rgba(79,142,247,0.2)',fontSize:'0.85rem' }}>
        Order ID: <strong style={{ color:'var(--blue)' }}>#{orderId}</strong>
      </div>

      <OrderTimeline status="Confirmed" />

      <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginTop:'1.5rem' }}>
        <Link to="/profile" className="btn btn-primary">Track Order →</Link>
        <Link to="/shop"    className="btn btn-glass">Continue Shopping</Link>
      </div>
    </div>
  );
}
