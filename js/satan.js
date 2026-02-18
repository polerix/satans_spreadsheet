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
let handshakeGracePeriod = true; // Prevent drops for first minute
let briberTokens = 0;            // Bribe tokens (tracked beyond 5, display capped at 5)
let pendingSoulReward = false;   // True when a soul was added but user hasn't reached last page yet
let startupSnickInterval = null; // Interval to re-trigger Snick during grace period

// End grace period after 60s, then resume normal handshake decay
setTimeout(() => {
    handshakeGracePeriod = false;
    if (startupSnickInterval) {
        clearInterval(startupSnickInterval);
        startupSnickInterval = null;
    }
}, 60000);

// --- PAGINATION GLOBALS ---
let currentPage = 1;
const rowsPerPage = 15;
let totalPages = 1;
let filteredSouls = []; // Store filtered results for pagination
let currentColumnPage = 0; // 0 = First 6 cols (A), 1 = Next 6 cols (B)

// --- ROLE \u0026 PERMISSIONS ---
let currentUser = {
    username: 'SINNER',
    isAdmin: false
};

// Field edit permissions configuration
const FIELD_CONFIG = {
    'name': { editable: false, reason: 'Soul identity is permanent' },
    'soulId': { editable: false, reason: 'Soul ID is permanent' },
    'wrongdoing': { editable: true, adminOnly: true, userCanAdd: true },
    'atonement': { editable: true, adminOnly: true, userCanAdd: true },
    'punishment': { editable: true, adminOnly: true, userCanAdd: true },
    'difficulty': { editable: true, adminOnly: true, userCanAdd: true },
    'duration': { editable: true, adminOnly: true, userCanAdd: true },
    'supervisor': { editable: true, adminOnly: true, userCanAdd: true },
    'bribe': { editable: true, adminOnly: false, viaSnick: true },
    'status': { editable: false, calculated: true, reason: 'VIBE is calculated' },
    'completion': { editable: true, adminOnly: true, calculated: true },
    'vote': { editable: false, calculated: true, reason: 'Vote is automatic' }
};

function canEditField(fieldName, isNewEntry = false) {
    const config = FIELD_CONFIG[fieldName];
    if (!config) return false;
    if (!config.editable) return false;
    if (config.viaSnick) return false; // BRIBE only via Snick
    if (isNewEntry && config.userCanAdd) return true;
    return config.adminOnly ? currentUser.isAdmin : true;
}

// Map column index to field name (columns displayed depend on currentColumnPage)
function getFieldNameFromColumn(colIndex) {
    // All fields: NAME, SOUL ID, WRONGDOING, TASK, PUNISHMENT, DIFF, VIBE, DURATION, SUPERVISOR, BRIBE, DONE, VOTE
    const allFields = ['name', 'soulId', 'wrongdoing', 'atonement', 'punishment', 'difficulty', 'status', 'duration', 'supervisor', 'bribe', 'completion', 'vote'];
    const startCol = currentColumnPage * 6;
    const actualIndex = startCol + colIndex;
    return allFields[actualIndex] || null;
}



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
    fetch('json/riddles.json').then(r => r.json()),
    fetch('data/damned.csv').then(r => r.text()),
    fetch('data/LEDGER_VOID_FINAL.csv').then(r => r.text()),
    fetch('json/secret.json').then(r => r.json()),
    fetch('json/existentialquotes.json').then(r => r.json())
]).then(([riddles, damnedCSV, ledgerCSV, secrets, quotesData]) => {
    // 1. Riddles & Content
    QUOTES = quotesData.quotes || [];
    RIDDLES = riddles.riddles || [];
    EXISTENTIAL_QUOTES = quotesData.existential_quotes || [];

    // 2. Parse damned.csv (NAME, SOUL ID)
    const damnedLines = damnedCSV.trim().split('\n');
    const damnedSouls = [];

    // Skip header (line 1 empty, line 2 has headers)
    for (let i = 2; i < damnedLines.length; i++) {
        if (!damnedLines[i].trim()) continue;
        const row = parseCSVLine(damnedLines[i]);
        if (row.length >= 2 && row[1]) {  // Must have SOUL ID
            damnedSouls.push({
                name: row[0] || "UNKNOWN",
                soulId: row[1]
            });
        }
    }

    // 3. Parse LEDGER_VOID_FINAL.csv (SOUL ID, Wrongdoing, Atonement, ...)
    const ledgerLines = ledgerCSV.trim().split('\n');
    const ledgerEntries = [];

    // Skip header (line 1 empty, line 2 has headers)
    for (let i = 2; i < ledgerLines.length; i++) {
        if (!ledgerLines[i].trim() || ledgerLines[i].startsWith(',,,')) continue;
        const row = parseCSVLine(ledgerLines[i]);
        if (row.length >= 5 && row[0]) {  // Must have SOUL ID
            ledgerEntries.push({
                soulId: row[0],
                wrongdoing: row[1] || "PENDING",
                atonement: row[2] || "NONE",
                punishment: row[3] || "AWAITING JUDGMENT",
                difficulty: row[4] || "N/A",
                status: row[5] || "ROTTING",
                duration: row[6] || "ETERNAL",
                supervisor: row[7] || "N/A",
                bribe: row[8] || "FALSE",
                completion: row[9] || "FALSE",
                vote: row[10] || "0"
            });
        }
    }

    // 4. JOIN: Match each soul with their ledger entry by SOUL ID
    initialSoulsData = damnedSouls.map(soul => {
        const assignment = ledgerEntries.find(entry => entry.soulId === soul.soulId);

        if (assignment) {
            // Soul has an assignment
            return {
                name: soul.name,
                soulId: soul.soulId,
                ...assignment  // Spread ledger data
            };
        } else {
            // Unassigned soul - use defaults
            return {
                name: soul.name,
                soulId: soul.soulId,
                wrongdoing: "PENDING ASSIGNMENT",
                atonement: "NONE",
                punishment: "AWAITING JUDGMENT",
                difficulty: "TBD",
                status: "LIMBO",
                duration: "UNTIL ASSIGNED",
                supervisor: "NONE",
                bribe: "FALSE",
                completion: "FALSE",
                vote: "0"
            };
        }
    });

    // 5. Extract unique values for generators
    if (initialSoulsData.length > 0) {
        NAMES = [...new Set(initialSoulsData.map(s => s.name))];
        PUNISHMENTS = [...new Set(initialSoulsData.map(s => s.punishment))];
        DURATIONS = [...new Set(initialSoulsData.map(s => s.duration))];
        ATONEMENTS = [...new Set(initialSoulsData.map(s => s.atonement))];
        VIBES = [...new Set(initialSoulsData.map(s => s.status))];
    }

    // 6. Secrets
    SECRETS = secrets;

    dataLoaded = true;
    console.log("Hell loaded successfully.");
    console.log(`Loaded ${damnedSouls.length} souls from damned.csv`);
    console.log(`Loaded ${ledgerEntries.length} ledger entries`);
    console.log(`Joined ${initialSoulsData.length} complete soul records`);
    console.log(`Loaded ${RIDDLES.length} riddles`);

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
let pendingAddSoul = false; // Track if [A] was used to add a soul (for deferred bribe reward)
let currentMode = document.getElementById('login-screen') ? 'login' : 'sheet';
let loginUser = 'SINNER';

// Auto-init if on spreadsheet page
if (currentMode === 'sheet') {
    window.addEventListener('DOMContentLoaded', () => {
        // Load user role from localStorage
        currentUser.username = localStorage.getItem('currentUsername') || 'SINNER';
        currentUser.isAdmin = localStorage.getItem('currentUserIsAdmin') === 'true';

        // Create edit modal
        createEditModal();
        console.log(`Logged in as: ${currentUser.username} (Admin: ${currentUser.isAdmin})`);

        initData();
        localStorage.removeItem('loginFailures');
        document.body.classList.remove('theme-yellow', 'theme-orange', 'theme-red');

        // Admin exemption: disable handshake entirely, hide bribe bar
        if (currentUser.isAdmin) {
            handshakeGracePeriod = true; // Keep grace period on forever for admin
            const briberBar = document.getElementById('bribe-bar');
            if (briberBar) briberBar.style.display = 'none';
        } else {
            // Non-admin: trigger startup Snick bribe demand immediately
            updateBribeBar();
            setTimeout(() => {
                triggerSnick('startup');
            }, 1500); // Small delay so the spreadsheet loads first

            // Re-trigger every 15s during grace period if Snick is dismissed without solving
            startupSnickInterval = setInterval(() => {
                if (handshakeGracePeriod && !snickActive) {
                    triggerSnick('startup');
                }
            }, 15000);
        }
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
        selectedRow = 0;
        slowRender();
    }
    // Reward for reaching last page after adding a soul
    if (currentPage === totalPages && pendingSoulReward) {
        pendingSoulReward = false;
        briberTokens++;
        updateBribeBar();
        document.getElementById('modem-text').innerText = "BRIBE EARNED";
        setTimeout(() => { document.getElementById('modem-text').innerText = "IDLE"; }, 2000);
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
                // Admin: never lose connection
                if (!currentUser.isAdmin && !handshakeGracePeriod && Math.random() < 0.1 && handshakeBuffer <= 0) {
                    // Try to spend a bribe token to auto-restore
                    if (briberTokens > 0) {
                        briberTokens--;
                        updateBribeBar();
                        handshakeBuffer = 100;
                        document.getElementById('modem-text').innerText = "BRIBE ACCEPTED";
                        await new Promise(res => setTimeout(res, 300));
                    } else {
                        isConnectionLost = true;
                        document.getElementById('handshake-warning').style.visibility = 'visible';
                        document.getElementById('modem-text').innerText = "NO CARRIER";
                        await new Promise(res => setTimeout(res, 100));
                    }
                }
                isConnectionLost = false;
                document.getElementById('handshake-warning').style.visibility = 'hidden';
                document.getElementById('modem-text').innerText = "RECEIVING";

                chunk += char;
                if (!currentUser.isAdmin) handshakeBuffer -= 0.1;
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
        // Admin: handshake always stable, no need to maintain
        if (currentUser.isAdmin) return;
        // During grace period, SPACE does nothing (Snick controls the connection)
        if (handshakeGracePeriod) return;
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
                // Save user info for spreadsheet page
                localStorage.setItem('currentUsername', loginUser);
                localStorage.setItem('currentUserIsAdmin', targetUser?.isAdmin || false);

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

                    const lockoutTime = Date.now() + 5 * 60 * 1000;
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

            if (e.key.toLowerCase() === 'e') {
                // Open edit modal for current cell
                const fieldName = getFieldNameFromColumn(selectedCol);
                if (fieldName) {
                    openEditModal(fieldName, selectedRow);
                }
            }

            if (e.key.toLowerCase() === 'b' && e.shiftKey) {
                pendingBribeAction = true;
                triggerSnick('bribe');
            }
            if (e.key.toLowerCase() === 'a' && e.shiftKey) { openModal("ADD NEW DAMNED:"); pendingAddSoul = true; }
            if (e.key.toLowerCase() === 's' && !e.shiftKey) openModal("SEARCH DATABASE:");
            if (e.key.toLowerCase() === 'i' && e.shiftKey) initData();
            if (e.key.toLowerCase() === 'h' && e.shiftKey) triggerSnick('help');
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
                    status: "ROTTING",
                    soulId: 'NEW-' + Date.now(),
                    wrongdoing: 'UNKNOWN',
                    difficulty: 'N/A',
                    supervisor: 'N/A',
                    bribe: 'FALSE',
                    completion: 'FALSE',
                    vote: '0'
                });
                // Deferred bribe reward: user must reach last page to earn it
                pendingSoulReward = true;
                pendingAddSoul = false;
                document.getElementById('modem-text').innerText = "SOUL LOGGED";
                setTimeout(() => { document.getElementById('modem-text').innerText = "IDLE"; }, 2000);
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
    else if (currentMode === 'editmodal') {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            closeEditModal();
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

// --- BRIBE BAR ---
function updateBribeBar() {
    const bar = document.getElementById('bribe-bar');
    if (!bar) return;
    const display = Math.min(briberTokens, 5);
    bar.textContent = '😈'.repeat(display) || '·····';
    bar.title = `BRIBE TOKENS: ${briberTokens}`;
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

// --- EDIT MODAL FUNCTIONS ---
let editModalElement = null;
let currentEditField = null;
let currentEditSoulIndex = null;

function createEditModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div style="background:#111; border:2px solid #0f0; padding:20px; max-width:500px; margin:50px auto;">
            <h3 id="edit-field-name" style="margin:0 0 15px 0; color:#0f0;">EDIT FIELD</h3>
            
            <div id="edit-permission-warning" style="display:none; background:#330; border:1px solid #f90; padding:10px; margin-bottom:10px;">
                ⚠️ ADMINISTRATOR ACCESS REQUIRED
            </div>
            
            <div id="edit-calculated-notice" style="display:none; background:#003; border:1px solid #09f; padding:10px; margin-bottom:10px;">
                🔢 CALCULATED VALUE - READ ONLY
            </div>
            
            <div id="edit-viasnick-notice" style="display:none; background:#303; border:1px solid #f0f; padding:10px; margin-bottom:10px;">
                💰 BRIBE CAN ONLY BE PURCHASED VIA SNICK
            </div>
            
            <div style="margin:15px 0;">
                <label for="edit-input" style="display:block; margin-bottom:5px; color:#0f0;">Value:</label>
                <textarea id="edit-input" rows="3" style="width:100%; font-family:monospace; background:#000; color:#0f0; border:1px solid #0f0; padding:5px;"></textarea>
            </div>
            
            <div style="margin-top:15px; text-align:right;">
                <button id="edit-save-btn" style="margin-right:10px; background:#0f0; color:#000; border:none; padding:5px 15px; cursor:pointer;">SAVE [ENTER]</button>
                <button id="edit-cancel-btn" style="background:#f00; color:#fff; border:none; padding:5px 15px; cursor:pointer;">CANCEL [ESC]</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    editModalElement = modal;

    // Add event listeners
    document.getElementById('edit-save-btn').addEventListener('click', saveEdit);
    document.getElementById('edit-cancel-btn').addEventListener('click', closeEditModal);
}

function openEditModal(fieldName, soulIndex) {
    if (!editModalElement) return;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const soul = filteredSouls[startIdx + soulIndex];
    if (!soul) return;

    currentEditField = fieldName;
    currentEditSoulIndex = soulIndex;

    const config = FIELD_CONFIG[fieldName];
    const canEdit = canEditField(fieldName);

    // Update modal title
    document.getElementById('edit-field-name').innerText = `EDIT: ${fieldName.toUpperCase()}`;

    // Hide all warnings
    document.getElementById('edit-permission-warning').style.display = 'none';
    document.getElementById('edit-calculated-notice').style.display = 'none';
    document.getElementById('edit-viasnick-notice').style.display = 'none';

    // Show appropriate warning/notice
    if (config && config.viaSnick) {
        document.getElementById('edit-viasnick-notice').style.display = 'block';
    } else if (config && config.calculated) {
        document.getElementById('edit-calculated-notice').style.display = 'block';
    } else if (!canEdit) {
        document.getElementById('edit-permission-warning').style.display = 'block';
    }

    // Set current value
    document.getElementById('edit-input').value = soul[fieldName] || '';
    document.getElementById('edit-input').disabled = !canEdit;

    // Show modal
    currentMode = 'editmodal';
    editModalElement.style.display = 'block';
    document.getElementById('edit-input').focus();
}

function saveEdit() {
    if (!canEditField(currentEditField)) {
        alertSnick('PERMISSION DENIED', true);
        playSnickFail();
        closeEditModal();
        return;
    }

    const newValue = document.getElementById('edit-input').value;
    const startIdx = (currentPage - 1) * rowsPerPage;
    const globalIndex = souls.findIndex(s => s === filteredSouls[startIdx + currentEditSoulIndex]);

    if (globalIndex !== -1) {
        souls[globalIndex][currentEditField] = newValue;
        playTypeSound(600);
        slowRender();
    }

    closeEditModal();
}

function closeEditModal() {
    currentMode = 'sheet';
    if (editModalElement) editModalElement.style.display = 'none';
    currentEditField = null;
    currentEditSoulIndex = null;
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
    'startup': 'images/snick_bribe.png',
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

    if (currentSnickScenario === 'startup') {
        currentRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
        document.getElementById('snick-dialog').innerText =
            "The infernal mainframe is initializing... Solve my riddle for a bribe token, or suffer the consequences. " +
            (currentRiddle ? currentRiddle.q : "What has keys but no locks?");
        document.getElementById('snick-input').style.display = 'block';
        document.getElementById('snick-submit-btn').style.display = 'block';
        document.getElementById('snick-input').focus();
    } else if (currentSnickScenario === 'bribe') {
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

    if (currentSnickScenario === 'goosechase' || currentSnickScenario === 'startup' ||
        (currentSnickScenario === 'bribe' && document.getElementById('snick-input').style.display !== 'none')) {
        if (currentRiddle && currentRiddle.a.includes(val)) {
            resolveConnection();
            // Grant a bribe token for solving a riddle
            briberTokens++;
            updateBribeBar();
            alertSnick("Fine. Connection restored. +1 😈 BRIBE TOKEN.", true);
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

    // Keep connection stable for 5 minutes
    const connectionDuration = 5 * 60 * 1000; // 5 minutes
    const endTime = Date.now() + connectionDuration;

    const connectionInterval = setInterval(() => {
        if (Date.now() >= endTime) {
            clearInterval(connectionInterval);
            return;
        }
        // Maintain buffer at max during blessed period
        handshakeBuffer = 100;
    }, 100);
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
