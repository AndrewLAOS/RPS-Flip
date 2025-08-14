/*
 * security.js — RPS Flip Site Security Enhancements
 * Author: Andrew Hinkley
 * Version: 1.0.0
 */

// 1️⃣ Inject Content Security Policy
(function() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
        default-src 'self';
        script-src 'self' https://cdnjs.cloudflare.com;
        style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data:;
        connect-src 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim();
    document.head.appendChild(meta);
})();

// 2️⃣ Block right-click & key shortcuts
(function() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && (e.key.toLowerCase() === 'u')) e.preventDefault(); // View Source
        if (e.keyCode === 123) e.preventDefault(); // F12
    });
})();

// 3️⃣ Force HTTPS
(function() {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }
})();

// 4️⃣ Protect external links
(function() {
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.setAttribute('rel', 'noopener noreferrer');
        });
    });
})();

// 5️⃣ Sanitize input helper
function sanitizeInput(input) {
    return input.replace(/[^a-zA-Z0-9 _-]/g, "");
}

// 6️⃣ Cache busting helper
function cacheBust(url) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${Date.now()}`;
}

// Optional: example usage
// let playerName = sanitizeInput(prompt("Enter your name:"));
// document.getElementById("myStylesheet").href = cacheBust("style.css");
