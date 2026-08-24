/* GugoPro Academy advanced tools: browser-only calculations. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const num = (id, fallback = 0) => {
    const value = Number($(id)?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const money = (value) => Number.isFinite(value) ? value.toLocaleString('zh-TW', { maximumFractionDigits: 2 }) : '—';
  const pct = (value) => `${(value * 100).toFixed(2)}%`;
  const show = (id, value) => { if ($(id)) $(id).textContent = value; };

  window.getGugoProGeminiKey = function () {
    return localStorage.getItem('gugopro_gemini_api_key') || '';
  };
  window.saveGugoProGeminiKey = function () {
    const input = $('gemini-api-key');
    if (!input) return;
    localStorage.setItem('gugopro_gemini_api_key', input.value.trim());
    show('key-status', input.value.trim() ? '已儲存於本機瀏覽器' : '已清除本機金鑰');
  };

  function dcf() {
    const fcf = num('dcf-fcf');
    const growth = num('dcf-growth') / 100;
    const terminalGrowth = num('dcf-terminal-growth') / 100;
    const discount = num('dcf-discount') / 100;
    const years = Math.max(1, Math.floor(num('dcf-years', 5)));
    const shares = Math.max(1, num('dcf-shares', 1));
    if (fcf <= 0 || discount <= terminalGrowth || shares <= 0) return show('dcf-result', '請確認現金流、股數與折現率條件。');
    let pv = 0;
    for (let year = 1; year <= years; year += 1) pv += fcf * ((1 + growth) ** year) / ((1 + discount) ** year);
    const terminal = (fcf * ((1 + growth) ** years) * (1 + terminalGrowth)) / (discount - terminalGrowth);
    const enterprise = pv + terminal / ((1 + discount) ** years);
    show('dcf-result', `每股估值 ${money(enterprise / shares)}；企業價值 ${money(enterprise)}`);
  }

  function varStress() {
    const capital = num('var-capital');
    const mean = num('var-mean') / 100;
    const volatility = num('var-vol') / 100;
    const z = num('var-confidence') >= 99 ? 2.326 : num('var-confidence') >= 97.5 ? 1.96 : 1.645;
    const varLoss = Math.max(0, -(mean - z * volatility) * capital);
    const stress = Math.max(0, -(mean - 2.5 * volatility) * capital);
    show('var-result', `單日 VaR ${money(varLoss)}；2.5σ 壓力損失 ${money(stress)}`);
  }

  function duration() {
    const face = num('bond-face', 1000);
    const coupon = num('bond-coupon') / 100;
    const ytm = num('bond-ytm') / 100;
    const years = Math.max(1, Math.floor(num('bond-years', 5)));
    const frequency = Math.max(1, Math.floor(num('bond-frequency', 2)));
    let price = 0; let weighted = 0;
    for (let t = 1; t <= years * frequency; t += 1) {
      const cash = t === years * frequency ? face * coupon / frequency + face : face * coupon / frequency;
      const pv = cash / ((1 + ytm / frequency) ** t);
      price += pv; weighted += (t / frequency) * pv;
    }
    const macaulay = weighted / price;
    show('bond-result', `債券價格 ${money(price)}；Macaulay 久期 ${macaulay.toFixed(2)} 年；修正久期 ${(macaulay / (1 + ytm / frequency)).toFixed(2)} 年`);
  }

  function positionSize() {
    const equity = num('pos-equity');
    const risk = num('pos-risk') / 100;
    const entry = num('pos-entry');
    const stop = num('pos-stop');
    const fee = num('pos-fee') / 100;
    const riskBudget = equity * risk;
    const perShare = Math.abs(entry - stop) + entry * fee;
    if (riskBudget <= 0 || perShare <= 0) return show('position-result', '請輸入有效的資金、風險與停損價格。');
    show('position-result', `建議部位 ${Math.floor(riskBudget / perShare).toLocaleString()} 股；風險預算 ${money(riskBudget)}；每股風險 ${money(perShare)}`);
  }

  function kelly() {
    const win = num('kelly-win') / 100;
    const payoff = num('kelly-payoff');
    const loss = 1 - win;
    const raw = payoff > 0 ? win - loss / payoff : 0;
    show('kelly-result', `Kelly 理論值 ${pct(raw)}；半 Kelly 參考 ${pct(Math.max(0, raw / 2))}`);
  }

  function allocation() {
    const a = Math.max(0.0001, num('alloc-a'));
    const b = Math.max(0.0001, num('alloc-b'));
    const c = Math.max(0.0001, num('alloc-c'));
    const inv = [1 / a, 1 / b, 1 / c]; const total = inv.reduce((s, x) => s + x, 0);
    show('allocation-result', `波動度反比配置：股票 ${pct(inv[0] / total)}、債券 ${pct(inv[1] / total)}、現金 ${pct(inv[2] / total)}`);
  }

  function seededRandom(seed) { let x = seed >>> 0; return () => ((x = (1664525 * x + 1013904223) >>> 0) / 4294967296); }
  function monteCarlo() {
    const capital = num('mc-capital'); const winRate = num('mc-win') / 100; const payoff = num('mc-payoff');
    const risk = num('mc-risk') / 100; const trades = Math.max(10, Math.floor(num('mc-trades', 100))); const paths = 1000;
    if (capital <= 0 || payoff <= 0) return show('mc-result', '請確認本金與盈虧比。');
    const random = seededRandom(20260824); let ruin = 0; let drawdowns = [];
    for (let p = 0; p < paths; p += 1) { let equity = capital; let peak = capital; let maxDD = 0; let breached = false;
      for (let t = 0; t < trades; t += 1) { equity *= 1 + (random() < winRate ? risk * payoff : -risk); peak = Math.max(peak, equity); maxDD = Math.max(maxDD, (peak - equity) / peak); if (equity <= capital * 0.5) breached = true; }
      drawdowns.push(maxDD); if (breached) ruin += 1;
    }
    drawdowns.sort((x, y) => x - y); show('mc-result', `估計跌破半數本金機率 ${pct(ruin / paths)}；95% 路徑最大回撤 ${pct(drawdowns[Math.floor(paths * 0.95)])}`);
  }

  const bindings = { dcf, 'var-stress': varStress, duration, 'position-size': positionSize, kelly, allocation, 'monte-carlo': monteCarlo };
  document.addEventListener('DOMContentLoaded', () => {
    const key = $('gemini-api-key'); if (key) key.value = window.getGugoProGeminiKey();
    document.querySelectorAll('[data-calc]').forEach((button) => button.addEventListener('click', () => bindings[button.dataset.calc]?.()));
    document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('[data-tab], .advanced-tool-panel').forEach((el) => el.classList.remove('active'));
      button.classList.add('active'); $(button.dataset.tab)?.classList.add('active');
    }));
  });
})();
