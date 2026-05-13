import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export async function getMenu(lang = 'en', category?: string) {
  const params: Record<string, string> = { lang };
  if (category) params.category = category;
  const res = await api.get('/api/menu', { params });
  return res.data;
}

export async function getCategories(lang = 'en') {
  const res = await api.get('/api/menu/categories', { params: { lang } });
  return res.data;
}

export async function getMenuItem(id: string, lang = 'en') {
  const res = await api.get(`/api/menu/item/${id}`, { params: { lang } });
  return res.data;
}

export async function createReservation(data: {
  name: string; phone: string; email: string;
  date: string; time: string; guests: number;
  hallId: number; notes?: string; lang?: string;
}) {
  const res = await api.post('/api/reservations', data);
  return res.data;
}

export async function checkAvailability(date: string, time: string, hallId: number) {
  const res = await api.get('/api/reservations/check', { params: { date, time, hallId } });
  return res.data;
}

export async function getReviews(source?: string) {
  const params: Record<string, string> = {};
  if (source && source !== 'all') params.source = source;
  const res = await api.get('/api/reviews', { params });
  return res.data;
}

export async function getEvents(lang = 'en') {
  const res = await api.get('/api/events', { params: { lang } });
  return res.data;
}

export async function getGallery(category?: string) {
  const params: Record<string, string> = {};
  if (category && category !== 'all') params.category = category;
  const res = await api.get('/api/gallery', { params });
  return res.data;
}

export async function adminLogin(email: string, password: string) {
  const res = await api.post('/api/admin/login', { email, password });
  return res.data;
}

export async function getAdminReservations(token: string, status?: string, date?: string, page = 1) {
  const params: Record<string, string | number> = { page };
  if (status) params.status = status;
  if (date) params.date = date;
  const res = await api.get('/api/admin/reservations', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
}

export async function updateReservationStatus(token: string, id: number, status: string) {
  const res = await api.patch(`/api/admin/reservations/${id}`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getAdminStats(token: string) {
  const res = await api.get('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function addMenuItem(token: string, item: Record<string, unknown>) {
  const res = await api.post('/api/admin/menu', item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteMenuItem(token: string, id: string) {
  const res = await api.delete(`/api/admin/menu/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ── User account ────────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('kamancha_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export async function getMyReservations() {
  const res = await api.get('/api/users/me/reservations', { headers: authHeaders() });
  return res.data;
}

export async function cancelMyReservation(id: number) {
  const res = await api.patch(`/api/users/me/reservations/${id}/cancel`, {}, { headers: authHeaders() });
  return res.data;
}

export async function getMyOrders() {
  const res = await api.get('/api/users/me/orders', { headers: authHeaders() });
  return res.data;
}

export async function createOrder(order: {
  name: string; phone: string; address: string; notes?: string; items: CartItem[];
}) {
  const res = await api.post('/api/users/me/orders', order, { headers: authHeaders() });
  return res.data;
}

export async function getMyFavorites(lang = 'en') {
  const res = await api.get('/api/users/me/favorites', { headers: authHeaders(), params: { lang } });
  return res.data;
}

export async function addFavorite(menuItemId: string) {
  const res = await api.post(`/api/users/me/favorites/${menuItemId}`, {}, { headers: authHeaders() });
  return res.data;
}

export async function removeFavorite(menuItemId: string) {
  const res = await api.delete(`/api/users/me/favorites/${menuItemId}`, { headers: authHeaders() });
  return res.data;
}

export async function updateProfile(data: { name?: string; phone?: string; password?: string }) {
  const res = await api.patch('/api/users/me', data, { headers: authHeaders() });
  return res.data;
}
