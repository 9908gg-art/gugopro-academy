(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var n = function (id, fallback) { var value = Number($(id).value); return Number.isFinite(value) ? value : fallback; };
  var money = function (value) { return 'NT$ ' + Math.round(value).toLocaleString('zh-TW'); };
  var pct = function (value) { return Number(value).toFixed(3) + '%'; };
  var safe = function (value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; }); };

  function calculate() {
    var result = $('tw-day-trading-fee-calc-result'); var buy = n('tw-fee-buy', 0); var sell = n('tw-fee-sell', 0); var shares = Math.floor(n('tw-fee-shares', 0)); var discount = n('tw-fee-discount', 6); var borrowRate = Math.max(0, n('tw-fee-borrow', 0)); var days = Math.max(0, n('tw-fee-days', 2)); var capital = Math.max(0, n('tw-fee-capital', 0)); var riskPct = Math.max(0, n('tw-fee-risk', 1)); var stop = n('tw-fee-stop', 0); var mode = $('tw-fee-mode').value; var symbol = safe($('tw-fee-symbol').value.trim() || '未命名標的');
    if (!(buy > 0 && sell > 0 && shares > 0 && Number.isFinite(discount) && discount >= 2.8 && discount <= 6 && Number.isFinite(stop) && stop > 0)) { result.classList.add('is-warning'); result.textContent = '請確認買賣價格、股數、折數與停損價格。'; return; }
    result.classList.remove('is-warning'); var buyTurnover = buy * shares; var sellTurnover = sell * shares; var commissionRate = .001425 * discount / 10; var buyFee = buyTurnover * commissionRate; var sellFee = sellTurnover * commissionRate; var taxRate = mode === 'day' ? .0015 : .003; var transactionTax = sellTurnover * taxRate; var borrowCost = sellTurnover * borrowRate / 100 * days / 365; var gross = (sell - buy) * shares; var totalCost = buyFee + sellFee + transactionTax + borrowCost; var net = gross - totalCost; var breakEvenSell = (buyTurnover + buyFee + sellFee + borrowCost) / (shares * (1 - taxRate - commissionRate)); var marginNeed = buyTurnover + buyFee; var shortfall = Math.max(0, marginNeed - capital); var riskBudget = capital * riskPct / 100; var riskPerShare = Math.abs(buy - stop); var riskShares = riskPerShare > 0 ? Math.floor(riskBudget / riskPerShare) : 0; var warning = [];
    if (net < 0) warning.push('扣除成本後為負：即使買賣價差為正，也可能不足以覆蓋費用。');
    if (shortfall > 0) warning.push('T+2 交割資金缺口 ' + money(shortfall) + '：若當沖未反向成交，需重新確認可用資金。');
    if (riskShares < shares) warning.push('依單筆風險上限，建議風險股數約 ' + riskShares.toLocaleString('zh-TW') + ' 股，低於本次輸入股數。');
    result.classList.toggle('is-warning', warning.length > 0);
    result.innerHTML = '<div class="tw-stat-grid"><div><span>標的／模式</span><strong>' + symbol + ' · ' + (mode === 'day' ? '當沖' : '現股') + '</strong></div><div><span>毛損益</span><strong>' + money(gross) + '</strong></div><div><span>總交易成本</span><strong>' + money(totalCost) + '</strong></div><div><span>成本後淨損益</span><strong class="tw-result-highlight">' + money(net) + '</strong></div><div><span>損益平衡賣價</span><strong>' + money(breakEvenSell) + '</strong></div><div><span>估算手續費／稅</span><strong>' + money(buyFee + sellFee) + '／' + money(transactionTax) + '</strong></div><div><span>T+2 需準備</span><strong>' + money(marginNeed) + '</strong></div><div><span>風險股數上限</span><strong>' + riskShares.toLocaleString('zh-TW') + ' 股</strong></div></div><p class="tw-result-explain">手續費折數 ' + discount.toFixed(1) + ' 折、證交稅 ' + pct(taxRate * 100) + '、借券／資金成本 ' + money(borrowCost) + '；輸入股數 ' + shares.toLocaleString('zh-TW') + ' 股，停損距離 ' + money(riskPerShare) + '／股。</p>' + (warning.length ? '<div class="tw-warning-list"><b>執行前再確認</b><ul>' + warning.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul></div>' : '<p class="tw-result-ok"><i class="fa-solid fa-circle-check"></i> 目前情境扣除估算成本後仍為正，請再檢查滑價與成交可能性。</p>');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = $('tw-fee-calc'); if (!button) return;
    button.addEventListener('click', calculate);
    document.querySelectorAll('#tw-fee-symbol, #tw-fee-mode, #tw-fee-buy, #tw-fee-sell, #tw-fee-shares, #tw-fee-discount, #tw-fee-borrow, #tw-fee-days, #tw-fee-capital, #tw-fee-risk, #tw-fee-stop').forEach(function (input) { input.addEventListener('input', calculate); input.addEventListener('change', calculate); });
    calculate();
  });
}());
