// src/services/api.js
// All HTTP calls to the Express backend go through here.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('shop_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token   = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// ── Convenience wrappers ─────────────────────────────────────────────────────
export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register:   (phone, password) => api.post('/auth/register',    { phone, password }),
  login:      (phone, password) => api.post('/auth/login',       { phone, password }),
  adminLogin: (phone, password) => api.post('/auth/admin-login', { phone, password }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll:  ()                    => api.get('/categories'),
  create:  (name, nameSi, image) => api.post('/categories', { name, nameSi, image }),
  delete:  (id)                  => api.delete(`/categories/${id}`),
};

// ── Items ─────────────────────────────────────────────────────────────────────
export const itemApi = {
  getByCategory: (categoryId) => api.get(`/items?categoryId=${categoryId}`),
  getAll:        ()            => api.get('/items'),
  create:        (data)        => api.post('/items', data),
  update:        (id, data)    => api.put(`/items/${id}`, data),
  delete:        (id)          => api.delete(`/items/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create:  (data) => api.post('/orders', data),
  getMine: ()     => api.get('/orders/mine'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getOrders: () => api.get('/admin/orders'),

  // ← CHANGED: now accepts optional rejectionMsg (sent only when rejecting)
  updateStatus: (id, status, rejectionMsg = '') =>
    api.patch(`/admin/orders/${id}/status`, { status, rejectionMsg }),

  findUser:   (phone) => api.get(`/admin/users?phone=${encodeURIComponent(phone)}`),
  deleteUser: (phone) => api.delete(`/admin/users/${encodeURIComponent(phone)}`),
};
