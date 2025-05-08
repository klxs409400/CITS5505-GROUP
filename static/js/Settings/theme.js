/**
 * SleepTracker Theme Handler
 * 这个文件负责处理整个应用程序的主题设置
 * 包括保存用户的主题偏好到 localStorage 和在页面加载时应用主题
 */

// 在页面加载时执行主题初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 localStorage 中获取用户主题偏好
    initTheme();

    // 查找页面上的主题切换开关（如果存在）
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 根据当前主题设置开关状态
        themeToggle.checked = localStorage.getItem('theme') === 'light';
        
        // 添加事件监听器，在开关状态改变时切换主题
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
 * 初始化主题 - 从 localStorage 中读取用户偏好并应用
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // 如果用户有保存的主题偏好，应用它
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    } else {
        // 默认使用暗色主题
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * 设置主题 - 应用主题并保存到 localStorage
 * @param {string} theme - 'light' 或 'dark'
 */
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
}

/**
 * 切换主题 - 在亮色和暗色主题之间切换
 * 可以从任何页面调用此函数
 */
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // 如果页面上有主题开关，更新其状态
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = newTheme === 'light';
    }
    
    return newTheme; // 返回新的主题，方便调用者使用
}