/**
 * Central API helper for all backend calls.
 * Base URL points to the Java Servlet backend (via Vite proxy in dev).
 */

const BASE = '';  // Vite proxy handles /api -> Tomcat

export const api = {
  // ── Products ───────────────────────────────────────────────
  getProducts:     ()         => fetch(`${BASE}/api/products`).then(r => r.json()),
  getFeatured:     ()         => fetch(`${BASE}/api/products?featured=1`).then(r => r.json()),
  searchProducts:  (q)        => fetch(`${BASE}/api/products?search=${encodeURIComponent(q)}`).then(r => r.json()),
  getByCategory:   (catId)    => fetch(`${BASE}/api/products?category=${catId}`).then(r => r.json()),
  getByState:      (state)    => fetch(`${BASE}/api/products?state=${encodeURIComponent(state)}`).then(r => r.json()),
  getProduct:      (id)       => fetch(`${BASE}/api/products?id=${id}`).then(r => r.json()),

  // ── Cart ───────────────────────────────────────────────────
  getCart:    ()                     => fetch(`${BASE}/api/cart`).then(r => r.json()),
  addToCart:  (productId, qty = 1)   => fetch(`${BASE}/api/cart?action=add&productId=${productId}&qty=${qty}`, { method: 'POST' }).then(r => r.json()),
  updateCart: (productId, qty)        => fetch(`${BASE}/api/cart?action=update&productId=${productId}&qty=${qty}`, { method: 'POST' }).then(r => r.json()),
  removeItem: (productId)             => fetch(`${BASE}/api/cart?action=remove&productId=${productId}`, { method: 'POST' }).then(r => r.json()),
  clearCart:  ()                      => fetch(`${BASE}/api/cart?action=clear`, { method: 'POST' }).then(r => r.json()),

  // ── Orders ─────────────────────────────────────────────────
  getOrders:   ()      => fetch(`${BASE}/api/orders`).then(r => r.json()),
  getOrder:    (id)    => fetch(`${BASE}/api/orders?id=${id}`).then(r => r.json()),
  placeOrder:  (addr)  => {
    const fd = new FormData(); fd.append('address', addr);
    return fetch(`${BASE}/api/orders`, { method: 'POST', body: fd }).then(r => r.json());
  },

  // ── Profile ────────────────────────────────────────────────
  getProfile:    ()     => fetch(`${BASE}/api/profile`).then(r => ({ ok: r.ok, data: r.json() })),
  updateProfile: (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    return fetch(`${BASE}/api/profile`, { method: 'POST', body: fd }).then(r => r.json());
  },

  // ── Reviews ────────────────────────────────────────────────
  addReview: (productId, rating, comment) => {
    const fd = new FormData();
    fd.append('productId', productId); fd.append('rating', rating); fd.append('comment', comment);
    return fetch(`${BASE}/api/products`, { method: 'POST', body: fd }).then(r => r.json());
  },

  // ── Admin ──────────────────────────────────────────────────
  adminStats:    ()       => fetch(`${BASE}/api/admin?action=stats`).then(r => r.json()),
  adminProducts: ()       => fetch(`${BASE}/api/admin?action=products`).then(r => r.json()),
  adminOrders:   ()       => fetch(`${BASE}/api/admin?action=orders`).then(r => r.json()),
  adminAddProduct:    (d) => { const fd = buildFD({ action: 'addProduct', ...d }); return fetch(`${BASE}/api/admin`, { method: 'POST', body: fd }).then(r => r.json()); },
  adminEditProduct:   (d) => { const fd = buildFD({ action: 'editProduct', ...d }); return fetch(`${BASE}/api/admin`, { method: 'POST', body: fd }).then(r => r.json()); },
  adminDeleteProduct: (id) => { const fd = buildFD({ action: 'deleteProduct', id }); return fetch(`${BASE}/api/admin`, { method: 'POST', body: fd }).then(r => r.json()); },
  adminUpdateStatus:  (orderId, status) => { const fd = buildFD({ action: 'updateOrderStatus', orderId, status }); return fetch(`${BASE}/api/admin`, { method: 'POST', body: fd }).then(r => r.json()); },
};

function buildFD(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

/** Auth: check if user is logged in */
export async function getAuthUser() {
  try {
    const res = await fetch(`${BASE}/api/profile`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
