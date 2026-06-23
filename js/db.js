// ============================================================
// DATABASE MODULE (Firestore)
// ============================================================

// Local cache
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
    settings: { company: 'Jayasinghe Distributors', address: 'Colombo, Sri Lanka', phone: '+94 77 123 4567',
        email: 'info@jayasinghe.lk' },
    leaveBalances: {},
    budget: { monthly: 0, category: {} },
    vouchers: [] // NEW
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
    vouchers: 'vouchers' // NEW
};

// ============================================================
// LOAD DATA FROM FIRESTORE
// ============================================================
async function loadAllData() {
    try {
        const promises = Object.keys(COLLECTIONS).map(async (key) => {
            const collectionName = COLLECTIONS[key];
            
            // categories, brands, leaveBalances, budget - single document
            if (['categories', 'brands', 'leaveBalances', 'budget'].includes(key)) {
                const docRef = db.collection(collectionName).doc(key);
                const doc = await docRef.get();
                if (doc.exists) {
                    if (key === 'categories' || key === 'brands') {
                        appData[key] = doc.data().list || [];
                    } else {
                        appData[key] = doc.data() || {};
                    }
                } else {
                    if (key === 'categories' || key === 'brands') {
                        appData[key] = [];
                    } else {
                        appData[key] = {};
                    }
                }
                return;
            }

            // Other collections
            const snapshot = await db.collection(collectionName).get();
            const docs = [];
            snapshot.forEach(doc => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            appData[key] = docs;
        });

        await Promise.all(promises);
        console.log('✅ Data loaded from Firestore');
        // Auto-migrate leave balances if needed
        await migrateLeaveBalancesIfNeeded();
        return true;
    } catch (error) {
        console.warn('⚠️ Error loading data from Firestore, using local cache:', error);
        loadFromLocalStorage();
        await migrateLeaveBalancesIfNeeded();
        return false;
    }
}

// ============================================================
// SAVE DATA TO FIRESTORE
// ============================================================
async function saveAllData() {
    try {
        const promises = Object.keys(COLLECTIONS).map(async (key) => {
            const collectionName = COLLECTIONS[key];
            const data = appData[key];

            // Single-document collections
            if (['categories', 'brands', 'leaveBalances', 'budget'].includes(key)) {
                const docRef = db.collection(collectionName).doc(key);
                if (key === 'categories' || key === 'brands') {
                    await docRef.set({ list: data });
                } else {
                    await docRef.set(data);
                }
                return;
            }

            // Normal collections
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            data.forEach(item => {
                const docId = item.id || generateId();
                if (!item.id) item.id = docId;
                const docRef = db.collection(collectionName).doc(docId);
                batch.set(docRef, item);
            });
            await batch.commit();
        });

        await Promise.all(promises);
        console.log('✅ Data saved to Firestore');
        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('❌ Error saving to Firestore:', error);
        saveToLocalStorage();
        return false;
    }
}

// ============================================================
// LOCAL STORAGE FALLBACK
// ============================================================
const STORAGE_KEY = 'jayasinghe_erp_local';

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            appData = { ...appData, ...data };
        }
    } catch (e) {
        console.warn('Error loading from localStorage:', e);
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.warn('Error saving to localStorage:', e);
    }
}

// ============================================================
// MIGRATION: Leave Balances for existing employees
// ============================================================
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
    if (changed) {
        console.log('🔄 Migrated leave balances for employees');
        await saveAllData();
    }
}

// ============================================================
// SYNC BUTTON
// ============================================================
document.getElementById('syncBtn')?.addEventListener('click', async () => {
    showToast('🔄 Syncing with Firebase...', 'warning');
    await saveAllData();
    await loadAllData();
    renderAll();
    showToast('✅ Sync complete!');
});

// ============================================================
// GENERATE ID
// ============================================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================================
// EXPORT HELPERS
// ============================================================
function getAppData() { return appData; }
function setAppData(data) { appData = { ...appData, ...data }; }
