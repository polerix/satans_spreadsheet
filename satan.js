// --- GLOBAL DATA ---
let NAMES = [];
let PUNISHMENTS = [];
let DURATIONS = [];
let ATONEMENTS = [];
let VIBES = [];
let QUOTES = []; // Demotivational
let RIDDLES = []; // Snick
let EXISTENTIAL_QUOTES = []; // Snick Help
let SECRETS = { users: [], defaultPattern: "666" };
let initialSoulsData = [];

// --- FETCH DATA ---
Promise.all([
    fetch('riddles.json').then(r => r.json()),
    fetch('damned.csv').then(r => r.text()),
    fetch('secret.json').then(r => r.json())
]).then(([riddles, csv, secrets]) => {
    // 1. Riddles & Content
    NAMES = riddles.names;
    PUNISHMENTS = riddles.punishments;
    DURATIONS = riddles.durations;
    ATONEMENTS = riddles.atonements;
    VIBES = riddles.vibes;
    QUOTES = riddles.quotes;
    RIDDLES = riddles.riddles;

    // 2. CSV Data
    const lines = csv.trim().split('\n');
    // Skip header (row 0)
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 5) {
            initialSoulsData.push({
                name: cols[0].trim(),
                punishment: cols[1].trim(),
                duration: cols[2].trim(),
                atonement: cols[3].trim(),
                status: cols[4].trim()
            });
        }
    }

    // 3. Secrets
    SECRETS = secrets;

    console.log("Hell loaded.");
}).catch(err => {
    console.error("Failed to load resources:", err);
    // Fallback?
});

let souls = [];
let selectedRow = 0;
let selectedCol = 0; // 0:Name, 1:Punishment, 2:Duration, 3:Atonement, 4:Vibe
let isEditMode = false; // For dropdown/modification
let currentMode = 'login';
let loginUser = 'SINNER'; // 'SINNER' or 'ADMIN'
let isRendering = false;

// ... (Handshake/Audio/Curse/Alchemy unchanged) ...

// --- RENDERER ---
async function slowRender(filter = "") {
    if (isRendering) return;
    isRendering = true;
    handshakeBuffer = 50; // Start with some signal

    const headers = ["SOUL ID", "PUNISHMENT", "ETA", "ATONEMENT", "VIBE"];
    const thead = document.querySelector('thead');
    if (thead) {
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    }

    const tbody = document.getElementById('sheet-body');
    tbody.innerHTML = '';
    const filtered = souls.filter(s => s.name.toUpperCase().includes(filter.toUpperCase()));

    for (let r = 0; r < filtered.length; r++) {
        const soul = filtered[r];
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        // Map soul properties to columns
        const fields = [curse(soul.name), soul.punishment, soul.duration, curse(soul.atonement), soul.status];

        for (let c = 0; c < fields.length; c++) {
            const field = fields[c];
            const td = document.createElement('td');

            // Highlight Selection
            if (currentMode === 'sheet' && r === selectedRow && c === selectedCol) {
                td.classList.add('reverse-cell');
                if (isEditMode) td.classList.add('edit-mode');
            }

            tr.appendChild(td);
            const chars = Array.from(field);
            for (let char of chars) {
                // HANDSHAKE CHECK (unchanged)
                while (handshakeBuffer <= 0) {
                    // ...
                    isConnectionLost = true;
                    document.getElementById('handshake-warning').style.visibility = 'visible';
                    document.getElementById('modem-text').innerText = "NO CARRIER";
                    await new Promise(r => setTimeout(r, 100)); // Wait for spacebar
                }
                isConnectionLost = false;
                document.getElementById('handshake-warning').style.visibility = 'hidden';
                document.getElementById('modem-text').innerText = "RECEIVING (" + handshakeBuffer + "%)";

                td.textContent += char;
                handshakeBuffer -= (Math.random() * 2 + 0.5); // Signal decays chaotically
                playDataStream();
                await new Promise(r => setTimeout(r, 33));
            }
        }
    }
    isRendering = false;
    document.getElementById('modem-text').innerText = "IDLE";
}

// --- CONTROLS ---
document.addEventListener('keydown', (e) => {
    // Spacebar Handshake (requires NO SHIFT)
    if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault();
        handshakeBuffer = Math.min(handshakeBuffer + 20, 100);
        spawnHandshakeEffect();
        playTypeSound(400);
        return;
    }

    if (isRendering && currentMode !== 'login') return;
    playTypeSound();

    if (currentMode === 'login') {
        const userSpan = document.getElementById('login-user');

        // Custom User Input Handler
        if (document.getElementById('user-type-input')) {
            if (e.key === 'Enter') {
                const val = document.getElementById('user-type-input').value.toUpperCase();
                loginUser = val || 'SINNER';
                userSpan.innerHTML = loginUser;
                if (loginUser !== 'ADMIN') userSpan.classList.add('reversed');
                else userSpan.classList.remove('reversed');
                document.getElementById('passInput').focus();
            }
            return;
        }

        // User Selection
        if (e.key.toLowerCase() === 'l') {
            loginUser = 'SINNER';
            userSpan.innerText = 'SINNER';
            userSpan.classList.add('reversed');
            document.getElementById('passInput').focus();
        }
        if (e.key.toLowerCase() === 'a') {
            loginUser = 'ADMIN';
            userSpan.innerText = 'ADMIN';
            userSpan.classList.remove('reversed');
            document.getElementById('passInput').focus();
        }
        if (e.key.toLowerCase() === 'u') {
            userSpan.classList.remove('reversed');
            userSpan.innerHTML = `<input id="user-type-input" style="background:transparent; border:none; border-bottom:1px solid red; color:red; font-family:inherit; width:100px; text-transform:uppercase; outline:none;" maxlength="10">`;
            const input = document.getElementById('user-type-input');
            input.focus();
            e.preventDefault();
        }

        if (e.key === 'Enter' && !document.getElementById('user-type-input')) {
            const pass = document.getElementById('passInput').value;
            let success = false;

            // Check against loaded secrets
            const targetUser = SECRETS.users.find(u => u.username === loginUser);

            if (targetUser) {
                if (pass === targetUser.password) success = true;
            } else {
                // Custom/Unknown user -> Use default pattern
                if (pass === SECRETS.defaultPattern) success = true;
            }

            if (success) {
                document.getElementById('login-screen').classList.remove('active');
                document.getElementById('sheet-screen').classList.add('active');
                currentMode = 'sheet';
                initData();
                playSnickSuccess();
            } else {
                document.getElementById('passInput').value = '';
                document.getElementById('login-error').style.display = 'block';
                playSnickFail();
                setTimeout(() => document.getElementById('login-error').style.display = 'none', 1000);
            }
        }
    }
    else if (currentMode === 'sheet') {
        const soul = souls[selectedRow];

        if (isEditMode) {
            // EDIT MODE CONTROLS
            if (e.key === 'x' || e.key === 'X') {
                isEditMode = false;
                slowRender(); // Re-render to remove edit style
                return;
            }

            if (selectedCol === 1) { // PUNISHMENT COLUMN
                let idx = PUNISHMENTS.indexOf(soul.punishment);
                if (e.key === 'ArrowDown') idx = (idx + 1) % PUNISHMENTS.length;
                if (e.key === 'ArrowUp') idx = (idx - 1 + PUNISHMENTS.length) % PUNISHMENTS.length;
                soul.punishment = PUNISHMENTS[idx];

                // Direct DOM update for speed
                const cell = document.getElementById('sheet-body').children[selectedRow].children[1];
                cell.innerText = soul.punishment;
            }
        } else {
            // NAVIGATION MODE
            if (e.key === 'ArrowDown') {
                selectedRow = Math.min(selectedRow + 1, souls.length - 1);
                slowRender();
            }
            if (e.key === 'ArrowUp') {
                selectedRow = Math.max(selectedRow - 1, 0);
                slowRender();
            }
            if (e.key === 'ArrowLeft') {
                selectedCol = Math.max(selectedCol - 1, 0);
                slowRender();
            }
            if (e.key === 'ArrowRight') {
                selectedCol = Math.min(selectedCol + 1, 4);
                slowRender();
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
            if (e.key === 'S' && e.shiftKey) saveToCSV(); // Shift+S to Save
            if (e.key === 'Escape') location.reload();
        }
    }
    else if (currentMode === 'modal') {
        if (e.key === 'Enter') {
            const val = document.getElementById('modal-input').value;
            if (document.getElementById('modal-label').innerText.includes("ADD")) {
                souls.push({ name: val.toUpperCase(), punishment: PUNISHMENTS[0], duration: DURATIONS[0], atonement: ATONEMENTS[0], status: "ROTTING" });
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
    // If we have CSV data, use it. Otherwise fallback to random (or empty if NAMES not loaded)
    if (initialSoulsData.length > 0) {
        // Deep copy to allow modification without affecting the "Reset" state? 
        // actually initData IS the reset. So we copy from initial.
        souls = JSON.parse(JSON.stringify(initialSoulsData));
    } else {
        // Fallback if CSV failed or not loaded yet
        souls = NAMES.map(name => ({
            name: name,
            punishment: PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)],
            duration: DURATIONS[Math.floor(Math.random() * DURATIONS.length)],
            atonement: ATONEMENTS[Math.floor(Math.random() * ATONEMENTS.length)],
            status: VIBES[Math.floor(Math.random() * VIBES.length)]
        }));
    }

    slowRender();

    // Automated Vibe Cycling
    setInterval(() => {
        if (currentMode === 'sheet' && souls.length > 0) {
            // Pick a random soul and change their vibe
            const r = Math.floor(Math.random() * souls.length);
            if (VIBES.length > 0) {
                souls[r].status = VIBES[Math.floor(Math.random() * VIBES.length)];
                // Update DOM directly
                if (!isRendering) {
                    const tbody = document.getElementById('sheet-body');
                    if (tbody && tbody.children[r] && tbody.children[r].children[4]) {
                        tbody.children[r].children[4].innerText = souls[r].status;
                        playDataStream(); // Small blip
                    }
                }
            }
        }
    }, 2000); // Change a vibe every 2 seconds

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
    document.getElementById('modal-input').focus();
}

function closeModal() {
    currentMode = 'sheet';
    document.getElementById('input-modal').style.display = 'none';
}

setInterval(() => {
    document.getElementById('main-title').innerText = curse("SATAN'S SPREADSHEETS", 1);
    const now = new Date();
    document.getElementById('clock').innerText = `06:66:${now.getSeconds().toString().padStart(2, '0')}`;
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
    'laugh': 'images/snick_laugh.png',
    'time': 'images/snick_time.png',
    'help': 'images/snick_laugh.png'
};
// EXISTENTIAL_QUOTES removed (now var)

function triggerSnick(forceScenario = null) {
    if (snickActive || (currentMode !== 'sheet' && !forceScenario)) return;
    snickActive = true;
    currentSnickScenario = forceScenario || SNICK_SCENARIOS[Math.floor(Math.random() * SNICK_SCENARIOS.length)];
    playSnickPop();

    // Setup UI
    document.getElementById('snick-modal').style.display = 'flex';
    document.getElementById('snick-img').src = SNICK_IMGS[currentSnickScenario];
    document.getElementById('snick-input').value = '';
    document.getElementById('snick-input').style.display = 'none';
    document.getElementById('snick-submit-btn').style.display = 'none';
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
        document.getElementById('snick-submit-btn').style.display = 'block';
        document.getElementById('snick-input').focus();
    } else if (currentSnickScenario === 'help') {
        document.getElementById('snick-dialog').innerText = EXISTENTIAL_QUOTES[Math.floor(Math.random() * EXISTENTIAL_QUOTES.length)];
        document.getElementById('snick-help-buttons').style.display = 'block';
    }
}

function handleSnickAnswer() {
    const val = document.getElementById('snick-input').value.trim().toLowerCase();

    if (currentSnickScenario === 'goosechase' || (currentSnickScenario === 'bribe' && document.getElementById('snick-input').style.display !== 'none')) {
        // Check against current riddle answers
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
    document.getElementById('passInput').focus(); // Refocus just in case
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

function playSnickLaugh() {
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

// Snick Event Listeners
document.getElementById('snick-submit-btn').addEventListener('click', handleSnickAnswer);
document.getElementById('snick-yes-btn').addEventListener('click', () => {
    // Bribe Accepted -> Transition to Riddle
    currentSnickScenario = 'goosechase';
    currentRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    document.getElementById('snick-dialog').innerText = "Excellent. Solve this: " + currentRiddle.q;
    document.getElementById('snick-buttons').style.display = 'none';
    document.getElementById('snick-input').style.display = 'block';
    document.getElementById('snick-submit-btn').style.display = 'block';
    document.getElementById('snick-input').focus();
});
document.getElementById('snick-no-btn').addEventListener('click', () => {
    // Bribe Rejected -> Goosechase (Curse)
    applyCurse();
    alertSnick("Big mistake. Have a curse.", true);
});

// Help Button Listeners
document.getElementById('snick-abort-btn').addEventListener('click', () => {
    location.reload(); // Returns to login/start
});
document.getElementById('snick-retry-btn').addEventListener('click', () => {
    document.getElementById('snick-dialog').innerText = EXISTENTIAL_QUOTES[Math.floor(Math.random() * EXISTENTIAL_QUOTES.length)];
});
document.getElementById('snick-resume-btn').addEventListener('click', closeSnick);

// Remove curse on new data entry
setInterval(() => {
    // Random Snick Trigger (low chance)
    if (Math.random() > 0.95 && !snickActive && currentMode === 'sheet') {
        triggerSnick();
    }
}, 15000);

// Hook into existing modal closing for curse removal
const originalCloseModal = closeModal;
closeModal = function () {
    originalCloseModal();
    if (cursedFontActive && document.getElementById('modal-label').innerText.includes("ADD") && document.getElementById('modal-input').value.length > 0) {
        cursedFontActive = false;
        document.body.classList.remove('cursed-font');
    }
};
