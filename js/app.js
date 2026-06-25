
// ============================================================
// MAIN APP MODULE (Conflict-Free Fix)
// ============================================================

function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 3000);
}
window.showToast = showToast;

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
window.generateId = generateId;

function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowISO() { return new Date().toISOString(); }
window.todayStr = todayStr;
window.nowISO = nowISO;

// ============================================================
// DATA RELOAD HELPER (used by patched render functions)
// ============================================================
async function ensureDataLoaded() {
    var data = getAppData();
    // If any main array is empty, reload from Firestore
    if (data.items.length === 0 && data.employees.length === 0) {
        console.log('Data empty, reloading from Firestore...');
        await loadAllData();
        console.log('Data reloaded:', getAppData());
        // Also repopulate dropdowns
        populateItemDropdowns();
        populateDeliveryDropdowns();
    }
    return getAppData();
}
window.ensureDataLoaded = ensureDataLoaded;

// ============================================================
// PATCH RENDER FUNCTIONS TO ENSURE DATA IS LOADED
// ============================================================
// Save original render functions from ui.js (they are global)
var origRenderEmployees = window.renderEmployees || function() {};
var origRenderInventory = window.renderInventory || function() {};
var origRenderCustomers = window.renderCustomers || function() {};
var origRenderAttendance = window.renderAttendance || function() {};
var origRenderLeave = window.renderLeave || function() {};
var origRenderPayroll = window.renderPayroll || function() {};
var origRenderPurchasing = window.renderPurchasing || function() {};
var origRenderSales = window.renderSales || function() {};
var origRenderDeliveries = window.renderDeliveries || function() {};
var origRenderFinance = window.renderFinance || function() {};
var origRenderVouchers = window.renderVouchers || function() {};
var origRenderFleet = window.renderFleet || function() {};
var origRenderReports = window.renderReports || function() {};
var origRenderProducts = window.renderProducts || function() {};
var origRenderAdministration = window.renderAdministration || function() {};

// Define patched versions
window.renderEmployees = async function() {
    await ensureDataLoaded();
    if (typeof origRenderEmployees === 'function') origRenderEmployees();
};
window.renderInventory = async function() {
    await ensureDataLoaded();
    if (typeof origRenderInventory === 'function') origRenderInventory();
};
window.renderCustomers = async function() {
    await ensureDataLoaded();
    if (typeof origRenderCustomers === 'function') origRenderCustomers();
};
window.renderAttendance = async function() {
    await ensureDataLoaded();
    if (typeof origRenderAttendance === 'function') origRenderAttendance();
};
window.renderLeave = async function() {
    await ensureDataLoaded();
    if (typeof origRenderLeave === 'function') origRenderLeave();
};
window.renderPayroll = async function() {
    await ensureDataLoaded();
    if (typeof origRenderPayroll === 'function') origRenderPayroll();
};
window.renderPurchasing = async function() {
    await ensureDataLoaded();
    if (typeof origRenderPurchasing === 'function') origRenderPurchasing();
};
window.renderSales = async function() {
    await ensureDataLoaded();
    if (typeof origRenderSales === 'function') origRenderSales();
};
window.renderDeliveries = async function() {
    await ensureDataLoaded();
    if (typeof origRenderDeliveries === 'function') origRenderDeliveries();
};
window.renderFinance = async function() {
    await ensureDataLoaded();
    if (typeof origRenderFinance === 'function') origRenderFinance();
};
window.renderVouchers = async function() {
    await ensureDataLoaded();
    if (typeof origRenderVouchers === 'function') origRenderVouchers();
};
window.renderFleet = async function() {
    await ensureDataLoaded();
    if (typeof origRenderFleet === 'function') origRenderFleet();
};
window.renderReports = async function() {
    await ensureDataLoaded();
    if (typeof origRenderReports === 'function') origRenderReports();
};
window.renderProducts = async function() {
    await ensureDataLoaded();
    if (typeof origRenderProducts === 'function') origRenderProducts();
};
window.renderAdministration = async function() {
    // No data needed for logs
    if (typeof origRenderAdministration === 'function') origRenderAdministration();
};

// Also patch renderDashboard (it already shows stats, but we ensure data)
var origRenderDashboard = window.renderDashboard || function() {};
window.renderDashboard = async function() {
    await ensureDataLoaded();
    if (typeof origRenderDashboard === 'function') origRenderDashboard();
};

// Patch switchPanel to ensure data before switching
var origSwitchPanel = window.switchPanel || function() {};
window.switchPanel = async function(id) {
    await ensureDataLoaded();
    if (typeof origSwitchPanel === 'function') origSwitchPanel(id);
};

// ============================================================
// POPULATE DROPDOWNS (already defined in ui.js, but keep local copy)
// ============================================================
function populateItemDropdowns() {
    var data = getAppData();
    var items = data.items || [];
    var categories = data.categories || [];
    var brands = data.brands || [];

    var catSelect = document.getElementById('itemCategory');
    if (catSelect) {
        var val = catSelect.value;
        catSelect.innerHTML = '<option value="">Select...</option>';
        for (var i = 0; i < categories.length; i++) {
            catSelect.innerHTML += '<option value="' + categories[i] + '">' + categories[i] + '</option>';
        }
        if (val && catSelect.querySelector('option[value="' + val + '"]')) catSelect.value = val;
    }

    var brandSelect = document.getElementById('itemBrand');
    if (brandSelect) {
        var val2 = brandSelect.value;
        brandSelect.innerHTML = '<option value="">Select...</option>';
        for (var j = 0; j < brands.length; j++) {
            brandSelect.innerHTML += '<option value="' + brands[j] + '">' + brands[j] + '</option>';
        }
        if (val2 && brandSelect.querySelector('option[value="' + val2 + '"]')) brandSelect.value = val2;
    }

    var cartSelect = document.getElementById('salesCartItemSelect');
    if (cartSelect) {
        var val3 = cartSelect.value;
        cartSelect.innerHTML = '<option value="">Select Item</option>';
        for (var k = 0; k < items.length; k++) {
            if (items[k].status === 'inactive') continue;
            cartSelect.innerHTML += '<option value="' + items[k].id + '">' + escapeHtml(items[k].name) + ' (' + (items[k].qty||0) + ' avail) - LKR ' + formatCurrency(items[k].price||0) + '</option>';
        }
        if (val3 && cartSelect.querySelector('option[value="' + val3 + '"]')) cartSelect.value = val3;
    }

    var delSelect = document.getElementById('delCartItemSelect');
    if (delSelect) {
        var val4 = delSelect.value;
        delSelect.innerHTML = '<option value="">Select Item</option>';
        for (var m = 0; m < items.length; m++) {
            if (items[m].status === 'inactive') continue;
            delSelect.innerHTML += '<option value="' + items[m].id + '">' + escapeHtml(items[m].name) + ' (' + (items[m].qty||0) + ' avail)</option>';
        }
        if (val4 && delSelect.querySelector('option[value="' + val4 + '"]')) delSelect.value = val4;
    }

    var poSelect = document.getElementById('poItemSelect');
    if (poSelect) {
        var val5 = poSelect.value;
        poSelect.innerHTML = '<option value="">Select</option>';
        for (var n = 0; n < items.length; n++) {
            poSelect.innerHTML += '<option value="' + items[n].id + '">' + escapeHtml(items[n].name) + '</option>';
        }
        if (val5 && poSelect.querySelector('option[value="' + val5 + '"]')) poSelect.value = val5;
    }
}
window.populateItemDropdowns = populateItemDropdowns;

function populateDeliveryDropdowns() {
    var data = getAppData();
    var employees = data.employees || [];
    var vehicles = data.vehicles || [];
    var customers = data.customers || [];

    var custSelect = document.getElementById('delCustomerSelect');
    if (custSelect) {
        var val = custSelect.value;
        custSelect.innerHTML = '<option value="">-- Select --</option>';
        for (var i = 0; i < customers.length; i++) {
            custSelect.innerHTML += '<option value="' + customers[i].id + '">' + escapeHtml(customers[i].name) + '</option>';
        }
        if (val && custSelect.querySelector('option[value="' + val + '"]')) custSelect.value = val;
    }

    var driverSelect = document.getElementById('delDriverSelect');
    if (driverSelect) {
        var val2 = driverSelect.value;
        driverSelect.innerHTML = '<option value="">-- Select --</option>';
        var drivers = [];
        for (var j = 0; j < employees.length; j++) {
            if (employees[j].department === 'Delivery' || (employees[j].designation && employees[j].designation.toLowerCase().indexOf('driver') !== -1)) {
                drivers.push(employees[j]);
            }
        }
        for (var k = 0; k < drivers.length; k++) {
            driverSelect.innerHTML += '<option value="' + drivers[k].id + '">' + escapeHtml(drivers[k].name) + '</option>';
        }
        if (val2 && driverSelect.querySelector('option[value="' + val2 + '"]')) driverSelect.value = val2;
    }

    var vehicleSelect = document.getElementById('delVehicleSelect');
    if (vehicleSelect) {
        var val3 = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="">-- Select --</option>';
        for (var m = 0; m < vehicles.length; m++) {
            vehicleSelect.innerHTML += '<option value="' + vehicles[m].id + '">' + escapeHtml(vehicles[m].vehicleNo) + '</option>';
        }
        if (val3 && vehicleSelect.querySelector('option[value="' + val3 + '"]')) vehicleSelect.value = val3;
    }
}
window.populateDeliveryDropdowns = populateDeliveryDropdowns;

// ============================================================
// RENDER ALL (forces reload and re-render)
// ============================================================
function renderAll() {
    var active = document.querySelector('.panel.active');
    if (active) switchPanel(active.id.replace('panel-', ''));
    else switchPanel('dashboard');
    renderSidebar();
}
window.renderAll = renderAll;

// ============================================================
// PROFILE MODAL
// ============================================================
function openProfileModal() {
    var modal = document.getElementById('profileModal');
    if (!modal) return;
    var user = getCurrentUser();
    if (!user) { showToast('Please login.', 'error'); return; }
    var data = getAppData();
    var emp = null;
    for (var i = 0; i < data.employees.length; i++) {
        if (data.employees[i].id === user.uid || data.employees[i].email === user.email) {
            emp = data.employees[i];
            break;
        }
    }
    document.getElementById('profileName').textContent = emp ? emp.name : (user.name || user.email);
    document.getElementById('profileRole').textContent = emp ? emp.department : (user.role || 'Employee');
    var details = document.getElementById('profileDetails');
    if (details) {
        details.innerHTML =
            '<div><strong>Email:</strong> ' + (emp ? emp.email : user.email) + '</div>' +
            '<div><strong>NIC:</strong> ' + (emp ? emp.nic : '—') + '</div>' +
            '<div><strong>Contact:</strong> ' + (emp ? emp.contact : '—') + '</div>' +
            '<div><strong>Department:</strong> ' + (emp ? emp.department : '—') + '</div>' +
            '<div><strong>Designation:</strong> ' + (emp ? emp.designation : '—') + '</div>' +
            '<div><strong>Joined:</strong> ' + (emp && emp.joinedDate ? formatDate(emp.joinedDate) : '—') + '</div>' +
            '<div><strong>Status:</strong> ' + (emp ? emp.status : 'active') + '</div>';
    }
    var stats = document.getElementById('profileStats');
    if (stats) {
        var att = [], leaves = [], payroll = [];
        for (var j = 0; j < (data.attendance || []).length; j++) {
            if (data.attendance[j].employeeId === user.uid) att.push(data.attendance[j]);
        }
        for (var k = 0; k < (data.leaves || []).length; k++) {
            if (data.leaves[k].employeeId === user.uid) leaves.push(data.leaves[k]);
        }
        for (var m = 0; m < (data.payroll || []).length; m++) {
            if (data.payroll[m].employeeId === user.uid) payroll.push(data.payroll[m]);
        }
        stats.innerHTML =
            '<div><strong>' + att.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Days Present</span></div>' +
            '<div><strong>' + leaves.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Leave Requests</span></div>' +
            '<div><strong>' + payroll.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Payroll Records</span></div>' +
            '<div><strong>' + (emp && emp.salary ? 'LKR ' + formatCurrency(emp.salary) : '—') + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Salary</span></div>';
    }
    modal.classList.add('open');
}
window.openProfileModal = openProfileModal;

// ============================================================
// DARK MODE / LANGUAGE
// ============================================================
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    var icon = document.getElementById('darkModeToggle') ? document.getElementById('darkModeToggle').querySelector('i') : null;
    if (icon) icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

var currentLang = 'en';
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'si' : 'en';
    document.getElementById('langToggle').textContent = currentLang === 'en' ? '🇱🇰 SI' : '🇺🇸 EN';
    renderSidebar();
    var active = document.querySelector('.panel.active');
    if (active) switchPanel(active.id.replace('panel-', ''));
    showToast(currentLang === 'en' ? '🌐 English' : '🌐 සිංහල');
}

// ============================================================
// BARCODE SCANNER
// ============================================================
var html5QrCode = null;
function openScanner() {
    var container = document.getElementById('scannerContainer');
    var reader = document.getElementById('scannerReader');
    if (!container || !reader) return;
    container.style.display = 'block';
    if (html5QrCode) { try { html5QrCode.stop(); } catch(e) {} html5QrCode = null; }
    html5QrCode = new Html5Qrcode("scannerReader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 150 } },
        function(decodedText) {
            document.getElementById('itemBarcode').value = decodedText;
            showToast('Scanned: ' + decodedText);
            closeScanner();
        },
        function() {}
    ).catch(function(err) { showToast('Camera error: ' + err.message, 'error'); });
}
function closeScanner() {
    var container = document.getElementById('scannerContainer');
    if (container) container.style.display = 'none';
    if (html5QrCode) { try { html5QrCode.stop(); } catch(e) {} html5QrCode = null; }
}
window.openScanner = openScanner;
window.closeScanner = closeScanner;

// ============================================================
// INIT – sets up all event listeners
// ============================================================
function init() {
    console.log('Initializing ERP...');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        var icon = document.getElementById('darkModeToggle') ? document.getElementById('darkModeToggle').querySelector('i') : null;
        if (icon) icon.className = 'fas fa-sun';
    }

    // Sidebar toggle
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    var sidebarClose = document.getElementById('sidebarClose');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() { sidebar.classList.toggle('open'); });
    }
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() { sidebar.classList.remove('open'); });
    }
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Dark mode & language
    var darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) darkToggle.addEventListener('click', toggleDarkMode);
    var langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);

    // Clear login
    var clearLoginBtn = document.getElementById('clearLoginBtn');
    if (clearLoginBtn) {
        clearLoginBtn.addEventListener('click', function() {
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginError').style.display = 'none';
            showToast('Cleared.');
        });
    }

    // Add Employee Button
    var addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', function() {
            if (!canManage('employees')) { showToast('No permission.', 'error'); return; }
            document.getElementById('empEditId').value = '';
            document.getElementById('empName').value = '';
            document.getElementById('empNIC').value = '';
            document.getElementById('empDept').value = 'Admin';
            document.getElementById('empDesignation').value = '';
            document.getElementById('empContact').value = '';
            document.getElementById('empEmergency').value = '';
            document.getElementById('empAddress').value = '';
            document.getElementById('empJoined').value = todayStr();
            document.getElementById('empSalary').value = '';
            document.getElementById('empEpf').value = '';
            document.getElementById('empUsername').value = '';
            document.getElementById('empPassword').value = '';
            document.getElementById('empStatus').value = 'active';
            document.getElementById('employeeModalTitle').textContent = '👤 Add Employee';
            document.getElementById('employeeModal').classList.add('open');
        });
    }

    var empModalClose = document.getElementById('empModalClose');
    if (empModalClose) {
        empModalClose.addEventListener('click', function() {
            document.getElementById('employeeModal').classList.remove('open');
        });
    }
    var empModal = document.getElementById('employeeModal');
    if (empModal) {
        empModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
        });
    }

    var empSaveBtn = document.getElementById('empSaveBtn');
    if (empSaveBtn) {
        empSaveBtn.addEventListener('click', async function() {
            if (!canManage('employees')) { showToast('No permission.', 'error'); return; }
            var id = document.getElementById('empEditId').value;
            var name = document.getElementById('empName').value.trim();
            var nic = document.getElementById('empNIC').value.trim();
            var department = document.getElementById('empDept').value;
            var designation = document.getElementById('empDesignation').value.trim();
            var contact = document.getElementById('empContact').value.trim();
            var emergency = document.getElementById('empEmergency').value.trim();
            var address = document.getElementById('empAddress').value.trim();
            var joinedDate = document.getElementById('empJoined').value;
            var salary = parseFloat(document.getElementById('empSalary').value) || 0;
            var epf = document.getElementById('empEpf').value.trim();
            var email = document.getElementById('empUsername').value.trim();
            var password = document.getElementById('empPassword').value;
            var status = document.getElementById('empStatus').value;

            if (!name) { showToast('Enter name.', 'error'); return; }
            if (!email) { showToast('Enter email.', 'error'); return; }

            var data = getAppData();
            if (!data.employees) data.employees = [];

            if (id) {
                var idx = -1;
                for (var i = 0; i < data.employees.length; i++) {
                    if (data.employees[i].id === id) { idx = i; break; }
                }
                if (idx > -1) {
                    data.employees[idx].name = name;
                    data.employees[idx].nic = nic;
                    data.employees[idx].department = department;
                    data.employees[idx].designation = designation;
                    data.employees[idx].contact = contact;
                    data.employees[idx].emergency = emergency;
                    data.employees[idx].address = address;
                    data.employees[idx].joinedDate = joinedDate;
                    data.employees[idx].salary = salary;
                    data.employees[idx].epf = epf;
                    data.employees[idx].email = email;
                    data.employees[idx].status = status;
                    data.employees[idx].updatedAt = nowISO();
                    if (password && password.length >= 6) {
                        data.employees[idx].password = password;
                        try {
                            var user = firebase.auth().currentUser;
                            if (user && user.email === email) await user.updatePassword(password);
                        } catch(e) { console.warn(e); }
                    }
                }
            } else {
                var newEmp = { id: generateId(), name: name, nic: nic, department: department, designation: designation, contact: contact, emergency: emergency, address: address, joinedDate: joinedDate, salary: salary, epf: epf, email: email, status: status, createdAt: nowISO(), updatedAt: nowISO() };
                if (password && password.length >= 6) {
                    try {
                        var cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
                        newEmp.uid = cred.user.uid;
                    } catch(e) { showToast('Auth creation failed: ' + e.message, 'warning'); }
                }
                data.employees.push(newEmp);
            }
            setAppData(data);
            await saveAllData();
            document.getElementById('employeeModal').classList.remove('open');
            renderEmployees();
            showToast('Employee saved.');
        });
    }

    // Add Item Button
    var addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            if (!canManage('inventory')) { showToast('No permission.', 'error'); return; }
            document.getElementById('itemEditId').value = '';
            document.getElementById('itemBarcode').value = '';
            document.getElementById('itemName').value = '';
            document.getElementById('itemQty').value = 0;
            document.getElementById('itemPrice').value = 0;
            document.getElementById('itemDesc').value = '';
            document.getElementById('itemExpiry').value = '';
            document.getElementById('itemBatch').value = '';
            document.getElementById('itemStatus').value = 'active';
            var items = getAppData().items || [];
            document.getElementById('itemProductCode').value = 'PRD-' + String(items.length + 1).padStart(4, '0');
            document.getElementById('itemUnit').value = 'Pcs';
            document.getElementById('itemCostPrice').value = 0;
            document.getElementById('itemReorderLevel').value = 0;
            document.getElementById('itemTaxRate').value = 0;
            document.getElementById('itemStockAlert').value = 'enabled';
            document.getElementById('itemModalTitle').textContent = '📦 Add Item';
            populateItemDropdowns();
            document.getElementById('itemModal').classList.add('open');
        });
    }

    var itemModalClose = document.getElementById('itemModalClose');
    if (itemModalClose) {
        itemModalClose.addEventListener('click', function() {
            document.getElementById('itemModal').classList.remove('open');
        });
    }
    var itemModal = document.getElementById('itemModal');
    if (itemModal) {
        itemModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
        });
    }

    var scanBtn = document.getElementById('scanBarcodeBtn');
    if (scanBtn) scanBtn.addEventListener('click', openScanner);
    var closeScan = document.getElementById('closeScannerBtn');
    if (closeScan) closeScan.addEventListener('click', closeScanner);

    var itemSaveBtn = document.getElementById('itemSaveBtn');
    if (itemSaveBtn) {
        itemSaveBtn.addEventListener('click', async function() {
            if (!canManage('inventory')) { showToast('No permission.', 'error'); return; }
            var id = document.getElementById('itemEditId').value;
            var barcode = document.getElementById('itemBarcode').value.trim() || generateId().slice(0, 8);
            var name = document.getElementById('itemName').value.trim();
            var qty = parseInt(document.getElementById('itemQty').value) || 0;
            var price = parseFloat(document.getElementById('itemPrice').value) || 0;
            var category = document.getElementById('itemCategory').value;
            var brand = document.getElementById('itemBrand').value;
            var desc = document.getElementById('itemDesc').value.trim();
            var expiry = document.getElementById('itemExpiry').value;
            var batch = document.getElementById('itemBatch').value.trim();
            var status = document.getElementById('itemStatus').value;
            var productCode = document.getElementById('itemProductCode').value.trim() || ('PRD-' + String((getAppData().items || []).length + 1).padStart(4, '0'));
            var unit = document.getElementById('itemUnit').value;
            var costPrice = parseFloat(document.getElementById('itemCostPrice').value) || 0;
            var reorderLevel = parseInt(document.getElementById('itemReorderLevel').value) || 0;
            var taxRate = parseFloat(document.getElementById('itemTaxRate').value) || 0;
            var stockAlert = document.getElementById('itemStockAlert').value;

            if (!name) { showToast('Enter item name.', 'error'); return; }

            var data = getAppData();
            if (!data.items) data.items = [];

            if (id) {
                var idx = -1;
                for (var i = 0; i < data.items.length; i++) {
                    if (data.items[i].id === id) { idx = i; break; }
                }
                if (idx > -1) {
                    data.items[idx].barcode = barcode;
                    data.items[idx].name = name;
                    data.items[idx].qty = qty;
                    data.items[idx].price = price;
                    data.items[idx].category = category;
                    data.items[idx].brand = brand;
                    data.items[idx].desc = desc;
                    data.items[idx].expiry = expiry;
                    data.items[idx].batch = batch;
                    data.items[idx].status = status;
                    data.items[idx].productCode = productCode;
                    data.items[idx].unit = unit;
                    data.items[idx].costPrice = costPrice;
                    data.items[idx].reorderLevel = reorderLevel;
                    data.items[idx].taxRate = taxRate;
                    data.items[idx].stockAlert = stockAlert;
                    data.items[idx].updatedAt = nowISO();
                }
            } else {
                data.items.push({ id: generateId(), barcode: barcode, name: name, qty: qty, price: price, category: category, brand: brand, desc: desc, expiry: expiry, batch: batch, status: status, productCode: productCode, unit: unit, costPrice: costPrice, reorderLevel: reorderLevel, taxRate: taxRate, stockAlert: stockAlert, createdAt: nowISO(), updatedAt: nowISO() });
            }
            setAppData(data);
            await saveAllData();
            document.getElementById('itemModal').classList.remove('open');
            renderInventory();
            renderDashboard();
            showToast('Item saved.');
        });
    }

    // Add Customer Button
    var addCustomerBtn = document.getElementById('addCustomerBtn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', function() {
            if (!canManage('customers')) { showToast('No permission.', 'error'); return; }
            document.getElementById('custEditId').value = '';
            document.getElementById('custName').value = '';
            document.getElementById('custContact').value = '';
            document.getElementById('custCategory').value = 'Retail';
            document.getElementById('custAddress').value = '';
            document.getElementById('custCreditLimit').value = 0;
            document.getElementById('custBalance').value = 0;
            document.getElementById('customerModalTitle').textContent = '👤 Add Customer';
            document.getElementById('customerModal').classList.add('open');
        });
    }

    var custModalClose = document.getElementById('custModalClose');
    if (custModalClose) {
        custModalClose.addEventListener('click', function() {
            document.getElementById('customerModal').classList.remove('open');
        });
    }
    var custModal = document.getElementById('customerModal');
    if (custModal) {
        custModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
        });
    }

    var custSaveBtn = document.getElementById('custSaveBtn');
    if (custSaveBtn) {
        custSaveBtn.addEventListener('click', async function() {
            if (!canManage('customers')) { showToast('No permission.', 'error'); return; }
            var id = document.getElementById('custEditId').value;
            var name = document.getElementById('custName').value.trim();
            var contact = document.getElementById('custContact').value.trim();
            var category = document.getElementById('custCategory').value;
            var address = document.getElementById('custAddress').value.trim();
            var creditLimit = parseFloat(document.getElementById('custCreditLimit').value) || 0;
            var balance = parseFloat(document.getElementById('custBalance').value) || 0;

            if (!name) { showToast('Enter name.', 'error'); return; }

            var data = getAppData();
            if (!data.customers) data.customers = [];

            if (id) {
                var idx = -1;
                for (var i = 0; i < data.customers.length; i++) {
                    if (data.customers[i].id === id) { idx = i; break; }
                }
                if (idx > -1) {
                    data.customers[idx].name = name;
                    data.customers[idx].contact = contact;
                    data.customers[idx].category = category;
                    data.customers[idx].address = address;
                    data.customers[idx].creditLimit = creditLimit;
                    data.customers[idx].balance = balance;
                    data.customers[idx].updatedAt = nowISO();
                }
            } else {
                data.customers.push({ id: generateId(), name: name, contact: contact, category: category, address: address, creditLimit: creditLimit, balance: balance, createdAt: nowISO(), updatedAt: nowISO() });
            }
            setAppData(data);
            await saveAllData();
            document.getElementById('customerModal').classList.remove('open');
            renderCustomers();
            showToast('Customer saved.');
        });
    }

    // Profile
    var userBadge = document.getElementById('userBadge');
    if (userBadge) userBadge.addEventListener('click', openProfileModal);
    var profileClose = document.getElementById('profileModalClose');
    if (profileClose) {
        profileClose.addEventListener('click', function() {
            document.getElementById('profileModal').classList.remove('open');
        });
    }
    var profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
        });
    }

    // Notifications
    var notifBell = document.getElementById('notifBell');
    if (notifBell) {
        notifBell.addEventListener('click', function() {
            var modal = document.getElementById('notifModal');
            var list = document.getElementById('notifList');
            if (!modal || !list) return;
            var data = getAppData();
            var notifs = data.notifications || [];
            if (notifs.length === 0) {
                list.innerHTML = '<div class="empty-state"><span class="icon">🔔</span><p>No notifications.</p></div>';
            } else {
                var html = '';
                for (var i = notifs.length - 1; i >= 0; i--) {
                    var n = notifs[i];
                    html += '<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;"><strong>' + (n.title || 'Notification') + '</strong><br>' + (n.message || '') + '<br><span style="font-size:11px;color:var(--text-muted);">' + formatDateTime(n.date) + '</span></div>';
                }
                list.innerHTML = html;
            }
            modal.classList.add('open');
        });
    }
    var notifClose = document.getElementById('notifModalClose');
    if (notifClose) {
        notifClose.addEventListener('click', function() {
            document.getElementById('notifModal').classList.remove('open');
        });
    }
    var notifModal = document.getElementById('notifModal');
    if (notifModal) {
        notifModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
        });
    }

    // EMPLOYEE FILTERS
    var empSearch = document.getElementById('empSearch');
    if (empSearch) empSearch.addEventListener('input', function() { renderEmployees(); });
    var empDept = document.getElementById('empDeptFilter');
    if (empDept) empDept.addEventListener('change', function() { renderEmployees(); });
    var empStatus = document.getElementById('empStatusFilter');
    if (empStatus) empStatus.addEventListener('change', function() { renderEmployees(); });
    var clearEmp = document.getElementById('clearEmpFilters');
    if (clearEmp) {
        clearEmp.addEventListener('click', function() {
            document.getElementById('empSearch').value = '';
            document.getElementById('empDeptFilter').value = 'all';
            document.getElementById('empStatusFilter').value = 'all';
            renderEmployees();
        });
    }

    // INVENTORY FILTERS
    var invSearch = document.getElementById('invSearch');
    if (invSearch) invSearch.addEventListener('input', function() { renderInventory(); });
    var invCat = document.getElementById('invCatFilter');
    if (invCat) invCat.addEventListener('change', function() { renderInventory(); });
    var invSort = document.getElementById('invSort');
    if (invSort) invSort.addEventListener('change', function() { renderInventory(); });
    var clearInv = document.getElementById('clearInvFilters');
    if (clearInv) {
        clearInv.addEventListener('click', function() {
            document.getElementById('invSearch').value = '';
            document.getElementById('invCatFilter').value = 'all';
            document.getElementById('invSort').value = 'name';
            renderInventory();
        });
    }

    // CUSTOMER FILTERS
    var custSearch = document.getElementById('custSearch');
    if (custSearch) custSearch.addEventListener('input', function() { renderCustomers(); });
    var clearCust = document.getElementById('clearCustSearch');
    if (clearCust) {
        clearCust.addEventListener('click', function() {
            document.getElementById('custSearch').value = '';
            renderCustomers();
        });
    }

    // ATTENDANCE
    var checkIn = document.getElementById('checkInBtn');
    if (checkIn) {
        checkIn.addEventListener('click', async function() {
            var user = getCurrentUser();
            if (!user) { showToast('Login first.', 'error'); return; }
            var data = getAppData();
            if (!data.attendance) data.attendance = [];
            var today = todayStr();
            var existing = null;
            for (var i = 0; i < data.attendance.length; i++) {
                if (data.attendance[i].employeeId === user.uid && data.attendance[i].date && data.attendance[i].date.slice(0,10) === today) {
                    existing = data.attendance[i];
                    break;
                }
            }
            if (existing && existing.checkIn) { showToast('Already checked in.', 'warning'); return; }
            var location = document.getElementById('attendanceLocation') ? document.getElementById('attendanceLocation').value : 'GPS not available';
            data.attendance.push({ id: generateId(), employeeId: user.uid, employeeName: user.name || user.email, date: nowISO(), checkIn: nowISO(), checkOut: null, location: location, status: 'present' });
            setAppData(data);
            await saveAllData();
            renderAttendance();
            showToast('Checked in.');
        });
    }

    var checkOut = document.getElementById('checkOutBtn');
    if (checkOut) {
        checkOut.addEventListener('click', async function() {
            var user = getCurrentUser();
            if (!user) { showToast('Login first.', 'error'); return; }
            var data = getAppData();
            var today = todayStr();
            var record = null;
            for (var i = 0; i < data.attendance.length; i++) {
                if (data.attendance[i].employeeId === user.uid && data.attendance[i].date && data.attendance[i].date.slice(0,10) === today && data.attendance[i].checkIn && !data.attendance[i].checkOut) {
                    record = data.attendance[i];
                    break;
                }
            }
            if (!record) { showToast('No check-in found.', 'warning'); return; }
            record.checkOut = nowISO();
            setAppData(data);
            await saveAllData();
            renderAttendance();
            showToast('Checked out.');
        });
    }

    var attRefresh = document.getElementById('attendanceRefreshBtn');
    if (attRefresh) {
        attRefresh.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(pos) {
                        var loc = document.getElementById('attendanceLocation');
                        if (loc) loc.value = pos.coords.latitude + ', ' + pos.coords.longitude;
                    },
                    function() {
                        var loc = document.getElementById('attendanceLocation');
                        if (loc) loc.value = 'Location unavailable';
                    }
                );
            }
            renderAttendance();
        });
    }

    // LEAVE
    var applyLeave = document.getElementById('applyLeaveBtn');
    if (applyLeave) {
        applyLeave.addEventListener('click', async function() {
            var empId = document.getElementById('leaveEmployeeSelect') ? document.getElementById('leaveEmployeeSelect').value : '';
            var type = document.getElementById('leaveType') ? document.getElementById('leaveType').value : '';
            var from = document.getElementById('leaveFrom') ? document.getElementById('leaveFrom').value : '';
            var to = document.getElementById('leaveTo') ? document.getElementById('leaveTo').value : '';
            var reason = document.getElementById('leaveReason') ? document.getElementById('leaveReason').value.trim() : '';
            if (!empId) { showToast('Select employee.', 'error'); return; }
            if (!from || !to || from > to) { showToast('Invalid dates.', 'error'); return; }
            var data = getAppData();
            var emp = null;
            for (var i = 0; i < data.employees.length; i++) {
                if (data.employees[i].id === empId) { emp = data.employees[i]; break; }
            }
            if (!emp) { showToast('Employee not found.', 'error'); return; }
            if (!data.leaves) data.leaves = [];
            data.leaves.push({ id: generateId(), employeeId: empId, employeeName: emp.name, type: type, from: from, to: to, reason: reason || '', status: 'pending', createdAt: nowISO() });
            setAppData(data);
            await saveAllData();
            renderLeave();
            showToast('Leave applied.');
            if (document.getElementById('leaveReason')) document.getElementById('leaveReason').value = '';
        });
    }

    var approveLeave = document.getElementById('approveLeaveBtn');
    if (approveLeave) {
        approveLeave.addEventListener('click', async function() {
            var data = getAppData();
            var pending = null;
            for (var i = 0; i < (data.leaves || []).length; i++) {
                if (data.leaves[i].status === 'pending') { pending = data.leaves[i]; break; }
            }
            if (!pending) { showToast('No pending requests.', 'warning'); return; }
            pending.status = 'approved';
            setAppData(data);
            await saveAllData();
            renderLeave();
            showToast('Approved.');
        });
    }

    var rejectLeave = document.getElementById('rejectLeaveBtn');
    if (rejectLeave) {
        rejectLeave.addEventListener('click', async function() {
            var data = getAppData();
            var pending = null;
            for (var i = 0; i < (data.leaves || []).length; i++) {
                if (data.leaves[i].status === 'pending') { pending = data.leaves[i]; break; }
            }
            if (!pending) { showToast('No pending requests.', 'warning'); return; }
            pending.status = 'rejected';
            setAppData(data);
            await saveAllData();
            renderLeave();
            showToast('Rejected.');
        });
    }

    // PAYROLL
    var calcPayroll = document.getElementById('calculatePayrollBtn');
    if (calcPayroll) {
        calcPayroll.addEventListener('click', async function() {
            if (!canManage('payroll')) { showToast('No permission.', 'error'); return; }
            var empId = document.getElementById('payrollEmployeeSelect') ? document.getElementById('payrollEmployeeSelect').value : '';
            var month = document.getElementById('payrollMonth') ? document.getElementById('payrollMonth').value : '';
            var basic = parseFloat(document.getElementById('payrollBasic') ? document.getElementById('payrollBasic').value : 0) || 0;
            var allowances = parseFloat(document.getElementById('payrollAllowances') ? document.getElementById('payrollAllowances').value : 0) || 0;
            var deductions = parseFloat(document.getElementById('payrollDeductions') ? document.getElementById('payrollDeductions').value : 0) || 0;
            var otHours = parseFloat(document.getElementById('payrollOT') ? document.getElementById('payrollOT').value : 0) || 0;
            if (!empId || !month) { showToast('Select employee and month.', 'error'); return; }
            var data = getAppData();
            var emp = null;
            for (var i = 0; i < data.employees.length; i++) {
                if (data.employees[i].id === empId) { emp = data.employees[i]; break; }
            }
            if (!emp) { showToast('Employee not found.', 'error'); return; }
            var otRate = (basic / 160) * 1.5 || 0;
            var otPay = otHours * otRate;
            var net = basic + allowances + otPay - deductions;
            var epf = basic * 0.08;
            var etf = basic * 0.03;
            if (!data.payroll) data.payroll = [];
            data.payroll.push({ id: generateId(), employeeId: empId, employeeName: emp.name, month: month, basic: basic, allowances: allowances, deductions: deductions, ot: otPay, epf: epf, etf: etf, net: net, createdAt: nowISO() });
            setAppData(data);
            await saveAllData();
            renderPayroll();
            showToast('Payroll for ' + emp.name + ': LKR ' + formatCurrency(net));
        });
    }

    var genPayslip = document.getElementById('generatePayslipBtn');
    if (genPayslip) {
        genPayslip.addEventListener('click', function() {
            showToast('Payslip generation coming soon.', 'info');
        });
    }

    // PURCHASING
    var addSupplier = document.getElementById('addSupplierBtn');
    if (addSupplier) {
        addSupplier.addEventListener('click', async function() {
            var name = document.getElementById('supplierName') ? document.getElementById('supplierName').value.trim() : '';
            var contact = document.getElementById('supplierContact') ? document.getElementById('supplierContact').value.trim() : '';
            var address = document.getElementById('supplierAddress') ? document.getElementById('supplierAddress').value.trim() : '';
            if (!name) { showToast('Enter supplier name.', 'error'); return; }
            var data = getAppData();
            if (!data.suppliers) data.suppliers = [];
            data.suppliers.push({ id: generateId(), name: name, contact: contact, address: address, createdAt: nowISO() });
            setAppData(data);
            await saveAllData();
            renderPurchasing();
            showToast('Supplier added.');
            if (document.getElementById('supplierName')) document.getElementById('supplierName').value = '';
            if (document.getElementById('supplierContact')) document.getElementById('supplierContact').value = '';
            if (document.getElementById('supplierAddress')) document.getElementById('supplierAddress').value = '';
        });
    }

    var clearSupplier = document.getElementById('clearSupplierBtn');
    if (clearSupplier) {
        clearSupplier.addEventListener('click', function() {
            if (document.getElementById('supplierName')) document.getElementById('supplierName').value = '';
            if (document.getElementById('supplierContact')) document.getElementById('supplierContact').value = '';
            if (document.getElementById('supplierAddress')) document.getElementById('supplierAddress').value = '';
        });
    }

    var addPO = document.getElementById('addPurchaseOrderBtn');
    if (addPO) {
        addPO.addEventListener('click', async function() {
            var supplierId = document.getElementById('poSupplierSelect') ? document.getElementById('poSupplierSelect').value : '';
            var itemId = document.getElementById('poItemSelect') ? document.getElementById('poItemSelect').value : '';
            var qty = parseInt(document.getElementById('poQty') ? document.getElementById('poQty').value : 0) || 0;
            var price = parseFloat(document.getElementById('poPrice') ? document.getElementById('poPrice').value : 0) || 0;
            if (!supplierId || !itemId || qty <= 0 || price <= 0) {
                showToast('Fill all fields.', 'error');
                return;
            }
            var data = getAppData();
            var supplier = null;
            for (var i = 0; i < (data.suppliers || []).length; i++) {
                if (data.suppliers[i].id === supplierId) { supplier = data.suppliers[i]; break; }
            }
            var item = null;
            for (var j = 0; j < (data.items || []).length; j++) {
                if (data.items[j].id === itemId) { item = data.items[j]; break; }
            }
            if (!supplier || !item) { showToast('Not found.', 'error'); return; }
            if (!data.purchaseOrders) data.purchaseOrders = [];
            data.purchaseOrders.push({ id: generateId(), supplierId: supplierId, supplierName: supplier.name, itemId: itemId, itemName: item.name, qty: qty, price: price, status: 'pending', createdAt: nowISO() });
            setAppData(data);
            await saveAllData();
            renderPurchasing();
            showToast('PO created.');
            if (document.getElementById('poQty')) document.getElementById('poQty').value = '';
            if (document.getElementById('poPrice')) document.getElementById('poPrice').value = '';
        });
    }

    // SALES CART
    var salesCart = [];
    window.salesCart = salesCart;

    var addToCart = document.getElementById('salesAddToCartBtn');
    if (addToCart) {
        addToCart.addEventListener('click', function() {
            var itemId = document.getElementById('salesCartItemSelect') ? document.getElementById('salesCartItemSelect').value : '';
            var qty = parseInt(document.getElementById('salesCartQty') ? document.getElementById('salesCartQty').value : 1) || 1;
            if (!itemId) { showToast('Select item.', 'error'); return; }
            var data = getAppData();
            var item = null;
            for (var i = 0; i < data.items.length; i++) {
                if (data.items[i].id === itemId) { item = data.items[i]; break; }
            }
            if (!item) { showToast('Item not found.', 'error'); return; }
            if ((item.qty || 0) < qty) { showToast('Insufficient stock: ' + item.qty, 'error'); return; }
            var existing = null;
            for (var j = 0; j < salesCart.length; j++) {
                if (salesCart[j].id === itemId) { existing = salesCart[j]; break; }
            }
            if (existing) existing.qty += qty;
            else salesCart.push({ id: itemId, name: item.name, qty: qty, price: item.price || 0 });
            renderSalesCart();
            showToast('Added ' + qty + ' x ' + item.name);
            if (document.getElementById('salesCartQty')) document.getElementById('salesCartQty').value = '1';
        });
    }

    var clearCart = document.getElementById('salesClearCartBtn');
    if (clearCart) {
        clearCart.addEventListener('click', function() {
            if (salesCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
            if (!confirm('Clear cart?')) return;
            salesCart = [];
            renderSalesCart();
            showToast('Cleared.');
        });
    }

    var createOrder = document.getElementById('createSalesOrderBtn');
    if (createOrder) {
        createOrder.addEventListener('click', async function() {
            if (!canManage('sales') && !canView('sales')) {
                showToast('No permission.', 'error');
                return;
            }
            if (salesCart.length === 0) { showToast('Cart is empty.', 'error'); return; }
            var customerId = document.getElementById('salesCustomerSelect') ? document.getElementById('salesCustomerSelect').value : '';
            var orderDate = document.getElementById('salesOrderDate') ? document.getElementById('salesOrderDate').value : '';
            if (!customerId) { showToast('Select customer.', 'error'); return; }
            var data = getAppData();
            var customer = null;
            for (var i = 0; i < data.customers.length; i++) {
                if (data.customers[i].id === customerId) { customer = data.customers[i]; break; }
            }
            if (!customer) { showToast('Customer not found.', 'error'); return; }

            var total = 0;
            var orderItems = [];
            for (var k = 0; k < salesCart.length; k++) {
                var citem = salesCart[k];
                total += citem.qty * citem.price;
                orderItems.push({ id: citem.id, name: citem.name, qty: citem.qty, price: citem.price });
            }

            var stockError = false;
            for (var m = 0; m < salesCart.length; m++) {
                var cartItem = salesCart[m];
                var invItem = null;
                for (var n = 0; n < data.items.length; n++) {
                    if (data.items[n].id === cartItem.id) { invItem = data.items[n]; break; }
                }
                if (invItem) {
                    if ((invItem.qty || 0) >= cartItem.qty) {
                        invItem.qty = (invItem.qty || 0) - cartItem.qty;
                        invItem.updatedAt = nowISO();
                    } else { stockError = true; }
                }
            }
            if (stockError) {
                showToast('Stock insufficient. Please reload.', 'error');
                await loadAllData();
                return;
            }

            if (!data.salesOrders) data.salesOrders = [];
            var order = { id: generateId(), orderNo: 'SO-' + String(data.salesOrders.length + 1).padStart(4, '0'), customerId: customerId, customerName: customer.name, items: orderItems, total: total, date: orderDate || nowISO(), createdAt: nowISO() };
            data.salesOrders.push(order);
            for (var p = 0; p < orderItems.length; p++) {
                var oi = orderItems[p];
                data.salesData.push({ id: generateId(), customer: customer.name, item: oi.name, qty: oi.qty, total: oi.qty * oi.price, date: order.date });
            }
            if (!data.logs) data.logs = [];
            data.logs.push({ id: generateId(), user: getCurrentUser() ? getCurrentUser().name : 'System', action: 'Sales Order', details: '#' + order.orderNo + ' - ' + customer.name + ' - LKR ' + formatCurrency(total), date: nowISO() });

            setAppData(data);
            await saveAllData();
            salesCart = [];
            renderSalesCart();
            renderSales();
            renderDashboard();
            showToast('Order #' + order.orderNo + ' created! Total: LKR ' + formatCurrency(total));
        });
    }

    var salesAddCustomer = document.getElementById('salesAddCustomerBtn');
    if (salesAddCustomer) {
        salesAddCustomer.addEventListener('click', function() {
            if (canManage('customers')) {
                var addCust = document.getElementById('addCustomerBtn');
                if (addCust) addCust.click();
            } else showToast('No permission.', 'error');
        });
    }

    // DELIVERY CART
    var deliveryCart = [];
    window.deliveryCart = deliveryCart;

    var delAddItem = document.getElementById('delAddToCartBtn');
    if (delAddItem) {
        delAddItem.addEventListener('click', function() {
            var itemId = document.getElementById('delCartItemSelect') ? document.getElementById('delCartItemSelect').value : '';
            var qty = parseInt(document.getElementById('delCartQty') ? document.getElementById('delCartQty').value : 1) || 1;
            if (!itemId) { showToast('Select item.', 'error'); return; }
            var data = getAppData();
            var item = null;
            for (var i = 0; i < data.items.length; i++) {
                if (data.items[i].id === itemId) { item = data.items[i]; break; }
            }
            if (!item) { showToast('Item not found.', 'error'); return; }
            if ((item.qty || 0) < qty) { showToast('Insufficient stock: ' + item.qty, 'error'); return; }
            var existing = null;
            for (var j = 0; j < deliveryCart.length; j++) {
                if (deliveryCart[j].id === itemId) { existing = deliveryCart[j]; break; }
            }
            if (existing) existing.qty += qty;
            else deliveryCart.push({ id: itemId, name: item.name, qty: qty });
            renderDeliveryCart();
            showToast('Added ' + qty + ' x ' + item.name);
            if (document.getElementById('delCartQty')) document.getElementById('delCartQty').value = '1';
        });
    }

    var delClearCart = document.getElementById('delClearCartBtn');
    if (delClearCart) {
        delClearCart.addEventListener('click', function() {
            if (deliveryCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
            if (!confirm('Clear items?')) return;
            deliveryCart = [];
            renderDeliveryCart();
            showToast('Cleared.');
        });
    }

    var confirmDelivery = document.getElementById('deliverSubmitBtn');
    if (confirmDelivery) {
        confirmDelivery.addEventListener('click', async function() {
            if (!canManage('deliveries') && !hasPermission('create_deliveries')) {
                showToast('No permission.', 'error');
                return;
            }
            var customerId = document.getElementById('delCustomerSelect') ? document.getElementById('delCustomerSelect').value : '';
            var driverId = document.getElementById('delDriverSelect') ? document.getElementById('delDriverSelect').value : '';
            var vehicleId = document.getElementById('delVehicleSelect') ? document.getElementById('delVehicleSelect').value : '';
            var status = document.getElementById('delStatusSelect') ? document.getElementById('delStatusSelect').value : 'pending';
            var route = document.getElementById('delRoute') ? document.getElementById('delRoute').value.trim() : '';
            var notes = document.getElementById('delNotes') ? document.getElementById('delNotes').value.trim() : '';
            var scheduledDate = document.getElementById('delScheduledDate') ? document.getElementById('delScheduledDate').value : nowISO();

            if (!customerId) { showToast('Select customer.', 'error'); return; }
            if (deliveryCart.length === 0) { showToast('Add at least one item.', 'error'); return; }

            var data = getAppData();
            var customer = null;
            for (var i = 0; i < data.customers.length; i++) {
                if (data.customers[i].id === customerId) { customer = data.customers[i]; break; }
            }
            var driver = null;
            for (var j = 0; j < data.employees.length; j++) {
                if (data.employees[j].id === driverId) { driver = data.employees[j]; break; }
            }
            var vehicle = null;
            for (var k = 0; k < data.vehicles.length; k++) {
                if (data.vehicles[k].id === vehicleId) { vehicle = data.vehicles[k]; break; }
            }
            if (!customer) { showToast('Customer not found.', 'error'); return; }

            var stockError = false;
            for (var m = 0; m < deliveryCart.length; m++) {
                var dcItem = deliveryCart[m];
                var invItem = null;
                for (var n = 0; n < data.items.length; n++) {
                    if (data.items[n].id === dcItem.id) { invItem = data.items[n]; break; }
                }
                if (invItem) {
                    if ((invItem.qty || 0) >= dcItem.qty) {
                        invItem.qty = (invItem.qty || 0) - dcItem.qty;
                        invItem.updatedAt = nowISO();
                    } else { stockError = true; }
                }
            }
            if (stockError) {
                showToast('Stock insufficient. Reload.', 'error');
                await loadAllData();
                return;
            }

            var deliveryItems = [];
            for (var di = 0; di < deliveryCart.length; di++) {
                deliveryItems.push({ id: deliveryCart[di].id, name: deliveryCart[di].name, qty: deliveryCart[di].qty });
            }
            var delivery = { id: generateId(), customerId: customerId, customerName: customer.name, items: deliveryItems, driverId: driverId, driverName: driver ? driver.name : '—', vehicleId: vehicleId, vehicleNo: vehicle ? vehicle.vehicleNo : '—', status: status, route: route, notes: notes, date: scheduledDate, updatedAt: nowISO() };
            data.deliveries.push(delivery);
            if (!data.logs) data.logs = [];
            data.logs.push({ id: generateId(), user: getCurrentUser() ? getCurrentUser().name : 'System', action: 'Delivery Created', details: customer.name + ' - ' + delivery.items.length + ' items - ' + status, date: nowISO() });

            setAppData(data);
            await saveAllData();
            deliveryCart = [];
            renderDeliveryCart();
            if (document.getElementById('delRoute')) document.getElementById('delRoute').value = '';
            if (document.getElementById('delNotes')) document.getElementById('delNotes').value = '';
            if (document.getElementById('delStatusSelect')) document.getElementById('delStatusSelect').value = 'pending';
            populateDeliveryDropdowns();
            renderDeliveries();
            renderDashboard();
            showToast('Delivery for ' + customer.name + ' created.');
        });
    }

    var refreshDeliveries = document.getElementById('refreshDeliveriesBtn');
    if (refreshDeliveries) {
        refreshDeliveries.addEventListener('click', function() {
            renderDeliveries();
            showToast('Refreshed.');
        });
    }

    var delDateFilter = document.getElementById('delDateFilter');
    if (delDateFilter) delDateFilter.addEventListener('change', function() { renderDeliveries(); });
    var delStatusFilter = document.getElementById('delStatusFilter');
    if (delStatusFilter) delStatusFilter.addEventListener('change', function() { renderDeliveries(); });
    var clearDelFilter = document.getElementById('clearDelFilter');
    if (clearDelFilter) {
        clearDelFilter.addEventListener('click', function() {
            if (document.getElementById('delDateFilter')) document.getElementById('delDateFilter').value = '';
            if (document.getElementById('delStatusFilter')) document.getElementById('delStatusFilter').value = 'all';
            renderDeliveries();
        });
    }

    var clearDeliveryForm = document.getElementById('clearDeliveryForm');
    if (clearDeliveryForm) {
        clearDeliveryForm.addEventListener('click', function() {
            if (document.getElementById('delCustomerSelect')) document.getElementById('delCustomerSelect').value = '';
            if (document.getElementById('delDriverSelect')) document.getElementById('delDriverSelect').value = '';
            if (document.getElementById('delVehicleSelect')) document.getElementById('delVehicleSelect').value = '';
            if (document.getElementById('delScheduledDate')) document.getElementById('delScheduledDate').value = '';
            if (document.getElementById('delStatusSelect')) document.getElementById('delStatusSelect').value = 'pending';
            if (document.getElementById('delRoute')) document.getElementById('delRoute').value = '';
            if (document.getElementById('delNotes')) document.getElementById('delNotes').value = '';
            deliveryCart = [];
            renderDeliveryCart();
            populateDeliveryDropdowns();
            showToast('Form cleared.');
        });
    }

    // FINANCE
    var financePaymentMethod = document.getElementById('financePaymentMethod');
    if (financePaymentMethod) {
        financePaymentMethod.addEventListener('change', function() {
            var chequeDiv = document.getElementById('chequeDetails');
            if (chequeDiv) chequeDiv.style.display = this.value === 'cheque' ? 'block' : 'none';
        });
    }

    var addFinance = document.getElementById('addFinanceBtn');
    if (addFinance) {
        addFinance.addEventListener('click', async function() {
            if (!canManage('finance')) { showToast('No permission.', 'error'); return; }
            var type = document.getElementById('financeType') ? document.getElementById('financeType').value : 'income';
            var amount = parseFloat(document.getElementById('financeAmount') ? document.getElementById('financeAmount').value : 0);
            var category = document.getElementById('financeCategory') ? document.getElementById('financeCategory').value : 'operational';
            var desc = document.getElementById('financeDesc') ? document.getElementById('financeDesc').value.trim() : '';
            var paymentMethod = document.getElementById('financePaymentMethod') ? document.getElementById('financePaymentMethod').value : 'cash';
            var budgetInput = document.getElementById('financeBudget') ? document.getElementById('financeBudget').value.trim() : '';

            var chequeNo = document.getElementById('financeChequeNo') ? document.getElementById('financeChequeNo').value.trim() : '';
            var bankName = document.getElementById('financeBankName') ? document.getElementById('financeBankName').value.trim() : '';
            var chequeDate = document.getElementById('financeChequeDate') ? document.getElementById('financeChequeDate').value : '';
            var chequeAmount = parseFloat(document.getElementById('financeChequeAmount') ? document.getElementById('financeChequeAmount').value : amount) || amount;

            if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
            if (!desc) { showToast('Enter description.', 'error'); return; }
            if (paymentMethod === 'cheque' && !chequeNo) { showToast('Enter cheque number.', 'error'); return; }

            var data = getAppData();
            if (!data.budget) data.budget = { monthly: 0, category: {} };
            if (budgetInput !== '') data.budget.category[category] = parseFloat(budgetInput) || 0;

            data.finance.push({ id: generateId(), type: type, amount: amount, category: category, desc: desc, paymentMethod: paymentMethod, chequeNo: paymentMethod === 'cheque' ? chequeNo : '', bankName: paymentMethod === 'cheque' ? bankName : '', chequeDate: paymentMethod === 'cheque' ? chequeDate : '', chequeAmount: paymentMethod === 'cheque' ? chequeAmount : 0, date: nowISO() });
            setAppData(data);
            await saveAllData();
            renderFinance();
            if (document.getElementById('financeAmount')) document.getElementById('financeAmount').value = '';
            if (document.getElementById('financeDesc')) document.getElementById('financeDesc').value = '';
            if (document.getElementById('financeBudget')) document.getElementById('financeBudget').value = '';
            if (document.getElementById('financeChequeNo')) document.getElementById('financeChequeNo').value = '';
            if (document.getElementById('financeBankName')) document.getElementById('financeBankName').value = '';
            if (document.getElementById('financeChequeDate')) document.getElementById('financeChequeDate').value = '';
            if (document.getElementById('financeChequeAmount')) document.getElementById('financeChequeAmount').value = '';
            if (document.getElementById('financePaymentMethod')) document.getElementById('financePaymentMethod').value = 'cash';
            var chqDiv = document.getElementById('chequeDetails');
            if (chqDiv) chqDiv.style.display = 'none';
            showToast(type + ' recorded.');
        });
    }

    var clearFinance = document.getElementById('clearFinanceBtn');
    if (clearFinance) {
        clearFinance.addEventListener('click', function() {
            if (document.getElementById('financeAmount')) document.getElementById('financeAmount').value = '';
            if (document.getElementById('financeDesc')) document.getElementById('financeDesc').value = '';
            if (document.getElementById('financeBudget')) document.getElementById('financeBudget').value = '';
            if (document.getElementById('financeChequeNo')) document.getElementById('financeChequeNo').value = '';
            if (document.getElementById('financeBankName')) document.getElementById('financeBankName').value = '';
            if (document.getElementById('financeChequeDate')) document.getElementById('financeChequeDate').value = '';
            if (document.getElementById('financeChequeAmount')) document.getElementById('financeChequeAmount').value = '';
            if (document.getElementById('financePaymentMethod')) document.getElementById('financePaymentMethod').value = 'cash';
            var chqDiv = document.getElementById('chequeDetails');
            if (chqDiv) chqDiv.style.display = 'none';
            showToast('Finance form cleared.');
        });
    }

    // PRODUCTS
    var updateProduct = document.getElementById('updateProductAttributesBtn');
    if (updateProduct) {
        updateProduct.addEventListener('click', async function() {
            if (!canManage('inventory')) { showToast('No permission.', 'error'); return; }
            var data = getAppData();
            var items = data.items || [];
            var productCode = document.getElementById('productCode') ? document.getElementById('productCode').value.trim() : '';
            var unit = document.getElementById('productUnit') ? document.getElementById('productUnit').value : 'Pcs';
            var costPrice = parseFloat(document.getElementById('productCostPrice') ? document.getElementById('productCostPrice').value : 0) || 0;
            var taxRate = parseFloat(document.getElementById('productTaxRate') ? document.getElementById('productTaxRate').value : 0) || 0;
            var reorderLevel = parseInt(document.getElementById('productReorderLevel') ? document.getElementById('productReorderLevel').value : 0) || 0;
            var stockAlert = document.getElementById('productStockAlert') ? document.getElementById('productStockAlert').value : 'enabled';

            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].productCode === productCode) { item = items[i]; break; }
            }
            if (!item && items.length > 0) item = items[0];
            if (!item) { showToast('No product found. Add items first.', 'error'); return; }

            var idx = -1;
            for (var j = 0; j < data.items.length; j++) {
                if (data.items[j].id === item.id) { idx = j; break; }
            }
            if (idx > -1) {
                data.items[idx].productCode = productCode || data.items[idx].productCode;
                data.items[idx].unit = unit || data.items[idx].unit || 'Pcs';
                data.items[idx].costPrice = costPrice || data.items[idx].costPrice || 0;
                data.items[idx].taxRate = taxRate || data.items[idx].taxRate || 0;
                data.items[idx].reorderLevel = reorderLevel || data.items[idx].reorderLevel || 0;
                data.items[idx].stockAlert = stockAlert || data.items[idx].stockAlert || 'enabled';
                data.items[idx].updatedAt = nowISO();
                setAppData(data);
                await saveAllData();
                renderProducts();
                renderInventory();
                showToast('Product attributes updated.');
            }
        });
    }

    // VOUCHER
    var addVoucher = document.getElementById('addVoucherBtn');
    if (addVoucher) {
        addVoucher.addEventListener('click', async function() {
            if (!canManage('voucher') && !canManage('finance')) {
                showToast('No permission.', 'error');
                return;
            }
            var voucherNo = document.getElementById('voucherNo') ? document.getElementById('voucherNo').value.trim() : '';
            if (!voucherNo) voucherNo = 'VCH-' + String((getAppData().vouchers || []).length + 1).padStart(4, '0');
            var date = document.getElementById('voucherDate') ? document.getElementById('voucherDate').value : todayStr();
            var paidTo = document.getElementById('voucherPaidTo') ? document.getElementById('voucherPaidTo').value.trim() : '';
            var amount = parseFloat(document.getElementById('voucherAmount') ? document.getElementById('voucherAmount').value : 0) || 0;
            var description = document.getElementById('voucherDescription') ? document.getElementById('voucherDescription').value.trim() : '';
            var approvedBy = document.getElementById('voucherApprovedBy') ? document.getElementById('voucherApprovedBy').value.trim() : '';
            var receivedBy = document.getElementById('voucherReceivedBy') ? document.getElementById('voucherReceivedBy').value.trim() : '';
            var signature = document.getElementById('voucherSignature') ? document.getElementById('voucherSignature').value.trim() : '';

            var paymentTypes = [];
            var checkboxes = document.querySelectorAll('.voucher-payment-type:checked');
            for (var i = 0; i < checkboxes.length; i++) {
                paymentTypes.push(checkboxes[i].value);
            }
            var otherText = document.getElementById('voucherOtherText') ? document.getElementById('voucherOtherText').value.trim() : '';
            if (otherText) paymentTypes.push(otherText);

            if (!paidTo) { showToast('Enter recipient.', 'error'); return; }
            if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }

            var data = getAppData();
            if (!data.vouchers) data.vouchers = [];
            data.vouchers.push({ id: generateId(), voucherNo: voucherNo, date: date, paidTo: paidTo, amount: amount, paymentTypes: paymentTypes.length > 0 ? paymentTypes : ['Other'], description: description || '', approvedBy: approvedBy || '', receivedBy: receivedBy || '', signature: signature || '', status: 'paid', createdAt: nowISO() });
            setAppData(data);
            await saveAllData();
            renderVouchers();
            showToast('Voucher #' + voucherNo + ' saved.');
            if (document.getElementById('voucherNo')) document.getElementById('voucherNo').value = '';
            if (document.getElementById('voucherDate')) document.getElementById('voucherDate').value = '';
            if (document.getElementById('voucherPaidTo')) document.getElementById('voucherPaidTo').value = '';
            if (document.getElementById('voucherAmount')) document.getElementById('voucherAmount').value = '';
            if (document.getElementById('voucherDescription')) document.getElementById('voucherDescription').value = '';
            if (document.getElementById('voucherApprovedBy')) document.getElementById('voucherApprovedBy').value = '';
            if (document.getElementById('voucherReceivedBy')) document.getElementById('voucherReceivedBy').value = '';
            if (document.getElementById('voucherSignature')) document.getElementById('voucherSignature').value = '';
            var cbs = document.querySelectorAll('.voucher-payment-type');
            for (var j = 0; j < cbs.length; j++) cbs[j].checked = false;
            if (document.getElementById('voucherOtherText')) document.getElementById('voucherOtherText').value = '';
        });
    }

    var printVoucher = document.getElementById('printVoucherBtn');
    if (printVoucher) {
        printVoucher.addEventListener('click', function() {
            showToast('Print coming soon.', 'info');
        });
    }
    var downloadVoucher = document.getElementById('downloadVoucherBtn');
    if (downloadVoucher) {
        downloadVoucher.addEventListener('click', function() {
            showToast('PDF coming soon.', 'info');
        });
    }
    var clearVoucherForm = document.getElementById('clearVoucherForm');
    if (clearVoucherForm) {
        clearVoucherForm.addEventListener('click', function() {
            if (document.getElementById('voucherNo')) document.getElementById('voucherNo').value = '';
            if (document.getElementById('voucherDate')) document.getElementById('voucherDate').value = '';
            if (document.getElementById('voucherPaidTo')) document.getElementById('voucherPaidTo').value = '';
            if (document.getElementById('voucherAmount')) document.getElementById('voucherAmount').value = '';
            if (document.getElementById('voucherDescription')) document.getElementById('voucherDescription').value = '';
            if (document.getElementById('voucherApprovedBy')) document.getElementById('voucherApprovedBy').value = '';
            if (document.getElementById('voucherReceivedBy')) document.getElementById('voucherReceivedBy').value = '';
            if (document.getElementById('voucherSignature')) document.getElementById('voucherSignature').value = '';
            var cbs = document.querySelectorAll('.voucher-payment-type');
            for (var i = 0; i < cbs.length; i++) cbs[i].checked = false;
            if (document.getElementById('voucherOtherText')) document.getElementById('voucherOtherText').value = '';
            showToast('Form cleared.');
        });
    }

    // FLEET
    var addVehicle = document.getElementById('addVehicleBtn');
    if (addVehicle) {
        addVehicle.addEventListener('click', async function() {
            if (!canManage('vehicles') && !canView('fleet')) {
                showToast('No permission.', 'error');
                return;
            }
            var vehicleNo = document.getElementById('vehicleNo') ? document.getElementById('vehicleNo').value.trim() : '';
            var driver = document.getElementById('vehicleDriver') ? document.getElementById('vehicleDriver').value.trim() : '';
            var fuel = document.getElementById('vehicleFuel') ? document.getElementById('vehicleFuel').value.trim() : '';
            var insurance = document.getElementById('vehicleInsurance') ? document.getElementById('vehicleInsurance').value.trim() : '';
            var service = document.getElementById('vehicleService') ? document.getElementById('vehicleService').value : '';

            if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }

            var data = getAppData();
            if (!data.vehicles) data.vehicles = [];

            var editId = addVehicle.dataset.editId;
            if (editId) {
                var idx = -1;
                for (var i = 0; i < data.vehicles.length; i++) {
                    if (data.vehicles[i].id === editId) { idx = i; break; }
                }
                if (idx > -1) {
                    data.vehicles[idx].vehicleNo = vehicleNo;
                    data.vehicles[idx].driver = driver;
                    data.vehicles[idx].fuel = fuel;
                    data.vehicles[idx].insurance = insurance;
                    data.vehicles[idx].service = service;
                    data.vehicles[idx].updatedAt = nowISO();
                }
                delete addVehicle.dataset.editId;
                addVehicle.textContent = '🚗 Add Vehicle';
            } else {
                data.vehicles.push({ id: generateId(), vehicleNo: vehicleNo, driver: driver, fuel: fuel, insurance: insurance, service: service, status: 'active', createdAt: nowISO(), updatedAt: nowISO() });
            }
            setAppData(data);
            await saveAllData();
            renderFleet();
            showToast('Vehicle saved.');
            if (document.getElementById('vehicleNo')) document.getElementById('vehicleNo').value = '';
            if (document.getElementById('vehicleDriver')) document.getElementById('vehicleDriver').value = '';
            if (document.getElementById('vehicleFuel')) document.getElementById('vehicleFuel').value = '';
            if (document.getElementById('vehicleInsurance')) document.getElementById('vehicleInsurance').value = '';
            if (document.getElementById('vehicleService')) document.getElementById('vehicleService').value = '';
            addVehicle.textContent = '🚗 Add Vehicle';
            delete addVehicle.dataset.editId;
        });
    }

    // REPORTS
    var genReport = document.getElementById('generateReportBtn');
    if (genReport) genReport.addEventListener('click', function() { renderReports(); });
    var reportType = document.getElementById('reportType');
    if (reportType) reportType.addEventListener('change', function() { renderReports(); });
    var applyReport = document.getElementById('applyReportFilters');
    if (applyReport) applyReport.addEventListener('click', function() { renderReports(); });
    var clearReport = document.getElementById('clearReportFilters');
    if (clearReport) {
        clearReport.addEventListener('click', function() {
            if (document.getElementById('reportFrom')) document.getElementById('reportFrom').value = '';
            if (document.getElementById('reportTo')) document.getElementById('reportTo').value = '';
            renderReports();
        });
    }

    var exportReport = document.getElementById('exportReportBtn');
    if (exportReport) {
        exportReport.addEventListener('click', function() {
            var content = document.getElementById('reportContent');
            if (!content) return;
            var tables = content.querySelectorAll('table');
            if (tables.length === 0) { showToast('No data.', 'warning'); return; }
            var csv = '';
            for (var t = 0; t < tables.length; t++) {
                var table = tables[t];
                var rows = table.querySelectorAll('tr');
                for (var r = 0; r < rows.length; r++) {
                    var cells = rows[r].querySelectorAll('th, td');
                    var rowData = [];
                    for (var c = 0; c < cells.length; c++) {
                        rowData.push(cells[c].textContent.trim().replace(/,/g, ''));
                    }
                    csv += rowData.join(',') + '\n';
                }
                csv += '\n';
            }
            var blob = new Blob([csv], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'report_' + todayStr() + '.csv';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSV exported.');
        });
    }

    var printReport = document.getElementById('printReportBtn');
    if (printReport) printReport.addEventListener('click', function() { window.print(); });

    // SETTINGS
    var saveSettings = document.getElementById('saveSettingsBtn');
    if (saveSettings) {
        saveSettings.addEventListener('click', async function() {
            var data = getAppData();
            if (!data.settings) data.settings = {};
            data.settings.company = document.getElementById('settingsCompany') ? document.getElementById('settingsCompany').value.trim() : '';
            data.settings.address = document.getElementById('settingsAddress') ? document.getElementById('settingsAddress').value.trim() : '';
            data.settings.phone = document.getElementById('settingsPhone') ? document.getElementById('settingsPhone').value.trim() : '';
            data.settings.email = document.getElementById('settingsEmail') ? document.getElementById('settingsEmail').value.trim() : '';
            setAppData(data);
            await saveAllData();
            showToast('Settings saved.');
        });
    }

    var saveSettings2 = document.getElementById('saveSettingsBtn2');
    if (saveSettings2) {
        saveSettings2.addEventListener('click', async function() {
            var data = getAppData();
            if (!data.settings) data.settings = {};
            data.settings.company = document.getElementById('settingsCompany') ? document.getElementById('settingsCompany').value.trim() : '';
            data.settings.address = document.getElementById('settingsAddress') ? document.getElementById('settingsAddress').value.trim() : '';
            data.settings.phone = document.getElementById('settingsPhone') ? document.getElementById('settingsPhone').value.trim() : '';
            data.settings.email = document.getElementById('settingsEmail') ? document.getElementById('settingsEmail').value.trim() : '';
            setAppData(data);
            await saveAllData();
            showToast('Settings saved.');
        });
    }

    var backupData = document.getElementById('backupDataBtn');
    if (backupData) {
        backupData.addEventListener('click', function() {
            var data = getAppData();
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'jayasinghe_erp_backup_' + todayStr() + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup downloaded.');
        });
    }

    var restoreData = document.getElementById('restoreDataBtn');
    if (restoreData) {
        restoreData.addEventListener('click', function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = async function(ev) {
                    try {
                        var data = JSON.parse(ev.target.result);
                        setAppData(data);
                        await saveAllData();
                        renderAll();
                        showToast('Data restored.');
                    } catch(err) {
                        showToast('Invalid file.', 'error');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }

    var clearData = document.getElementById('clearDataBtn');
    if (clearData) {
        clearData.addEventListener('click', async function() {
            if (!confirm('Delete ALL data? Cannot undo!')) return;
            var data = getAppData();
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (Array.isArray(data[key])) data[key] = [];
                    else if (typeof data[key] === 'object' && data[key] !== null) data[key] = {};
                }
            }
            setAppData(data);
            await saveAllData();
            renderAll();
            showToast('All data cleared.');
        });
    }

    var clearLogs = document.getElementById('clearLogsBtn');
    if (clearLogs) {
        clearLogs.addEventListener('click', async function() {
            if (!confirm('Clear logs?')) return;
            var data = getAppData();
            data.logs = [];
            setAppData(data);
            await saveAllData();
            renderAdministration();
            showToast('Logs cleared.');
        });
    }

    // DEFAULT DATES
    var defaultIds = ['voucherDate', 'salesOrderDate', 'delScheduledDate', 'payrollMonth', 'leaveFrom', 'leaveTo'];
    for (var d = 0; d < defaultIds.length; d++) {
        var el = document.getElementById(defaultIds[d]);
        if (el && !el.value) {
            if (defaultIds[d] === 'delScheduledDate') el.value = nowISO().slice(0, 16);
            else if (defaultIds[d] === 'payrollMonth') el.value = todayStr().slice(0, 7);
            else el.value = todayStr();
        }
    }

    // Load data and initialize
    loadAllData().then(function() {
        var user = getCurrentUser();
        if (user) {
            renderSidebar();
            switchPanel('dashboard');
        }
        populateItemDropdowns();
        populateDeliveryDropdowns();
    }).catch(function(err) {
        console.warn('Data load error, but continuing:', err);
        var user = getCurrentUser();
        if (user) {
            renderSidebar();
            switchPanel('dashboard');
        }
    });

    console.log('ERP initialized.');
}

// ============================================================
// START
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
