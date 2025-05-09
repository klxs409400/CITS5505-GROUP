/**
 * SleepTracker Theme Handler
 * This file is responsible for handling theme settings throughout the application
 * Including saving user theme preferences to localStorage and applying the theme on page load
 */

// Execute theme initialization when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get user theme preference from localStorage
    initTheme();

    // Find the theme toggle switch on the page (if it exists)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Set the switch state based on current theme
        themeToggle.checked = localStorage.getItem('theme') === 'light';
        
        // Add event listener to switch theme when toggle state changes
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }
});

/**
 * Initialize theme - Read user preferences from localStorage and apply
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // If user has a saved theme preference, apply it
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    } else {
        // Use dark theme as default
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Set theme - Apply theme and save to localStorage
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
}

/**
 * Toggle theme - Switch between light and dark themes
 * This function can be called from any page
 */
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // If there's a theme toggle on the page, update its state
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = newTheme === 'light';
    }
    
    return newTheme; // Return the new theme for convenience
}