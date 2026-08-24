/* GugoPro Academy: browser-only finance calculators. No network calls are made. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const value = (id, fallback = 0) => { const n = Number($(id)?.value); return Number.isFinite(n) ? n : fallback; };
  const money = (n) => Number.isFinite(n) ? `NT$ ${Math.round(n).toLocaleString('zh-TW')}` : '—';
  const pct = (n) => `${(n * 100).toFixed(2)}%`;
  const result = (id, text, warning = false) => { const el = $(id); if (!el) return; el.textContent = text; el.classList.toggle('tool-warning', warning); };
  const validPositive = (...numbers) => numbers.every((n) => Number.isFinite(n) && n > 0);

  window.getGugoProGeminiKey = () => localStorage.getItem('gugopro_gemini_api_key') || '';
  window.saveGugoProGeminiKey = () => {
    const input = $('gemini-api-key');
    if (!input) return;
    const key = input.value.trim();
    if (key) localStorage.setItem('gugopro_gemini_api_key', key);
    else localStorage.removeItem('gugopro_gemini_api_key');
    if ($('key-status')) $('key-status').textContent = key ? '已儲存於本機瀏覽器，不會上傳至學院伺服器。' : '已清除本機金鑰。';
  };

  function compound() {
    const principal = value('compound-principal'); const monthly = value('compound-monthly');
    const rate = (value('compound-rate') - value('compound-fee')) / 100; const years = Math.floor(value('compound-years', 20));
    if (!validPositive(principal, years) || monthly < 0 || !Number.isFinite(rate) || rate <= -1) return result('compound-result', '請輸入有效的本金、投入、報酬率與年限。', true);
    const months = years * 12; const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1; let total = principal;
    for (let i = 0; i < months; i += 1) total = (total + monthly) * (1 + monthlyRate);
    const invested = principal + monthly * months;
    result('compound-result', `預估終值 ${money(total)}；投入本金 ${money(invested)}；複利增值 ${money(total - invested)}。模型採月末投入，淨報酬率已扣除年度費用。`);
  }

  function etfFee() {
    const principal = value('etf-principal'); const gross = value('etf-return') / 100; const fee = value('etf-fee') / 100; const years = Math.floor(value('etf-years', 20));
    if (!validPositive(principal, years) || gross <= -1 || fee < 0) return result('etf-result', '請輸入有效的本金、報酬、費用率與年限。', true);
    const grossFinal = principal * Math.pow(1 + gross, years); const netFinal = principal * Math.pow(1 + gross - fee, years); const drag = grossFinal - netFinal;
    result('etf-result', `未扣費用終值 ${money(grossFinal)}；扣除年度費用後 ${money(netFinal)}；估計費用複利拖累 ${money(drag)}。此結果未含稅費、追蹤差異與交易成本。`);
  }

  function duration() {
    const face = value('bond-face', 1000); const couponRate = value('bond-coupon') / 100; const ytm = value('bond-ytm') / 100;
    const years = Math.floor(value('bond-years', 5)); const frequency = Math.floor(value('bond-frequency', 2)); const shift = value('bond-shift') / 10000;
    const periods = years * frequency; const ratePerPeriod = ytm / frequency;
    if (!validPositive(face, years, frequency) || ratePerPeriod <= -1 || couponRate < 0) return result('bond-result', '請確認面額、到期年數、付息頻率與殖利率。', true);
    let price = 0; let weighted = 0;
    for (let t = 1; t <= periods; t += 1) { const cash = face * couponRate / frequency + (t === periods ? face : 0); const pv = cash / Math.pow(1 + ratePerPeriod, t); price += pv; weighted += (t / frequency) * pv; }
    const macaulay = weighted / price; const modified = macaulay / (1 + ratePerPeriod); const approxChange = -modified * shift * price;
    result('bond-result', `理論價格 ${money(price)}；Macaulay 久期 ${macaulay.toFixed(2)} 年；修正久期 ${modified.toFixed(2)} 年；殖利率變動 ${value('bond-shift').toFixed(0)} bp 時，近似價格變動 ${money(approxChange)}，新價格約 ${money(price + approxChange)}。`);
  }

  function curve() {
    const shortRate = value('curve-short'); const longRate = value('curve-long'); const threshold = value('curve-threshold'); const spread = (shortRate - longRate) * 100;
    if (![shortRate, longRate, threshold].every(Number.isFinite)) return result('curve-result', '請輸入有效的短、長天期殖利率。', true);
    const inverted = spread > threshold; const text = inverted ? '倒掛警示' : spread < -Math.abs(threshold || 1) ? '正常斜率' : '接近持平';
    result('curve-result', `${text}：短長天期利差為 ${spread.toFixed(0)} bp（短天期 ${shortRate.toFixed(2)}% − 長天期 ${longRate.toFixed(2)}%）。這是情境訊號，不是精準擇時工具。`, inverted);
  }

  function risk() {
    const entry = value('rr-entry'); const stop = value('rr-stop'); const target = value('rr-target'); const equity = value('rr-equity'); const riskPct = value('rr-risk') / 100;
    const win = value('kelly-win') / 100; const payoff = value('kelly-payoff'); const riskPerUnit = Math.abs(entry - stop); const rewardPerUnit = Math.abs(target - entry);
    if (!validPositive(entry, equity, riskPerUnit, rewardPerUnit) || riskPct <= 0 || win <= 0 || win >= 1 || payoff <= 0) return result('risk-result', '請確認進場、停損、目標、資金與勝率條件。', true);
    const rr = rewardPerUnit / riskPerUnit; const budget = equity * riskPct; const units = Math.floor(budget / riskPerUnit); const kelly = win - (1 - win) / payoff;
    result('risk-result', `交易風報比 ${rr.toFixed(2)}R；單筆風險預算 ${money(budget)}；以價格距離估算最多 ${units.toLocaleString()} 單位；Kelly 理論值 ${pct(kelly)}，半 Kelly 參考 ${pct(Math.max(0, kelly / 2))}。`);
  }

  function dcf() {
    const fcf = value('dcf-fcf'); const growth = value('dcf-growth') / 100; const terminalGrowth = value('dcf-terminal') / 100; const discount = value('dcf-discount') / 100; const years = Math.floor(value('dcf-years', 5)); const shares = value('dcf-shares'); const price = value('dcf-price'); const mos = value('dcf-mos') / 100;
    if (!validPositive(fcf, years, shares) || discount <= terminalGrowth || discount <= -1 || growth <= -1 || mos < 0 || mos >= 1) return result('dcf-result', '請確認 FCF、折現率、終值成長率、股數與安全邊際條件。', true);
    let pv = 0; for (let y = 1; y <= years; y += 1) pv += fcf * Math.pow(1 + growth, y) / Math.pow(1 + discount, y);
    const terminal = fcf * Math.pow(1 + growth, years) * (1 + terminalGrowth) / (discount - terminalGrowth); const enterprise = pv + terminal / Math.pow(1 + discount, years); const perShare = enterprise / shares; const buyBelow = perShare * (1 - mos);
    const comparison = price > 0 ? (price <= buyBelow ? `目前價格低於安全邊際價格 ${money(buyBelow)}。` : `目前價格高於安全邊際價格 ${money(buyBelow)}。`) : `安全邊際價格 ${money(buyBelow)}。`;
    result('dcf-result', `簡化企業價值 ${money(enterprise)}；每股價值 ${money(perShare)}；${comparison} 結果高度取決於成長率與折現率假設，不能取代完整估值。`, price > 0 && price > buyBelow);
  }

  function retirement() {
    let balance = value('ret-capital'); const withdrawalRate = value('ret-withdrawal') / 100; const annualReturn = value('ret-return') / 100; const inflation = value('ret-inflation') / 100; const years = Math.floor(value('ret-years', 30));
    if (!validPositive(balance, years) || withdrawalRate < 0 || annualReturn <= -1 || inflation < 0) return result('retirement-result', '請輸入有效的本金、提領率、報酬率、通膨與年限。', true);
    const firstWithdrawal = balance * withdrawalRate; let withdrawal = firstWithdrawal; let totalWithdrawn = 0; let depletedAt = 0;
    for (let y = 1; y <= years; y += 1) { balance *= 1 + annualReturn; balance -= withdrawal; totalWithdrawn += Math.max(0, withdrawal); if (balance <= 0) { balance = 0; depletedAt = y; break; } withdrawal *= 1 + inflation; }
    const status = depletedAt ? `在第 ${depletedAt} 年耗盡` : `期末剩餘 ${money(balance)}`;
    result('retirement-result', `首年提領 ${money(firstWithdrawal)}；模擬期間累計提領 ${money(totalWithdrawn)}；${status}。此為固定報酬情境，未模擬報酬順序風險。`, Boolean(depletedAt));
  }

  function allocation() {
    const values = [value('alloc-stock-value'), value('alloc-bond-value'), value('alloc-cash-value')]; const targets = [value('alloc-stock-target'), value('alloc-bond-target'), value('alloc-cash-target')]; const total = values.reduce((a, b) => a + b, 0); const targetTotal = targets.reduce((a, b) => a + b, 0);
    if (total <= 0 || targetTotal <= 0 || Math.abs(targetTotal - 100) > 0.01 || values.some((n) => n < 0) || targets.some((n) => n < 0)) return result('allocation-result', '請確認資產金額非負，且三項目標權重合計為 100%。', true);
    const labels = ['股票', '債券', '現金']; const changes = targets.map((target, i) => total * target / 100 - values[i]); const text = changes.map((n, i) => `${labels[i]}${n >= 0 ? '買入' : '減碼'} ${money(Math.abs(n))}`).join('；');
    result('allocation-result', `投資組合總額 ${money(total)}；再平衡建議：${text}。這是目標權重差額，不含稅務、交易成本與流動性限制。`);
  }

  function seededRandom(seed) { let x = seed >>> 0; return () => ((x = (1664525 * x + 1013904223) >>> 0) / 4294967296); }
  function monteCarlo() {
    const capital = value('mc-capital'); const winRate = value('mc-win') / 100; const payoff = value('mc-payoff'); const risk = value('mc-risk') / 100; const trades = Math.floor(value('mc-trades', 100)); const paths = 1000;
    if (!validPositive(capital, payoff, trades) || winRate < 0 || winRate > 1 || risk <= 0 || risk >= 1) return result('mc-result', '請確認本金、勝率、盈虧比、風險與交易次數。', true);
    const random = seededRandom(20260824); let breached = 0; const drawdowns = [];
    for (let p = 0; p < paths; p += 1) { let equity = capital; let peak = capital; let maxDD = 0; let hit = false; for (let t = 0; t < trades; t += 1) { equity *= 1 + (random() < winRate ? risk * payoff : -risk); peak = Math.max(peak, equity); maxDD = Math.max(maxDD, (peak - equity) / peak); if (equity <= capital * .5) hit = true; } if (hit) breached += 1; drawdowns.push(maxDD); }
    drawdowns.sort((a, b) => a - b); result('mc-result', `1,000 條固定種子路徑中，跌破半數本金機率 ${pct(breached / paths)}；95% 路徑最大回撤 ${pct(drawdowns[Math.floor(paths * .95)])}。模擬不代表未來分布。`, breached / paths > .1);
  }

  const bindings = { compound, 'etf-fee': etfFee, duration, curve, risk, dcf, retirement, allocation, 'monte-carlo': monteCarlo };
  function activatePanel(id, updateHash = true) {
    const button = document.querySelector(`[data-tab="${id}"]`); const panel = $(id);
    if (!button || !panel) return;
    document.querySelectorAll('[data-tab]').forEach((el) => el.classList.toggle('active', el === button));
    document.querySelectorAll('.advanced-tool-panel').forEach((el) => el.classList.toggle('active', el === panel));
    if (updateHash) history.replaceState(null, '', `#${id}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const key = $('gemini-api-key'); if (key) key.value = window.getGugoProGeminiKey();
    document.querySelectorAll('[data-calc]').forEach((button) => button.addEventListener('click', () => bindings[button.dataset.calc]?.()));
    document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => activatePanel(button.dataset.tab)));
    const hash = window.location.hash.slice(1); if (hash && $(hash)) activatePanel(hash, false);
  });
})();
