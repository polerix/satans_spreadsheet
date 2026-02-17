// --- GLOBAL DATA ---
let NAMES = [];
let PUNISHMENTS = [];
let DURATIONS = [];
let ATONEMENTS = [];
let VIBES = [];
let QUOTES = [];
let RIDDLES = [];
let EXISTENTIAL_QUOTES = [];
let SECRETS = { users: [], defaultPattern: "666" };
let initialSoulsData = [];

// --- HANDSHAKE & AUDIO GLOBALS ---
let handshakeBuffer = 100;
let isConnectionLost = false;
let audioCtx = null;
let pendingBribeAction = false;
let currentRiddle = null;

// --- PAGINATION GLOBALS ---
let currentPage = 1;
const rowsPerPage = 15;
let totalPages = 1;
let filteredSouls = []; // Store filtered results for pagination
let currentColumnPage = 0; // 0 = First 6 cols (A), 1 = Next 6 cols (B)


// Initialize Audio Context
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Audio Functions
function playTypeSound(freq = 800) {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playDataStream() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = Math.random() * 200 + 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.02);
}

function playSnickPop() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playSnickSuccess() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function playSnickFail() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function playSnickLaugh() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// Curse function
function curse(text, strength = 1) {
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

// Handshake effect
function spawnHandshakeEffect() {
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

// --- FETCH DATA ---
let dataLoaded = false;

Promise.all([
    fetch('riddles.json').then(r => r.json()),
    fetch('LEDGER_VOID_FINAL.csv').then(r => r.text()),
    fetch('secret.json').then(r => r.json()),
    fetch('existentialquotes.json').then(r => r.json())
]).then(([riddles, csv, secrets, quotesData]) => {
    // 1. Riddles & Content
    // 1. Riddles & Content
    QUOTES = quotesData.quotes || [];
    RIDDLES = riddles.riddles || [];
    EXISTENTIAL_QUOTES = quotesData.existential_quotes || [];

    // 2. CSV Data
    // 2. CSV Data (LEDGER_VOID_FINAL.csv)
    // Expected Headers: NAME, SOUL ID, Wrongdoing, Atonement Task, Punishment, Difficulty, VIBE, Duration, Supervisor, BRIBE, Completion Check, Vote
    const lines = csv.trim().split('\n');
    // Line 1 is empty or headers? The file view shows line 1 as empty commas.
    // Line 2 has headers: NAME,SOUL ID, ...

    // We will start parsing from line 3 (index 2)
    for (let i = 2; i < lines.length; i++) {
        if (!lines[i].trim() || lines[i].startsWith(',,,')) continue;

        const row = parseCSVLine(lines[i]);
        if (row.length >= 5) {
            initialSoulsData.push({
                name: row[0] || "UNKNOWN",
                soulId: row[1] || "N/A",
                wrongdoing: row[2] || "N/A",
                atonement: row[3] || "N/A",
                punishment: row[4] || "N/A",
                difficulty: row[5] || "N/A",
                status: row[6] || "ROTTING",
                duration: row[7] || "ETERNAL",
                supervisor: row[8] || "N/A",
                bribe: row[9] || "FALSE",
                completion: row[10] || "FALSE",
                vote: row[11] || "0"
            });
        }
    }

    // Extract unique values for generators
    if (initialSoulsData.length > 0) {
        NAMES = [...new Set(initialSoulsData.map(s => s.name))];
        PUNISHMENTS = [...new Set(initialSoulsData.map(s => s.punishment))];
        DURATIONS = [...new Set(initialSoulsData.map(s => s.duration))];
        ATONEMENTS = [...new Set(initialSoulsData.map(s => s.atonement))];
        VIBES = [...new Set(initialSoulsData.map(s => s.status))];
    }


    // 3. Secrets
    SECRETS = secrets;

    dataLoaded = true;
    console.log("Hell loaded successfully.");
    console.log("Loaded souls:", initialSoulsData.length);
    console.log("Loaded riddles:", RIDDLES.length);

    checkLockout();
}).catch(err => {
    console.error("Failed to load resources:", err);
    alert("ERROR: Failed to load infernal database. Check console.");
});

function parseCSVLine(text) {
    let result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c === '"') {
            inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur.trim());
    return result;
}

function checkLockout() {
    const lockoutUntil = parseInt(localStorage.getItem('lockoutUntil') || 0);
    if (Date.now() < lockoutUntil) {
        document.getElementById('lockout-overlay').style.display = 'flex';
        const timerInterval = setInterval(() => {
            const diff = lockoutUntil - Date.now();
            if (diff <= 0) {
                clearInterval(timerInterval);
                localStorage.removeItem('lockoutUntil');
                localStorage.removeItem('loginFailures');
                document.body.classList.remove('theme-yellow', 'theme-orange', 'theme-red');
                document.getElementById('lockout-overlay').style.display = 'none';
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            document.getElementById('lockout-timer').innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

let souls = [];
let selectedRow = 0;
let selectedCol = 0;
let isEditMode = false;
let currentMode = document.getElementById('login-screen') ? 'login' : 'sheet';
let loginUser = 'SINNER';

// Auto-init if on spreadsheet page
if (currentMode === 'sheet') {
    window.addEventListener('DOMContentLoaded', () => {
        initData();
        localStorage.removeItem('loginFailures');
        document.body.classList.remove('theme-yellow', 'theme-orange', 'theme-red');
    });
}
let isRendering = false;

// --- PAGINATION CONTROL ---
function updatePagination() {
    totalPages = Math.ceil(filteredSouls.length / rowsPerPage) || 1;
    const pageIndicator = document.getElementById('page-indicator');
    if (pageIndicator) {
        const subPage = currentColumnPage === 0 ? 'A' : 'B';
        pageIndicator.innerText = `PAGE ${currentPage}-${subPage} OF ${totalPages}`;
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        selectedRow = 0; // Reset selection on page change
        slowRender(document.getElementById('modal-input')?.value || ""); // Re-render with existing filter if any? 
        // Actually slowRender takes a filter arg, but usually we filter global souls. 
        // Let's rely on slowRender using 'souls' and local processing
        slowRender();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        selectedRow = 0;
        slowRender();
    }
}

// --- RENDERER ---
async function slowRender(filter = "") {
    if (isRendering) return;
    isRendering = true;
    handshakeBuffer = 50;

    // Headers from the new CSV
    const allHeaders = ["NAME", "SOUL ID", "WRONGDOING", "TASK", "PUNISHMENT", "DIFF", "VIBE", "DURATION", "SUPERVISOR", "BRIBE", "DONE", "VOTE"];

    // Slice headers based on currentColumnPage (0 = 0-6, 1 = 6-12)
    // Actually user requested 6 columns. 12 / 2 = 6.
    const startCol = currentColumnPage * 6;
    const endCol = startCol + 6;
    const headers = allHeaders.slice(startCol, endCol);

    const thead = document.querySelector('thead');
    if (thead) {
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    }

    const tbody = document.getElementById('sheet-body');
    tbody.innerHTML = '';

    // Filter first
    if (filter) {
        filteredSouls = souls.filter(s => s.name.toUpperCase().includes(filter.toUpperCase()));
        // Reset to page 1 on new filter
        if (currentPage !== 1) currentPage = 1;
    } else {
        filteredSouls = souls; // or keep existing filteredSouls if we want to maintain state? 
        // For simplicity, if no filter arg is passed, we assume we are just re-rendering current state.
        // But the initData calls slowRender() without args.
    }

    updatePagination();

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const pageData = filteredSouls.slice(startIdx, endIdx);

    for (let r = 0; r < pageData.length; r++) {
        const soul = pageData[r];
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        // Map to headers: NAME, SOUL ID, WRONGDOING, TASK, PUNISHMENT, DIFF, VIBE, DURATION, SUPERVISOR, BRIBE, DONE, VOTE
        const fields = [
            curse(soul.name),
            soul.soulId,
            soul.wrongdoing.substring(0, 30), // Truncate
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

            // selectedCol is 0-5. We need to match it to c.
            if (currentMode === 'sheet' && r === selectedRow && c === selectedCol) {
                td.classList.add('reverse-cell');
                if (isEditMode) td.classList.add('edit-mode');
            }

            tr.appendChild(td);
            const chars = Array.from(String(field)); // Ensure string

            // Speed up rendering slightly for large tables
            let chunk = "";
            for (let char of chars) {
                // Check handshake less frequently
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
            await new Promise(res => setTimeout(res, 5)); // Faster render
        }
    }
    isRendering = false;
    document.getElementById('modem-text').innerText = "IDLE";
}

// CSV Export Function
function saveToCSV() {
    const headers = "SOUL ID,PUNISHMENT,ETA,ATONEMENT,VIBE\n";
    const rows = souls.map(s => `${s.name},${s.punishment},${s.duration},${s.atonement},${s.status}`).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'damned.csv';
    a.click();
    URL.revokeObjectURL(url);

    playSnickSuccess();
    alert('CSV EXPORTED TO DOWNLOADS');
}

// --- CONTROLS ---
document.addEventListener('keydown', (e) => {
    if (!audioCtx) initAudio();

    if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault();
        handshakeBuffer = Math.min(handshakeBuffer + 20, 100);
        spawnHandshakeEffect();
        playTypeSound(400);
        return;
    }

    if (isRendering && currentMode !== 'login') return;
    playTypeSound();

    if (Date.now() < parseInt(localStorage.getItem('lockoutUntil') || 0)) {
        e.preventDefault();
        return;
    }

    if (currentMode === 'login') {
        const userSpan = document.getElementById('login-user');
        const userInput = document.getElementById('userInput');
        const passInput = document.getElementById('passInput');

        userInput.addEventListener('input', () => {
            loginUser = userInput.value.toUpperCase() || 'SINNER';
            userSpan.innerText = loginUser;
            userSpan.classList.add('reversed');
        });

        if (e.key.toLowerCase() === 'u' && document.activeElement !== userInput && document.activeElement !== passInput) {
            userInput.focus();
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            if (document.activeElement === userInput) {
                passInput.focus();
                return;
            }

            if (!dataLoaded) {
                alert('LOADING INFERNAL DATABASE... PLEASE WAIT');
                return;
            }

            const pass = passInput.value.toUpperCase();
            let success = false;

            const targetUser = SECRETS.users.find(u => u.username === loginUser);
            if (targetUser) {
                if (pass === targetUser.password.toUpperCase()) success = true;
            } else {
                if (pass === SECRETS.defaultPattern.toUpperCase()) success = true;
            }

            if (success) {
                // Redirect to spreadsheet.html instead of SPA toggle
                window.location.href = 'spreadsheet.html';
            } else {
                passInput.value = '';
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
            }
        }
    }
    else if (currentMode === 'sheet') {
        // souls is all souls, but we need page data for row selection
        const startIdx = (currentPage - 1) * rowsPerPage;
        const endIdx = startIdx + rowsPerPage;
        const pageData = filteredSouls.slice(startIdx, endIdx);

        const soul = pageData[selectedRow]; // selectedRow calls are now relative to PAGE

        if (isEditMode) {
            if (e.key === 'x' || e.key === 'X') {
                isEditMode = false;
                slowRender();
                return;
            }

            if (selectedCol === 3) { // Punishment is now index 3 in fields
                // ... editing logic ...
                // implementation of edit logic on paginated data
                // For now, let's just make it simple/disable complex edit or fix indices
                let idx = PUNISHMENTS.indexOf(soul.punishment);
                if (e.key === 'ArrowDown') idx = (idx + 1) % PUNISHMENTS.length;
                if (e.key === 'ArrowUp') idx = (idx - 1 + PUNISHMENTS.length) % PUNISHMENTS.length;
                soul.punishment = PUNISHMENTS[idx];

                const cell = document.getElementById('sheet-body').children[selectedRow].children[3];
                cell.innerText = soul.punishment;
            }
        } else {
            if (e.key === 'ArrowDown') {
                if (selectedRow < pageData.length - 1) {
                    selectedRow++;
                    slowRender();
                } else {
                    nextPage();
                }
            }
            if (e.key === 'ArrowUp') {
                if (selectedRow > 0) {
                    selectedRow--;
                    slowRender();
                } else {
                    prevPage();
                    selectedRow = rowsPerPage - 1; // Go to bottom of prev page
                    slowRender();
                }
            }
            if (e.key === 'ArrowLeft') {
                if (selectedCol > 0) {
                    selectedCol--;
                    slowRender();
                } else {
                    // Navigate to previous column page
                    if (currentColumnPage === 1) {
                        currentColumnPage = 0;
                        selectedCol = 5;
                        slowRender();
                    } else {
                        if (currentPage > 1) {
                            prevPage();
                            currentColumnPage = 1;
                            selectedCol = 5;
                            slowRender();
                        }
                    }
                }
            }
            if (e.key === 'ArrowRight') {
                if (selectedCol < 5) { // 6 columns displayed, index 0-5
                    selectedCol++;
                    slowRender();
                } else {
                    // Navigate to next column page
                    if (currentColumnPage === 0) {
                        currentColumnPage = 1;
                        selectedCol = 0;
                        slowRender();
                    } else {
                        if (currentPage < totalPages) {
                            nextPage();
                            currentColumnPage = 0;
                            selectedCol = 0;
                            slowRender();
                        }
                    }
                }
            }

            if (e.key === 'x' || e.key === 'X') {
                isEditMode = true;
                slowRender();
            }

            if (e.key.toLowerCase() === 'b') {
                pendingBribeAction = true;
                triggerSnick('bribe');
            }
            if (e.key.toLowerCase() === 'a') openModal("ADD NEW DAMNED:");
            if (e.key.toLowerCase() === 's' && !e.shiftKey) openModal("SEARCH DATABASE:");
            if (e.key.toLowerCase() === 'i') initData();
            if (e.key.toLowerCase() === 'h') triggerSnick('help');
            if (e.key === 'S' && e.shiftKey) saveToCSV();
            if (e.key === 'Escape') location.reload();
        }
    }
    else if (currentMode === 'modal') {
        if (e.key === 'Enter') {
            const val = document.getElementById('modal-input').value;
            if (document.getElementById('modal-label').innerText.includes("ADD")) {
                souls.push({
                    name: val.toUpperCase(),
                    punishment: PUNISHMENTS[0],
                    duration: DURATIONS[0],
                    atonement: ATONEMENTS[0],
                    status: "ROTTING"
                });
            }
            closeModal();
            slowRender(val.length > 0 && !document.getElementById('modal-label').innerText.includes("ADD") ? val : "");
        }
        if (e.key === 'Escape') closeModal();
    }
    else if (currentMode === 'demotivational') {
        if (e.key.toLowerCase() === 'x') {
            document.getElementById('demotivational-modal').style.display = 'none';
            currentMode = 'sheet';
        }
    }
});

function initData() {
    if (initialSoulsData.length > 0) {
        souls = JSON.parse(JSON.stringify(initialSoulsData));
    } else {
        souls = NAMES.map(name => ({
            name: name,
            punishment: PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)],
            duration: DURATIONS[Math.floor(Math.random() * DURATIONS.length)],
            atonement: ATONEMENTS[Math.floor(Math.random() * ATONEMENTS.length)],
            status: VIBES[Math.floor(Math.random() * VIBES.length)]
        }));
    }

    slowRender();

    setInterval(() => {
        if (currentMode === 'sheet' && souls.length > 0 && VIBES.length > 0) {
            const r = Math.floor(Math.random() * souls.length);
            souls[r].status = VIBES[Math.floor(Math.random() * VIBES.length)];
            if (!isRendering) {
                const tbody = document.getElementById('sheet-body');
                if (tbody && tbody.children[r] && tbody.children[r].children[4]) {
                    tbody.children[r].children[4].innerText = souls[r].status;
                    playDataStream();
                }
            }
        }
    }, 2000);

    setInterval(() => {
        if (currentMode === 'sheet' && !isRendering && Math.random() > 0.8 && QUOTES.length > 0) {
            document.getElementById('quote-text').innerText = curse(QUOTES[Math.floor(Math.random() * QUOTES.length)], 2);
            document.getElementById('demotivational-modal').style.display = 'block';
            currentMode = 'demotivational';
        }
    }, 12000);
}

function openModal(text) {
    currentMode = 'modal';
    document.getElementById('modal-label').innerText = text;
    document.getElementById('input-modal').style.display = 'block';
    document.getElementById('modal-input').value = '';
    document.getElementById('modal-input').focus();
}

function closeModal() {
    currentMode = 'sheet';
    document.getElementById('input-modal').style.display = 'none';
}

setInterval(() => {
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) mainTitle.innerText = curse("SATAN'S SPREADSHEETS", 1);

    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        clock.innerText = `06:66:${now.getSeconds().toString().padStart(2, '0')}`;
    }
}, 1000);

// --- SNICK THE ASSISTANT ---
let snickActive = false;
let cursedFontActive = false;
let currentSnickScenario = null;

const SNICK_SCENARIOS = ['bribe', 'goosechase', 'laugh', 'time'];
const SNICK_IMGS = {
    'bribe': 'images/snick_bribe.png',
    'goosechase': 'images/snick_goosechase.png',
    'laugh': 'images/snick_laugh.png',
    'time': 'images/snick_time.png',
    'help': 'images/snick_laugh.png'
};

function triggerSnick(forceScenario = null) {
    if (snickActive || (currentMode !== 'sheet' && !forceScenario)) return;
    snickActive = true;
    currentSnickScenario = forceScenario || SNICK_SCENARIOS[Math.floor(Math.random() * SNICK_SCENARIOS.length)];
    playSnickPop();

    document.getElementById('snick-modal').style.display = 'flex';
    document.getElementById('snick-img').src = SNICK_IMGS[currentSnickScenario];
    document.getElementById('snick-input').value = '';
    document.getElementById('snick-input').style.display = 'none';
    document.getElementById('snick-submit-btn').style.display = 'none';
    document.getElementById('snick-buttons').style.display = 'none';
    document.getElementById('snick-help-buttons').style.display = 'none';

    if (currentSnickScenario === 'bribe') {
        document.getElementById('snick-dialog').innerText = "Looks like you're having connection issues! Want to bribe me to fix it?";
        document.getElementById('snick-buttons').style.display = 'block';
    } else if (currentSnickScenario === 'goosechase') {
        currentRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
        document.getElementById('snick-dialog').innerText = "I can fix this... IF you answer my riddle! " + currentRiddle.q;
        document.getElementById('snick-input').style.display = 'block';
        document.getElementById('snick-submit-btn').style.display = 'block';
        document.getElementById('snick-input').focus();
    } else if (currentSnickScenario === 'laugh') {
        document.getElementById('snick-dialog').innerText = "Hahaha! Your suffering is data to us!";
        playSnickLaugh();
        setTimeout(closeSnick, 3000);
    } else if (currentSnickScenario === 'time') {
        document.getElementById('snick-dialog').innerText = "QUICK! What time is it (seconds only)? Be within 3 seconds!";
        document.getElementById('snick-input').style.display = 'block';
        document.getElementById('snick-submit-btn').style.display = 'block';
        document.getElementById('snick-input').focus();
    } else if (currentSnickScenario === 'help') {
        const quote = EXISTENTIAL_QUOTES.length > 0
            ? EXISTENTIAL_QUOTES[Math.floor(Math.random() * EXISTENTIAL_QUOTES.length)]
            : "ERROR: EXISTENTIAL CRISIS NOT FOUND";
        document.getElementById('snick-dialog').innerText = quote;
        document.getElementById('snick-help-buttons').style.display = 'block';
    }
}

function handleSnickAnswer() {
    const val = document.getElementById('snick-input').value.trim().toLowerCase();

    if (currentSnickScenario === 'goosechase' || (currentSnickScenario === 'bribe' && document.getElementById('snick-input').style.display !== 'none')) {
        if (currentRiddle && currentRiddle.a.includes(val)) {
            resolveConnection();
            alertSnick("Fine. Connection restored.", true);
            playSnickSuccess();

            if (pendingBribeAction) {
                const bribe = souls.splice(selectedRow, 1)[0];
                bribe.status = curse("VIP");
                souls.unshift(bribe);
                selectedRow = 0;
                slowRender();
                pendingBribeAction = false;
            }
        } else {
            applyCurse();
            alertSnick("WRONG! Enjoy the curse.", true);
            playSnickFail();
            pendingBribeAction = false;
        }
    } else if (currentSnickScenario === 'time') {
        const seconds = new Date().getSeconds();
        const inputSec = parseInt(val);
        if (!isNaN(inputSec) && Math.abs(inputSec - seconds) <= 3) {
            resolveConnection();
            alertSnick("Acceptable.", true);
            playSnickSuccess();
        } else {
            applyRGBCycle();
            alertSnick("TOO SLOW! BURN IN RGB!", true);
            playSnickFail();
        }
    }
}

function alertSnick(msg, autoClose) {
    document.getElementById('snick-dialog').innerText = msg;
    document.getElementById('snick-input').style.display = 'none';
    document.getElementById('snick-submit-btn').style.display = 'none';
    document.getElementById('snick-buttons').style.display = 'none';
    if (autoClose) setTimeout(closeSnick, 2000);
}

function closeSnick() {
    document.getElementById('snick-modal').style.display = 'none';
    snickActive = false;
    currentSnickScenario = null;
    pendingBribeAction = false;
}

function resolveConnection() {
    handshakeBuffer = 100;
    document.getElementById('handshake-warning').style.visibility = 'hidden';
}

function applyCurse() {
    cursedFontActive = true;
    document.body.classList.add('cursed-font');
}

function applyRGBCycle() {
    document.body.classList.add('rgb-cycle');
    setTimeout(() => {
        document.body.classList.remove('rgb-cycle');
    }, 20000);
}

document.getElementById('snick-submit-btn').addEventListener('click', handleSnickAnswer);
document.getElementById('snick-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSnickAnswer();
});

document.getElementById('snick-yes-btn').addEventListener('click', () => {
    currentSnickScenario = 'goosechase';
    currentRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    document.getElementById('snick-dialog').innerText = "Excellent. Solve this: " + currentRiddle.q;
    document.getElementById('snick-buttons').style.display = 'none';
    document.getElementById('snick-input').style.display = 'block';
    document.getElementById('snick-submit-btn').style.display = 'block';
    document.getElementById('snick-input').focus();
});

document.getElementById('snick-no-btn').addEventListener('click', () => {
    applyCurse();
    alertSnick("Big mistake. Have a curse.", true);
});

document.getElementById('snick-abort-btn').addEventListener('click', () => {
    location.reload();
});

document.getElementById('snick-retry-btn').addEventListener('click', () => {
    const quote = EXISTENTIAL_QUOTES.length > 0
        ? EXISTENTIAL_QUOTES[Math.floor(Math.random() * EXISTENTIAL_QUOTES.length)]
        : "ERROR: EXISTENTIAL CRISIS NOT FOUND";
    document.getElementById('snick-dialog').innerText = quote;
});

document.getElementById('snick-resume-btn').addEventListener('click', closeSnick);

// Event Listeners for Pagination
document.getElementById('prev-btn')?.addEventListener('click', () => {
    prevPage();
    playTypeSound();
});
document.getElementById('next-btn')?.addEventListener('click', () => {
    nextPage();
    playTypeSound();
});

setInterval(() => {
    if (Math.random() > 0.95 && !snickActive && currentMode === 'sheet') {
        triggerSnick();
    }
}, 15000);
