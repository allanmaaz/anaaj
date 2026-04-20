/**
 * Anaaj — The Ecommerce · Global JavaScript
 * Handles: cart badge, toast notifications, hamburger nav, CMD+K search
 */

// ── Context path detection ──────────────────────────────────────────
const CTX = (() => {
  const parts = window.location.pathname.split('/');
  return parts.length > 1 && parts[1] !== 'pages' ? `/${parts[1]}` : '';
})();

const API = {
  products : `${CTX}/api/products`,
  cart     : `${CTX}/api/cart`,
  orders   : `${CTX}/api/orders`,
  profile  : `${CTX}/api/profile`,
  admin    : `${CTX}/api/admin`,
};

// ── Toast System ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `${icons[type] || ''} ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ── Cart Badge Update ───────────────────────────────────────────────
async function updateCartBadge() {
  try {
    const res = await fetch(API.cart);
    if (!res.ok) return;
    const data = await res.json();
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = data.count || 0;
      badge.style.display = (data.count > 0) ? 'flex' : 'none';
    }
  } catch (_) { /* Network issue — ignore silently */ }
}

// ── Add to Cart (used on shop & home) ──────────────────────────────
async function addToCart(productId, qty = 1) {
  try {
    const res = await fetch(`${API.cart}?action=add&productId=${productId}&qty=${qty}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Added to cart! 🛒', 'success');
      updateCartBadge();
    } else {
      showToast(data.error || 'Failed to add to cart', 'error');
      if (res.status === 401) {
        setTimeout(() => { window.location.href = `${CTX}/pages/login.html`; }, 1000);
      }
    }
  } catch (e) {
    showToast('Network error', 'error');
  }
}

// ── Render Stars ────────────────────────────────────────────────────
function renderStars(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
  }
  return html;
}

// ── Freshness Bar HTML ──────────────────────────────────────────────
function freshnessBar(score) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--rose)';
  return `
    <div class="freshness-bar-wrap">
      <span class="freshness-label">Freshness</span>
      <div class="freshness-bar">
        <div class="freshness-fill" style="width:${score}%;background:${color}"></div>
      </div>
      <span class="freshness-score">${score}</span>
    </div>`;
}

// ── Product Card HTML ───────────────────────────────────────────────
function productCardHTML(p) {
  const emoji = categoryEmoji(p.categoryName);
  const imgContent = p.imageUrl
    ? `<img src="${CTX}/images/${p.imageUrl}" alt="${p.name}" loading="lazy">`
    : emoji;

  return `
    <div class="product-card" data-id="${p.id}" onclick="window.location='${CTX}/pages/product-detail.html?id=${p.id}'">
      <div class="product-card-image">
        ${imgContent}
        ${p.organic || p.isOrganic ? '<span class="organic-badge">🌿 Organic</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-name">${p.name}</div>
        <div class="product-origin">📍 ${p.originState || 'India'}</div>
        ${freshnessBar(p.freshnessScore || 85)}
        <div class="stars">
          ${renderStars(p.avgRating || 0)}
          <span class="rating-count">(${p.avgRating ? p.avgRating.toFixed(1) : '—'})</span>
        </div>
        <div class="product-footer">
          <div>
            <span class="product-price">₹${Number(p.price).toFixed(2)}</span>
            <span class="product-unit"> /${p.unit || 'kg'}</span>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart(${p.id})" title="Add to cart" id="atc-${p.id}">+</button>
        </div>
      </div>
    </div>`;
}

function categoryEmoji(name) {
  if (!name) return '🌾';
  const n = name.toLowerCase();
  if (n.includes('rice'))    return '🍚';
  if (n.includes('dal') || n.includes('lentil')) return '🫘';
  if (n.includes('millet'))  return '🌽';
  if (n.includes('wheat'))   return '🌾';
  if (n.includes('oil'))     return '🫒';
  if (n.includes('spice'))   return '🌶️';
  return '🌾';
}

// ── Hamburger Toggle ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  const hamburger = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // CMD+K / CTRL+K → focus search
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchEl = document.getElementById('main-search');
      if (searchEl) searchEl.focus();
    }
  });

  // Mark active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar-links a').forEach(a => {
    if (a.href && currentPath.includes(a.getAttribute('href'))) {
      a.classList.add('active');
    }
  });

  // Show welcome toast
  const params = new URLSearchParams(window.location.search);
  if (params.get('welcome') === '1') showToast('Welcome to Anaaj! 🌾', 'success');
});

// ── Bulk Calculator ─────────────────────────────────────────────────
function initBulkCalculator() {
  const qtySlider    = document.getElementById('bulk-qty');
  const qtyVal       = document.getElementById('bulk-qty-val');
  const basePrice    = document.getElementById('bulk-base-price');
  const discountEl   = document.getElementById('bulk-discount');
  const totalPriceEl = document.getElementById('bulk-total');
  const savingsEl    = document.getElementById('bulk-savings');
  const discountBadge= document.getElementById('discount-badge');

  if (!qtySlider) return;

  function calculate() {
    const qty   = parseInt(qtySlider.value);
    const price = parseFloat(basePrice ? basePrice.dataset.price : 85);
    qtyVal.textContent = qty + ' kg';

    let discPct = 0;
    if (qty >= 80) discPct = 20;
    else if (qty >= 50) discPct = 15;
    else if (qty >= 25) discPct = 10;
    else if (qty >= 10) discPct = 5;

    const originalTotal = qty * price;
    const savings       = originalTotal * (discPct / 100);
    const finalTotal    = originalTotal - savings;

    if (discountEl)   discountEl.textContent = discPct + '%';
    if (totalPriceEl) totalPriceEl.textContent = '₹' + finalTotal.toFixed(2);
    if (savingsEl)    savingsEl.textContent = '₹' + savings.toFixed(2);
    if (discountBadge){
      discountBadge.textContent = discPct > 0 ? `${discPct}% OFF` : 'No discount';
      discountBadge.style.display = discPct > 0 ? 'inline-block' : 'none';
    }
  }

  qtySlider.addEventListener('input', calculate);
  calculate(); // initial render
}

// ── Navbar HTML helper (avoids duplication) ─────────────────────────
// Each page includes its own navbar inline for simplicity in a servlet app.

// Expose globally
window.addToCart    = addToCart;
window.showToast    = showToast;
window.renderStars  = renderStars;
window.freshnessBar = freshnessBar;
window.productCardHTML = productCardHTML;
window.initBulkCalculator = initBulkCalculator;
window.CTX = CTX;
window.API = API;
