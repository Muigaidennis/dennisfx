/**
 * ManooFX — Deriv API Engine
 * Handles: WebSocket connection, OAuth login, live ticks,
 * digit tracking, trade execution, balance updates
 */

const ManooFX = (() => {

  // ─── CONFIG ────────────────────────────────────────────────
  const APP_ID   = '33GCXosgXARHc1nbvBdEL';
  const WS_URL   = `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`;
  const OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=en&brand=deriv`;

  // ─── STATE ─────────────────────────────────────────────────
  let ws            = null;
  let token         = null;
  let accountList   = [];
  let activeAccount = null;
  let balance       = 0;
  let isDemo        = false;
  let reconnectTimer = null;
  let pingTimer      = null;
  let subscriptions  = {};   // symbol → subscription id
  let digitHistory   = {};   // symbol → last 500 digits
  let tickCallbacks  = {};   // symbol → [fn, fn, ...]
  let balanceCallback = null;
  let loginCallback   = null;
  let errorCallback   = null;

  // All supported markets
  const MARKETS = {
    // Standard Volatility
    'R_10':   'Volatility 10 Index',
    'R_25':   'Volatility 25 Index',
    'R_50':   'Volatility 50 Index',
    'R_75':   'Volatility 75 Index',
    'R_100':  'Volatility 100 Index',
    // 1s Volatility
    '1HZ10V':  'Volatility 10 (1s) Index',
    '1HZ25V':  'Volatility 25 (1s) Index',
    '1HZ50V':  'Volatility 50 (1s) Index',
    '1HZ75V':  'Volatility 75 (1s) Index',
    '1HZ100V': 'Volatility 100 (1s) Index',
    // Jump
    'JD10':   'Jump 10 Index',
    'JD25':   'Jump 25 Index',
    'JD50':   'Jump 50 Index',
    'JD75':   'Jump 75 Index',
    'JD100':  'Jump 100 Index',
    // Step
    'stpRNG': 'Step Index',
  };

  // Reverse map: name → symbol
  const MARKET_SYMBOLS = {};
  Object.entries(MARKETS).forEach(([sym, name]) => { MARKET_SYMBOLS[name] = sym; });

  // ─── WEBSOCKET ─────────────────────────────────────────────
  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    console.log('[ManooFX] Connecting to Deriv WebSocket...');
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[ManooFX] WebSocket connected');
      clearTimeout(reconnectTimer);
      startPing();
      // Authorize if token exists
      const t = getToken();
      if (t) authorize(t);
    };

    ws.onmessage = (e) => handleMessage(JSON.parse(e.data));

    ws.onerror = (e) => {
      console.error('[ManooFX] WebSocket error', e);
      if (errorCallback) errorCallback('WebSocket connection error');
    };

    ws.onclose = () => {
      console.warn('[ManooFX] WebSocket closed. Reconnecting in 3s...');
      clearInterval(pingTimer);
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    } else {
      console.warn('[ManooFX] WS not open, queuing...');
      setTimeout(() => send(obj), 1000);
    }
  }

  function startPing() {
    clearInterval(pingTimer);
    pingTimer = setInterval(() => send({ ping: 1 }), 25000);
  }

  // ─── MESSAGE HANDLER ───────────────────────────────────────
  function handleMessage(msg) {
    const type = msg.msg_type;

    if (type === 'pong') return;

    if (type === 'authorize') {
      handleAuthorize(msg);
    } else if (type === 'account_list') {
      handleAccountList(msg);
    } else if (type === 'balance') {
      handleBalance(msg);
    } else if (type === 'tick') {
      handleTick(msg);
    } else if (type === 'buy') {
      handleBuy(msg);
    } else if (type === 'proposal') {
      handleProposal(msg);
    } else if (type === 'error' || msg.error) {
      handleError(msg);
    }
  }

  // ─── AUTH ──────────────────────────────────────────────────
  function authorize(t) {
    token = t;
    send({ authorize: t });
  }

  function handleAuthorize(msg) {
    if (msg.error) {
      console.error('[ManooFX] Auth error:', msg.error.message);
      clearToken();
      if (errorCallback) errorCallback('Login failed: ' + msg.error.message);
      return;
    }

    const acc = msg.authorize;
    activeAccount = {
      loginid:   acc.loginid,
      email:     acc.email,
      fullname:  acc.fullname,
      currency:  acc.currency,
      balance:   acc.balance,
      is_virtual: acc.is_virtual,
    };
    balance  = acc.balance;
    isDemo   = acc.is_virtual === 1;

    console.log('[ManooFX] Authorized:', activeAccount.loginid);

    // Save to session
    sessionStorage.setItem('mfx_account', JSON.stringify(activeAccount));

    // Get full account list
    send({ account_list: 1 });

    // Subscribe to balance updates
    send({ balance: 1, subscribe: 1 });

    if (loginCallback) loginCallback(activeAccount);
  }

  function handleAccountList(msg) {
    if (msg.error) return;
    accountList = msg.account_list || [];
    sessionStorage.setItem('mfx_accounts', JSON.stringify(accountList));
  }

  function handleBalance(msg) {
    if (msg.error) return;
    balance = msg.balance.balance;
    activeAccount.balance  = balance;
    activeAccount.currency = msg.balance.currency;
    sessionStorage.setItem('mfx_account', JSON.stringify(activeAccount));
    if (balanceCallback) balanceCallback(balance, msg.balance.currency);
    // Update any balance display elements
    document.querySelectorAll('[data-mfx-balance]').forEach(el => {
      el.textContent = msg.balance.currency + ' ' + parseFloat(balance).toFixed(2);
    });
  }

  // ─── TICKS ─────────────────────────────────────────────────
  function subscribeTick(symbol, callback) {
    if (!digitHistory[symbol]) digitHistory[symbol] = [];
    if (!tickCallbacks[symbol]) tickCallbacks[symbol] = [];
    tickCallbacks[symbol].push(callback);

    // Only send subscribe once per symbol
    if (!subscriptions[symbol]) {
      send({ ticks: symbol, subscribe: 1 });
    }
  }

  function unsubscribeTick(symbol) {
    const subId = subscriptions[symbol];
    if (subId) {
      send({ forget: subId });
      delete subscriptions[symbol];
    }
    delete tickCallbacks[symbol];
  }

  function unsubscribeAll() {
    send({ forget_all: 'ticks' });
    subscriptions  = {};
    tickCallbacks  = {};
  }

  function handleTick(msg) {
    if (msg.error) return;
    const tick   = msg.tick;
    const symbol = tick.symbol;
    const quote  = tick.quote;
    const digit  = parseInt(String(parseFloat(quote).toFixed(2)).slice(-1));

    // Store history
    if (!digitHistory[symbol]) digitHistory[symbol] = [];
    digitHistory[symbol].push({ quote, digit, epoch: tick.epoch });
    if (digitHistory[symbol].length > 500) digitHistory[symbol].shift();

    // Store subscription id
    if (msg.subscription) subscriptions[symbol] = msg.subscription.id;

    // Fire callbacks
    if (tickCallbacks[symbol]) {
      tickCallbacks[symbol].forEach(fn => fn({ symbol, quote, digit, epoch: tick.epoch, history: digitHistory[symbol] }));
    }

    // Auto-update data-mfx-* elements for this symbol
    document.querySelectorAll(`[data-mfx-price="${symbol}"]`).forEach(el => {
      el.textContent = parseFloat(quote).toFixed(2);
    });
    document.querySelectorAll(`[data-mfx-digit="${symbol}"]`).forEach(el => {
      el.textContent = digit;
    });
  }

  // ─── DIGIT HELPERS ─────────────────────────────────────────
  function getDigitFrequency(symbol, last = 100) {
    const hist = (digitHistory[symbol] || []).slice(-last);
    const freq = Array(10).fill(0);
    hist.forEach(t => freq[t.digit]++);
    const total = hist.length || 1;
    return freq.map(f => ({ count: f, pct: Math.round(f / total * 100) }));
  }

  function getLastDigits(symbol, count = 20) {
    return (digitHistory[symbol] || []).slice(-count).map(t => t.digit);
  }

  function getDominantDigit(symbol, last = 100) {
    const freq = getDigitFrequency(symbol, last);
    let max = 0, dominant = 0;
    freq.forEach((f, i) => { if (f.count > max) { max = f.count; dominant = i; } });
    return dominant;
  }

  function getColdDigit(symbol, last = 100) {
    const freq = getDigitFrequency(symbol, last);
    let min = Infinity, cold = 0;
    freq.forEach((f, i) => { if (f.count < min) { min = f.count; cold = i; } });
    return cold;
  }

  function getEvenOddRatio(symbol, last = 100) {
    const hist = (digitHistory[symbol] || []).slice(-last);
    let even = 0, odd = 0;
    hist.forEach(t => { t.digit % 2 === 0 ? even++ : odd++; });
    const total = hist.length || 1;
    return { even: Math.round(even/total*100), odd: Math.round(odd/total*100) };
  }

  function getOverUnderRatio(symbol, barrier = 5, last = 100) {
    const hist = (digitHistory[symbol] || []).slice(-last);
    let over = 0, under = 0;
    hist.forEach(t => { t.digit > barrier ? over++ : under++; });
    const total = hist.length || 1;
    return { over: Math.round(over/total*100), under: Math.round(under/total*100) };
  }

  // ─── TRADING ───────────────────────────────────────────────
  function getProposal({ symbol, contractType, duration, durationUnit, stake, barrier }) {
    const req = {
      proposal: 1,
      subscribe: 1,
      amount:    stake,
      basis:     'stake',
      contract_type: contractType,
      currency:  activeAccount?.currency || 'USD',
      duration,
      duration_unit: durationUnit || 't',
      symbol,
    };
    if (barrier !== undefined) req.barrier = barrier;
    send(req);
  }

  function handleProposal(msg) {
    if (msg.error) {
      if (errorCallback) errorCallback('Proposal error: ' + msg.error.message);
      return;
    }
    // Dispatch custom event so trade page can listen
    window.dispatchEvent(new CustomEvent('mfx:proposal', { detail: msg.proposal }));
  }

  function buyContract({ proposalId, stake, callback }) {
    send({ buy: proposalId, price: stake });
    // Store callback for when buy response arrives
    window._mfxBuyCallback = callback;
  }

  function handleBuy(msg) {
    if (msg.error) {
      if (errorCallback) errorCallback('Trade error: ' + msg.error.message);
      if (window._mfxBuyCallback) window._mfxBuyCallback({ error: msg.error.message });
      return;
    }
    const contract = msg.buy;
    console.log('[ManooFX] Trade placed:', contract);
    window.dispatchEvent(new CustomEvent('mfx:trade', { detail: contract }));
    if (window._mfxBuyCallback) window._mfxBuyCallback({ success: true, contract });
  }

  function handleError(msg) {
    const errMsg = msg.error?.message || 'Unknown error';
    console.error('[ManooFX] Error:', errMsg);
    if (errorCallback) errorCallback(errMsg);
  }

  // ─── OAUTH ─────────────────────────────────────────────────
  function loginWithDeriv() {
    // Save current page to return after login
    sessionStorage.setItem('mfx_return', window.location.href);
    window.location.href = OAUTH_URL;
  }

  function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const tokens = [];

    // Deriv returns token1, acct1, cur1, token2, acct2, etc.
    let i = 1;
    while (params.get(`token${i}`)) {
      tokens.push({
        token:    params.get(`token${i}`),
        loginid:  params.get(`acct${i}`),
        currency: params.get(`cur${i}`),
      });
      i++;
    }

    if (tokens.length > 0) {
      // Save all tokens
      sessionStorage.setItem('mfx_tokens', JSON.stringify(tokens));
      // Use first token (real account first, or demo)
      const realToken = tokens.find(t => !t.loginid.startsWith('VRT')) || tokens[0];
      saveToken(realToken.token);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return realToken.token;
    }
    return null;
  }

  function saveToken(t) {
    sessionStorage.setItem('mfx_token', t);
    token = t;
  }

  function getToken() {
    return sessionStorage.getItem('mfx_token');
  }

  function clearToken() {
    sessionStorage.removeItem('mfx_token');
    sessionStorage.removeItem('mfx_account');
    sessionStorage.removeItem('mfx_tokens');
    token = null;
    activeAccount = null;
  }

  function logout() {
    unsubscribeAll();
    clearToken();
    if (ws) ws.close();
    window.location.href = 'login.html';
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function getAccount() {
    const stored = sessionStorage.getItem('mfx_account');
    return stored ? JSON.parse(stored) : null;
  }

  function getAccounts() {
    const stored = sessionStorage.getItem('mfx_accounts');
    return stored ? JSON.parse(stored) : [];
  }

  function switchAccount(loginid) {
    const tokens = JSON.parse(sessionStorage.getItem('mfx_tokens') || '[]');
    const match = tokens.find(t => t.loginid === loginid);
    if (match) {
      saveToken(match.token);
      authorize(match.token);
    }
  }

  // ─── EVENT CALLBACKS ───────────────────────────────────────
  function onLogin(fn)   { loginCallback   = fn; }
  function onBalance(fn) { balanceCallback = fn; }
  function onError(fn)   { errorCallback   = fn; }

  // ─── INIT ──────────────────────────────────────────────────
  function init() {
    // Check for OAuth callback params in URL
    if (window.location.search.includes('token1=')) {
      const t = handleOAuthCallback();
      if (t) {
        connect();
        return;
      }
    }

    // Auto-connect
    connect();

    // Protect pages that need login
    const publicPages = ['index.html', 'login.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    if (!publicPages.includes(currentPage) && !isLoggedIn()) {
      // Uncomment below when backend is live:
      // window.location.href = 'login.html';
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────
  return {
    init,
    connect,
    loginWithDeriv,
    logout,
    isLoggedIn,
    getAccount,
    getAccounts,
    switchAccount,
    getToken,

    subscribeTick,
    unsubscribeTick,
    unsubscribeAll,
    getDigitFrequency,
    getLastDigits,
    getDominantDigit,
    getColdDigit,
    getEvenOddRatio,
    getOverUnderRatio,

    getProposal,
    buyContract,

    onLogin,
    onBalance,
    onError,

    MARKETS,
    MARKET_SYMBOLS,
  };
})();

// Auto-init on page load
document.addEventListener('DOMContentLoaded', () => ManooFX.init());
