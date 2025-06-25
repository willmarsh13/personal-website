function detectColorScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setFavicon() {
    const isDarkMode = detectColorScheme();
    const favicon = document.getElementById('favicon');
    favicon.href = isDarkMode ? '/favicons/favicon_dark.svg' : '/favicons/favicon_light.svg';
}

setFavicon();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setFavicon);