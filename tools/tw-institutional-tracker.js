(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var num = function (id, fallback) {
    var value = Number($(id).value);
    return Number.isFinite(value) ? value : fallback;
  };
  var esc = function (value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; }); };
  var format = function (value, digits) { return Number(value).toLocaleString('zh-TW', { maximumFractionDigits: digits || 0, minimumFractionDigits: digits || 0 }); };

  function calculate() {
    var symbol = esc($('tw-inst-symbol').value.trim() || '未命名標的');
    var windowDays = Math.max(1, Math.floor(num('tw-inst-window', 5)));
    var foreign = num('tw-inst-foreign', 0);
    var investment = num('tw-inst-investment', 0);
    var dealer = num('tw-inst-dealer', 0);
    var streak = Math.max(0, Math.floor(num('tw-inst-streak', 0)));
    var margin = Math.max(0, num('tw-inst-margin', 0));
    var short = Math.max(0, num('tw-inst-short', 0));
    var concentration = Math.min(100, Math.max(0, num('tw-inst-concentration', 0)));
    var institutionalNet = foreign + investment + dealer;
    var dailyMomentum = institutionalNet / windowDays;
    var shortRatio = margin > 0 ? short / margin * 100 : NaN;
    var warnings = [];
    if (institutionalNet < 0) warnings.push('法人合計偏賣超：先確認價格是否跌破關鍵支撐。');
    if (shortRatio >= 20) warnings.push('券資比偏高：回補可能放大波動，但不等於必然軋空。');
    if (concentration >= 60) warnings.push('集中度偏高：流動性與單一籌碼撤出風險需要壓力測試。');
    if (streak >= 5 && institutionalNet > 0) warnings.push('連續買超已延續：避免把趨勢延續直接當成未來報酬保證。');
    var signal = warnings.length ? (institutionalNet < 0 ? '偏弱／待確認' : '有條件警戒') : (institutionalNet > 0 ? '偏多／待價格確認' : '中性觀察');
    var result = $('tw-institutional-tracker-result');
    result.classList.toggle('is-warning', warnings.length > 0);
    result.innerHTML = '<div class="tw-stat-grid"><div><span>標的</span><strong>' + symbol + '</strong></div><div><span>法人合計</span><strong>' + format(institutionalNet) + ' 張</strong></div><div><span>日均動能</span><strong>' + format(dailyMomentum) + ' 張</strong></div><div><span>券資比</span><strong>' + (Number.isFinite(shortRatio) ? format(shortRatio, 2) + '%' : '—') + '</strong></div><div><span>集中度</span><strong>' + format(concentration, 1) + '%</strong></div><div><span>條件狀態</span><strong class="tw-result-highlight">' + signal + '</strong></div></div><p class="tw-result-explain">外資 ' + format(foreign) + ' 張、投信 ' + format(investment) + ' 張、自營商 ' + format(dealer) + ' 張；觀察窗口 ' + windowDays + ' 個交易日，法人方向仍需與收盤、成交量及資料日期交叉確認。</p>' + (warnings.length ? '<div class="tw-warning-list"><b>需要再查證</b><ul>' + warnings.map(function (warning) { return '<li>' + warning + '</li>'; }).join('') + '</ul></div>' : '<p class="tw-result-ok"><i class="fa-solid fa-circle-check"></i> 暫無達到本工具門檻的警示；這不代表沒有市場風險。</p>');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = $('tw-inst-calc');
    if (!button) return;
    button.addEventListener('click', calculate);
    document.querySelectorAll('#tw-inst-symbol, #tw-inst-window, #tw-inst-foreign, #tw-inst-investment, #tw-inst-dealer, #tw-inst-streak, #tw-inst-margin, #tw-inst-short, #tw-inst-concentration').forEach(function (input) { input.addEventListener('input', calculate); });
    calculate();
  });
}());
