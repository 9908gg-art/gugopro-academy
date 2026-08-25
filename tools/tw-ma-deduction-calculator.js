(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var number = function (value) { return Number(value); };
  var format = function (value) { return Number(value).toLocaleString('zh-TW', { maximumFractionDigits: 2, minimumFractionDigits: 2 }); };
  var parsePrices = function () { return $('tw-ma-prices').value.split(/[\s,，;；]+/).map(number).filter(function (value) { return Number.isFinite(value) && value > 0; }); };

  function average(values) { return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length; }
  function maAt(values, period, offset) {
    var end = values.length + offset;
    var series = values.slice();
    while (series.length < end) series.push(values[values.length - 1]);
    return average(series.slice(end - period, end));
  }
  function rsi(values) {
    var window = values.slice(-15); var gains = 0; var losses = 0;
    for (var i = 1; i < window.length; i += 1) { var change = window[i] - window[i - 1]; if (change >= 0) gains += change; else losses -= change; }
    if (!losses) return gains ? 100 : 50;
    var rs = (gains / 14) / (losses / 14);
    return 100 - (100 / (1 + rs));
  }
  function stochasticK(values, period) {
    var window = values.slice(-period); var low = Math.min.apply(Math, window); var high = Math.max.apply(Math, window);
    return high === low ? 50 : (values[values.length - 1] - low) / (high - low) * 100;
  }
  function macd(values) {
    var ema = function (period) { var alpha = 2 / (period + 1); var current = values[0]; values.slice(1).forEach(function (price) { current = alpha * price + (1 - alpha) * current; }); return current; };
    var line = ema(12) - ema(26);
    var recent = values.slice(-10); var signal = 0; var alpha = 2 / 10;
    recent.forEach(function (_, index) { var prefix = values.slice(0, values.length - recent.length + index + 1); var point = (function () { var a = 2 / 13; var fast = prefix[0]; var slow = prefix[0]; prefix.slice(1).forEach(function (price) { fast = 2 / 13 * price + (1 - 2 / 13) * fast; slow = 2 / 27 * price + (1 - 2 / 27) * slow; }); return fast - slow; }()); signal = index === 0 ? point : alpha * point + (1 - alpha) * signal; });
    return { line: line, signal: signal };
  }
  function status(incoming, deducted) {
    if (incoming > deducted) return '<span class="tw-status-up">扣低助漲</span>';
    if (incoming < deducted) return '<span class="tw-status-down">扣高助跌</span>';
    return '<span class="tw-status-flat">持平觀察</span>';
  }

  function calculate() {
    var prices = parsePrices(); var result = $('tw-ma-deduction-calculator-result');
    if (prices.length < 20) { result.classList.add('is-warning'); result.textContent = '至少需要 20 筆有效收盤價，才能同時比較 5MA 與 20MA。'; return; }
    result.classList.remove('is-warning');
    var latest = prices[prices.length - 1]; var horizon = Math.min(3, Math.max(1, Math.floor(Number($('tw-ma-horizon').value) || 3))); var rows = [];
    for (var day = 0; day <= horizon; day += 1) {
      var ma5 = maAt(prices, 5, day); var ma20 = maAt(prices, 20, day); var fiveIndex = prices.length + day - 5; var twentyIndex = prices.length + day - 20;
      var fiveDeduct = prices[Math.max(0, Math.min(prices.length - 1, fiveIndex))]; var twentyDeduct = prices[Math.max(0, Math.min(prices.length - 1, twentyIndex))];
      rows.push('<tr><th>' + (day === 0 ? '今日' : '第 ' + day + ' 日') + '</th><td>' + format(ma5) + '</td><td>' + format(fiveDeduct) + '</td><td>' + status(latest, fiveDeduct) + '</td><td>' + format(ma20) + '</td><td>' + format(twentyDeduct) + '</td><td>' + status(latest, twentyDeduct) + '</td></tr>');
    }
    var rsiValue = rsi(prices); var kValue = stochasticK(prices, 9); var dValue = (stochasticK(prices.slice(0, -2), 9) + stochasticK(prices.slice(0, -1), 9) + kValue) / 3; var macdValue = macd(prices); var macdState = macdValue.line >= macdValue.signal ? '動能偏強' : '動能偏弱';
    $('tw-ma-rsi-pill').textContent = 'RSI ' + format(rsiValue) + (rsiValue >= 70 ? '｜高檔' : rsiValue <= 30 ? '｜低檔' : '｜中性');
    $('tw-ma-kd-pill').textContent = 'KD K ' + format(kValue) + '／D ' + format(dValue);
    $('tw-ma-macd-pill').textContent = 'MACD ' + format(macdValue.line) + '／' + macdState;
    result.innerHTML = '<p class="tw-result-lead">最新收盤 <strong>' + format(latest) + '</strong>；以下未來情境假設收盤持平，重點是看「新值」與「被扣除值」的相對位置。</p><div class="tw-table-wrap"><table class="tw-result-table"><thead><tr><th>時點</th><th>5MA</th><th>5MA 扣抵</th><th>5MA 診斷</th><th>20MA</th><th>20MA 扣抵</th><th>20MA 診斷</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div><p class="tw-result-explain">扣抵值升高或降低只描述均線斜率；仍需搭配收盤位置、成交量、回踩與失效價。RSI、KD、MACD 是過濾器，不是單獨的買賣指令。</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = $('tw-ma-calc'); if (!button) return;
    button.addEventListener('click', calculate);
    document.querySelectorAll('#tw-ma-symbol, #tw-ma-horizon, #tw-ma-prices').forEach(function (input) { input.addEventListener('input', calculate); });
    calculate();
  });
}());
