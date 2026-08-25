(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var num = function (id) { return Number($(id).value); };
  var list = function (id) { return $(id).value.split(/[\s,，;；]+/).map(Number).filter(function (value) { return Number.isFinite(value); }); };
  var money = function (value) { return 'NT$ ' + Math.round(value).toLocaleString('zh-TW'); };
  var pct = function (value) { return Number(value).toFixed(2) + '%'; };
  var clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
  var average = function (values) { return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length; };
  var escapeHtml = function (value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; }); };

  function drawChart(low, mid, high, price) {
    var svg = $('tw-val-valuation-chart'); var min = Math.max(0, Math.min(low, price) * .84); var max = Math.max(high, price) * 1.12; var scale = function (value) { return 26 + (value - min) / (max - min || 1) * 668; };
    var xLow = scale(low); var xMid = scale(mid); var xHigh = scale(high); var xPrice = scale(price);
    svg.innerHTML = '<rect x="0" y="0" width="720" height="190" rx="12" fill="#0b111c" stroke="#26364d"/><text x="20" y="27" fill="#ffcf83" font-size="12" font-weight="700">PE VALUATION BAND / 河流圖簡化示意</text><rect x="26" y="68" width="668" height="40" rx="8" fill="#172436"/><rect x="' + xLow.toFixed(1) + '" y="68" width="' + Math.max(2, xMid - xLow).toFixed(1) + '" height="40" fill="#7ed6b0" opacity=".55"/><rect x="' + xMid.toFixed(1) + '" y="68" width="' + Math.max(2, xHigh - xMid).toFixed(1) + '" height="40" fill="#ffb25f" opacity=".62"/><line x1="' + xPrice.toFixed(1) + '" y1="46" x2="' + xPrice.toFixed(1) + '" y2="135" stroke="#f8fafc" stroke-width="2" stroke-dasharray="5 4"/><text x="' + clamp(xPrice - 24, 26, 650).toFixed(1) + '" y="40" fill="#f8fafc" font-size="11" font-weight="700">現價</text><text x="' + clamp(xLow - 18, 26, 650).toFixed(1) + '" y="132" fill="#9cebc5" font-size="11">便宜帶</text><text x="' + clamp(xMid - 24, 26, 650).toFixed(1) + '" y="157" fill="#ffcf83" font-size="11">合理中位</text><text x="' + clamp(xHigh - 18, 26, 650).toFixed(1) + '" y="132" fill="#ffaaa0" font-size="11">昂貴帶</text><text x="26" y="178" fill="#9fb2bf" font-size="11">' + money(low) + '</text><text x="' + clamp(xMid - 28, 26, 640).toFixed(1) + '" y="178" fill="#9fb2bf" font-size="11">' + money(mid) + '</text><text x="' + clamp(xHigh - 28, 26, 640).toFixed(1) + '" y="178" fill="#9fb2bf" font-size="11">' + money(high) + '</text>';
  }

  function calculate() {
    var result = $('tw-stock-valuation-result'); var price = num('tw-val-price'); var eps = num('tw-val-eps'); var lowPe = num('tw-val-pe-low'); var midPe = num('tw-val-pe-mid'); var highPe = num('tw-val-pe-high'); var growth = list('tw-val-growth'); var dividends = list('tw-val-dividends');
    if (![price, eps, lowPe, midPe, highPe].every(Number.isFinite) || price <= 0 || eps <= 0 || lowPe <= 0 || !(lowPe < midPe && midPe < highPe) || !growth.length || !dividends.length) { result.classList.add('is-warning'); result.textContent = '請確認股價、EPS、本益比區間與至少一組成長／股利數字。'; return; }
    result.classList.remove('is-warning'); var low = eps * lowPe; var mid = eps * midPe; var high = eps * highPe; var averageGrowth = average(growth); var averageDividend = average(dividends); var peg = averageGrowth > 0 ? midPe / averageGrowth : NaN; var exPrice = Math.max(0, price - dividends[dividends.length - 1]); var yieldRate = averageDividend / price * 100; var score = clamp(50 + clamp(averageGrowth, -20, 20) + clamp(yieldRate, 0, 20) - (price > mid ? 10 : 0), 0, 100); var valuation = price < low ? '低於便宜帶' : price <= high ? '位於估值帶內' : '高於昂貴帶';
    drawChart(low, mid, high, price);
    result.innerHTML = '<div class="tw-stat-grid"><div><span>便宜參考價</span><strong>' + money(low) + '</strong></div><div><span>合理中位價</span><strong>' + money(mid) + '</strong></div><div><span>昂貴參考價</span><strong>' + money(high) + '</strong></div><div><span>PEG</span><strong>' + (Number.isFinite(peg) ? peg.toFixed(2) : '—') + '</strong></div><div><span>除息參考價</span><strong>' + money(exPrice) + '</strong></div><div><span>填息參考分數</span><strong class="tw-result-highlight">' + score.toFixed(0) + ' / 100</strong></div></div><p class="tw-result-explain">' + escapeHtml($('tw-val-symbol').value.trim() || '未命名標的') + ' 目前 ' + money(price) + '，' + valuation + '；近三年平均營收 YoY ' + pct(averageGrowth) + '，平均現金股利 ' + money(averageDividend) + '，殖利率約 ' + pct(yieldRate) + '。分數是透明情境提示，不是填息機率。</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = $('tw-val-calc'); if (!button) return;
    button.addEventListener('click', calculate);
    document.querySelectorAll('#tw-val-symbol, #tw-val-price, #tw-val-eps, #tw-val-pe-low, #tw-val-pe-mid, #tw-val-pe-high, #tw-val-growth, #tw-val-dividends').forEach(function (input) { input.addEventListener('input', calculate); });
    calculate();
  });
}());
