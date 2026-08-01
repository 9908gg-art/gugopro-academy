// Language switcher function
function changeLanguage(lang) {
    localStorage.setItem('user-language', lang);
    
    // Get current pathname (e.g. "/tools/tradingview-guide.html" or "/ja/tools/tradingview-guide.html")
    var currentPath = window.location.pathname;
    
    // Supported language directories
    var langs = ['en', 'ja', 'ko', 'es', 'zh-cn', 'vi'];
    
    // Split the path into parts
    var pathParts = currentPath.split('/');
    
    // Normalize empty last part (e.g. /ja/ or /tools/ -> index.html)
    if (pathParts[pathParts.length - 1] === '') {
        pathParts[pathParts.length - 1] = 'index.html';
    }
    
    // Remove current language directory prefix if present in URL
    if (pathParts.length > 1 && langs.includes(pathParts[1].toLowerCase())) {
        pathParts.splice(1, 1);
    }
    
    // Build target path
    var targetPath = '';
    if (lang === 'zh-tw') {
        // Traditional Chinese is located at root level
        targetPath = pathParts.join('/');
    } else {
        // Insert target language folder at index 1
        pathParts.splice(1, 0, lang);
        targetPath = pathParts.join('/');
    }
    
    // Fallback if target path is empty or single slash
    if (!targetPath || targetPath === '/') {
        targetPath = lang === 'zh-tw' ? '/index.html' : '/' + lang + '/index.html';
    }
    
    window.location.href = targetPath;
}

// Sidebar Active Link Tracker & Dropdown Toggle for Mobile/Click
document.addEventListener('DOMContentLoaded', function() {
    // 1. Sidebar Tracker
    var sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    if (sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // 2. Dropdown Toggles (Click Support for Mobile / Safe Hover)
    var langBtn = document.querySelector('.lang-btn');
    var langSelector = document.querySelector('.lang-selector');
    var toolsBtn = document.querySelector('.tools-btn');
    var toolsSelector = document.querySelector('.tools-selector');

    if (langBtn && langSelector) {
        langBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (toolsSelector) toolsSelector.classList.remove('show-dropdown');
            langSelector.classList.toggle('show-dropdown');
        });
    }

    if (toolsBtn && toolsSelector) {
        toolsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (langSelector) langSelector.classList.remove('show-dropdown');
            toolsSelector.classList.toggle('show-dropdown');
        });
    }

    // Intercept language clicks to prevent '#' hash navigation from closing dropdown early
    var langLinks = document.querySelectorAll('.lang-dropdown a');
    langLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                // Extract language code, e.g. "changeLanguage('en')" -> "en"
                var match = onclickAttr.match(/changeLanguage\(['"]([^'"]+)['"]\)/);
                if (match && match[1]) {
                    changeLanguage(match[1]);
                }
            }
        });
    });

    // Close dropdowns only on outside click to prevent browser from aborting navigation
    document.addEventListener('click', function(e) {
        if (langSelector && !langSelector.contains(e.target)) {
            langSelector.classList.remove('show-dropdown');
        }
        if (toolsSelector && !toolsSelector.contains(e.target)) {
            toolsSelector.classList.remove('show-dropdown');
        }
    });
});
