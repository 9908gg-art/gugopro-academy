(() => {
  'use strict';

  const FILTER_TRANSITION_MS = 180;

  function initToolsHub() {
    const grid = document.getElementById('tool-library-grid');
    const search = document.getElementById('tool-library-search');
    const summary = document.getElementById('tool-library-summary');
    const empty = document.getElementById('tool-library-empty');
    const cards = grid ? [...grid.querySelectorAll('[data-tool-card]')] : [];
    const filters = [...document.querySelectorAll('[data-tool-filter]')];

    // This flag belongs to the runtime, not the HTML. A pre-existing data attribute
    // must never prevent the count/filter initialization from running.
    if (!grid || grid.dataset.toolsHubInitialized === 'true') return;
    grid.dataset.toolsHubInitialized = 'true';

    let activeFilter = 'all';
    const hideTimers = new WeakMap();
    const categoryTokens = (card) => (card.getAttribute('data-tool-category') || '')
      .split(/\s+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    const filterFor = (key) => filters.find((filter) => (filter.getAttribute('data-tool-filter') || 'all') === key);
    const filterLabel = (key) => filterFor(key)?.querySelector('span')?.textContent?.trim() || key;
    const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    function setCardVisibility(card, show) {
      const previousTimer = hideTimers.get(card);
      if (previousTimer) window.clearTimeout(previousTimer);

      if (show) {
        card.hidden = false;
        card.setAttribute('aria-hidden', 'false');
        card.classList.add('is-filter-hidden');
        if (reduceMotion()) {
          card.classList.remove('is-filter-hidden');
          return;
        }
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => card.classList.remove('is-filter-hidden'));
        });
        return;
      }

      card.setAttribute('aria-hidden', 'true');
      card.classList.add('is-filter-hidden');
      if (reduceMotion()) {
        card.hidden = true;
        return;
      }
      const timer = window.setTimeout(() => {
        card.hidden = true;
        hideTimers.delete(card);
      }, FILTER_TRANSITION_MS);
      hideTimers.set(card, timer);
    }

    function updateCounts() {
      const counts = new Map([['all', cards.length]]);
      filters.forEach((filter) => {
        const key = filter.getAttribute('data-tool-filter') || 'all';
        if (key === 'all') return;
        counts.set(key, cards.filter((card) => categoryTokens(card).includes(key)).length);
      });

      filters.forEach((filter) => {
        const key = filter.getAttribute('data-tool-filter') || 'all';
        const count = counts.get(key) || 0;
        const badge = filter.querySelector('[data-filter-count]');
        const isEmpty = key !== 'all' && count === 0;
        if (badge) badge.textContent = String(count);
        filter.disabled = isEmpty;
        filter.classList.toggle('is-empty', isEmpty);
        filter.setAttribute('aria-disabled', String(isEmpty));
        filter.setAttribute('aria-label', `${filterLabel(key)}，${count} 個工具`);
        filter.title = isEmpty ? '目前分類建置中，尚無可顯示工具' : '';
      });

      const total = document.getElementById('tool-library-total');
      const categoryTotal = document.getElementById('tool-library-category-count');
      const publicTotal = document.getElementById('tool-library-public-count');
      const chapterTotal = document.getElementById('tool-library-chapter-count');
      if (total) total.textContent = String(cards.length);
      if (categoryTotal) categoryTotal.textContent = String(filters.filter((filter) => (filter.getAttribute('data-tool-filter') || 'all') !== 'all').length);
      if (publicTotal) publicTotal.textContent = String(cards.filter((card) => card.matches('[data-global-tool-card]')).length);
      if (chapterTotal) chapterTotal.textContent = String(cards.filter((card) => card.matches('[data-chapter-tool-card]')).length);

      const activeButton = filterFor(activeFilter);
      if (!activeButton || activeButton.disabled) activeFilter = 'all';
    }

    function render() {
      const query = search ? search.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach((card) => {
        const matchesFilter = activeFilter === 'all' || categoryTokens(card).includes(activeFilter);
        const haystack = (card.getAttribute('data-tool-search') || '').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const show = matchesFilter && matchesQuery;
        setCardVisibility(card, show);
        if (show) visible += 1;
      });

      if (empty) {
        empty.hidden = visible !== 0;
        if (!empty.hidden) {
          empty.textContent = query
            ? `找不到符合「${query}」的工具，請換一個市場或關鍵字。`
            : `目前「${filterLabel(activeFilter)}」分類沒有可顯示的工具。`;
        }
      }
      if (summary) {
        const label = activeFilter === 'all' ? '全市場' : filterLabel(activeFilter);
        summary.textContent = query ? `找到 ${visible} 個工具` : `顯示 ${label} ${visible} 個工具`;
      }
      grid.setAttribute('aria-rowcount', String(visible));
      grid.setAttribute('data-visible-count', String(visible));
    }

    function selectFilter(filter) {
      if (!filter || filter.disabled) return;
      activeFilter = filter.getAttribute('data-tool-filter') || 'all';
      filters.forEach((item) => {
        const selected = item === filter;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      render();
      if (window.matchMedia?.('(max-width: 900px)').matches) {
        grid.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }

    filters.forEach((filter) => filter.addEventListener('click', () => selectFilter(filter)));

    cards.forEach((card) => {
      if (!card.matches('button')) return;
      card.addEventListener('click', function () {
        const targetId = card.getAttribute('data-tool-launch');
        const tab = targetId ? document.querySelector(`[data-tab="${targetId}"]`) : null;
        const panel = targetId ? document.getElementById(targetId) : null;
        if (!tab || !panel) return;
        tab.click();
        panel.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        window.setTimeout(() => tab.focus({ preventScroll: true }), reduceMotion() ? 0 : FILTER_TRANSITION_MS);
      });
    });

    if (search) search.addEventListener('input', render);
    document.addEventListener('keydown', (event) => {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolsHub, { once: true });
  } else {
    initToolsHub();
  }
})();
