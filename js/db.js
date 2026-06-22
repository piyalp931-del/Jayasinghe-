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
        email: 'info@jayasinghe.lk' }
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
    settings: 'settings'
};

// ============================================================
// LOAD DATA FROM FIRESTORE
// ============================================================
async function loadAllData() {
    try {
        const promises = Object.keys(COLLECTIONS).map(async (key) => {
            const collectionName = COLLECTIONS[key];
            const snapshot = await db.collection(collectionName).get();
            const docs = [];
            snapshot.forEach(doc => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            appData[key] = docs;
        });

        await Promise.all(promises);
        console.log('✅ Data loaded from Firestore');
        return true;
    } catch (error) {
        console.warn('⚠️ Error loading data from Firestore, using local cache:', error);
        // Load from localStorage as fallback
        loadFromLocalStorage();
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

            // For simplicity, we'll sync by deleting and re-adding
            // In production, you should use individual doc updates
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();

            // Delete all existing docs
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Add new docs
            data.forEach(item => {
                const docRef = db.collection(collectionName).doc();
                batch.set(docRef, item);
            });

            await batch.commit();
        });

        await Promise.all(promises);
        console.log('✅ Data saved to Firestore');
        saveToLocalStorage(); // Cache locally
        return true;
    } catch (error) {
        console.error('❌ Error saving to Firestore:', error);
        saveToLocalStorage(); // Save locally as fallback
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
