// GugoPro Academy shared browser runtime.
(function () {
  'use strict';

  function changeLanguage(lang) {
    localStorage.setItem('user-language', lang);
    var currentPath = window.location.pathname;
    var langs = ['en', 'ja', 'ko', 'es', 'zh-cn', 'vi'];
    var pathParts = currentPath.split('/');
    if (pathParts[pathParts.length - 1] === '') pathParts[pathParts.length - 1] = 'index.html';
    if (pathParts.length > 1 && langs.includes(pathParts[1].toLowerCase())) pathParts.splice(1, 1);
    var targetPath = '';
    if (lang === 'zh-tw') targetPath = pathParts.join('/');
    else { pathParts.splice(1, 0, lang); targetPath = pathParts.join('/'); }
    if (!targetPath || targetPath === '/') targetPath = lang === 'zh-tw' ? '/index.html' : '/' + lang + '/index.html';
    window.location.href = targetPath;
  }
  window.changeLanguage = changeLanguage;

  function initDropdowns() {
    var langBtn = document.querySelector('.lang-btn');
    var langSelector = document.querySelector('.lang-selector');
    var mobileToggle = document.querySelector('.mobile-nav-toggle');
    var primaryNav = document.querySelector('.primary-nav');
    if (langBtn && langSelector) {
      langBtn.addEventListener('click', function (event) {
        event.preventDefault(); event.stopPropagation();
        langSelector.classList.toggle('show-dropdown');
      });
    }
    document.querySelectorAll('.lang-dropdown a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault(); event.stopPropagation();
        var match = (this.getAttribute('onclick') || '').match(/changeLanguage\(['"]([^'"]+)['"]\)/);
        if (match) changeLanguage(match[1]);
      });
    });
    if (mobileToggle && primaryNav) {
      mobileToggle.addEventListener('click', function () {
        var open = primaryNav.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', String(open));
      });
    }
    document.addEventListener('click', function (event) {
      if (langSelector && !langSelector.contains(event.target)) langSelector.classList.remove('show-dropdown');
    });
  }

  function initKnowledgeTree() {
    var grid = document.getElementById('knowledge-grid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.knowledge-card'));
    var empty = document.getElementById('knowledge-empty');
    var search = document.getElementById('knowledge-search');
    var activeFilter = 'all';
    function render() {
      var query = (search ? search.value : '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
        var matchesSearch = !query || (card.dataset.search || '').toLowerCase().includes(query);
        var show = matchesFilter && matchesSearch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    var chips = Array.prototype.slice.call(document.querySelectorAll('#knowledge-tree .filter-chip'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
        chip.classList.add('is-active'); chip.setAttribute('aria-selected', 'true'); activeFilter = chip.dataset.filter || 'all'; render();
      });
    });
    if (search) search.addEventListener('input', render);
    document.addEventListener('keydown', function (event) {
      if (event.key === '/' && document.activeElement !== search) { event.preventDefault(); if (search) search.focus(); }
      if (event.key === 'Escape' && search) { search.value = ''; render(); search.blur(); }
    });
    render();
  }

  function initSiteConfig() {
    fetch('/config.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('config unavailable');
      return response.json();
    }).then(function (config) {
      if (!config.kofi_url) return;
      document.querySelectorAll('[data-kofi-link]').forEach(function (link) { link.href = config.kofi_url; });
    }).catch(function () { /* Static fallback remains the Ko-fi landing page. */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDropdowns();
    initKnowledgeTree();
    initSiteConfig();
    document.querySelectorAll('.sidebar-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-menu a').forEach(function (item) { item.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  });
})();
