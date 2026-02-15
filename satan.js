const NAMES = ["NERO", "THE CEO OF SUBSCRIPTIONS", "EPSTEIN", "CALIGULA", "BRUTUS", "PEOPLE WHO DON'T RECYCLE"];
const PUNISHMENTS = ["ETERNAL DIAL-UP", "RE-WATCHING THE 2024 DEBATES", "SMELLING BURNT TOAST", "STEPPING ON A LEGO"];
const DURATIONS = ["4000 EONS", "999,999 HOURS", "UNTIL VOID CONSUMES"];
const ATONEMENTS = ["COUNTING SAND GRAINS", "SORT RICE BY LENGTH", "TYPING WITH ELBOWS"];
const QUOTES = ["HOPE IS THE FIRST STEP TO DISAPPOINTMENT.", "EVERYONE HAS A PURPOSE. YOURS IS LIKELY DATA ENTRY.", "THE LIGHT AT THE END OF THE TUNNEL IS AN ONCOMING TRAIN."];

let souls = [];
let selectedRow = 0;
let currentMode = 'login';
let isRendering = false;

// Handshake Variables
let handshakeBuffer = 100; // Depletes during render
let isConnectionLost = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- CURSED GLYPH ENGINE ---
function curse(text, intensity = 5) {
    const chars = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0310', '\u0316', '\u0317', '\u0318', '\u0319'];
    return text.split('').map(char => {
        if (Math.random() > 0.9) {
            let glitched = char;
            for (let i = 0; i < intensity; i++) glitched += chars[Math.floor(Math.random() * chars.length)];
            return glitched;
        }
        return char;
    }).join('');
}

// --- ALCHEMY EFFECT ---
function spawnHandshakeEffect() {
    const sigil = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sigil.setAttribute("class", "alchemy-sigil fly-away");

    // Random direction
    const tx = (Math.random() - 0.5) * 2000;
    const ty = (Math.random() - 0.5) * 2000;
    sigil.style.setProperty('--tw-x', `${tx}px`);
    sigil.style.setProperty('--tw-y', `${ty}px`);

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#brimstone");
    sigil.appendChild(use);

    document.getElementById('monitor').appendChild(sigil);
    setTimeout(() => sigil.remove(), 2000);
}

// --- AUDIO ---
function playTypeSound(freq = 150) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq + Math.random() * 50, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

// --- RENDERER ---
async function slowRender(filter = "") {
    if (isRendering) return;
    isRendering = true;
    handshakeBuffer = 50; // Start with some signal

    const tbody = document.getElementById('sheet-body');
    tbody.innerHTML = '';
    const filtered = souls.filter(s => s.name.toUpperCase().includes(filter.toUpperCase()));

    for (let soul of filtered) {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        const fields = [curse(soul.name), soul.punishment, soul.duration, curse(soul.atonement), soul.status];

        for (let field of fields) {
            const td = document.createElement('td');
            tr.appendChild(td);
            const chars = Array.from(field);
            for (let char of chars) {
                // HANDSHAKE CHECK
                while (handshakeBuffer <= 0) {
                    isConnectionLost = true;
                    document.getElementById('handshake-warning').style.visibility = 'visible';
                    document.getElementById('modem-text').innerText = "NO CARRIER";
                    await new Promise(r => setTimeout(r, 100)); // Wait for spacebar
                }
                isConnectionLost = false;
                document.getElementById('handshake-warning').style.visibility = 'hidden';
                document.getElementById('modem-text').innerText = "RECEIVING (" + handshakeBuffer + "%)";

                td.textContent += char;
                handshakeBuffer -= 1; // Signal decays as data flows
                playTypeSound();
                await new Promise(r => setTimeout(r, 33));
            }
        }
    }
    isRendering = false;
    document.getElementById('modem-text').innerText = "IDLE";
}

// --- CONTROLS ---
document.addEventListener('keydown', (e) => {
    // Spacebar Handshake
    if (e.code === 'Space') {
        e.preventDefault();
        handshakeBuffer = Math.min(handshakeBuffer + 20, 100);
        spawnHandshakeEffect();
        playTypeSound(400);
        return;
    }

    if (isRendering && currentMode !== 'login') return;
    playTypeSound();

    if (currentMode === 'login') {
        if (e.key === 'Enter') {
            if (document.getElementById('passInput').value === '666') {
                document.getElementById('login-screen').classList.remove('active');
                document.getElementById('sheet-screen').classList.add('active');
                currentMode = 'sheet';
                initData();
            } else {
                document.getElementById('passInput').value = '';
            }
        }
    }
    else if (currentMode === 'sheet') {
        if (e.key === 'ArrowDown') selectedRow = Math.min(selectedRow + 1, souls.length - 1);
        if (e.key === 'ArrowUp') selectedRow = Math.max(selectedRow - 1, 0);
        if (e.key.toLowerCase() === 'b') {
            const bribe = souls.splice(selectedRow, 1)[0];
            bribe.status = curse("VIP");
            souls.unshift(bribe);
            selectedRow = 0;
            slowRender();
        }
        if (e.key.toLowerCase() === 'a') openModal("ADD NEW DAMNED:");
        if (e.key.toLowerCase() === 's') openModal("SEARCH DATABASE:");
        if (e.key === 'Escape') location.reload();
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
    souls = NAMES.map(name => ({
        name: name,
        punishment: PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)],
        duration: DURATIONS[Math.floor(Math.random() * DURATIONS.length)],
        atonement: ATONEMENTS[Math.floor(Math.random() * ATONEMENTS.length)],
        status: "ROTTING"
    }));
    slowRender();
    setInterval(() => {
        if (currentMode === 'sheet' && !isRendering && Math.random() > 0.8) {
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
