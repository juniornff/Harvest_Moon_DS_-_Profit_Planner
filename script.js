// script.js - Harvest Moon DS Complete Profit Planner
// This file contains all the logic for simulating crops, trees, and mushrooms,
// managing user data (localStorage), rendering day‑by‑day tables, and handling
// user interactions (add, edit, delete, clear).

// ----------------------------- CROP DATABASE ---------------------------------
// Defines all growable items: crops (with growth days, regrowth, season),
// fruit trees (with production season), and mushrooms (with size‑dependent
// prices and growth times).
const CROPS_DB = [
    // ========== CROPS ==========
    { name: "Turnip", type: "crop", basePrice: 60, growthDays: 5, regrowDays: 0, season: "spring" },
    { name: "Potato", type: "crop", basePrice: 80, growthDays: 8, regrowDays: 0, season: "spring" },
    { name: "Cucumber", type: "crop", basePrice: 60, growthDays: 10, regrowDays: 5, season: "spring" },
    { name: "Strawberry", type: "crop", basePrice: 30, growthDays: 8, regrowDays: 2, season: "spring" },
    { name: "Cabbage", type: "crop", basePrice: 250, growthDays: 15, regrowDays: 0, season: "spring" },
    { name: "Toy Flower", type: "crop", basePrice: 130, growthDays: 13, regrowDays: 0, season: "spring" },
    { name: "Moondrop Flower", type: "crop", basePrice: 60, growthDays: 7, regrowDays: 0, season: "spring" },
    { name: "Tomato", type: "crop", basePrice: 60, growthDays: 10, regrowDays: 3, season: "summer" },
    { name: "Corn", type: "crop", basePrice: 100, growthDays: 15, regrowDays: 3, season: "summer" },
    { name: "Onion", type: "crop", basePrice: 80, growthDays: 8, regrowDays: 0, season: "summer" },
    { name: "Pumpkin", type: "crop", basePrice: 250, growthDays: 15, regrowDays: 0, season: "summer" },
    { name: "Pineapple", type: "crop", basePrice: 500, growthDays: 21, regrowDays: 5, season: "summer" },
    { name: "Pinkcat Flower", type: "crop", basePrice: 70, growthDays: 7, regrowDays: 0, season: "summer" },
    { name: "Eggplant", type: "crop", basePrice: 80, growthDays: 10, regrowDays: 3, season: "fall" },
    { name: "Carrot", type: "crop", basePrice: 120, growthDays: 8, regrowDays: 0, season: "fall" },
    { name: "Yam", type: "crop", basePrice: 100, growthDays: 6, regrowDays: 2, season: "fall" },
    { name: "Spinach", type: "crop", basePrice: 80, growthDays: 6, regrowDays: 0, season: "fall" },
    { name: "Green Pepper", type: "crop", basePrice: 40, growthDays: 8, regrowDays: 2, season: "fall" },
    { name: "Magic Flower", type: "crop", basePrice: 80, growthDays: 11, regrowDays: 0, season: "fall" },
    // ========== TREES ==========
    { name: "Banana", type: "tree", basePrice: 300, growthDays: 40, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Orange", type: "tree", basePrice: 200, growthDays: 43, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Peach", type: "tree", basePrice: 250, growthDays: 58, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Apple", type: "tree", basePrice: 100, growthDays: 52, regrowDays: 3, season: "fall", productionSeason: "fall" },
    { name: "Grape", type: "tree", basePrice: 200, growthDays: 58, regrowDays: 3, season: "fall", productionSeason: "fall" },
    // ========== MUSHROOMS ==========
    { name: "Shiitake", type: "mushroom", basePriceSmall: 50, basePriceMedium: 80, basePriceLarge: 120,
      initialDays: 35, smallRegrow: 3, mediumRegrow: 3, largeRegrow: 3 },
    { name: "Toadstool", type: "mushroom", basePriceSmall: 100, basePriceMedium: 130, basePriceLarge: 160,
      initialDays: 42, smallRegrow: 3, mediumRegrow: 3, largeRegrow: 4 },
    { name: "Matsutake", type: "mushroom", basePriceSmall: 350, basePriceMedium: 500, basePriceLarge: 800,
      initialDays: 59, smallRegrow: 3, mediumRegrow: 5, largeRegrow: 6 }
];

// Helper: retrieve full data object for a given crop/tree/mushroom name
function getCropData(cropName) {
    return CROPS_DB.find(c => c.name === cropName);
}

// Soil type modifiers (days added to growth time)
const FIELD_MOD = { slow: 1, normal: 0, fast: -1, super: -2 };

// Calculate profit for a single unit of a crop at a given level.
// Profit = basePrice × level².
function cropValue(basePrice, level) {
    return basePrice * level * level;
}

// ----------------------------- STATE MANAGEMENT -----------------------------
// Each array holds the entries (user‑added items) for its respective section.
let springEntries = [], summerEntries = [], autumnEntries = [], waterfallEntries = [], basementEntries = [];
let treesEntries = [], mushroomsEntries = [];

// Load saved data from localStorage (if any) into the state arrays.
function loadFromStorage() {
    const saved = localStorage.getItem("hmds_complete_planner");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            springEntries = data.spring || [];
            summerEntries = data.summer || [];
            autumnEntries = data.autumn || [];
            waterfallEntries = data.waterfall || [];
            basementEntries = data.basement || [];
            treesEntries = data.trees || [];
            mushroomsEntries = data.mushrooms || [];
        } catch(e) {}
    }
}

// Save current state arrays to localStorage.
function saveToStorage() {
    localStorage.setItem("hmds_complete_planner", JSON.stringify({
        spring: springEntries, summer: summerEntries, autumn: autumnEntries,
        waterfall: waterfallEntries, basement: basementEntries,
        trees: treesEntries, mushrooms: mushroomsEntries
    }));
}

// Helper: return CSS class name for a given day (1‑120) based on the season.
function getSeasonClass(day) {
    if (day >= 1 && day <= 30) return "season-spring";
    if (day >= 31 && day <= 60) return "season-summer";
    if (day >= 61 && day <= 90) return "season-autumn";
    return "season-winter";
}

// ----------------------------- SIMULATION ENGINES -----------------------------

/**
 * Simulates a standard crop (not a tree, not a mushroom).
 * Produces a timeline of events (sow, harvest, regrow) for the given entry.
 * @param {Object} entry - The crop entry (contains cropName, quantity, level, fieldType, sowDay, replantUntilEnd).
 * @param {number} maxDays - Number of days to simulate (30 for seasonal tables, 120 for all‑year fields).
 * @returns {Object} { timelineEvents: Array of arrays (event per day), totalProfit: number }
 */
function simulateCrop(entry, maxDays) {
    const crop = getCropData(entry.cropName);
    if (!crop || crop.type !== "crop") return { timelineEvents: new Array(maxDays+1).fill(null), totalProfit: 0 };
    
    let replantFlag = entry.replantUntilEnd;
    if (crop.regrowDays > 0) replantFlag = false;
    
    let maturity = crop.growthDays + FIELD_MOD[entry.fieldType];
    if (maturity < 1) maturity = 1;
    const regrow = crop.regrowDays;
    const profitPerHarvest = entry.quantity * cropValue(crop.basePrice, entry.level);
    
    let timeline = new Array(maxDays+1);
    for (let i=1; i<=maxDays; i++) timeline[i] = [];
    let totalProfit = 0;
    let sowDay = entry.sowDay;
    if (sowDay < 1 || sowDay > maxDays) return { timelineEvents: timeline, totalProfit: 0 };
    
    timeline[sowDay].push("sow");
    let currentSow = sowDay;
    let isFirstHarvest = true;
    
    while (currentSow <= maxDays) {
        // Harvest day calculation: the day of sowing counts as day 1,
        // so we subtract 1 day from the maturity period.
        let harvestDay = currentSow + maturity - 1;
        if (harvestDay > maxDays) break;
        
        timeline[harvestDay].push(isFirstHarvest ? "harvest" : "regrow");
        totalProfit += profitPerHarvest;
        
        if (replantFlag) {
            // Replant immediately on the same day as harvest.
            currentSow = harvestDay;
            if (currentSow <= maxDays) timeline[currentSow].push("sow");
            isFirstHarvest = true;
        } else {
            if (regrow > 0) {
                // Natural regrowth: subsequent harvests occur every regrowDays.
                let nextHarvest = harvestDay + regrow;
                while (nextHarvest <= maxDays) {
                    timeline[nextHarvest].push("regrow");
                    totalProfit += profitPerHarvest;
                    nextHarvest += regrow;
                }
            }
            break;
        }
    }
    return { timelineEvents: timeline, totalProfit };
}

/**
 * Simulates a fruit tree (outdoor only, seasonal production).
 * @param {Object} entry - Tree entry (cropName, quantity, level, fieldType, sowDay, alreadyMature).
 * @param {number} maxDays - Always 120 (full year).
 * @returns {Object} { timelineEvents, totalProfit }
 */
function simulateTree(entry, maxDays) {
    const tree = getCropData(entry.cropName);
    if (!tree || tree.type !== "tree") return { timelineEvents: new Array(maxDays+1).fill(null), totalProfit: 0 };
    
    const productionSeason = tree.productionSeason;
    let seasonStart, seasonEnd;
    if (productionSeason === "summer") { seasonStart = 31; seasonEnd = 60; }
    else if (productionSeason === "fall") { seasonStart = 61; seasonEnd = 90; }
    else { return { timelineEvents: new Array(maxDays+1).fill(null), totalProfit: 0 }; }
    
    let mature = entry.alreadyMature || false;
    let maturity = mature ? 0 : (tree.growthDays + FIELD_MOD[entry.fieldType]);
    if (maturity < 0) maturity = 0;
    const regrow = tree.regrowDays;
    const profitPerHarvest = entry.quantity * cropValue(tree.basePrice, entry.level);
    
    let timeline = new Array(maxDays+1);
    for (let i=1; i<=maxDays; i++) timeline[i] = [];
    let totalProfit = 0;
    let sowDay = entry.sowDay;
    if (sowDay < 1 || sowDay > maxDays) return { timelineEvents: timeline, totalProfit: 0 };
    
    timeline[sowDay].push("sow");
    let readyDay = sowDay + maturity;
    let firstHarvest = -1;
    if (readyDay <= seasonEnd && readyDay >= seasonStart) firstHarvest = readyDay;
    else if (readyDay < seasonStart) firstHarvest = seasonStart;
    else return { timelineEvents: timeline, totalProfit: 0 };
    if (firstHarvest > seasonEnd) return { timelineEvents: timeline, totalProfit: 0 };
    
    let currentHarvest = firstHarvest;
    while (currentHarvest <= seasonEnd) {
        timeline[currentHarvest].push("harvest");
        totalProfit += profitPerHarvest;
        currentHarvest += regrow;
    }
    return { timelineEvents: timeline, totalProfit };
}

/**
 * Simulates mushrooms grown in the Mushroom House.
 * Supports three harvest sizes (small, medium, large) each with different
 * initial growth and regrowth cycles.
 * @param {Object} entry - Mushroom entry (cropName, quantity, level, harvestSize, sowDay, alreadyMature).
 * @param {number} maxDays - 120 (full year).
 * @returns {Object} { timelineEvents, totalProfit }
 */
function simulateMushroom(entry, maxDays) {
    const mush = getCropData(entry.cropName);
    if (!mush || mush.type !== "mushroom") return { timelineEvents: new Array(maxDays+1).fill(null), totalProfit: 0 };
    
    const size = entry.harvestSize;
    let daysToFirstHarvest = mush.initialDays;
    let regrowCycleDays;
    let price;
    if (size === "small") {
        price = mush.basePriceSmall;
        regrowCycleDays = mush.smallRegrow;
    } else if (size === "medium") {
        price = mush.basePriceMedium;
        regrowCycleDays = mush.mediumRegrow;
        daysToFirstHarvest += mush.mediumRegrow;
    } else {
        price = mush.basePriceLarge;
        regrowCycleDays = mush.mediumRegrow + mush.largeRegrow;
        daysToFirstHarvest += mush.mediumRegrow + mush.largeRegrow;
    }
    const profitPerHarvest = entry.quantity * cropValue(price, entry.level);
    
    let timeline = new Array(maxDays+1);
    for (let i=1; i<=maxDays; i++) timeline[i] = [];
    let totalProfit = 0;
    let sowDay = entry.sowDay;
    if (sowDay < 1 || sowDay > maxDays) return { timelineEvents: timeline, totalProfit: 0 };
    
    timeline[sowDay].push("sow");
    let firstHarvestDay = entry.alreadyMature ? sowDay : sowDay + daysToFirstHarvest;
    let currentHarvest = firstHarvestDay;
    while (currentHarvest <= maxDays) {
        if (currentHarvest >= sowDay) {
            timeline[currentHarvest].push("harvest");
            totalProfit += profitPerHarvest;
        }
        currentHarvest += regrowCycleDays;
    }
    return { timelineEvents: timeline, totalProfit };
}

// ----------------------------- RENDER FUNCTION (DOM‑based) -----------------------------

/**
 * Renders a complete table for a given section.
 * It builds the header and all rows using DOM methods (insertRow, insertCell)
 * to guarantee perfect column alignment, especially for the "Actions" column.
 * @param {string} sectionId - ID of the section (e.g., "spring", "waterfall").
 * @param {Array} entries - Array of entry objects for that section.
 * @param {number} maxDays - Number of days (30 or 120).
 * @param {string} sectionName - Display name for the profit summary.
 * @param {Function} simulationFunc - The simulation function to use (simulateCrop, simulateTree, etc.).
 * @returns {number} Total profit for the section.
 */
function renderSection(sectionId, entries, maxDays, sectionName, simulationFunc) {
    const table = document.getElementById(`${sectionId}-table`);
    const thead = document.getElementById(`${sectionId}-header`);
    const tbody = document.getElementById(`${sectionId}-tbody`);
    if (!table || !thead || !tbody) return 0;
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Build header row
    const headerRow = document.createElement('tr');
    const infoTh = document.createElement('th');
    infoTh.textContent = 'Item (Details)';
    headerRow.appendChild(infoTh);
    for (let d = 1; d <= maxDays; d++) {
        const th = document.createElement('th');
        th.textContent = d;
        if (maxDays === 120) th.classList.add(getSeasonClass(d));
        headerRow.appendChild(th);
    }
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Actions';
    headerRow.appendChild(actionsTh);
    thead.appendChild(headerRow);
    
    // Apply background colour class for 30‑day tables
    if (maxDays === 30) {
        if (sectionId === "spring") table.classList.add("spring-bg");
        else if (sectionId === "summer") table.classList.add("summer-bg");
        else if (sectionId === "autumn") table.classList.add("autumn-bg");
        else table.classList.remove("spring-bg", "summer-bg", "autumn-bg");
    } else {
        table.classList.remove("spring-bg", "summer-bg", "autumn-bg");
    }
    
    let totalProfit = 0;
    
    entries.forEach((entry, idx) => {
        const { timelineEvents, totalProfit: profit } = simulationFunc(entry, maxDays);
        totalProfit += profit;
        
        const row = tbody.insertRow();
        
        // Info cell (first column)
        const infoCell = row.insertCell();
        infoCell.style.textAlign = 'left';
        let infoText = "";
        if (entry.type === "tree") {
            infoText = `${entry.cropName}<br>${entry.quantity} trees · Lv.${entry.level}<br>${entry.fieldType} soil · Sown day ${entry.sowDay}<br>Mature: ${entry.alreadyMature ? "Yes" : "No"}`;
        } else if (entry.type === "mushroom") {
            infoText = `${entry.cropName}<br>${entry.quantity} pallets · Lv.${entry.level}<br>Size: ${entry.harvestSize}<br>Sown day ${entry.sowDay}<br>Mature: ${entry.alreadyMature ? "Yes" : "No"}`;
        } else {
            let replantText = entry.replantUntilEnd ? "Yes" : "No";
            if (getCropData(entry.cropName)?.regrowDays > 0) replantText = "No (regrow)";
            infoText = `${entry.cropName}<br>${entry.quantity} units · Lv.${entry.level}<br>${entry.fieldType} soil · Day ${entry.sowDay}<br>Replant: ${replantText}`;
        }
        infoCell.innerHTML = infoText;
        
        // Day cells (columns 2 .. maxDays+1)
        for (let d = 1; d <= maxDays; d++) {
            const events = timelineEvents[d] || [];
            const cell = row.insertCell();
            let cellClass = (maxDays === 120) ? getSeasonClass(d) : '';
            if (events.length === 0) {
                cell.className = `day-empty ${cellClass}`;
                cell.textContent = '·';
            } else if (events.length === 1) {
                const ev = events[0];
                let stateClass = '';
                let content = '';
                if (ev === "sow") { stateClass = 'day-sowing'; content = '🌱'; }
                else if (ev === "harvest") { stateClass = 'day-harvest'; content = '🍅'; }
                else if (ev === "regrow") { stateClass = 'day-regrow'; content = '🔄'; }
                else { stateClass = 'day-empty'; content = '·'; }
                cell.className = `${stateClass} ${cellClass}`;
                cell.textContent = content;
            } else {
                // Two events on the same day (e.g., harvest + replant)
                if (events.includes("harvest") && events.includes("sow")) {
                    cell.className = `multi-event harvest-sow ${cellClass}`;
                    cell.innerHTML = '<span class="harvest-icon">🍅</span><span class="sow-icon">🌱</span>';
                } else if (events.includes("regrow") && events.includes("sow")) {
                    cell.className = `multi-event regrow-sow ${cellClass}`;
                    cell.innerHTML = '<span class="regrow-icon">🔄</span><span class="sow-icon">🌱</span>';
                } else {
                    cell.className = `day-empty ${cellClass}`;
                    cell.textContent = events.join(',');
                }
            }
        }
        
        // Actions cell (last column)
        const actionsCell = row.insertCell();
        actionsCell.className = 'action-btns';
        actionsCell.style.verticalAlign = 'middle';
        actionsCell.style.minWidth = '80px';
        actionsCell.style.width = '80px';
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.setAttribute('data-section', sectionId);
        editBtn.setAttribute('data-index', idx);
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-section', sectionId);
        deleteBtn.setAttribute('data-index', idx);
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        
        // Safety check: ensure the row has exactly (1 + maxDays + 1) cells.
        const expectedCells = 1 + maxDays + 1;
        if (row.cells.length !== expectedCells) {
            console.warn(`Row has incorrect cell count: ${row.cells.length}, expected ${expectedCells}. Rebuilding...`);
            while (row.cells.length > expectedCells) row.deleteCell(-1);
            if (row.cells.length < expectedCells) {
                const missing = expectedCells - row.cells.length;
                for (let i = 0; i < missing; i++) row.insertCell();
            }
            const lastCell = row.cells[row.cells.length - 1];
            lastCell.className = 'action-btns';
            lastCell.style.verticalAlign = 'middle';
            lastCell.style.minWidth = '80px';
            lastCell.style.width = '80px';
            lastCell.innerHTML = '';
            lastCell.appendChild(editBtn.cloneNode(true));
            lastCell.appendChild(deleteBtn.cloneNode(true));
        }
    });
    
    const summarySpan = document.getElementById(`${sectionId}-summary`);
    if (summarySpan) summarySpan.innerHTML = `💰 ${sectionName} total profit: ${totalProfit.toLocaleString()} G`;
    return totalProfit;
}

// ----------------------------- GLOBAL REFRESH -----------------------------
/**
 * Refreshes all sections by calling renderSection for each one,
 * updates the global summary totals, and saves the current state.
 */
function refreshAll() {
    const springProfit = renderSection("spring", springEntries, 30, "Spring", simulateCrop);
    const summerProfit = renderSection("summer", summerEntries, 30, "Summer", simulateCrop);
    const autumnProfit = renderSection("autumn", autumnEntries, 30, "Autumn", simulateCrop);
    const waterfallProfit = renderSection("waterfall", waterfallEntries, 120, "Waterfall Field", simulateCrop);
    const basementProfit = renderSection("basement", basementEntries, 120, "Basements", simulateCrop);
    const treesProfit = renderSection("trees", treesEntries, 120, "Trees (full year)", simulateTree);
    const mushroomsProfit = renderSection("mushrooms", mushroomsEntries, 120, "Mushrooms", simulateMushroom);
    
    document.getElementById("global-spring").innerText = springProfit.toLocaleString();
    document.getElementById("global-summer").innerText = summerProfit.toLocaleString();
    document.getElementById("global-autumn").innerText = autumnProfit.toLocaleString();
    document.getElementById("global-waterfall").innerText = waterfallProfit.toLocaleString();
    document.getElementById("global-basement").innerText = basementProfit.toLocaleString();
    document.getElementById("global-trees").innerText = treesProfit.toLocaleString();
    document.getElementById("global-mushrooms").innerText = mushroomsProfit.toLocaleString();
    
    const grand = springProfit + summerProfit + autumnProfit + waterfallProfit + basementProfit + treesProfit + mushroomsProfit;
    document.getElementById("grand-total").innerText = grand.toLocaleString();
    saveToStorage();
}

// ----------------------------- FORM HANDLING (ADD/EDIT/DELETE) -----------------------------

/**
 * Reads the form fields for a given section and returns an entry object.
 * @param {string} prefix - Section prefix (e.g., "spring", "waterfall").
 * @param {string} type - "crop", "tree", or "mushroom".
 * @returns {Object|null} Entry object or null if validation fails.
 */
function getEntryFromForm(prefix, type) {
    const cropSelect = document.getElementById(`${prefix}-crop`);
    const qty = parseInt(document.getElementById(`${prefix}-qty`).value);
    const level = parseInt(document.getElementById(`${prefix}-level`).value);
    const sowDay = parseInt(document.getElementById(`${prefix}-day`).value);
    if (!cropSelect || !cropSelect.value || isNaN(qty) || qty < 1 || isNaN(level) || level < 1 || level > 100 || isNaN(sowDay)) return null;
    
    if (type === "tree") {
        const fieldType = document.getElementById(`${prefix}-field`).value;
        const mature = document.getElementById(`${prefix}-mature`).checked;
        return { cropName: cropSelect.value, quantity: qty, level, fieldType, sowDay, alreadyMature: mature, type: "tree" };
    } else if (type === "mushroom") {
        const harvestSize = document.getElementById(`${prefix}-size`).value;
        const mature = document.getElementById(`${prefix}-mature`).checked;
        return { cropName: cropSelect.value, quantity: qty, level, sowDay, harvestSize, alreadyMature: mature, type: "mushroom" };
    } else { // crop
        let fieldType;
        const fieldSelect = document.getElementById(`${prefix}-field`);
        if (fieldSelect) {
            fieldType = fieldSelect.value;
        } else {
            if (prefix === "waterfall") fieldType = "super";
            else if (prefix === "basement") fieldType = "normal";
            else fieldType = "normal";
        }
        const replant = document.getElementById(`${prefix}-replant`)?.checked || false;
        const cropData = getCropData(cropSelect.value);
        let finalReplant = replant;
        if (cropData && cropData.regrowDays > 0) finalReplant = false;
        return { cropName: cropSelect.value, quantity: qty, level, fieldType, sowDay, replantUntilEnd: finalReplant, type: "crop" };
    }
}

/** Adds a new entry to the specified section's array and refreshes the view. */
function addEntry(sectionId, entriesArray, maxDays, type) {
    const prefix = sectionId.split('-')[0];
    const newEntry = getEntryFromForm(prefix, type);
    if (!newEntry) { alert("Please fill all fields correctly."); return; }
    if (newEntry.sowDay < 1 || newEntry.sowDay > maxDays) { alert(`Sowing day must be between 1 and ${maxDays}`); return; }
    entriesArray.push(newEntry);
    refreshAll();
}

/** Edits an entry: removes the old one and prompts the user to re‑add it with modified values. */
function editEntry(sectionId, index, entriesArray, maxDays, type) {
    const entry = entriesArray[index];
    if (!entry) return;
    const prefix = sectionId.split('-')[0];
    document.getElementById(`${prefix}-crop`).value = entry.cropName;
    document.getElementById(`${prefix}-qty`).value = entry.quantity;
    document.getElementById(`${prefix}-level`).value = entry.level;
    document.getElementById(`${prefix}-day`).value = entry.sowDay;
    if (type === "tree") {
        document.getElementById(`${prefix}-field`).value = entry.fieldType;
        document.getElementById(`${prefix}-mature`).checked = entry.alreadyMature;
    } else if (type === "mushroom") {
        document.getElementById(`${prefix}-size`).value = entry.harvestSize;
        document.getElementById(`${prefix}-mature`).checked = entry.alreadyMature;
    } else {
        const fieldSelect = document.getElementById(`${prefix}-field`);
        if (fieldSelect) fieldSelect.value = entry.fieldType;
        const replantCheck = document.getElementById(`${prefix}-replant`);
        if (replantCheck) replantCheck.checked = entry.replantUntilEnd;
        const cropData = getCropData(entry.cropName);
        if (replantCheck && cropData && cropData.regrowDays > 0) {
            replantCheck.disabled = true;
            replantCheck.checked = false;
        } else if (replantCheck) {
            replantCheck.disabled = false;
        }
    }
    entriesArray.splice(index, 1);
    refreshAll();
    alert(`Editing: ${entry.cropName}. Modify and click "Add" again.`);
}

/** Deletes an entry after confirmation. */
function deleteEntry(sectionId, index, entriesArray) {
    if (confirm("Delete this item?")) { entriesArray.splice(index, 1); refreshAll(); }
}

/** Clears all entries from a specific section. */
function clearSection(sectionId, entriesArray) {
    if (confirm(`Clear all items from ${sectionId}?`)) { entriesArray.length = 0; refreshAll(); }
}

/** Clears all data from all sections (global reset). */
function clearAllData() {
    if (confirm("⚠️ WARNING: This will delete ALL data from ALL sections. Are you sure?")) {
        springEntries = []; summerEntries = []; autumnEntries = [];
        waterfallEntries = []; basementEntries = [];
        treesEntries = []; mushroomsEntries = [];
        refreshAll();
    }
}

// ----------------------------- EVENT DELEGATION & UI SETUP -----------------------------

/** Sets up event listeners for all "Add" and "Clear" buttons,
 *  and delegates edit/delete clicks on dynamically created table buttons. */
function setupEventDelegation() {
    const sections = [
        { id: "spring", entries: springEntries, maxDays: 30, type: "crop" },
        { id: "summer", entries: summerEntries, maxDays: 30, type: "crop" },
        { id: "autumn", entries: autumnEntries, maxDays: 30, type: "crop" },
        { id: "waterfall", entries: waterfallEntries, maxDays: 120, type: "crop" },
        { id: "basement", entries: basementEntries, maxDays: 120, type: "crop" },
        { id: "trees", entries: treesEntries, maxDays: 120, type: "tree" },
        { id: "mushrooms", entries: mushroomsEntries, maxDays: 120, type: "mushroom" }
    ];
    
    sections.forEach(s => {
        const addBtn = document.getElementById(`${s.id}-add-btn`);
        if (addBtn) {
            addBtn.replaceWith(addBtn.cloneNode(true));
            const newBtn = document.getElementById(`${s.id}-add-btn`);
            newBtn.addEventListener("click", () => addEntry(s.id, s.entries, s.maxDays, s.type));
        }
        const clearBtn = document.getElementById(`${s.id}-clear-btn`);
        if (clearBtn) {
            clearBtn.replaceWith(clearBtn.cloneNode(true));
            const newClear = document.getElementById(`${s.id}-clear-btn`);
            newClear.addEventListener("click", () => clearSection(s.id, s.entries));
        }
    });
    
    const globalClear = document.getElementById("global-clear-all");
    if (globalClear) {
        globalClear.replaceWith(globalClear.cloneNode(true));
        const newGlobal = document.getElementById("global-clear-all");
        newGlobal.addEventListener("click", clearAllData);
    }
    
    // Delegate edit/delete clicks (buttons are inside the table, created dynamically)
    document.body.addEventListener("click", (e) => {
        const target = e.target.closest(".edit-btn, .delete-btn");
        if (!target) return;
        const section = target.getAttribute("data-section");
        const index = parseInt(target.getAttribute("data-index"));
        if (isNaN(index)) return;
        const s = sections.find(s => s.id === section);
        if (!s) return;
        if (target.classList.contains("delete-btn")) deleteEntry(section, index, s.entries);
        else if (target.classList.contains("edit-btn")) editEntry(section, index, s.entries, s.maxDays, s.type);
    });
}

/** Populates all dropdown selectors with the correct items based on their section type. */
function populateDropdowns() {
    const cropSeasons = { spring: "spring", summer: "summer", autumn: "fall", waterfall: null, basement: null };
    for (let id of ["spring", "summer", "autumn", "waterfall", "basement"]) {
        const select = document.getElementById(`${id}-crop`);
        if (!select) continue;
        let filterSeason = cropSeasons[id];
        let crops = CROPS_DB.filter(c => c.type === "crop" && (filterSeason === null || c.season === filterSeason)).map(c => c.name);
        select.innerHTML = crops.map(n => `<option value="${n}">${n}</option>`).join("");
    }
    const treesSelect = document.getElementById("trees-crop");
    if (treesSelect) treesSelect.innerHTML = CROPS_DB.filter(c => c.type === "tree").map(c => c.name).map(n => `<option value="${n}">${n}</option>`).join("");
    const mushSelect = document.getElementById("mushrooms-crop");
    if (mushSelect) mushSelect.innerHTML = CROPS_DB.filter(c => c.type === "mushroom").map(c => c.name).map(n => `<option value="${n}">${n}</option>`).join("");
    
    // Disable "Replant after harvest" checkbox for crops that naturally regrow
    const cropSections = ["spring", "summer", "autumn", "waterfall", "basement"];
    cropSections.forEach(id => {
        const select = document.getElementById(`${id}-crop`);
        const checkbox = document.getElementById(`${id}-replant`);
        if (select && checkbox) {
            const update = () => {
                const crop = getCropData(select.value);
                if (crop && crop.regrowDays > 0) {
                    checkbox.disabled = true;
                    checkbox.checked = false;
                } else {
                    checkbox.disabled = false;
                }
            };
            select.removeEventListener("change", update);
            select.addEventListener("change", update);
            update();
        }
    });
}

// ----------------------------- INITIALIZATION -----------------------------
function init() {
    loadFromStorage();
    populateDropdowns();
    setupEventDelegation();
    refreshAll();
}

// Start the application once the DOM is ready.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}