// script.js - Harvest Moon DS Complete Profit Planner (fixed add buttons)

const CROPS_DB = [
    // Crops
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
    // Trees
    { name: "Banana", type: "tree", basePrice: 300, growthDays: 40, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Orange", type: "tree", basePrice: 200, growthDays: 43, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Peach", type: "tree", basePrice: 250, growthDays: 58, regrowDays: 3, season: "summer", productionSeason: "summer" },
    { name: "Apple", type: "tree", basePrice: 100, growthDays: 52, regrowDays: 3, season: "fall", productionSeason: "fall" },
    { name: "Grape", type: "tree", basePrice: 200, growthDays: 58, regrowDays: 3, season: "fall", productionSeason: "fall" },
    // Mushrooms
    { name: "Shiitake", type: "mushroom", basePriceSmall: 50, basePriceMedium: 80, basePriceLarge: 120,
      initialDays: 35, smallRegrow: 3, mediumRegrow: 3, largeRegrow: 3 },
    { name: "Toadstool", type: "mushroom", basePriceSmall: 100, basePriceMedium: 130, basePriceLarge: 160,
      initialDays: 42, smallRegrow: 3, mediumRegrow: 3, largeRegrow: 4 },
    { name: "Matsutake", type: "mushroom", basePriceSmall: 350, basePriceMedium: 500, basePriceLarge: 800,
      initialDays: 59, smallRegrow: 3, mediumRegrow: 5, largeRegrow: 6 }
];

function getCropData(cropName) {
    return CROPS_DB.find(c => c.name === cropName);
}

const FIELD_MOD = { slow: 1, normal: 0, fast: -1, super: -2 };
function cropValue(basePrice, level) { return basePrice * level * level; }

// State
let springEntries = [], summerEntries = [], autumnEntries = [], waterfallEntries = [], basementEntries = [];
let treesEntries = [], mushroomsEntries = [];

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
function saveToStorage() {
    localStorage.setItem("hmds_complete_planner", JSON.stringify({
        spring: springEntries, summer: summerEntries, autumn: autumnEntries,
        waterfall: waterfallEntries, basement: basementEntries,
        trees: treesEntries, mushrooms: mushroomsEntries
    }));
}

function getSeasonClass(day) {
    if (day >= 1 && day <= 30) return "season-spring";
    if (day >= 31 && day <= 60) return "season-summer";
    if (day >= 61 && day <= 90) return "season-autumn";
    return "season-winter";
}

// Simulation functions
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
        let harvestDay = currentSow + maturity;
        if (harvestDay > maxDays) break;
        timeline[harvestDay].push(isFirstHarvest ? "harvest" : "regrow");
        totalProfit += profitPerHarvest;
        if (replantFlag) {
            currentSow = harvestDay;
            if (currentSow <= maxDays) timeline[currentSow].push("sow");
            isFirstHarvest = true;
        } else {
            if (regrow > 0) {
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

// Render function
function renderSection(sectionId, entries, maxDays, sectionName, simulationFunc) {
    const tbody = document.getElementById(`${sectionId}-tbody`);
    const thead = document.getElementById(`${sectionId}-header`);
    if (!tbody) return 0;
    
    let headerHtml = `<tr><th>Item (Details)</th>`;
    for (let d = 1; d <= maxDays; d++) {
        let thClass = "";
        if (maxDays === 120) thClass = ` class="${getSeasonClass(d)}"`;
        headerHtml += `<th${thClass}>${d}</th>`;
    }
    headerHtml += `<th>Actions</th></tr>`;
    thead.innerHTML = headerHtml;
    
    const table = document.getElementById(`${sectionId}-table`);
    if (table) {
        if (maxDays === 30) {
            if (sectionId === "spring") table.classList.add("spring-bg");
            else if (sectionId === "summer") table.classList.add("summer-bg");
            else if (sectionId === "autumn") table.classList.add("autumn-bg");
            else table.classList.remove("spring-bg", "summer-bg", "autumn-bg");
        } else {
            table.classList.remove("spring-bg", "summer-bg", "autumn-bg");
        }
    }
    
    let rowsHtml = "";
    let totalProfit = 0;
    entries.forEach((entry, idx) => {
        const { timelineEvents, totalProfit: profit } = simulationFunc(entry, maxDays);
        totalProfit += profit;
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
        let row = `<tr><td style="text-align:left;">${infoText}</td>`;
        for (let d = 1; d <= maxDays; d++) {
            const events = timelineEvents[d] || [];
            let cellClass = "";
            if (maxDays === 120) cellClass = getSeasonClass(d);
            if (events.length === 0) {
                row += `<td class="day-empty ${cellClass}">·</td>`;
            } else if (events.length === 1) {
                const ev = events[0];
                if (ev === "sow") row += `<td class="day-sowing ${cellClass}">🌱</td>`;
                else if (ev === "harvest") row += `<td class="day-harvest ${cellClass}">🍅</td>`;
                else if (ev === "regrow") row += `<td class="day-regrow ${cellClass}">🔄</td>`;
                else row += `<td class="day-empty ${cellClass}">·</td>`;
            } else {
                if (events.includes("harvest") && events.includes("sow"))
                    row += `<td class="multi-event harvest-sow ${cellClass}"><span class="harvest-icon">🍅</span><span class="sow-icon">🌱</span></td>`;
                else if (events.includes("regrow") && events.includes("sow"))
                    row += `<td class="multi-event regrow-sow ${cellClass}"><span class="regrow-icon">🔄</span><span class="sow-icon">🌱</span></td>`;
                else row += `<td class="day-empty ${cellClass}">${events.join(',')}</td>`;
            }
        }
        row += `<td class="action-btns">
                    <button class="edit-btn" data-section="${sectionId}" data-index="${idx}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-section="${sectionId}" data-index="${idx}"><i class="fas fa-trash-alt"></i></button>
                <\/td><\/tr>`;
        rowsHtml += row;
    });
    tbody.innerHTML = rowsHtml;
    const summarySpan = document.getElementById(`${sectionId}-summary`);
    if (summarySpan) summarySpan.innerHTML = `💰 ${sectionName} total profit: ${totalProfit.toLocaleString()} G`;
    return totalProfit;
}

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

// Fixed getEntryFromForm: handles missing field select
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
            // For waterfall and basement sections, set fixed soil type
            if (prefix === "waterfall") fieldType = "super";
            else if (prefix === "basement") fieldType = "normal";
            else fieldType = "normal"; // fallback
        }
        const replant = document.getElementById(`${prefix}-replant`)?.checked || false;
        const cropData = getCropData(cropSelect.value);
        let finalReplant = replant;
        if (cropData && cropData.regrowDays > 0) finalReplant = false;
        return { cropName: cropSelect.value, quantity: qty, level, fieldType, sowDay, replantUntilEnd: finalReplant, type: "crop" };
    }
}

function addEntry(sectionId, entriesArray, maxDays, type) {
    const prefix = sectionId.split('-')[0];
    const newEntry = getEntryFromForm(prefix, type);
    if (!newEntry) { alert("Please fill all fields correctly."); return; }
    if (newEntry.sowDay < 1 || newEntry.sowDay > maxDays) { alert(`Sowing day must be between 1 and ${maxDays}`); return; }
    entriesArray.push(newEntry);
    refreshAll();
}

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

function deleteEntry(sectionId, index, entriesArray) {
    if (confirm("Delete this item?")) { entriesArray.splice(index, 1); refreshAll(); }
}

function clearSection(sectionId, entriesArray) {
    if (confirm(`Clear all items from ${sectionId}?`)) { entriesArray.length = 0; refreshAll(); }
}

function clearAllData() {
    if (confirm("⚠️ WARNING: This will delete ALL data from ALL sections. Are you sure?")) {
        springEntries = []; summerEntries = []; autumnEntries = [];
        waterfallEntries = []; basementEntries = [];
        treesEntries = []; mushroomsEntries = [];
        refreshAll();
    }
}

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
            // Remove any existing listener to avoid duplicates
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
    // Delegation for edit/delete buttons (they are dynamically created)
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
    // Disable replant for regrow crops
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

function init() {
    loadFromStorage();
    populateDropdowns();
    setupEventDelegation();
    refreshAll();
}

// Ensure DOM is fully loaded before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}