(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('tool-library-grid');
    var search = document.getElementById('tool-library-search');
    var summary = document.getElementById('tool-library-summary');
    var empty = document.getElementById('tool-library-empty');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-tool-card]')) : [];
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-tool-filter]'));
    var activeFilter = 'all';

    if (!grid || !cards.length) return;

    function categories(card) {
      return (card.getAttribute('data-tool-category') || '').split(/\s+/).filter(Boolean);
    }

    function updateCounts() {
      filters.forEach(function (filter) {
        var key = filter.getAttribute('data-tool-filter');
        var count = key === 'all' ? cards.length : cards.filter(function (card) { return categories(card).indexOf(key) !== -1; }).length;
        var badge = filter.querySelector('[data-filter-count]');
        if (badge) badge.textContent = String(count);
      });
    }

    function render() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var matchesFilter = activeFilter === 'all' || categories(card).indexOf(activeFilter) !== -1;
        var matchesQuery = !query || (card.getAttribute('data-tool-search') || '').toLowerCase().indexOf(query) !== -1;
        var show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
      if (summary) summary.textContent = query ? ('找到 ' + visible + ' 個工具') : ('顯示 ' + (activeFilter === 'all' ? '全部' : '此分類') + ' ' + visible + ' 個工具');
    }

    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        activeFilter = filter.getAttribute('data-tool-filter') || 'all';
        filters.forEach(function (item) {
          var selected = item === filter;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-selected', String(selected));
        });
        render();
      });
    });

    cards.forEach(function (card) {
      if (!card.matches('button')) return;
      card.addEventListener('click', function () {
        var targetId = card.getAttribute('data-tool-launch');
        var tab = targetId ? document.querySelector('[data-tab="' + targetId + '"]') : null;
        var panel = targetId ? document.getElementById(targetId) : null;
        if (!tab || !panel) return;
        tab.click();
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(function () { tab.focus({ preventScroll: true }); }, 180);
      });
    });

    if (search) search.addEventListener('input', render);
    document.addEventListener('keydown', function (event) {
      if (event.key === '/' && document.activeElement !== search) {
        event.preventDefault();
        if (search) search.focus();
      }
      if (event.key === 'Escape' && search) {
        search.value = '';
        render();
        search.blur();
      }
    });

    updateCounts();
    render();
  });
}());
