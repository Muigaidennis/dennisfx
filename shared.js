// ===== ManooFX Shared JS =====

const APP_ID = '33scAN1TBU9sHqZPKckm9';
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

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
      // Send authorize request immediately after connection
      this._sendRaw({ authorize: this.token });
      this.queue.forEach(m => this._sendRaw(m));
      this.queue = [];
    };
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const type = data.msg_type;
      
      // Handle pending promises
      if (data.req_id && this.pending[data.req_id]) {
        const { resolve, reject } = this.pending[data.req_id];
        delete this.pending[data.req_id];
        if (data.error) reject(data.error); else resolve(data);
      }
      
      // Emit events to listeners
      if (this.listeners[type]) this.listeners[type].forEach(fn => fn(data));
      if (this.listeners['*']) this.listeners['*'].forEach(fn => fn(data));
    };
    this.ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };
    this.ws.onclose = () => {
      this.connected = false;
      // Reconnect after 3 seconds if not intentionally closed
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
  t.innerHTML = `<span>${icons[type]||"ℹ"}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, duration);
}

// ---- UTILS ----
function fmt(num, dp = 2) { 
  if (num === undefined || num === null) return '—';
  return Number(num).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ','); 
}
function fmtTime(timestamp) { return new Date(timestamp * 1000).toLocaleTimeString(); }

async function switchAccount(account) {
  const accounts = getAccounts();
  const newActive = accounts.find(a => a.account === account);
  if (newActive) {
    setActive(newActive);
    location.reload();
  }
}

// ---- BUILDERS (Placeholders for UI structure) ----
function buildNav(activePage) { return ''; }
function buildSidebar(activePage) { return ''; }
function buildBottomNav(activePage) { return ''; }

