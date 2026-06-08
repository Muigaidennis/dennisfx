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
  localStorage.setItem('mfx_access_token', acc.token);
}
function logout() {
  localStorage.clear();
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
    if (this.ws) this.ws.close(); // Close existing connection if any
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => {
      this.connected = true;
      // Authorize immediately with the token
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
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this._open(), 3000); // Attempt to reconnect after 3 seconds
    };
    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      toast('WebSocket connection error. Attempting to reconnect...', 'error');
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

// ---- UI HELPERS ----
function buildNav(page) {
  return `<nav class="top-nav">
    <div class="logo">Manoo<span>FX</span></div>
    <div class="nav-links">
      <a href="dashboard.html" class="${page==='dashboard'?'active':''}">Dashboard</a>
      <a href="trade.html" class="${page==='trade'?'active':''}">Trade</a>
    </div>
  </nav>`;
}

function buildSidebar(activePage) {
  const activeAcc = getActive();
  const accounts = getAccounts();
  
  let accountOptions = '';
  accounts.forEach(acc => {
    accountOptions += `<option value="${acc.account}" ${acc.account === activeAcc.account ? 'selected' : ''}>
      ${acc.account.startsWith('VRTC') ? 'Demo' : 'Real'} (${acc.currency})
    </option>`;
  });

  return `<aside class="mfx-sidebar">
    <div class="sidebar-user">
      <select onchange="switchAccount(this.value)" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border); background:var(--surface); color:var(--text); margin-bottom:10px;">
        ${accountOptions}
      </select>
      <div class="user-id">${activeAcc.account}</div>
      <div class="user-type">${activeAcc.account.startsWith('VRTC')?'Demo':'Real'} Account</div>
    </div>
    <ul class="sidebar-menu">
      <li class="${activePage==='dashboard'?'active':''}"><a href="dashboard.html">Dashboard</a></li>
      <li><a href="#" onclick="logout()">Logout</a></li>
    </ul>
  </aside>`;
}

function buildBottomNav(page) {
  return `<div class="bottom-nav">
    <a href="dashboard.html" class="${page==='dashboard'?'active':''}">Home</a>
    <a href="#" onclick="logout()">Logout</a>
  </div>`;
}

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
