// --- SPREADSHEET MAIN MODULE ---
// Main entry point for spreadsheet.html

import { initAudio, playTypeSound, playSnickPop, playSnickSuccess, playSnickFail, playSnickLaugh } from './audio.js';
import { loadData, initialSoulsData, QUOTES, RIDDLES, EXISTENTIAL_QUOTES } from './data-loader.js';
import { spawnHandshakeEffect, checkLockout } from './utils.js';
import { nextPage, prevPage, currentColumnPage, nextColumnPage, prevColumnPage, resetColumnPage } from './pagination.js';
import { slowRender, fastRender, selectedRow, selectedCol, setSelectedCell, setEditMode, setHandshakeBuffer } from './renderer.js';

let handshakeBuffer = 100;
let currentRiddle = null;
let pendingBribeAction = false;

// Initialize spreadsheet
async function init() {
    const success = await loadData();
    if (!success) return;

    // Clear login states
    localStorage.removeItem('loginFailures');
    document.body.classList.remove('theme-yellow', 'theme-orange', 'theme-red');

    // Initial render
    await slowRender(initialSoulsData);

    setupEventListeners();
    startHandshakeDecay();
    startClock();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (prevPage()) {
            resetColumnPage();
            fastRender(initialSoulsData);
        }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
        if (nextPage()) {
            resetColumnPage();
            fastRender(initialSoulsData);
        }
    });

    document.addEventListener('keydown', handleKeydown);
}

// Handshake buffer decay
function startHandshakeDecay() {
    setInterval(() => {
        handshakeBuffer = Math.max(handshakeBuffer - 1, 0);
        setHandshakeBuffer(handshakeBuffer);
    }, 100);
}

// Clock
function startClock() {
    setInterval(() => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            clockEl.innerText = `${h}:${m}:${s}`;
        }
    }, 1000);
}

// Handle keyboard input
function handleKeydown(e) {
    if (!audioCtx) initAudio();

    // Spacebar - maintain handshake
    if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault();
        handshakeBuffer = Math.min(handshakeBuffer + 20, 100);
        setHandshakeBuffer(handshakeBuffer);
        spawnHandshakeEffect();
        playTypeSound(400);
        return;
    }

    playTypeSound();

    // Navigation
    if (e.key === 'ArrowUp') {
        if (selectedRow > 0) {
            setSelectedCell(selectedRow - 1, selectedCol);
            fastRender(initialSoulsData);
        }
    }
    if (e.key === 'ArrowDown') {
        if (selectedRow < 14) {
            setSelectedCell(selectedRow + 1, selectedCol);
            fastRender(initialSoulsData);
        }
    }
    if (e.key === 'ArrowLeft') {
        if (selectedCol > 0) {
            setSelectedCell(selectedRow, selectedCol - 1);
            fastRender(initialSoulsData);
        } else {
            if (prevColumnPage()) {
                setSelectedCell(selectedRow, 5);
                fastRender(initialSoulsData);
            } else if (prevPage()) {
                if (currentColumnPage === 0) {
                    // Switch to view B of previous page
                    nextColumnPage();
                }
                setSelectedCell(selectedRow, 5);
                fastRender(initialSoulsData);
            }
        }
    }
    if (e.key === 'ArrowRight') {
        if (selectedCol < 5) {
            setSelectedCell(selectedRow, selectedCol + 1);
            fastRender(initialSoulsData);
        } else {
            if (nextColumnPage()) {
                setSelectedCell(selectedRow, 0);
                fastRender(initialSoulsData);
            } else if (nextPage()) {
                resetColumnPage();
                setSelectedCell(selectedRow, 0);
                fastRender(initialSoulsData);
            }
        }
    }

    // Actions
    if (e.key.toLowerCase() === 's') {
        handleSearch();
    }
    if (e.key.toLowerCase() === 'h') {
        showHelp();
    }
    if (e.key.toLowerCase() === 'u') {
        window.location.href = 'useradministrator.html';
    }
}

// Search functionality
function handleSearch() {
    const query = prompt('SEARCH BY NAME:');
    if (query) {
        slowRender(initialSoulsData, query);
    }
}

// Help dialog
function showHelp() {
    const helpModal = document.getElementById('demotivational-modal');
    const quoteText = document.getElementById('quote-text');
    if (helpModal && quoteText) {
        const randomQuote = EXISTENTIAL_QUOTES[Math.floor(Math.random() * EXISTENTIAL_QUOTES.length)] || "THE VOID STARES BACK";
        quoteText.innerText = randomQuote;
        helpModal.style.display = 'flex';
    }
}

// Close demotivational modal
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'x') {
        const modal = document.getElementById('demotivational-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
});

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
