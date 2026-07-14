// Language switcher function
function changeLanguage(lang) {
    localStorage.setItem('user-language', lang);
    
    // Determine target URL path based on current path and selected language
    var currentPath = window.location.pathname;
    
    // Normalize path to get the filename
    var filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (filename === '' || filename === '/' || filename.indexOf('.') === -1) {
        filename = 'index.html';
    }
    
    // Supported language directories
    var langs = ['en', 'ja', 'ko', 'es', 'zh-cn', 'vi'];
    
    // Build the target path
    var targetPath = '';
    if (lang === 'zh-tw') {
        // Redirect to root level
        targetPath = '/' + filename;
    } else {
        // Redirect to language subdirectory
        targetPath = '/' + lang + '/' + filename;
    }
    
    // If running in development with relative paths, handle appropriately
    // For GitHub Pages, it's relative to the repository name or custom domain root
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

    // Close dropdowns on outside click
    document.addEventListener('click', function() {
        if (langSelector) langSelector.classList.remove('show-dropdown');
        if (toolsSelector) toolsSelector.classList.remove('show-dropdown');
    });
});
