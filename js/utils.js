// --- UTILITIES MODULE ---
// Shared utility functions

// Curse function - adds glitch effect to text
export function curse(text, strength = 1) {
    let result = '';
    for (let char of text) {
        if (Math.random() < 0.05 * strength) {
            const glitchChars = '█▓▒░@#$%&*';
            result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
            result += char;
        }
    }
    return result;
}

// Handshake effect - spawns flying alchemy symbols
export function spawnHandshakeEffect() {
    const symbols = ['brimstone', 'pentagram', 'chaos', 'void'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('alchemy-sigil', 'fly-away');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.setProperty('--tw-x', `${(Math.random() - 0.5) * 200}px`);
    svg.style.setProperty('--tw-y', `${(Math.random() - 0.5) * 200}px`);

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${symbol}`);
    svg.appendChild(use);

    document.getElementById('monitor').appendChild(svg);

    setTimeout(() => svg.remove(), 2000);
}

// Lockout checker
export function checkLockout() {
    const lockoutUntil = parseInt(localStorage.getItem('lockoutUntil') || 0);
    if (Date.now() < lockoutUntil) {
        const overlay = document.getElementById('lockout-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const timerInterval = setInterval(() => {
                const diff = lockoutUntil - Date.now();
                if (diff <= 0) {
                    clearInterval(timerInterval);
                    localStorage.removeItem('lockoutUntil');
                    localStorage.removeItem('loginFailures');
                    document.body.classList.remove('theme-yellow', 'theme-orange', 'theme-red');
                    overlay.style.display = 'none';
                    return;
                }
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                const timerEl = document.getElementById('lockout-timer');
                if (timerEl) {
                    timerEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            }, 1000);
        }
    }
}
