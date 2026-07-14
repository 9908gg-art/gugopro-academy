// Language switcher function
function changeLanguage(lang) {
    localStorage.setItem('user-language', lang);
    
    // Get current pathname (e.g. "/tools/tradingview-guide.html" or "/en/tools/tradingview-guide.html")
    var currentPath = window.location.pathname;
    
    // Supported language directories
    var langs = ['en', 'ja', 'ko', 'es', 'zh-cn', 'vi'];
    
    // Split the path into parts
    var pathParts = currentPath.split('/');
    
    // Remove the language prefix if it exists in the URL
    if (pathParts.length > 1 && langs.includes(pathParts[1])) {
        pathParts.splice(1, 1); // remove the language folder part
    }
    
    // Build the target path
    var targetPath = '';
    if (lang === 'zh-tw') {
        // Redirect to root level
        targetPath = pathParts.join('/');
    } else {
        // Redirect to language subdirectory
        pathParts.splice(1, 0, lang); // insert new language folder at index 1
        targetPath = pathParts.join('/');
    }
    
    // Ensure we don't end up with empty path or double slashes
    if (targetPath === '' || targetPath === '/') {
        targetPath = '/index.html';
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
