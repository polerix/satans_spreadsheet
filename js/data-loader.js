// --- DATA LOADER MODULE ---
// Handles loading and caching of external data files

const CACHE_KEY = 'satans_spreadsheet_data';
const CACHE_TIMESTAMP_KEY = 'satans_spreadsheet_cache_time';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export let NAMES = [];
export let PUNISHMENTS = [];
export let DURATIONS = [];
export let ATONEMENTS = [];
export let VIBES = [];
export let QUOTES = [];
export let RIDDLES = [];
export let EXISTENTIAL_QUOTES = [];
export let SECRETS = { users: [], defaultPattern: "666" };
export let initialSoulsData = [];

// CSV Parser
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

// Check if cache is still valid
function isCacheValid() {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    return (Date.now() - parseInt(timestamp)) < CACHE_DURATION;
}

// Get cached data
function getCachedData() {
    try {
        const data = localStorage.getItem(CACHE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Failed to parse cached data:', e);
        return null;
    }
}

// Store data in cache
function cacheData(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
        console.warn('Failed to cache data:', e);
    }
}

// Load all data files
export async function loadData() {
    // Check cache first
    if (isCacheValid()) {
        const cached = getCachedData();
        if (cached) {
            console.log('Loading from cache');
            applyData(cached);
            return true;
        }
    }

    // Fetch fresh data
    try {
        const [riddles, csv, secrets, quotesData] = await Promise.all([
            fetch('riddles.json').then(r => r.json()),
            fetch('LEDGER_VOID_FINAL.csv').then(r => r.text()),
            fetch('secret.json').then(r => r.json()),
            fetch('existentialquotes.json').then(r => r.json())
        ]);

        // Process data
        const data = processData(riddles, csv, secrets, quotesData);

        // Cache for next time
        cacheData(data);

        // Apply to module exports
        applyData(data);

        console.log("Hell loaded successfully.");
        console.log("Loaded souls:", initialSoulsData.length);
        console.log("Loaded riddles:", RIDDLES.length);

        return true;
    } catch (err) {
        console.error("Failed to load resources:", err);
        alert("ERROR: Failed to load infernal database. Check console.");
        return false;
    }
}

// Process raw data
function processData(riddles, csv, secrets, quotesData) {
    const quotes = quotesData.quotes || [];
    const riddlesList = riddles.riddles || [];
    const existentialQuotes = quotesData.existential_quotes || [];
    const souls = [];

    // Parse CSV
    const lines = csv.trim().split('\n');
    for (let i = 2; i < lines.length; i++) {
        if (!lines[i].trim() || lines[i].startsWith(',,,')) continue;

        const row = parseCSVLine(lines[i]);
        if (row.length >= 5) {
            souls.push({
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

    // Extract unique values
    const names = souls.length > 0 ? [...new Set(souls.map(s => s.name))] : [];
    const punishments = souls.length > 0 ? [...new Set(souls.map(s => s.punishment))] : [];
    const durations = souls.length > 0 ? [...new Set(souls.map(s => s.duration))] : [];
    const atonements = souls.length > 0 ? [...new Set(souls.map(s => s.atonement))] : [];
    const vibes = souls.length > 0 ? [...new Set(souls.map(s => s.status))] : [];

    return {
        quotes,
        riddles: riddlesList,
        existentialQuotes,
        secrets,
        souls,
        names,
        punishments,
        durations,
        atonements,
        vibes
    };
}

// Apply data to module exports
function applyData(data) {
    QUOTES = data.quotes;
    RIDDLES = data.riddles;
    EXISTENTIAL_QUOTES = data.existentialQuotes;
    SECRETS = data.secrets;
    initialSoulsData = data.souls;
    NAMES = data.names;
    PUNISHMENTS = data.punishments;
    DURATIONS = data.durations;
    ATONEMENTS = data.atonements;
    VIBES = data.vibes;
}

// Clear cache (useful for debugging)
export function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}
