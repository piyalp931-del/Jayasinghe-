// ============================================================
// DATABASE MODULE (Fixed)
// ============================================================

let appData = {
    items: [],
    categories: ['Cosmetics', 'Electronics', 'Food', 'Beverages', 'Clothing'],
    brands: ['Nike', 'Apple', 'Samsung', 'Adidas', 'Pepsi'],
    employees: [],
    deliveries: [],
    attendance: [],
    leaves: [],
    payroll: [],
    customers: [],
    finance: [],
    vehicles: [],
    notifications: [],
    salesData: [],
    settings: { company: 'Jayasinghe Distributors', address: 'Colombo, Sri Lanka', phone: '+94 77 123 4567', email: 'info@jayasinghe.lk' },
    leaveBalances: {},
    budget: { monthly: 0, category: {} },
    vouchers: [],
    suppliers: [],
    purchaseOrders: [],
    salesOrders: [],
    logs: []
};

const COLLECTIONS = {
    items: 'items',
    categories: 'categories',
    brands: 'brands',
    employees: 'employees',
    deliveries: 'deliveries',
    attendance: 'attendance',
    leaves: 'leaves',
    payroll: 'payroll',
    customers: 'customers',
    finance: 'finance',
    vehicles: 'vehicles',
    notifications: 'notifications',
    salesData: 'salesData',
    settings: 'settings',
    leaveBalances: 'leaveBalances',
    budget: 'budget',
    vouchers: 'vouchers',
    suppliers: 'suppliers',
    purchaseOrders: 'purchaseOrders',
    salesOrders: 'salesOrders',
    logs: 'logs'
};

// -------------------- LOAD --------------------
async function loadAllData() {
    try {
        const promises = Object.keys(COLLECTIONS).map(async (key) => {
            const collectionName = COLLECTIONS[key];
            if (['categories', 'brands', 'leaveBalances', 'budget'].includes(key)) {
                const docRef = db.collection(collectionName).doc(key);
                const doc = await docRef.get();
                if (doc.exists) {
                    if (key === 'categories' || key === 'brands') appData[key] = doc.data().list || [];
                    else appData[key] = doc.data() || {};
                } else {
                    if (key === 'categories' || key === 'brands') appData[key] = [];
                    else appData[key] = {};
                }
                return;
            }
            const snapshot = await db.collection(collectionName).get();
            const docs = [];
            snapshot.forEach(doc => { docs.push({ id: doc.id, ...doc.data() }); });
            appData[key] = docs;
        });
        await Promise.all(promises);
        await migrateLeaveBalancesIfNeeded();
        return true;
    } catch (error) {
        console.warn('⚠️ Firestore error, using local cache:', error);
        loadFromLocalStorage();
        await migrateLeaveBalancesIfNeeded();
        return false;
    }
}

// -------------------- SAVE --------------------
async function saveAllData() {
    try {
        const promises = Object.keys(COLLECTIONS).map(async (key) => {
            const collectionName = COLLECTIONS[key];
            const data = appData[key];
            if (['categories', 'brands', 'leaveBalances', 'budget'].includes(key)) {
                const docRef = db.collection(collectionName).doc(key);
                if (key === 'categories' || key === 'brands') await docRef.set({ list: data });
                else await docRef.set(data);
                return;
            }
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();
            snapshot.forEach(doc => { batch.delete(doc.ref); });
            data.forEach(item => {
                const docId = item.id || generateId();
                if (!item.id) item.id = docId;
                const docRef = db.collection(collectionName).doc(docId);
                batch.set(docRef, item);
            });
            await batch.commit();
        });
        await Promise.all(promises);
        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('❌ Firestore save error:', error);
        saveToLocalStorage();
        return false;
    }
}

// -------------------- LOCAL STORAGE --------------------
const STORAGE_KEY = 'jayasinghe_erp_local';
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            appData = { ...appData, ...data };
        }
    } catch (e) { console.warn(e); }
}
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) { console.warn(e); }
}

// -------------------- MIGRATION --------------------
async function migrateLeaveBalancesIfNeeded() {
    const employees = appData.employees || [];
    if (!appData.leaveBalances) appData.leaveBalances = {};
    let changed = false;
    employees.forEach(emp => {
        if (!appData.leaveBalances[emp.id]) {
            appData.leaveBalances[emp.id] = { sick: 10, casual: 5, annual: 12 };
            changed = true;
        }
    });
    if (changed) await saveAllData();
}

// -------------------- HELPERS --------------------
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
window.generateId = generateId;

function getAppData() { return appData; }
function setAppData(data) { appData = { ...appData, ...data }; }

window.getAppData = getAppData;
window.setAppData = setAppData;
window.loadAllData = loadAllData;
window.saveAllData = saveAllData;

// -------------------- SYNC BUTTON --------------------
document.getElementById('syncBtn')?.addEventListener('click', async () => {
    showToast('🔄 Syncing...', 'warning');
    await saveAllData();
    await loadAllData();
    renderAll();
    showToast('✅ Sync complete!');
});
