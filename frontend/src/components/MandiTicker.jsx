import { useState, useEffect } from 'react';

export default function MandiTicker() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const staticData = [
      { state: 'Punjab', market: 'Amritsar', commodity: 'Basmati Rice', price: 4200 },
      { state: 'Haryana', market: 'Karnal', commodity: 'Wheat (Sharbati)', price: 2350 },
      { state: 'Maharashtra', market: 'Pune', commodity: 'Jowar', price: 3450 },
      { state: 'Gujarat', market: 'Rajkot', commodity: 'Mustard Oil', price: 6100 },
      { state: 'Karnataka', market: 'Mysuru', commodity: 'Ragi', price: 3200 },
      { state: 'Rajasthan', market: 'Jaipur', commodity: 'Bajra', price: 2100 },
      { state: 'MP', market: 'Bhopal', commodity: 'Toor Dal', price: 5400 },
      { state: 'Kerala', market: 'Kochi', commodity: 'Black Pepper', price: 12500 }
    ];

    const generateFluctuations = (data) => {
      return data.map(item => ({
        ...item,
        modal_price: (item.price + (Math.random() * 100 - 50)).toFixed(0)
      }));
    };

    setPrices(generateFluctuations(staticData));
    setLoading(false);

    const interval = setInterval(() => {
      setPrices(prev => generateFluctuations(staticData));
    }, 15000); // Dynamic update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div style={{
      width: '100%',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      padding: '6px 0',
      fontSize: '0.7rem',
      fontWeight: '600',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 999
    }}>
      <div style={{
        background: '#EDEDED',
        color: '#000',
        padding: '2px 10px',
        borderRadius: '0 4px 4px 0',
        marginRight: '12px',
        flexShrink: 0,
        fontWeight: '900',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        zIndex: 2
      }}>
        LIVE MANDI FEED
      </div>
      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative', flex: 1 }}>
        <div style={{
          display: 'inline-block',
          animation: 'mandiMarquee 40s linear infinite',
          paddingLeft: '100%'
        }}>
          <style>
            {`
              @keyframes mandiMarquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
              }
            `}
          </style>
          {prices.map((p, i) => (
             <span key={i} style={{ marginRight: '40px' }}>
               <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>{p.state} •</span>{' '}
               <span style={{ color: 'var(--text-primary)' }}>{p.commodity}:</span>{' '}
               <span style={{ color: '#0070F3' }}>₹{p.modal_price}</span>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem', marginLeft: '2px' }}>/q</span>
             </span>
          ))}
        </div>
      </div>
    </div>
  );
}
