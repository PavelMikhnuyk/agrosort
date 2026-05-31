const API_BASE = '/api';

const api = {
  _token: () => localStorage.getItem('agrosort_token'),

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this._token();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_BASE + path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  },

  get: (path) => api.request('GET', path),
  post: (path, body) => api.request('POST', path, body),
  put: (path, body) => api.request('PUT', path, body),
  delete: (path) => api.request('DELETE', path)
};

function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.background = type === 'error' ? '#8a2020' : type === 'success' ? '#2d6a2d' : 'var(--g)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function renderStars(val, max = 5) {
  return Array.from({length: max}, (_, i) =>
    `<div class="star ${i < val ? 'filled' : ''}"></div>`
  ).join('');
}

function buildQueryString(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== '' && v != null) q.set(k, v); });
  return q.toString();
}

// Admin API
const admin = {
  getUsers: (params) => api.get('/users?' + buildQueryString(params)),
  getUser: (id) => api.get('/users/' + id),
  updateUserRole: (id, role) => api.put('/users/' + id + '/role', { role }),
  toggleUserBlock: (id) => api.put('/users/' + id + '/block', {}),
  getCultures: () => api.get('/cultures'),
  createCulture: (data) => api.post('/cultures', data),
  updateCulture: (id, data) => api.put('/cultures/' + id, data),
  deleteCulture: (id) => api.delete('/cultures/' + id)
};
