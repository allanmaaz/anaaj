const STEPS = [
  { label: 'Confirmed', icon: '✓' },
  { label: 'Packed',    icon: '📦' },
  { label: 'Shipped',   icon: '🚚' },
  { label: 'Delivered', icon: '🏠' },
];

const STATUS_IDX = { Confirmed: 0, Packed: 1, Shipped: 2, Delivered: 3 };

export default function OrderTimeline({ status }) {
  const current = STATUS_IDX[status] ?? 0;
  return (
    <div className="order-timeline">
      {STEPS.map((step, i) => (
        <div
          key={step.label}
          className={`timeline-step ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`}
        >
          <div className="step-dot">{step.icon}</div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  );
}
