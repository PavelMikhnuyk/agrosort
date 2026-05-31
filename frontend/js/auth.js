function getUser() {
  try { return JSON.parse(localStorage.getItem('agrosort_user')); } catch { return null; }
}

function setAuth(token, user) {
  localStorage.setItem('agrosort_token', token);
  localStorage.setItem('agrosort_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('agrosort_token');
  localStorage.removeItem('agrosort_user');
}

function isLoggedIn() {
  return !!localStorage.getItem('agrosort_token');
}

function updateNavAuth() {
  const el = document.getElementById('navAuth');
  if (!el) return;
  const user = getUser();
  if (user) {
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const adminLink = user.role === 'admin' ? '<li><a href="/pages/admin.html" style="color:var(--a)">Администрирование</a></li>' : '';
    // Add admin link to nav-links if exists
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && user.role === 'admin') {
      const existing = navLinks.querySelector('[href="/pages/admin.html"]');
      if (!existing) navLinks.insertAdjacentHTML('beforeend', adminLink);
    }
    el.innerHTML = `
      <a href="/pages/dashboard.html" class="nav-user">
        <div class="nav-avatar">${initials}</div>
        <span style="color:var(--g5);font-size:.83rem">${user.name.split(' ')[0]}</span>
      </a>
      <button class="btn-nav-outline" onclick="logout()">Выйти</button>`;
  }
}

function logout() {
  clearAuth();
  window.location.href = '/';
}

function requireAuth(options = {}) {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
    return false;
  }
  const user = getUser();
  if (options.admin && user.role !== 'admin') {
    window.location.href = '/pages/dashboard.html';
    return false;
  }
  return true;
}
