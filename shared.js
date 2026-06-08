// ===== ManooFX Shared JS (No-Backend Version) =====

const APP_ID = '33scAN1TBU9sHqZPKckm9';
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

// ---- AUTH & STORAGE ----
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
  const active = getActive();
  return active && active.account === adminId;
}
function logout() {
  localStorage.removeItem('mfx_active');
  localStorage.removeItem('mfx_accounts');
  localStorage.removeItem('mfx_access_token');
  location.href = 'index.html';
}

// ---- WEBSOCKET CLASS ----
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
      // Authorize immediately
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
    if (callback) this.on(type, callback);
  }

  on(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

// ---- UI BUILDERS ----
function buildNav(activePage) {
  return `<nav class="top-nav">
    <div class="logo">Manoo<span>FX</span></div>
    <div class="nav-links">
      <a href="dashboard.html" class="${activePage==='dashboard'?'active':''}">Dashboard</a>
      <a href="trade.html" class="${activePage==='trade'?'active':''}">Trade</a>
    </div>
  </nav>`;
}

function buildSidebar(activePage) {
  const activeAcc = getActive();
  return `<aside class="mfx-sidebar">
    <div class="sidebar-user">
      <div class="user-id">${activeAcc.account}</div>
      <div class="user-type">${activeAcc.account.startsWith('VRTC')?'Demo':'Real'} Account</div>
    </div>
    <ul class="sidebar-menu">
      <li class="${activePage==='dashboard'?'active':''}"><a href="dashboard.html">Dashboard</a></li>
      <li><a href="#" onclick="logout()">Logout</a></li>
    </ul>
  </aside>`;
}

function buildBottomNav(activePage) {
  return `<div class="bottom-nav">
    <a href="dashboard.html" class="${activePage==='dashboard'?'active':''}">Home</a>
    <a href="trade.html" class="${activePage==='trade'?'active':''}">Trade</a>
    <a href="bots.html">Bots</a>
    <a href="settings.html">Settings</a>
  </div>`;
}

// ---- UTILS ----
function fmt(num, dp = 2) { 
  if (num === undefined || num === null) return '—';
  return Number(num).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ','); 
}

function toast(msg, type = 'info') {
  console.log(`TOAST [${type}]: ${msg}`);
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

async function switchAccount(account) {
  const accounts = getAccounts();
  const newActive = accounts.find(a => a.account === account);
  if (newActive) {
    setActive(newActive);
    location.reload();
  }
}
