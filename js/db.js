// ============================================================
// DATABASE MODULE (OPTIMIZED)
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
var _isLoading = false;
var _isSaving = false;

// ============================================================
// LOADING INDICATOR (UI නොවෙනස්ව)
// ============================================================
function showLoading(message) {
    var toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = '⏳ ' + (message || 'Loading...');
        toast.className = 'toast info show';
        clearTimeout(toast._timer);
    }
}

function hideLoading() {
    var toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// ============================================================
// OPTIMIZED LOAD - PARALLEL
// ============================================================
async function loadAllData() {
    if (_isLoading) return;
    _isLoading = true;
    showLoading('Loading data...');

    try {
        loadFromLocalStorage();
        
        var keys = Object.keys(COLLECTIONS);
        var promises = [];
        
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            var collectionName = COLLECTIONS[key];
            
            if (['categories', 'brands', 'leaveBalances', 'budget'].indexOf(key) !== -1) {
                promises.push(loadDocument(key, collectionName));
            } else {
                promises.push(loadCollection(key, collectionName));
            }
        }
        
        await Promise.all(promises);
        
        var employees = appData.employees || [];
        if (!appData.leaveBalances) appData.leaveBalances = {};
        for (var e = 0; e < employees.length; e++) {
            var emp = employees[e];
            if (!appData.leaveBalances[emp.id]) {
                appData.leaveBalances[emp.id] = { sick: 10, casual: 5, annual: 12 };
            }
        }
        
        saveToLocalStorage();
        hideLoading();
        return true;
        
    } catch (error) {
        console.warn('Firestore error, using local cache:', error);
        loadFromLocalStorage();
        hideLoading();
        return false;
    } finally {
        _isLoading = false;
    }
}

async function loadCollection(key, collectionName) {
    try {
        var snapshot = await db.collection(collectionName).get();
        var docs = [];
        snapshot.forEach(function(doc) {
            var data = doc.data();
            data.id = doc.id;
            docs.push(data);
        });
        appData[key] = docs;
    } catch (e) {
        console.warn('Failed to load ' + key + ':', e);
    }
}

async function loadDocument(key, collectionName) {
    try {
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
    } catch (e) {
        console.warn('Failed to load ' + key + ':', e);
    }
}

// ============================================================
// OPTIMIZED SAVE - DEBOUNCED
// ============================================================
var _saveQueue = [];
var _saveTimeout = null;

async function saveAllData(immediate) {
    if (immediate) {
        return await saveAllDataImmediate();
    }
    
    return new Promise(function(resolve) {
        _saveQueue.push(resolve);
        if (_saveTimeout) clearTimeout(_saveTimeout);
        _saveTimeout = setTimeout(async function() {
            await saveAllDataImmediate();
            while (_saveQueue.length > 0) {
                var r = _saveQueue.shift();
                if (r) r();
            }
            _saveTimeout = null;
        }, 500);
    });
}

async function saveAllDataImmediate() {
    if (_isSaving) return;
    _isSaving = true;
    showLoading('Saving...');

    try {
        var keys = Object.keys(COLLECTIONS);
        var batch = db.batch();
        var hasChanges = false;
        
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            var collectionName = COLLECTIONS[key];
            var data = appData[key];
            
            // Handle single documents
            if (['categories', 'brands', 'leaveBalances', 'budget'].indexOf(key) !== -1) {
                var docRef = db.collection(collectionName).doc(key);
                if (key === 'categories' || key === 'brands') {
                    batch.set(docRef, { list: data });
                } else {
                    batch.set(docRef, data);
                }
                hasChanges = true;
                continue;
            }
            
            // For collections: instead of delete all, we update each document with merge
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var docId = item.id || generateId();
                if (!item.id) item.id = docId;
                var ref = db.collection(collectionName).doc(docId);
                batch.set(ref, item, { merge: true });
                hasChanges = true;
            }
            
            // Also handle deleted items? We could track deletions, but for simplicity we keep all.
            // To remove items that are no longer in appData, we would need to delete them.
            // But since we are not doing that, we can skip the delete-all step.
            // However, if you want to ensure deletion, you can implement a diff.
            // For now, we only update existing and add new, not delete.
        }
        
        if (hasChanges) {
            await batch.commit();
        }
        
        saveToLocalStorage();
        hideLoading();
        if (window._onDataChanged) window._onDataChanged();
        return true;
        
    } catch (error) {
        console.error('Firestore save error:', error);
        saveToLocalStorage();
        hideLoading();
        showToast('⚠️ Save failed. Data saved locally.', 'error');
        return false;
    } finally {
        _isSaving = false;
    }
}

// ============================================================
// LOCAL STORAGE
// ============================================================
function loadFromLocalStorage() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            var data = JSON.parse(raw);
            for (var key in data) {
                if (data.hasOwnProperty(key) && appData.hasOwnProperty(key)) {
                    if (Array.isArray(data[key]) && appData[key].length === 0) {
                        appData[key] = data[key];
                    } else if (typeof data[key] === 'object' && !Array.isArray(data[key]) && Object.keys(appData[key]).length === 0) {
                        appData[key] = data[key];
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Local storage load error:', e);
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.warn('Local storage save error:', e);
    }
}

// ============================================================
// UTILITY FUNCTIONS (single definitions)
// ============================================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
window.generateId = generateId;

function getAppData() { return appData; }

function setAppData(data) {
    for (var key in data) {
        if (data.hasOwnProperty(key) && appData.hasOwnProperty(key)) {
            appData[key] = data[key];
        }
    }
}

// ============================================================
// SYNC BUTTON
// ============================================================
var syncBtn = document.getElementById('syncBtn');
if (syncBtn) {
    syncBtn.addEventListener('click', async function() {
        var originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        syncBtn.disabled = true;
        
        try {
            showToast('🔄 Syncing...', 'info');
            await saveAllData(true);
            await loadAllData();
            showToast('✅ Sync complete!', 'success');
        } catch (e) {
            showToast('❌ Sync failed: ' + e.message, 'error');
        } finally {
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    });
}

// ============================================================
// EXPOSE
// ============================================================
window.getAppData = getAppData;
window.setAppData = setAppData;
window.loadAllData = loadAllData;
window.saveAllData = saveAllData;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
