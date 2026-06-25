// ============================================================
// DATABASE MODULE
// ============================================================
var appData = {
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

var COLLECTIONS = {
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

var STORAGE_KEY = 'jayasinghe_erp_local';

async function loadAllData() {
    try {
        var keys = Object.keys(COLLECTIONS);
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            var collectionName = COLLECTIONS[key];

            if (['categories', 'brands', 'leaveBalances', 'budget'].indexOf(key) !== -1) {
                var docRef = db.collection(collectionName).doc(key);
                var doc = await docRef.get();
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
                continue;
            }

            var snapshot = await db.collection(collectionName).get();
            var docs = [];
            snapshot.forEach(function(doc) {
                var data = doc.data();
                data.id = doc.id;
                docs.push(data);
            });
            appData[key] = docs;
        }

        var employees = appData.employees || [];
        if (!appData.leaveBalances) appData.leaveBalances = {};
        for (var e = 0; e < employees.length; e++) {
            var emp = employees[e];
            if (!appData.leaveBalances[emp.id]) {
                appData.leaveBalances[emp.id] = { sick: 10, casual: 5, annual: 12 };
            }
        }

        saveToLocalStorage();
        return true;

    } catch (error) {
        console.warn('Firestore error, using local cache:', error);
        loadFromLocalStorage();
        return false;
    }
}

async function saveAllData() {
    try {
        var keys = Object.keys(COLLECTIONS);
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            var collectionName = COLLECTIONS[key];
            var data = appData[key];

            if (['categories', 'brands', 'leaveBalances', 'budget'].indexOf(key) !== -1) {
                var docRef = db.collection(collectionName).doc(key);
                if (key === 'categories' || key === 'brands') {
                    await docRef.set({ list: data });
                } else {
                    await docRef.set(data);
                }
                continue;
            }

            var snapshot = await db.collection(collectionName).get();
            var batch = db.batch();
            snapshot.forEach(function(doc) { batch.delete(doc.ref); });

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var docId = item.id || generateId();
                if (!item.id) item.id = docId;
                var ref = db.collection(collectionName).doc(docId);
                batch.set(ref, item);
            }
            await batch.commit();
        }

        saveToLocalStorage();
        return true;

    } catch (error) {
        console.error('Firestore save error:', error);
        saveToLocalStorage();
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            var data = JSON.parse(raw);
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    appData[key] = data[key];
                }
            }
        }
    } catch (e) {
        console.warn(e);
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.warn(e);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
window.generateId = generateId;

function getAppData() { return appData; }

function setAppData(data) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            appData[key] = data[key];
        }
    }
}

window.getAppData = getAppData;
window.setAppData = setAppData;
window.loadAllData = loadAllData;
window.saveAllData = saveAllData;

var syncBtn = document.getElementById('syncBtn');
if (syncBtn) {
    syncBtn.addEventListener('click', async function() {
        showToast('Syncing...', 'warning');
        await saveAllData();
        await loadAllData();
        renderAll();
        showToast('Sync complete!');
    });
}
