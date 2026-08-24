(() => {
  'use strict';
  const ids = ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'];
  const $ = (id) => document.getElementById(id);
  const number = (id) => Number($(id)?.value);
  const format = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString('zh-TW', { maximumFractionDigits: digits }) : '—';
  const set = (id, value) => { const node = $(id); if (node) node.textContent = value; };

  function calculate() {
    const entry = number('rr-entry-price');
    const stop = number('rr-stop-price');
    const target = number('rr-target-price');
    const capital = number('rr-capital');
    const riskPercent = number('rr-risk-percent');
    const status = $('rr-status');
    const direction = $('rr-direction');
    const values = [entry, stop, target, capital, riskPercent];
    if (values.some((value) => !Number.isFinite(value)) || entry <= 0 || stop <= 0 || target <= 0 || capital <= 0 || riskPercent <= 0 || riskPercent > 100) {
      set('rr-ratio', '—'); set('rr-risk-per-unit', '—'); set('rr-risk-budget', '—'); set('rr-position-size', '—'); set('rr-notional', '—'); set('rr-profit', '—');
      if (direction) direction.textContent = '需要有效輸入';
      if (status) status.textContent = '請輸入大於 0 的價格、資金與 0–100% 之間的單筆風險百分比。';
      return;
    }
    const isLong = target > entry && stop < entry;
    const isShort = target < entry && stop > entry;
    if (!isLong && !isShort) {
      set('rr-ratio', '—'); set('rr-risk-per-unit', '—'); set('rr-risk-budget', '—'); set('rr-position-size', '—'); set('rr-notional', '—'); set('rr-profit', '—');
      if (direction) direction.textContent = '價格方向不一致';
      if (status) status.textContent = '多頭需符合「目標 > 進場 > 停損」；空頭需符合「停損 > 進場 > 目標」。';
      return;
    }
    const riskPerUnit = Math.abs(entry - stop);
    const rewardPerUnit = Math.abs(target - entry);
    const ratio = rewardPerUnit / riskPerUnit;
    const riskBudget = capital * riskPercent / 100;
    const positionSize = Math.floor(riskBudget / riskPerUnit);
    const notional = positionSize * entry;
    const maxLoss = positionSize * riskPerUnit;
    const profit = positionSize * rewardPerUnit;
    set('rr-ratio', `${format(ratio)}R`);
    set('rr-risk-per-unit', format(riskPerUnit));
    set('rr-risk-budget', format(riskBudget));
    set('rr-position-size', format(positionSize, 0));
    set('rr-notional', format(notional));
    set('rr-profit', format(profit));
    if (direction) direction.textContent = isLong ? '多頭計畫 / Long' : '空頭計畫 / Short';
    if (status) {
      if (positionSize < 1) {
        status.textContent = `風險預算 ${format(riskBudget)} 小於一單位風險 ${format(riskPerUnit)}；依此設定不應建立部位，請降低價格距離或調整風險規模。`;
      } else {
        status.textContent = `以 ${format(positionSize, 0)} 單位計算，最大價格損失約 ${format(maxLoss)}，到達目標的模型潛在獲利約 ${format(profit)}；尚未扣除費用、滑價與跳空。`;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ids.forEach((id) => $(id)?.addEventListener('input', calculate));
    calculate();
  });
})();
