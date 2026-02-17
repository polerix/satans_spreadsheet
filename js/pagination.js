// --- PAGINATION MODULE ---
// Handles pagination logic for the spreadsheet

export let currentPage = 1;
export let currentColumnPage = 0; // 0 = First 6 cols (A), 1 = Next 6 cols (B)
export const rowsPerPage = 15;
export let totalPages = 1;
export let filteredSouls = [];

export function setFilteredSouls(souls) {
    filteredSouls = souls;
    totalPages = Math.ceil(filteredSouls.length / rowsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
}

export function updatePagination() {
    totalPages = Math.ceil(filteredSouls.length / rowsPerPage) || 1;
    const pageIndicator = document.getElementById('page-indicator');
    if (pageIndicator) {
        const subPage = currentColumnPage === 0 ? 'A' : 'B';
        pageIndicator.innerText = `PAGE ${currentPage}-${subPage} OF ${totalPages}`;
    }
}

export function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        return true;
    }
    return false;
}

export function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        return true;
    }
    return false;
}

export function setPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updatePagination();
        return true;
    }
    return false;
}

export function nextColumnPage() {
    if (currentColumnPage === 0) {
        currentColumnPage = 1;
        updatePagination();
        return true;
    }
    return false;
}

export function prevColumnPage() {
    if (currentColumnPage === 1) {
        currentColumnPage = 0;
        updatePagination();
        return true;
    }
    return false;
}

export function resetColumnPage() {
    currentColumnPage = 0;
    updatePagination();
}

export function getCurrentPageData() {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredSouls.slice(startIdx, endIdx);
}
