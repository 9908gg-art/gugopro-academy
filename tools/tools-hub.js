(() => {
  'use strict';

  function initToolsHub() {
    const grid = document.getElementById('tool-library-grid');
    const search = document.getElementById('tool-library-search');
    const summary = document.getElementById('tool-library-summary');
    const empty = document.getElementById('tool-library-empty');
    const cards = grid ? [...grid.querySelectorAll('[data-tool-card]')] : [];
    const filters = [...document.querySelectorAll('[data-tool-filter]')];
    let activeFilter = 'all';

    if (!grid || !cards.length || grid.dataset.toolsHubReady === 'true') return;
    grid.dataset.toolsHubReady = 'true';

    const categories = (card) => (card.getAttribute('data-tool-category') || '').split(/\s+/).filter(Boolean);
    const countCards = (selector) => cards.filter((card) => !selector || card.matches(selector)).length;

    function updateCounts() {
      filters.forEach((filter) => {
        const key = filter.getAttribute('data-tool-filter') || 'all';
        const count = key === 'all' ? cards.length : cards.filter((card) => categories(card).includes(key)).length;
        const badge = filter.querySelector('[data-filter-count]');
        if (badge) badge.textContent = String(count);
        filter.setAttribute('aria-label', `${filter.querySelector('span')?.textContent?.trim() || key}，${count} 個工具`);
      });
      const total = document.getElementById('tool-library-total');
      const categoryTotal = document.getElementById('tool-library-category-count');
      const publicTotal = document.getElementById('tool-library-public-count');
      const chapterTotal = document.getElementById('tool-library-chapter-count');
      if (total) total.textContent = String(cards.length);
      if (categoryTotal) categoryTotal.textContent = String(filters.filter((filter) => (filter.getAttribute('data-tool-filter') || 'all') !== 'all').length);
      if (publicTotal) publicTotal.textContent = String(countCards('[data-global-tool-card]'));
      if (chapterTotal) chapterTotal.textContent = String(countCards('[data-chapter-tool-card]'));
    }

    function render() {
      const query = search ? search.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach((card) => {
        const matchesFilter = activeFilter === 'all' || categories(card).includes(activeFilter);
        const matchesQuery = !query || (card.getAttribute('data-tool-search') || '').toLowerCase().includes(query);
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
      if (summary) {
        const label = activeFilter === 'all' ? '全市場' : (filters.find((filter) => filter.getAttribute('data-tool-filter') === activeFilter)?.querySelector('span')?.textContent?.trim() || '此分類');
        summary.textContent = query ? `找到 ${visible} 個工具` : `顯示 ${label} ${visible} 個工具`;
      }
      grid.setAttribute('aria-rowcount', String(visible));
    }

    filters.forEach((filter) => {
      filter.addEventListener('click', function () {
        activeFilter = filter.getAttribute('data-tool-filter') || 'all';
        filters.forEach((item) => {
          const selected = item === filter;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-selected', String(selected));
        });
        render();
        if (window.matchMedia('(max-width: 900px)').matches) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    cards.forEach((card) => {
      if (!card.matches('button')) return;
      card.addEventListener('click', function () {
        const targetId = card.getAttribute('data-tool-launch');
        const tab = targetId ? document.querySelector(`[data-tab="${targetId}"]`) : null;
        const panel = targetId ? document.getElementById(targetId) : null;
        if (!tab || !panel) return;
        tab.click();
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => tab.focus({ preventScroll: true }), 180);
      });
    });

    if (search) search.addEventListener('input', render);
    document.addEventListener('keydown', function (event) {
      if (event.key === '/' && document.activeElement !== search) {
        event.preventDefault();
        search?.focus();
      }
      if (event.key === 'Escape' && search) {
        search.value = '';
        render();
        search.blur();
      }
    });

    updateCounts();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initToolsHub, { once: true });
  else initToolsHub();
})();
