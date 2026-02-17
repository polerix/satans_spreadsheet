// --- LOGIN MODULE ---
// Handles login screen functionality

import { initAudio, playTypeSound, playSnickFail } from './audio.js';
import { loadData, SECRETS } from './data-loader.js';
import { spawnHandshakeEffect, checkLockout } from './utils.js';

let dataLoaded = false;
let handshakeBuffer = 100;
let loginUser = 'SINNER';

// Initialize
async function init() {
    dataLoaded = await loadData();
    checkLockout();
    setupEventListeners();
    startHandshakeDecay();
}

// Setup event listeners
function setupEventListeners() {
    const userInput = document.getElementById('userInput');
    const passInput = document.getElementById('passInput');
    const loginBtn = document.getElementById('login-btn');

    if (userInput) {
        userInput.addEventListener('input', () => {
            loginUser = userInput.value.toUpperCase() || 'SINNER';
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    document.addEventListener('keydown', handleKeydown);
}

// Handshake buffer decay
function startHandshakeDecay() {
    setInterval(() => {
        handshakeBuffer = Math.max(handshakeBuffer - 1, 0);
        if (handshakeBuffer <= 0) {
            document.getElementById('handshake-warning')?.classList.add('blink');
        } else {
            document.getElementById('handshake-warning')?.classList.remove('blink');
        }
    }, 100);
}

// Handle keyboard input
function handleKeydown(e) {
    if (!audioCtx) initAudio();

    const userInput = document.getElementById('userInput');
    const passInput = document.getElementById('passInput');

    // Spacebar - maintain handshake
    if (e.code === 'Space' && !e.shiftKey && document.activeElement !== userInput && document.activeElement !== passInput) {
        e.preventDefault();
        handshakeBuffer = Math.min(handshakeBuffer + 20, 100);
        spawnHandshakeEffect();
        playTypeSound(400);
        return;
    }

    playTypeSound();

    // Check lockout
    if (Date.now() < parseInt(localStorage.getItem('lockoutUntil') || 0)) {
        e.preventDefault();
        return;
    }

    // U key - focus username
    if (e.key.toLowerCase() === 'u' && document.activeElement !== userInput && document.activeElement !== passInput) {
        userInput?.focus();
        e.preventDefault();
        return;
    }

    // Enter key
    if (e.key === 'Enter') {
        if (document.activeElement === userInput) {
            passInput?.focus();
            return;
        }
        handleLogin();
    }
}

// Handle login attempt
function handleLogin() {
    if (!dataLoaded) {
        alert('LOADING INFERNAL DATABASE... PLEASE WAIT');
        return;
    }

    const passInput = document.getElementById('passInput');
    const pass = passInput?.value.toUpperCase() || '';
    let success = false;

    const targetUser = SECRETS.users.find(u => u.username === loginUser);
    if (targetUser) {
        if (pass === targetUser.password.toUpperCase()) success = true;
    } else {
        if (pass === SECRETS.defaultPattern.toUpperCase()) success = true;
    }

    if (success) {
        // Redirect to spreadsheet
        window.location.href = 'spreadsheet.html';
    } else {
        if (passInput) passInput.value = '';
        playSnickFail();

        let fails = parseInt(localStorage.getItem('loginFailures') || 0) + 1;
        localStorage.setItem('loginFailures', fails);

        if (fails === 1) {
            document.body.classList.add('theme-yellow');
        } else if (fails === 2) {
            document.body.classList.remove('theme-yellow');
            document.body.classList.add('theme-orange');
        } else if (fails >= 3) {
            document.body.classList.remove('theme-orange');
            document.body.classList.add('theme-red');

            const lockoutTime = Date.now() + 20 * 60 * 1000;
            localStorage.setItem('lockoutUntil', lockoutTime);
            checkLockout();
        }

        const errorMsg = document.getElementById('login-error');
        if (errorMsg) {
            errorMsg.style.display = 'block';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 2000);
        }
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
