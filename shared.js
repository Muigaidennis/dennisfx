// ===== ManooFX Shared JS =====

const APP_ID = '33scAN1TBU9sHqZPKckm9';
// Use legacy WS endpoint which still works with new token
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=1089`;

// ---- AUTH ----
function requireAuth() {
  const active = localStorage.getItem('mfx_active');
  if (!active) { location.href = 'index.html'; return null; }
  return JSON.parse(active);
}
function getAccounts() {
  const a = localStorage.getItem('mfx_accounts');
  return a ? JSON.parse(a) : [];
}
function getActive() {
  const a = localStorage.getItem('mfx_active');
  return a ? JSON.parse(a) : null;
}
function setActive(acc) {
  localStorage.setItem('mfx_active', JSON.stringify(acc));
}
function isAdmin() {
  const adminId = localStorage.getItem('mfx_admin_id');
  return getAccounts().some(a => a.account === adminId);
}
function logout() {
  localStorage.removeItem('mfx_active');
  localStorage.removeItem('mfx_accounts');
  localStorage.removeItem('mfx_access_token');
  location.href = 'index.html';
}

// ---- WEBSOCKET ----
class DerivWS {
  constructor() {
    this.ws = null; this.queue = []; this.listeners = {};
    this.reqId = 1; this.pending = {}; this.connected = false;
    this.reconnectTimer = null; this.token = null;
  }
  connect(token) {
    this.token = token;
    this._open();
  }
  _open() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => {
      this.connected = true;
      this._sendRaw({ authorize: this.token });
      this.queue.forEach(m => this._sendRaw(m));
      this.queue = [];
    };
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const type = data.msg_type;
      if (data.req_id && this.pending[data.req_id]) {
        const { resolve, reject } = this.pending[data.req_id];
        delete this.pending[data.req_id];
        if (data.error) reject(data.error); else resolve(data);
      }
      if (this.listeners[type]) this.listeners[type].forEach(fn => fn(data));
      if (this.listeners['*']) this.listeners['*'].forEach(fn => fn(data));
    };
    this.ws.onerror = () => {};
    this.ws.onclose = () => {
      this.connected = false;
      this.reconnectTimer = setTimeout(() => this._open(), 3000);
    };
  }
  _sendRaw(msg) {
    if (!msg.req_id) msg.req_id = this.reqId++;
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg));
    return msg.req_id;
  }
  send(msg) {
    return new Promise((resolve, reject) => {
      msg.req_id = this.reqId++;
      this.pending[msg.req_id] = { resolve, reject };
      if (this.connected && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg));
      else this.queue.push(msg);
    });
  }
  subscribe(msg, callback) {
    msg.subscribe = 1;
    const type = Object.keys(msg).find(k => !['subscribe','req_id'].includes(k));
    this._sendRaw(msg);
    this.on(type, callback);
  }
  on(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  off(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(f => f !== fn);
  }
  forget(id) { this._sendRaw({ forget: id }); }
  forgetAll(type) { this._sendRaw({ forget_all: type }); }
  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

// ---- TOAST ----
function ensureToastContainer() {
  let el = document.getElementById('toast-container');
  if (!el) { el = document.createElement('div'); el.id = 'toast-container'; document.body.appendChild(el); }
  return el;
}
function toast(msg, type = 'info', duration = 3500) {
  const container = ensureToastContainer();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, duration);
}

// ---- BOTTOM NAV BUILDER ----
function buildBottomNav(activePage) {
  const isAdminUser = isAdmin();
  const items = [
    { href:'dashboard.html', id:'dashboard', label:'Home', icon:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href:'trade.html',     id:'trade',     label:'Trade', icon:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    { href:'markets.html',   id:'markets',   label:'Markets', icon:'<line x1="18.36" y1="6.64" x2="9.9" y2="15.1"/><line x1="2" y1="12" x2="22" y2="12"/>' },
    { href:'analysis.html',  id:'analysis',  label:'Analysis', icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
    { href:'bots.html',      id:'bots',      label:'Bots', icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
    { href:'botbuilder.html', id:'botbuilder', label:'Builder', icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="3" x2="12" y2="8"/><line x1="8" y1="5" x2="16" y2="5"/>' },
  ];
  return `<nav class="mfx-bottom-nav">
    ${items.map(p=>`
      <a href="${p.href}" class="bnav-item ${activePage===p.id?'active':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${p.icon}</svg>
        ${p.label}
      </a>`).join('')}
  </nav>`;
}

// ---- NAV BUILDER ----
function buildNav(activePage) {
  const active = getActive();
  const accounts = getAccounts();
  const isAdminUser = isAdmin();
  const isDemoAcc = active?.account?.startsWith('VRTC');
  const accLabel = active ? active.account.slice(0,8) + '...' : '—';

  const pages = [
    { href:'dashboard.html', label:'Dashboard', id:'dashboard', icon:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href:'trade.html',     label:'Trade',     id:'trade',     icon:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>' },
    { href:'markets.html',   label:'Markets',   id:'markets',   icon:'<line x1="18.36" y1="6.64" x2="9.9" y2="15.1"/><line x1="2" y1="12" x2="22" y2="12"/>' },
    { href:'analysis.html',  label:'Analysis',  id:'analysis',  icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
    { href:'analytics.html', label:'History',   id:'analytics', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { href:'bots.html',      label:'Bots',      id:'bots',      icon:'<rect x="2" y="3" width="20" height="14" rx="2"/>' },
  ];
  if (isAdminUser) pages.push({ href:'admin.html', label:'Admin', id:'admin', icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' });

  const accItems = accounts.map(a => {
    const isDemo = a.account.startsWith('VRTC');
    const isSelected = a.account === active?.account;
    return `<div class="acc-item ${isSelected?'selected':''}" onclick="switchAccount('${a.account}')">
      <div class="acc-item-left">
        <div class="acc-dot ${isDemo?'demo':'real'}"></div>
        <span>${a.account}</span>
        <span class="tag ${isDemo?'tag-blue':'tag-green'}">${isDemo?'Demo':'Real'}</span>
      </div>
      <span class="acc-balance" id="bal_${a.account}">—</span>
    </div>`;
  }).join('') + `<div class="acc-item" onclick="logout()" style="color:var(--danger);">
    <div class="acc-item-left">⊗ Logout</div>
  </div>`;

  return `
  <nav class="mfx-nav">
    <div class="mfx-logo">Manoo<span>FX</span></div>
    <div class="nav-links">
      ${pages.map(p=>`<a href="${p.href}" class="nav-link ${activePage===p.id?'active':''}" title="${p.label}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${p.icon}</svg>${p.label}
      </a>`).join('')}
    </div>
    <div class="nav-right">
      <div class="account-badge" id="accBadge" onclick="toggleDropdown()">
        <div class="acc-dot ${isDemoAcc?'demo':'real'}"></div>
        <span class="acc-label" id="accLabel">${accLabel}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        <div class="acc-dropdown" id="accDropdown">${accItems}</div>
      </div>
    </div>
  </nav>`;
}

function toggleDropdown() {
  document.getElementById('accDropdown').classList.toggle('open');
}
document.addEventListener('click', e => {
  const badge = document.getElementById('accBadge');
  if (badge && !badge.contains(e.target)) document.getElementById('accDropdown')?.classList.remove('open');
});
function switchAccount(accId) {
  const acc = getAccounts().find(a => a.account === accId);
  if (acc) { setActive(acc); location.reload(); }
}

// ---- SIDEBAR BUILDER ----
function buildSidebar(activePage) {
  const isAdminUser = isAdmin();
  const links = [
    { section:'Trading' },
    { href:'dashboard.html', label:'Dashboard', id:'dashboard', icon:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href:'trade.html', label:'Trade', id:'trade', icon:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>' },
    { href:'markets.html', label:'Live Markets', id:'markets', icon:'<line x1="18.36" y1="6.64" x2="9.9" y2="15.1"/><line x1="2" y1="12" x2="22" y2="12"/>' },
    { section:'Tools' },
    { href:'analysis.html', label:'Analysis Tool', id:'analysis', icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
    { href:'bots.html', label:'Bot Manager', id:'bots', icon:'<rect x="2" y="3" width="20" height="14" rx="2"/>' },
    { href:'botbuilder.html', label:'Bot Builder', id:'botbuilder', icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="3" x2="12" y2="8"/>' },
    { section:'Account' },
    { href:'analytics.html', label:'Trade History', id:'analytics', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  ];
  if (isAdminUser) {
    links.push({ section:'Admin' });
    links.push({ href:'admin.html', label:'Admin Panel', id:'admin', icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' });
  }
  return `<div class="mfx-sidebar">${links.map(l => {
    if (l.section) return `<div class="sidebar-section">${l.section}</div>`;
    return `<a href="${l.href}" class="sidebar-link ${activePage===l.id?'active':''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${l.icon}</svg>${l.label}
    </a>`;
  }).join('')}</div>`;
}

// ---- UTILS ----
function fmt(n, dec=2) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtTime(epoch) {
  return new Date(epoch * 1000).toLocaleString();
}
