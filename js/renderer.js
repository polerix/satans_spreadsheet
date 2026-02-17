// --- RENDERER MODULE ---
// Handles table rendering with virtual scrolling

import { playDataStream } from './audio.js';
import { curse } from './utils.js';
import { currentColumnPage, getCurrentPageData, updatePagination, setFilteredSouls } from './pagination.js';

let isRendering = false;
let handshakeBuffer = 100;
let isConnectionLost = false;
export let selectedRow = 0;
export let selectedCol = 0;
export let isEditMode = false;

export function setSelectedCell(row, col) {
    selectedRow = row;
    selectedCol = col;
}

export function setEditMode(mode) {
    isEditMode = mode;
}

export function getHandshakeBuffer() {
    return handshakeBuffer;
}

export function setHandshakeBuffer(val) {
    handshakeBuffer = val;
}

// Main render function
export async function slowRender(souls, filter = "") {
    if (isRendering) return;
    isRendering = true;
    handshakeBuffer = 50;

    // Headers from the new CSV
    const allHeaders = ["NAME", "SOUL ID", "WRONGDOING", "TASK", "PUNISHMENT", "DIFF", "VIBE", "DURATION", "SUPERVISOR", "BRIBE", "DONE", "VOTE"];

    // Slice headers based on currentColumnPage (0 = 0-6, 1 = 6-12)
    const startCol = currentColumnPage * 6;
    const endCol = startCol + 6;
    const headers = allHeaders.slice(startCol, endCol);

    const thead = document.querySelector('thead');
    if (thead) {
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    }

    const tbody = document.getElementById('sheet-body');
    if (!tbody) {
        isRendering = false;
        return;
    }
    tbody.innerHTML = '';

    // Filter
    let filtered;
    if (filter) {
        filtered = souls.filter(s => s.name.toUpperCase().includes(filter.toUpperCase()));
    } else {
        filtered = souls;
    }

    setFilteredSouls(filtered);
    updatePagination();

    const pageData = getCurrentPageData();

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < pageData.length; r++) {
        const soul = pageData[r];
        const tr = document.createElement('tr');

        const fields = [
            curse(soul.name),
            soul.soulId,
            soul.wrongdoing.substring(0, 30),
            soul.atonement.substring(0, 30),
            soul.punishment,
            soul.difficulty,
            soul.status,
            soul.duration,
            soul.supervisor,
            soul.bribe,
            soul.completion,
            soul.vote
        ];

        const displayFields = fields.slice(startCol, endCol);

        for (let c = 0; c < displayFields.length; c++) {
            const field = displayFields[c];
            const td = document.createElement('td');

            if (r === selectedRow && c === selectedCol) {
                td.classList.add('reverse-cell');
                if (isEditMode) td.classList.add('edit-mode');
            }

            tr.appendChild(td);

            // Render with handshake checks
            const chars = Array.from(String(field));
            let chunk = "";
            for (let char of chars) {
                if (Math.random() < 0.1 && handshakeBuffer <= 0) {
                    isConnectionLost = true;
                    document.getElementById('handshake-warning').style.visibility = 'visible';
                    document.getElementById('modem-text').innerText = "NO CARRIER";
                    await new Promise(res => setTimeout(res, 100));
                }
                isConnectionLost = false;
                document.getElementById('handshake-warning').style.visibility = 'hidden';
                document.getElementById('modem-text').innerText = "RECEIVING";

                chunk += char;
                handshakeBuffer -= 0.1;
            }
            td.textContent = chunk;
            playDataStream();
            await new Promise(res => setTimeout(res, 5));
        }

        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);
    isRendering = false;
    document.getElementById('modem-text').innerText = "IDLE";
}

// Fast render without animation (for better performance)
export function fastRender(souls, filter = "") {
    const allHeaders = ["NAME", "SOUL ID", "WRONGDOING", "TASK", "PUNISHMENT", "DIFF", "VIBE", "DURATION", "SUPERVISOR", "BRIBE", "DONE", "VOTE"];
    const startCol = currentColumnPage * 6;
    const endCol = startCol + 6;
    const headers = allHeaders.slice(startCol, endCol);

    const thead = document.querySelector('thead');
    if (thead) {
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    }

    const tbody = document.getElementById('sheet-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let filtered;
    if (filter) {
        filtered = souls.filter(s => s.name.toUpperCase().includes(filter.toUpperCase()));
    } else {
        filtered = souls;
    }

    setFilteredSouls(filtered);
    updatePagination();

    const pageData = getCurrentPageData();
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < pageData.length; r++) {
        const soul = pageData[r];
        const tr = document.createElement('tr');

        const fields = [
            curse(soul.name),
            soul.soulId,
            soul.wrongdoing.substring(0, 30),
            soul.atonement.substring(0, 30),
            soul.punishment,
            soul.difficulty,
            soul.status,
            soul.duration,
            soul.supervisor,
            soul.bribe,
            soul.completion,
            soul.vote
        ];

        const displayFields = fields.slice(startCol, endCol);

        for (let c = 0; c < displayFields.length; c++) {
            const td = document.createElement('td');

            if (r === selectedRow && c === selectedCol) {
                td.classList.add('reverse-cell');
                if (isEditMode) td.classList.add('edit-mode');
            }

            td.textContent = String(displayFields[c]);
            tr.appendChild(td);
        }

        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);
}
