(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const n = (id) => Number($(id)?.value) || 0;
  const money = (value) => Number.isFinite(value) ? `NT$ ${value.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}` : '—';
  const percent = (value) => `${value.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}%`;
  let latest = null;

  function gridLevels(lower, upper, count, mode) {
    const levels = [];
    for (let index = 0; index <= count; index += 1) {
      const ratio = index / count;
      levels.push(mode === 'geometric' ? lower * Math.pow(upper / lower, ratio) : lower + (upper - lower) * ratio);
    }
    return levels;
  }

  function simulatePath(lower, upper, days, volatility) {
    const midpoint = (lower + upper) / 2;
    const amplitude = (upper - lower) * Math.min(0.48, Math.max(0.02, volatility / 100));
    return Array.from({ length: days + 1 }, (_, index) => {
      const cycle = Math.sin(index * 0.33) * 0.58 + Math.sin(index * 0.095 + 1.1) * 0.27 + Math.cos(index * 0.71) * 0.15;
      return Math.max(lower * 0.5, midpoint + amplitude * cycle);
    });
  }

  function pathFor(points, width = 800, height = 300, min = 0, max = 1) {
    return points.map((point, index) => `${index ? 'L' : 'M'} ${42 + (index / Math.max(1, points.length - 1)) * 728} ${height - 28 - ((point - min) / Math.max(0.00001, max - min)) * 210}`).join(' ');
  }

  function renderGrid(levels, lower, upper, path, equityPath) {
    const lines = $('grid-lines');
    if (lines) lines.innerHTML = levels.map((level) => { const y = 272 - ((level - lower) / (upper - lower)) * 210; return `<line x1="42" x2="770" y1="${y}" y2="${y}"/><text x="10" y="${y + 4}" class="svg-axis-label">${level.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}</text>`; }).join('');
    const min = Math.min(...path, lower); const max = Math.max(...path, upper);
    if ($('grid-path')) $('grid-path').setAttribute('d', pathFor(path, 800, 300, min, max));
    if ($('grid-equity-path')) $('grid-equity-path').setAttribute('d', pathFor(equityPath, 800, 300, Math.min(...equityPath), Math.max(...equityPath)));
    const markers = $('grid-markers');
    if (markers) markers.innerHTML = levels.map((level) => { const y = 272 - ((level - min) / Math.max(0.00001, max - min)) * 210; return `<circle cx="${42 + (levels.indexOf(level) / Math.max(1, levels.length - 1)) * 728}" cy="${y}" r="2.5" class="grid-level-marker"/>`; }).join('');
  }

  function simulate() {
    const lower = Math.max(0.000001, n('grid-lower'));
    const upper = Math.max(lower + 0.000001, n('grid-upper'));
    const count = Math.min(100, Math.max(2, Math.floor(n('grid-count'))));
    const capital = Math.max(0, n('grid-capital'));
    const volatility = Math.max(0, n('grid-volatility'));
    const days = Math.min(365, Math.max(1, Math.floor(n('grid-days'))));
    const mode = $('grid-mode')?.value || 'arithmetic';
    const levels = gridLevels(lower, upper, count, mode);
    const path = simulatePath(lower, upper, days, volatility);
    const spacing = mode === 'geometric' ? (Math.pow(upper / lower, 1 / count) - 1) * 100 : ((upper - lower) / count / ((upper + lower) / 2)) * 100;
    const allocationPerGrid = capital / count;
    let inventory = 0;
    let cash = capital;
    let profit = 0;
    let trades = 0;
    let peakEquity = capital;
    let maxDrawdown = 0;
    const equityPath = [capital];
    for (let index = 1; index < path.length; index += 1) {
      const previous = path[index - 1]; const price = path[index];
      const crossed = Math.abs(price - previous);
      const traversed = Math.floor(crossed / Math.max(0.000001, (upper - lower) / count));
      if (traversed > 0 && price >= lower && price <= upper) {
        const gross = traversed * allocationPerGrid * (spacing / 100);
        profit += gross; trades += traversed;
        inventory += price < previous ? allocationPerGrid / Math.max(price, 0.000001) : -allocationPerGrid / Math.max(price, 0.000001);
        cash += price < previous ? -allocationPerGrid : allocationPerGrid + gross;
      }
      const marked = cash + inventory * price;
      peakEquity = Math.max(peakEquity, marked);
      maxDrawdown = Math.max(maxDrawdown, peakEquity ? (peakEquity - marked) / peakEquity : 0);
      equityPath.push(marked);
    }
    const finalValue = equityPath[equityPath.length - 1];
    const returnPct = capital ? ((finalValue - capital) / capital) * 100 : 0;
    latest = { levels, path, equityPath, lower, upper };
    if ($('grid-spacing')) $('grid-spacing').textContent = mode === 'geometric' ? `${percent(spacing)}（比例）` : `${percent(spacing)}（估算）`;
    if ($('grid-trades')) $('grid-trades').textContent = `${trades.toLocaleString('zh-TW')} 回合`;
    if ($('grid-profit')) $('grid-profit').textContent = money(profit);
    if ($('grid-return')) $('grid-return').textContent = percent(returnPct);
    if ($('grid-drawdown')) $('grid-drawdown').textContent = percent(maxDrawdown * 100);
    if ($('grid-final-value')) $('grid-final-value').textContent = money(finalValue);
    if ($('grid-status')) $('grid-status').textContent = `${mode === 'geometric' ? '等比' : '等差'} ${count} 格、${days} 天、波動率 ${volatility}% 的固定路徑情境已更新；成交增加不代表風險降低。`;
    renderGrid(levels, lower, upper, path, equityPath);
  }

  function bind() {
    ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-volatility', 'grid-days'].forEach((id) => $(id)?.addEventListener('input', simulate));
    simulate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
