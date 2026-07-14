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

// Sidebar Active Link Tracker
document.addEventListener('DOMContentLoaded', function() {
    var sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    if (sidebarLinks.length > 0) {
        // Handle scroll spy or active link tracking
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});
