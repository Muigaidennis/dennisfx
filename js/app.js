/**
 * ManooFX — App Logic
 * Wires live Deriv data into all page elements
 */

// ── DASHBOARD ─────────────────────────────────────────────────
function initDashboard() {
  if (!document.getElementById('dashBalance')) return;

  ManooFX.onLogin(acc => {
    document.getElementById('dashBalance').textContent =
      (acc.currency || 'USD') + ' ' + parseFloat(acc.balance).toFixed(2);
    document.getElementById('dashUser').textContent = acc.fullname || acc.loginid;
    document.getElementById('dashAccount').textContent =
      acc.is_virtual ? 'Demo' : 'Real';
  });

  ManooFX.onBalance((bal, cur) => {
    document.getElementById('dashBalance').textContent =
      cur + ' ' + parseFloat(bal).toFixed(2);
  });

  // Live market snapshot — subscribe V75 and V100
  ['R_75','R_100','stpRNG','JD75'].forEach(sym => {
    ManooFX.subscribeTick(sym, ({ quote, digit }) => {
      const priceEl  = document.querySelector(`[data-mfx-price="${sym}"]`);
      const digitEl  = document.querySelector(`[data-mfx-digit="${sym}"]`);
      if (priceEl) priceEl.textContent = parseFloat(quote).toFixed(2);
      if (digitEl) digitEl.textContent = digit;
    });
  });
}

// ── MARKETS PAGE ──────────────────────────────────────────────
function initMarkets() {
  if (!document.getElementById('marketsTable')) return;

  const ALL_SYMS = Object.keys(ManooFX.MARKETS);

  ALL_SYMS.forEach(sym => {
    ManooFX.subscribeTick(sym, ({ quote, digit }) => {
      const row = document.querySelector(`[data-mfx-row="${sym}"]`);
      if (!row) return;

      const priceEl = row.querySelector('[data-col="price"]');
      const digitEl = row.querySelector('[data-col="digit"]');
      if (priceEl) priceEl.textContent = parseFloat(quote).toFixed(2);
      if (digitEl) digitEl.textContent = digit;

      // Update digit frequency panels
      updateDigitPanel(sym);
    });
  });
}

function updateDigitPanel(sym) {
  const panel = document.querySelector(`[data-digit-panel="${sym}"]`);
  if (!panel) return;

  const freq = ManooFX.getDigitFrequency(sym, 100);
  const maxPct = Math.max(...freq.map(f => f.pct));

  freq.forEach((f, i) => {
    const cell = panel.querySelector(`[data-digit="${i}"]`);
    if (!cell) return;
    const pctEl  = cell.querySelector('.dc-pct');
    const barEl  = cell.querySelector('.dc-bar');
    if (pctEl) pctEl.textContent = f.pct + '%';
    if (barEl) barEl.style.width = (f.pct / (maxPct || 1) * 100) + '%';
    cell.classList.toggle('hot', f.pct === maxPct);
  });

  // Last digits strip
  const strip = panel.querySelector('[data-last-digits]');
  if (strip) {
    const last = ManooFX.getLastDigits(sym, 20);
    strip.innerHTML = last.map(d =>
      `<div class="ls ${d%2===0?'ls-e':'ls-o'}">${d}</div>`
    ).join('');
  }
}

// ── TRADE PAGE ────────────────────────────────────────────────
function initTrade() {
  if (!document.getElementById('tradePrice')) return;

  let currentSym = 'R_75';

  function subscribeMarket(sym) {
    ManooFX.unsubscribeAll();
    currentSym = sym;

    ManooFX.subscribeTick(sym, ({ quote, digit, history }) => {
      // Update price
      const priceEl = document.getElementById('tradePrice');
      if (priceEl) priceEl.textContent = parseFloat(quote).toFixed(2);

      // Update digit strip
      const strip = document.getElementById('digitStrip');
      if (strip) {
        const last = ManooFX.getLastDigits(sym, 20);
        strip.innerHTML = last.map(d =>
          `<div class="ds ${d%2===0?'ds-e':'ds-o'}">${d}</div>`
        ).join('');
      }

      // Update payout estimate
      updatePayout();
    });
  }

  // Market select change
  const mktSelect = document.getElementById('mktSelect');
  if (mktSelect) {
    mktSelect.addEventListener('change', () => {
      const sym = ManooFX.MARKET_SYMBOLS[mktSelect.value] || 'R_75';
      subscribeMarket(sym);
    });
  }

  subscribeMarket(currentSym);

  // Balance
  ManooFX.onBalance((bal, cur) => {
    const el = document.getElementById('tradeBalance');
    if (el) el.textContent = cur + ' ' + parseFloat(bal).toFixed(2);
  });

  // Trade execution
  window.placeLiveTrade = function(direction) {
    if (!ManooFX.isLoggedIn()) {
      alert('Please log in with your Deriv account first.');
      window.location.href = 'login.html';
      return;
    }

    const stake     = parseFloat(document.getElementById('stakeInput')?.value || 1);
    const barrier   = document.getElementById('barrierSelect')?.value;
    const ctSelect  = document.getElementById('contractTypeSelect');
    const ct        = ctSelect?.value || 'DIGITDIFF';
    const dur       = parseInt(document.getElementById('durationInput')?.value || 5);

    // Show loading
    const btn = document.querySelector(`.buy-${direction.toLowerCase()}`);
    if (btn) { btn.textContent = '⏳ Placing...'; btn.disabled = true; }

    ManooFX.buyContract({
      proposalId: window._lastProposalId || '',
      stake,
      callback: ({ success, contract, error }) => {
        if (btn) { btn.textContent = direction === 'Rise' ? '▲ Rise' : '▼ Fall'; btn.disabled = false; }
        if (success) {
          addTradeLog({ contract_type: ct, symbol: currentSym, buy_price: stake, result: 'open' });
          showToast('✅ Trade placed! Contract ID: ' + contract.contract_id);
        } else {
          showToast('❌ Trade failed: ' + error, 'error');
        }
      }
    });
  };

  // Get proposal on input change
  function updatePayout() {
    if (!ManooFX.isLoggedIn()) return;
    const stake   = parseFloat(document.getElementById('stakeInput')?.value || 1);
    const barrier = document.getElementById('barrierSelect')?.value || '5';
    const ct      = document.getElementById('contractTypeSelect')?.value || 'DIGITDIFF';

    ManooFX.getProposal({
      symbol:       currentSym,
      contractType: ct,
      duration:     5,
      durationUnit: 't',
      stake,
      barrier: parseInt(barrier),
    });
  }

  window.addEventListener('mfx:proposal', (e) => {
    const p = e.detail;
    window._lastProposalId = p.id;
    const payEl = document.getElementById('payoutVal');
    if (payEl) payEl.textContent = '$' + parseFloat(p.payout).toFixed(2);
  });
}

// ── AI ANALYSER ───────────────────────────────────────────────
function initAnalyser() {
  if (!document.getElementById('analyserPage')) return;

  // Subscribe to selected market on analyse click
  window.runLiveAnalysis = function() {
    const select = document.getElementById('marketSelect');
    const name   = select?.value || 'Volatility 75 Index';
    const sym    = ManooFX.MARKET_SYMBOLS[name] || 'R_75';
    const sample = parseInt(document.getElementById('sampleSize')?.value || 100);

    ManooFX.subscribeTick(sym, ({ digit }) => {
      // Once we have enough ticks, compute analysis
      const hist = ManooFX.getDigitFrequency(sym, sample);
      if (hist.reduce((a,b)=>a+b.count,0) >= Math.min(sample, 20)) {
        updateAnalyserUI(sym, name, sample, hist);
      }
    });

    showToast('📡 Subscribing to live data for ' + name + '...');
  };

  function updateAnalyserUI(sym, name, sample, freq) {
    const maxPct = Math.max(...freq.map(f => f.pct));
    const minPct = Math.min(...freq.map(f => f.pct));
    const domDigit  = freq.findIndex(f => f.pct === maxPct);
    const coldDigit = freq.findIndex(f => f.pct === minPct);
    const eo  = ManooFX.getEvenOddRatio(sym, sample);
    const ou  = ManooFX.getOverUnderRatio(sym, 5, sample);
    const conf = Math.min(95, 60 + (maxPct - 10) * 3);

    // Hero card
    const heroCard = document.getElementById('heroCard');
    if (heroCard) heroCard.classList.add('visible');

    const heroMarket = document.getElementById('heroMarket');
    if (heroMarket) heroMarket.textContent = name + ' 🔴 LIVE';

    const heroSignal = document.getElementById('heroSignal');
    if (heroSignal) heroSignal.textContent = `Digit Differs — ${coldDigit}`;

    const heroDesc = document.getElementById('heroDesc');
    if (heroDesc) heroDesc.textContent =
      `Live analysis of ${name} (last ${sample} ticks): Digit ${domDigit} is dominant at ${maxPct}%. Digit ${coldDigit} is cold at ${minPct}% — best target for Digit Differs. Even: ${eo.even}% / Odd: ${eo.odd}%. Over 5: ${ou.over}% / Under 5: ${ou.under}%.`;

    const confFill = document.getElementById('confFill');
    if (confFill) { confFill.style.width = '0%'; setTimeout(()=>{ confFill.style.width = conf+'%'; }, 100); }

    const confPct = document.getElementById('confPct');
    if (confPct) confPct.textContent = conf + '%';

    // Digit grid
    const daGrid = document.getElementById('daGrid');
    if (daGrid) {
      daGrid.innerHTML = freq.map((f,i) => `
        <div class="da-cell ${i===domDigit?'dominant':i===coldDigit?'cold':''}">
          <div class="da-num">${i}</div>
          <div class="da-pct">${f.pct}%</div>
          <div class="da-bar" style="width:${(f.pct/maxPct*100)}%"></div>
          <div class="da-label">${i===domDigit?'🔥':i===coldDigit?'🧊':''}</div>
        </div>`).join('');
    }

    // Streak
    const streak = document.getElementById('streakRow');
    if (streak) {
      streak.innerHTML = ManooFX.getLastDigits(sym, 25).map(d =>
        `<div class="sr ${d%2===0?'sr-e':'sr-o'}">${d}</div>`).join('');
    }

    // Stats
    const statsRow = document.getElementById('statsRow');
    if (statsRow) {
      statsRow.innerHTML = `
        <div class="stat-box"><div class="sb-val" style="color:var(--purple-lt)">${domDigit}</div><div class="sb-lbl">Dominant</div></div>
        <div class="stat-box"><div class="sb-val" style="color:var(--pink-lt)">${coldDigit}</div><div class="sb-lbl">Cold / Target</div></div>
        <div class="stat-box"><div class="sb-val">${eo.even>eo.odd?'Even':'Odd'}</div><div class="sb-lbl">Favoured</div></div>
        <div class="stat-box"><div class="sb-val">${ou.over>ou.under?'Over':'Under'}</div><div class="sb-lbl">O/U Bias</div></div>`;
    }

    document.getElementById('digitAnalysis')?.classList.add('visible');
    document.getElementById('recoPanel')?.classList.add('visible');
  }
}

// ── LOGIN PAGE ────────────────────────────────────────────────
function initLogin() {
  if (!document.getElementById('loginPage')) return;

  // Override the Deriv login button
  window.handleDerivLogin = function() {
    ManooFX.loginWithDeriv();
  };

  // If already logged in, redirect
  if (ManooFX.isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function addTradeLog({ contract_type, symbol, buy_price, result }) {
  const log = document.getElementById('tradeLogBody');
  if (!log) return;
  const row = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML = `
    <div>${contract_type}</div>
    <div>${ManooFX.MARKETS[symbol] || symbol}</div>
    <div>$${parseFloat(buy_price).toFixed(2)}</div>
    <div>—</div>
    <div><span class="badge badge-win">Open</span></div>`;
  log.prepend(row);
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('mfxToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mfxToast';
    toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;z-index:9999;padding:0.85rem 1.4rem;border-radius:12px;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:600;max-width:340px;box-shadow:0 8px 32px rgba(0,0,0,0.4);transition:opacity 0.3s;`;
    document.body.appendChild(toast);
  }
  toast.style.background = type === 'error'
    ? 'rgba(239,68,68,0.9)'
    : 'linear-gradient(135deg,#7c3aed,#ec4899)';
  toast.style.color = '#fff';
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

// ── SIDEBAR: show live account ─────────────────────────────────
function initSidebar() {
  ManooFX.onLogin(acc => {
    document.querySelectorAll('[data-mfx-username]').forEach(el => {
      el.textContent = acc.fullname || acc.loginid;
    });
    document.querySelectorAll('[data-mfx-role]').forEach(el => {
      el.textContent = (acc.is_virtual ? 'Demo' : 'Real') + ' · ' + (acc.loginid || '');
    });
  });

  // Logout button
  document.querySelectorAll('[data-mfx-logout]').forEach(el => {
    el.addEventListener('click', () => ManooFX.logout());
  });
}

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogin();
  initDashboard();
  initMarkets();
  initTrade();
  initAnalyser();

  ManooFX.onError(msg => showToast('⚠ ' + msg, 'error'));
});
