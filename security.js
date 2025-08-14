/*
 * security.js — RPS Flip Site Security Enhancements
 * Author: Andrew Hinkley
 * Version: 1.0.0
 */


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
