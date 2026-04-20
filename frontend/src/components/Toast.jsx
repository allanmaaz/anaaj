import { useState, useEffect, useRef } from 'react';

let toastId = 0;

// Singleton store for toasts (avoids context overhead)
const listeners = new Set();
let toasts = [];

export function showToast(msg, type = 'info') {
  const id = ++toastId;
  toasts = [...toasts, { id, msg, type }];
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...toasts]));
  }, 3000);
}

export function ToastContainer() {
  const [list, setList] = useState([]);

  useEffect(() => {
    listeners.add(setList);
    return () => listeners.delete(setList);
  }, []);

  if (!list.length) return null;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className="toast-container">
      {list.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type] || ''} {t.msg}
        </div>
      ))}
    </div>
  );
}
