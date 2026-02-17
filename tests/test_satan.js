
const fs = require('fs');

// --- Mock Browser Environment ---
const window = {
    souls: [],
    initialSoulsData: [],
    currentPage: 1,
    rowsPerPage: 15,
    filteredSouls: []
};

// --- Extracted Logic from satan.js ---

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

function processCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    let data = [];

    // Line 1 is empty in the file
    // Line 2 has headers
    // Data starts at line 3 (index 2)

    for (let i = 2; i < lines.length; i++) {
        if (!lines[i].trim() || lines[i].startsWith(',,,')) continue;

        const row = parseCSVLine(lines[i]);
        if (row.length >= 5) {
            data.push({
                name: row[0] || "UNKNOWN",
                soulId: row[1] || "N/A",
                wrongdoing: row[2] || "N/A",
                atonement: row[3] || "N/A",
                punishment: row[4] || "N/A",
                difficulty: row[5] || "N/A",
                status: row[6] || "ROTTING", // VIBE
                duration: row[7] || "ETERNAL",
                supervisor: row[8] || "N/A",
                bribe: row[9] || "FALSE",
                completion: row[10] || "FALSE",
                vote: row[11] || "0"
            });
        }
    }
    return data;
}

// --- Test Execution ---

try {
    const csvContent = fs.readFileSync('data/LEDGER_VOID_FINAL.csv', 'utf8');
    const souls = processCSV(csvContent);

    console.log(`Successfully parsed ${souls.length} souls.`);

    if (souls.length === 0) {
        console.error("FAIL: No souls parsed.");
        process.exit(1);
    }

    // Verify Specific Data
    const hitler = souls.find(s => s.name === "Adolf Hitler");
    if (!hitler) {
        console.error("FAIL: Adolf Hitler not found in parsed data.");
    } else {
        console.log("Found Hitler:", hitler);
        if (hitler.punishment !== "ETERNAL DIAL-UP") console.error("FAIL: Incorrect punishment for Hitler.");
    }

    // Verify Pagination Logic
    const totalPages = Math.ceil(souls.length / 15);
    console.log(`Total Pages: ${totalPages} (Rows per page: 15)`);

    const page1 = souls.slice(0, 15);
    const page2 = souls.slice(15, 30);

    console.log(`Page 1 Item 1: ${page1[0].name}`);
    console.log(`Page 2 Item 1: ${page2[0]?.name || "NONE"}`);

    if (page1.length !== 15) console.error("FAIL: Page 1 should have 15 items.");
    if (totalPages < 2) console.error("FAIL: Should be at least 2 pages.");

} catch (err) {
    console.error("Error reading/processing file:", err);
}
