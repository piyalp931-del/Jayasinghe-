// ============================================================
// MAIN APP MODULE
// ============================================================
function showToast(message, type) {
    type = type || 'info';
    const toast = document.getElementById('toast');
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

function populateItemDropdowns() {
    var data = getAppData();
    var items = data.items || [];
    var categories = data.categories || [];
    var brands = data.brands || [];

    var catSelect = document.getElementById('itemCategory');
    if (catSelect) {
        var val = catSelect.value;
        catSelect.innerHTML = '<option value="">Select...</option>';
        categories.forEach(function(c) { catSelect.innerHTML += '<option value="' + c + '">' + c + '</option>'; });
        if (val && catSelect.querySelector('option[value="' + val + '"]')) catSelect.value = val;
    }

    var brandSelect = document.getElementById('itemBrand');
    if (brandSelect) {
        var val2 = brandSelect.value;
        brandSelect.innerHTML = '<option value="">Select...</option>';
        brands.forEach(function(b) { brandSelect.innerHTML += '<option value="' + b + '">' + b + '</option>'; });
        if (val2 && brandSelect.querySelector('option[value="' + val2 + '"]')) brandSelect.value = val2;
    }

    var cartSelect = document.getElementById('salesCartItemSelect');
    if (cartSelect) {
        var val3 = cartSelect.value;
        cartSelect.innerHTML = '<option value="">Select Item</option>';
        items.filter(function(i) { return i.status !== 'inactive'; }).forEach(function(i) {
            cartSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + ' (' + (i.qty||0) + ' avail) - LKR ' + formatCurrency(i.price||0) + '</option>';
        });
        if (val3 && cartSelect.querySelector('option[value="' + val3 + '"]')) cartSelect.value = val3;
    }

    var delSelect = document.getElementById('delCartItemSelect');
    if (delSelect) {
        var val4 = delSelect.value;
        delSelect.innerHTML = '<option value="">Select Item</option>';
        items.filter(function(i) { return i.status !== 'inactive'; }).forEach(function(i) {
            delSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + ' (' + (i.qty||0) + ' avail)</option>';
        });
        if (val4 && delSelect.querySelector('option[value="' + val4 + '"]')) delSelect.value = val4;
    }

    var poSelect = document.getElementById('poItemSelect');
    if (poSelect) {
        var val5 = poSelect.value;
        poSelect.innerHTML = '<option value="">Select</option>';
        items.forEach(function(i) { poSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + '</option>'; });
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
        customers.forEach(function(c) { custSelect.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; });
        if (val && custSelect.querySelector('option[value="' + val + '"]')) custSelect.value = val;
    }

    var driverSelect = document.getElementById('delDriverSelect');
    if (driverSelect) {
        var val2 = driverSelect.value;
        driverSelect.innerHTML = '<option value="">-- Select --</option>';
        var drivers = employees.filter(function(e) { return e.department === 'Delivery' || (e.designation || '').toLowerCase().includes('driver'); });
        drivers.forEach(function(e) { driverSelect.innerHTML += '<option value="' + e.id + '">' + escapeHtml(e.name) + '</option>'; });
        if (val2 && driverSelect.querySelector('option[value="' + val2 + '"]')) driverSelect.value = val2;
    }

    var vehicleSelect = document.getElementById('delVehicleSelect');
    if (vehicleSelect) {
        var val3 = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="">-- Select --</option>';
        vehicles.forEach(function(v) { vehicleSelect.innerHTML += '<option value="' + v.id + '">' + escapeHtml(v.vehicleNo) + '</option>'; });
        if (val3 && vehicleSelect.querySelector('option[value="' + val3 + '"]')) vehicleSelect.value = val3;
    }
}
window.populateDeliveryDropdowns = populateDeliveryDropdowns;

function renderAll() {
    var active = document.querySelector('.panel.active');
    if (active) switchPanel(active.id.replace('panel-', ''));
    else switchPanel('dashboard');
    renderSidebar();
}
window.renderAll = renderAll;

function openProfileModal() {
    var modal = document.getElementById('profileModal');
    if (!modal) return;
    var user = getCurrentUser();
    if (!user) { showToast('Please login.', 'error'); return; }
    var data = getAppData();
    var emp = data.employees.find(function(e) { return e.id === user.uid || e.email === user.email; });
    document.getElementById('profileName').textContent = emp?.name || user.name || user.email;
    document.getElementById('profileRole').textContent = emp?.department || user.role || 'Employee';
    var details = document.getElementById('profileDetails');
    if (details) {
        details.innerHTML =
            '<div><strong>Email:</strong> ' + (emp?.email || user.email) + '</div>' +
            '<div><strong>NIC:</strong> ' + (emp?.nic || '—') + '</div>' +
            '<div><strong>Contact:</strong> ' + (emp?.contact || '—') + '</div>' +
            '<div><strong>Department:</strong> ' + (emp?.department || '—') + '</div>' +
            '<div><strong>Designation:</strong> ' + (emp?.designation || '—') + '</div>' +
            '<div><strong>Joined:</strong> ' + (emp?.joinedDate ? formatDate(emp.joinedDate) : '—') + '</div>' +
            '<div><strong>Status:</strong> ' + (emp?.status || 'active') + '</div>';
    }
    var stats = document.getElementById('profileStats');
    if (stats) {
        var att = data.attendance?.filter(function(a) { return a.employeeId === user.uid; }) || [];
        var leaves = data.leaves?.filter(function(l) { return l.employeeId === user.uid; }) || [];
        var payroll = data.payroll?.filter(function(p) { return p.employeeId === user.uid; }) || [];
        stats.innerHTML =
            '<div><strong>' + att.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Days Present</span></div>' +
            '<div><strong>' + leaves.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Leave Requests</span></div>' +
            '<div><strong>' + payroll.length + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Payroll Records</span></div>' +
            '<div><strong>' + (emp?.salary ? 'LKR ' + formatCurrency(emp.salary) : '—') + '</strong><br><span style="font-size:10px;color:var(--text-muted);">Salary</span></div>';
    }
    modal.classList.add('open');
}
window.openProfileModal = openProfileModal;

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    var icon = document.getElementById('darkModeToggle')?.querySelector('i');
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
            showToast('✅ Scanned: ' + decodedText);
            closeScanner();
        },
        function() {}
    ).catch(function(err) { showToast('⚠️ Camera error: ' + err.message, 'error'); });
}
function closeScanner() {
    var container = document.getElementById('scannerContainer');
    if (container) container.style.display = 'none';
    if (html5QrCode) { try { html5QrCode.stop(); } catch(e) {} html5QrCode = null; }
}
window.openScanner = openScanner;
window.closeScanner = closeScanner;

// ============================================================
// INIT
// ============================================================
function init() {
    console.log('🚀 Initializing ERP...');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        var icon = document.getElementById('darkModeToggle')?.querySelector('i');
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
            if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
    document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);

    // Clear login
    document.getElementById('clearLoginBtn')?.addEventListener('click', function() {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        showToast('🧹 Cleared.');
    });

    // -------------------- EMPLOYEE MODAL --------------------
    document.getElementById('addEmployeeBtn')?.addEventListener('click', function() {
        if (!canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
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

    document.getElementById('empModalClose')?.addEventListener('click', function() {
        document.getElementById('employeeModal').classList.remove('open');
    });
    document.getElementById('employeeModal')?.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('empSaveBtn')?.addEventListener('click', async function() {
        if (!canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
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
            var idx = data.employees.findIndex(function(e) { return e.id === id; });
            if (idx > -1) {
                data.employees[idx] = { ...data.employees[idx], name: name, nic: nic, department: department, designation: designation, contact: contact, emergency: emergency, address: address, joinedDate: joinedDate, salary: salary, epf: epf, email: email, status: status, updatedAt: nowISO() };
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
                } catch(e) { showToast('⚠️ Auth creation failed: ' + e.message, 'warning'); }
            }
            data.employees.push(newEmp);
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('employeeModal').classList.remove('open');
        renderEmployees();
        showToast('✅ Employee saved.');
    });

    // -------------------- ITEM MODAL --------------------
    document.getElementById('addItemBtn')?.addEventListener('click', function() {
        if (!canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
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

    document.getElementById('itemModalClose')?.addEventListener('click', function() {
        document.getElementById('itemModal').classList.remove('open');
    });
    document.getElementById('itemModal')?.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('scanBarcodeBtn')?.addEventListener('click', openScanner);
    document.getElementById('closeScannerBtn')?.addEventListener('click', closeScanner);

    document.getElementById('itemSaveBtn')?.addEventListener('click', async function() {
        if (!canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
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
            var idx = data.items.findIndex(function(i) { return i.id === id; });
            if (idx > -1) {
                data.items[idx] = { ...data.items[idx], barcode: barcode, name: name, qty: qty, price: price, category: category, brand: brand, desc: desc, expiry: expiry, batch: batch, status: status, productCode: productCode, unit: unit, costPrice: costPrice, reorderLevel: reorderLevel, taxRate: taxRate, stockAlert: stockAlert, updatedAt: nowISO() };
            }
        } else {
            data.items.push({ id: generateId(), barcode: barcode, name: name, qty: qty, price: price, category: category, brand: brand, desc: desc, expiry: expiry, batch: batch, status: status, productCode: productCode, unit: unit, costPrice: costPrice, reorderLevel: reorderLevel, taxRate: taxRate, stockAlert: stockAlert, createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('itemModal').classList.remove('open');
        renderInventory();
        renderDashboard();
        showToast('✅ Item saved.');
    });

    // -------------------- CUSTOMER MODAL --------------------
    document.getElementById('addCustomerBtn')?.addEventListener('click', function() {
        if (!canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
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

    document.getElementById('custModalClose')?.addEventListener('click', function() {
        document.getElementById('customerModal').classList.remove('open');
    });
    document.getElementById('customerModal')?.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('custSaveBtn')?.addEventListener('click', async function() {
        if (!canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
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
            var idx = data.customers.findIndex(function(c) { return c.id === id; });
            if (idx > -1) {
                data.customers[idx] = { ...data.customers[idx], name: name, contact: contact, category: category, address: address, creditLimit: creditLimit, balance: balance, updatedAt: nowISO() };
            }
        } else {
            data.customers.push({ id: generateId(), name: name, contact: contact, category: category, address: address, creditLimit: creditLimit, balance: balance, createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('customerModal').classList.remove('open');
        renderCustomers();
        showToast('✅ Customer saved.');
    });

    // -------------------- PROFILE --------------------
    document.getElementById('userBadge')?.addEventListener('click', openProfileModal);
    document.getElementById('profileModalClose')?.addEventListener('click', function() {
        document.getElementById('profileModal').classList.remove('open');
    });
    document.getElementById('profileModal')?.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    // -------------------- NOTIFICATIONS --------------------
    document.getElementById('notifBell')?.addEventListener('click', function() {
        var modal = document.getElementById('notifModal');
        var list = document.getElementById('notifList');
        if (!modal || !list) return;
        var data = getAppData();
        var notifs = data.notifications || [];
        if (notifs.length === 0) {
            list.innerHTML = '<div class="empty-state"><span class="icon">🔔</span><p>No notifications.</p></div>';
        } else {
            var html = '';
            notifs.slice().reverse().forEach(function(n) {
                html += '<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;"><strong>' + (n.title || 'Notification') + '</strong><br>' + (n.message || '') + '<br><span style="font-size:11px;color:var(--text-muted);">' + formatDateTime(n.date) + '</span></div>';
            });
            list.innerHTML = html;
        }
        modal.classList.add('open');
    });
    document.getElementById('notifModalClose')?.addEventListener('click', function() {
        document.getElementById('notifModal').classList.remove('open');
    });
    document.getElementById('notifModal')?.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    // -------------------- FILTERS --------------------
    document.getElementById('empSearch')?.addEventListener('input', renderEmployees);
    document.getElementById('empDeptFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('empStatusFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('clearEmpFilters')?.addEventListener('click', function() {
        document.getElementById('empSearch').value = '';
        document.getElementById('empDeptFilter').value = 'all';
        document.getElementById('empStatusFilter').value = 'all';
        renderEmployees();
    });

    document.getElementById('invSearch')?.addEventListener('input', renderInventory);
    document.getElementById('invCatFilter')?.addEventListener('change', renderInventory);
    document.getElementById('invSort')?.addEventListener('change', renderInventory);
    document.getElementById('clearInvFilters')?.addEventListener('click', function() {
        document.getElementById('invSearch').value = '';
        document.getElementById('invCatFilter').value = 'all';
        document.getElementById('invSort').value = 'name';
        renderInventory();
    });

    document.getElementById('custSearch')?.addEventListener('input', renderCustomers);
    document.getElementById('clearCustSearch')?.addEventListener('click', function() {
        document.getElementById('custSearch').value = '';
        renderCustomers();
    });

    // -------------------- ATTENDANCE --------------------
    document.getElementById('checkInBtn')?.addEventListener('click', async function() {
        var user = getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        var data = getAppData();
        if (!data.attendance) data.attendance = [];
        var today = todayStr();
        var existing = data.attendance.find(function(a) { return a.employeeId === user.uid && a.date?.slice(0,10) === today; });
        if (existing && existing.checkIn) { showToast('Already checked in.', 'warning'); return; }
        var location = document.getElementById('attendanceLocation')?.value || 'GPS not available';
        data.attendance.push({ id: generateId(), employeeId: user.uid, employeeName: user.name || user.email, date: nowISO(), checkIn: nowISO(), checkOut: null, location: location, status: 'present' });
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked in.');
    });

    document.getElementById('checkOutBtn')?.addEventListener('click', async function() {
        var user = getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        var data = getAppData();
        var today = todayStr();
        var record = data.attendance.find(function(a) { return a.employeeId === user.uid && a.date?.slice(0,10) === today && a.checkIn && !a.checkOut; });
        if (!record) { showToast('No check-in found.', 'warning'); return; }
        record.checkOut = nowISO();
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked out.');
    });

    document.getElementById('attendanceRefreshBtn')?.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(pos) { document.getElementById('attendanceLocation').value = pos.coords.latitude + ', ' + pos.coords.longitude; },
                function() { document.getElementById('attendanceLocation').value = 'Location unavailable'; }
            );
        }
        renderAttendance();
    });

    // -------------------- LEAVE --------------------
    document.getElementById('applyLeaveBtn')?.addEventListener('click', async function() {
        var empId = document.getElementById('leaveEmployeeSelect')?.value;
        var type = document.getElementById('leaveType')?.value;
        var from = document.getElementById('leaveFrom')?.value;
        var to = document.getElementById('leaveTo')?.value;
        var reason = document.getElementById('leaveReason')?.value.trim();
        if (!empId) { showToast('Select employee.', 'error'); return; }
        if (!from || !to || from > to) { showToast('Invalid dates.', 'error'); return; }
        var data = getAppData();
        var emp = data.employees.find(function(e) { return e.id === empId; });
        if (!emp) { showToast('Employee not found.', 'error'); return; }
        if (!data.leaves) data.leaves = [];
        data.leaves.push({ id: generateId(), employeeId: empId, employeeName: emp.name, type: type, from: from, to: to, reason: reason || '', status: 'pending', createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave applied.');
        document.getElementById('leaveReason').value = '';
    });

    document.getElementById('approveLeaveBtn')?.addEventListener('click', async function() {
        var data = getAppData();
        var pending = data.leaves?.find(function(l) { return l.status === 'pending'; });
        if (!pending) { showToast('No pending requests.', 'warning'); return; }
        pending.status = 'approved';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Approved.');
    });

    document.getElementById('rejectLeaveBtn')?.addEventListener('click', async function() {
        var data = getAppData();
        var pending = data.leaves?.find(function(l) { return l.status === 'pending'; });
        if (!pending) { showToast('No pending requests.', 'warning'); return; }
        pending.status = 'rejected';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('❌ Rejected.');
    });

    // -------------------- PAYROLL --------------------
    document.getElementById('calculatePayrollBtn')?.addEventListener('click', async function() {
        if (!canManage('payroll')) { showToast('⛔ No permission.', 'error'); return; }
        var empId = document.getElementById('payrollEmployeeSelect')?.value;
        var month = document.getElementById('payrollMonth')?.value;
        var basic = parseFloat(document.getElementById('payrollBasic').value) || 0;
        var allowances = parseFloat(document.getElementById('payrollAllowances').value) || 0;
        var deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
        var otHours = parseFloat(document.getElementById('payrollOT').value) || 0;
        if (!empId || !month) { showToast('Select employee and month.', 'error'); return; }
        var data = getAppData();
        var emp = data.employees.find(function(e) { return e.id === empId; });
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
        showToast('✅ Payroll for ' + emp.name + ': LKR ' + formatCurrency(net));
    });

    document.getElementById('generatePayslipBtn')?.addEventListener('click', function() {
        showToast('📄 Payslip generation coming soon.', 'info');
    });

    // -------------------- PURCHASING --------------------
    document.getElementById('addSupplierBtn')?.addEventListener('click', async function() {
        var name = document.getElementById('supplierName').value.trim();
        var contact = document.getElementById('supplierContact').value.trim();
        var address = document.getElementById('supplierAddress').value.trim();
        if (!name) { showToast('Enter supplier name.', 'error'); return; }
        var data = getAppData();
        if (!data.suppliers) data.suppliers = [];
        data.suppliers.push({ id: generateId(), name: name, contact: contact, address: address, createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderPurchasing();
        showToast('✅ Supplier added.');
        document.getElementById('supplierName').value = '';
        document.getElementById('supplierContact').value = '';
        document.getElementById('supplierAddress').value = '';
    });

    document.getElementById('clearSupplierBtn')?.addEventListener('click', function() {
        document.getElementById('supplierName').value = '';
        document.getElementById('supplierContact').value = '';
        document.getElementById('supplierAddress').value = '';
    });

    document.getElementById('addPurchaseOrderBtn')?.addEventListener('click', async function() {
        var supplierId = document.getElementById('poSupplierSelect')?.value;
        var itemId = document.getElementById('poItemSelect')?.value;
        var qty = parseInt(document.getElementById('poQty').value) || 0;
        var price = parseFloat(document.getElementById('poPrice').value) || 0;
        if (!supplierId || !itemId || qty <= 0 || price <= 0) {
            showToast('Fill all fields.', 'error');
            return;
        }
        var data = getAppData();
        var supplier = data.suppliers?.find(function(s) { return s.id === supplierId; });
        var item = data.items?.find(function(i) { return i.id === itemId; });
        if (!supplier || !item) { showToast('Not found.', 'error'); return; }
        if (!data.purchaseOrders) data.purchaseOrders = [];
        data.purchaseOrders.push({ id: generateId(), supplierId: supplierId, supplierName: supplier.name, itemId: itemId, itemName: item.name, qty: qty, price: price, status: 'pending', createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderPurchasing();
        showToast('✅ PO created.');
        document.getElementById('poQty').value = '';
        document.getElementById('poPrice').value = '';
    });

    // -------------------- SALES (Cart) --------------------
    var salesCart = [];
    window.salesCart = salesCart;

    document.getElementById('salesAddToCartBtn')?.addEventListener('click', function() {
        var itemId = document.getElementById('salesCartItemSelect').value;
        var qty = parseInt(document.getElementById('salesCartQty').value) || 1;
        if (!itemId) { showToast('Select item.', 'error'); return; }
        var data = getAppData();
        var item = data.items.find(function(i) { return i.id === itemId; });
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast('Insufficient stock: ' + item.qty, 'error'); return; }
        var existing = salesCart.find(function(i) { return i.id === itemId; });
        if (existing) existing.qty += qty;
        else salesCart.push({ id: itemId, name: item.name, qty: qty, price: item.price || 0 });
        renderSalesCart();
        showToast('✅ Added ' + qty + ' x ' + item.name);
        document.getElementById('salesCartQty').value = '1';
    });

    document.getElementById('salesClearCartBtn')?.addEventListener('click', function() {
        if (salesCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
        if (!confirm('Clear cart?')) return;
        salesCart = [];
        renderSalesCart();
        showToast('🧹 Cleared.');
    });

    document.getElementById('createSalesOrderBtn')?.addEventListener('click', async function() {
        if (!canManage('sales') && !canView('sales')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        if (salesCart.length === 0) { showToast('Cart is empty.', 'error'); return; }
        var customerId = document.getElementById('salesCustomerSelect').value;
        var orderDate = document.getElementById('salesOrderDate').value;
        if (!customerId) { showToast('Select customer.', 'error'); return; }
        var data = getAppData();
        var customer = data.customers.find(function(c) { return c.id === customerId; });
        if (!customer) { showToast('Customer not found.', 'error'); return; }

        var total = 0;
        var orderItems = salesCart.map(function(item) {
            total += item.qty * item.price;
            return { id: item.id, name: item.name, qty: item.qty, price: item.price };
        });

        // Deduct stock
        var stockError = false;
        salesCart.forEach(function(cartItem) {
            var item = data.items.find(function(i) { return i.id === cartItem.id; });
            if (item) {
                if ((item.qty || 0) >= cartItem.qty) {
                    item.qty = (item.qty || 0) - cartItem.qty;
                    item.updatedAt = nowISO();
                } else stockError = true;
            }
        });
        if (stockError) {
            showToast('⚠️ Stock insufficient. Please reload.', 'error');
            await loadAllData();
            return;
        }

        if (!data.salesOrders) data.salesOrders = [];
        var order = { id: generateId(), orderNo: 'SO-' + String(data.salesOrders.length + 1).padStart(4, '0'), customerId: customerId, customerName: customer.name, items: orderItems, total: total, date: orderDate || nowISO(), createdAt: nowISO() };
        data.salesOrders.push(order);
        orderItems.forEach(function(item) {
            data.salesData.push({ id: generateId(), customer: customer.name, item: item.name, qty: item.qty, total: item.qty * item.price, date: order.date });
        });
        if (!data.logs) data.logs = [];
        data.logs.push({ id: generateId(), user: getCurrentUser()?.name || 'System', action: 'Sales Order', details: '#' + order.orderNo + ' - ' + customer.name + ' - LKR ' + formatCurrency(total), date: nowISO() });

        setAppData(data);
        await saveAllData();
        salesCart = [];
        renderSalesCart();
        renderSales();
        renderDashboard();
        showToast('✅ Order #' + order.orderNo + ' created! Total: LKR ' + formatCurrency(total));
    });

    document.getElementById('salesAddCustomerBtn')?.addEventListener('click', function() {
        if (canManage('customers')) document.getElementById('addCustomerBtn')?.click();
        else showToast('⛔ No permission.', 'error');
    });

    // -------------------- DELIVERIES (Cart + Status) --------------------
    var deliveryCart = [];
    window.deliveryCart = deliveryCart;

    document.getElementById('delAddToCartBtn')?.addEventListener('click', function() {
        var itemId = document.getElementById('delCartItemSelect').value;
        var qty = parseInt(document.getElementById('delCartQty').value) || 1;
        if (!itemId) { showToast('Select item.', 'error'); return; }
        var data = getAppData();
        var item = data.items.find(function(i) { return i.id === itemId; });
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast('Insufficient stock: ' + item.qty, 'error'); return; }
        var existing = deliveryCart.find(function(i) { return i.id === itemId; });
        if (existing) existing.qty += qty;
        else deliveryCart.push({ id: itemId, name: item.name, qty: qty });
        renderDeliveryCart();
        showToast('✅ Added ' + qty + ' x ' + item.name);
        document.getElementById('delCartQty').value = '1';
    });

    document.getElementById('delClearCartBtn')?.addEventListener('click', function() {
        if (deliveryCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
        if (!confirm('Clear items?')) return;
        deliveryCart = [];
        renderDeliveryCart();
        showToast('🧹 Cleared.');
    });

    document.getElementById('deliverSubmitBtn')?.addEventListener('click', async function() {
        if (!canManage('deliveries') && !hasPermission('create_deliveries')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        var customerId = document.getElementById('delCustomerSelect')?.value;
        var driverId = document.getElementById('delDriverSelect')?.value;
        var vehicleId = document.getElementById('delVehicleSelect')?.value;
        var status = document.getElementById('delStatusSelect')?.value || 'pending';
        var route = document.getElementById('delRoute')?.value.trim() || '';
        var notes = document.getElementById('delNotes')?.value.trim() || '';
        var scheduledDate = document.getElementById('delScheduledDate')?.value || nowISO();

        if (!customerId) { showToast('Select customer.', 'error'); return; }
        if (deliveryCart.length === 0) { showToast('Add at least one item.', 'error'); return; }

        var data = getAppData();
        var customer = data.customers.find(function(c) { return c.id === customerId; });
        var driver = data.employees.find(function(e) { return e.id === driverId; });
        var vehicle = data.vehicles.find(function(v) { return v.id === vehicleId; });
        if (!customer) { showToast('Customer not found.', 'error'); return; }

        // Deduct stock
        var stockError = false;
        deliveryCart.forEach(function(cartItem) {
            var item = data.items.find(function(i) { return i.id === cartItem.id; });
            if (item) {
                if ((item.qty || 0) >= cartItem.qty) {
                    item.qty = (item.qty || 0) - cartItem.qty;
                    item.updatedAt = nowISO();
                } else stockError = true;
            }
        });
        if (stockError) {
            showToast('⚠️ Stock insufficient. Reload.', 'error');
            await loadAllData();
            return;
        }

        var delivery = { id: generateId(), customerId: customerId, customerName: customer.name, items: deliveryCart.map(function(i) { return { id: i.id, name: i.name, qty: i.qty }; }), driverId: driverId, driverName: driver ? driver.name : '—', vehicleId: vehicleId, vehicleNo: vehicle ? vehicle.vehicleNo : '—', status: status, route: route, notes: notes, date: scheduledDate, updatedAt: nowISO() };
        data.deliveries.push(delivery);
        if (!data.logs) data.logs = [];
        data.logs.push({ id: generateId(), user: getCurrentUser()?.name || 'System', action: 'Delivery Created', details: customer.name + ' - ' + delivery.items.length + ' items - ' + status, date: nowISO() });

        setAppData(data);
        await saveAllData();
        deliveryCart = [];
        renderDeliveryCart();
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        populateDeliveryDropdowns();
        renderDeliveries();
        renderDashboard();
        showToast('✅ Delivery for ' + customer.name + ' created.');
    });

    document.getElementById('refreshDeliveriesBtn')?.addEventListener('click', function() {
        renderDeliveries();
        showToast('🔄 Refreshed.');
    });

    document.getElementById('delDateFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('delStatusFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('clearDelFilter')?.addEventListener('click', function() {
        document.getElementById('delDateFilter').value = '';
        document.getElementById('delStatusFilter').value = 'all';
        renderDeliveries();
    });

    document.getElementById('clearDeliveryForm')?.addEventListener('click', function() {
        document.getElementById('delCustomerSelect').value = '';
        document.getElementById('delDriverSelect').value = '';
        document.getElementById('delVehicleSelect').value = '';
        document.getElementById('delScheduledDate').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        deliveryCart = [];
        renderDeliveryCart();
        populateDeliveryDropdowns();
        showToast('🧹 Form cleared.');
    });

    // -------------------- FINANCE (Cheque details toggle) --------------------
    document.getElementById('financePaymentMethod')?.addEventListener('change', function() {
        document.getElementById('chequeDetails').style.display = this.value === 'cheque' ? 'block' : 'none';
    });

    document.getElementById('addFinanceBtn')?.addEventListener('click', async function() {
        if (!canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        var type = document.getElementById('financeType').value;
        var amount = parseFloat(document.getElementById('financeAmount').value);
        var category = document.getElementById('financeCategory').value;
        var desc = document.getElementById('financeDesc').value.trim();
        var paymentMethod = document.getElementById('financePaymentMethod').value;
        var budgetInput = document.getElementById('financeBudget')?.value.trim();

        var chequeNo = document.getElementById('financeChequeNo').value.trim();
        var bankName = document.getElementById('financeBankName').value.trim();
        var chequeDate = document.getElementById('financeChequeDate').value;
        var chequeAmount = parseFloat(document.getElementById('financeChequeAmount').value) || amount;

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
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        document.getElementById('financeBudget')?.value = '';
        document.getElementById('financeChequeNo').value = '';
        document.getElementById('financeBankName').value = '';
        document.getElementById('financeChequeDate').value = '';
        document.getElementById('financeChequeAmount').value = '';
        document.getElementById('financePaymentMethod').value = 'cash';
        document.getElementById('chequeDetails').style.display = 'none';
        showToast('✅ ' + type + ' recorded.');
    });

    document.getElementById('clearFinanceBtn')?.addEventListener('click', function() {
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        document.getElementById('financeBudget')?.value = '';
        document.getElementById('financeChequeNo').value = '';
        document.getElementById('financeBankName').value = '';
        document.getElementById('financeChequeDate').value = '';
        document.getElementById('financeChequeAmount').value = '';
        document.getElementById('financePaymentMethod').value = 'cash';
        document.getElementById('chequeDetails').style.display = 'none';
        showToast('🧹 Finance form cleared.');
    });

    // -------------------- PRODUCTS (Update Attributes) --------------------
    document.getElementById('updateProductAttributesBtn')?.addEventListener('click', async function() {
        if (!canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        var data = getAppData();
        var items = data.items || [];
        var productCode = document.getElementById('productCode').value.trim();
        var unit = document.getElementById('productUnit').value;
        var costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;
        var taxRate = parseFloat(document.getElementById('productTaxRate').value) || 0;
        var reorderLevel = parseInt(document.getElementById('productReorderLevel').value) || 0;
        var stockAlert = document.getElementById('productStockAlert').value;

        var item = items.find(function(i) { return i.productCode === productCode; });
        if (!item && items.length > 0) item = items[0];
        if (!item) { showToast('No product found. Add items first.', 'error'); return; }

        var idx = data.items.findIndex(function(i) { return i.id === item.id; });
        if (idx > -1) {
            data.items[idx] = { ...data.items[idx], productCode: productCode || data.items[idx].productCode, unit: unit || data.items[idx].unit || 'Pcs', costPrice: costPrice || data.items[idx].costPrice || 0, taxRate: taxRate || data.items[idx].taxRate || 0, reorderLevel: reorderLevel || data.items[idx].reorderLevel || 0, stockAlert: stockAlert || data.items[idx].stockAlert || 'enabled', updatedAt: nowISO() };
            setAppData(data);
            await saveAllData();
            renderProducts();
            renderInventory();
            showToast('✅ Product attributes updated.');
        }
    });

    // -------------------- VOUCHER --------------------
    document.getElementById('addVoucherBtn')?.addEventListener('click', async function() {
        if (!canManage('voucher') && !canManage('finance')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        var voucherNo = document.getElementById('voucherNo').value.trim() || ('VCH-' + String((getAppData().vouchers || []).length + 1).padStart(4, '0'));
        var date = document.getElementById('voucherDate').value || todayStr();
        var paidTo = document.getElementById('voucherPaidTo').value.trim();
        var amount = parseFloat(document.getElementById('voucherAmount').value) || 0;
        var description = document.getElementById('voucherDescription').value.trim();
        var approvedBy = document.getElementById('voucherApprovedBy').value.trim();
        var receivedBy = document.getElementById('voucherReceivedBy').value.trim();
        var signature = document.getElementById('voucherSignature').value.trim();

        var paymentTypes = [];
        document.querySelectorAll('.voucher-payment-type:checked').forEach(function(cb) { paymentTypes.push(cb.value); });
        var otherText = document.getElementById('voucherOtherText').value.trim();
        if (otherText) paymentTypes.push(otherText);

        if (!paidTo) { showToast('Enter recipient.', 'error'); return; }
        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }

        var data = getAppData();
        if (!data.vouchers) data.vouchers = [];
        data.vouchers.push({ id: generateId(), voucherNo: voucherNo, date: date, paidTo: paidTo, amount: amount, paymentTypes: paymentTypes.length > 0 ? paymentTypes : ['Other'], description: description || '', approvedBy: approvedBy || '', receivedBy: receivedBy || '', signature: signature || '', status: 'paid', createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderVouchers();
        showToast('✅ Voucher #' + voucherNo + ' saved.');
        document.getElementById('voucherNo').value = '';
        document.getElementById('voucherDate').value = '';
        document.getElementById('voucherPaidTo').value = '';
        document.getElementById('voucherAmount').value = '';
        document.getElementById('voucherDescription').value = '';
        document.getElementById('voucherApprovedBy').value = '';
        document.getElementById('voucherReceivedBy').value = '';
        document.getElementById('voucherSignature').value = '';
        document.querySelectorAll('.voucher-payment-type').forEach(function(cb) { cb.checked = false; });
        document.getElementById('voucherOtherText').value = '';
    });

    document.getElementById('printVoucherBtn')?.addEventListener('click', function() {
        showToast('🖨️ Print coming soon.', 'info');
    });
    document.getElementById('downloadVoucherBtn')?.addEventListener('click', function() {
        showToast('📄 PDF coming soon.', 'info');
    });
    document.getElementById('clearVoucherForm')?.addEventListener('click', function() {
        document.getElementById('voucherNo').value = '';
        document.getElementById('voucherDate').value = '';
        document.getElementById('voucherPaidTo').value = '';
        document.getElementById('voucherAmount').value = '';
        document.getElementById('voucherDescription').value = '';
        document.getElementById('voucherApprovedBy').value = '';
        document.getElementById('voucherReceivedBy').value = '';
        document.getElementById('voucherSignature').value = '';
        document.querySelectorAll('.voucher-payment-type').forEach(function(cb) { cb.checked = false; });
        document.getElementById('voucherOtherText').value = '';
        showToast('🧹 Form cleared.');
    });

    // -------------------- FLEET --------------------
    document.getElementById('addVehicleBtn')?.addEventListener('click', async function() {
        if (!canManage('vehicles') && !canView('fleet')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        var vehicleNo = document.getElementById('vehicleNo').value.trim();
        var driver = document.getElementById('vehicleDriver').value.trim();
        var fuel = document.getElementById('vehicleFuel').value.trim();
        var insurance = document.getElementById('vehicleInsurance').value.trim();
        var service = document.getElementById('vehicleService').value;

        if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }

        var data = getAppData();
        if (!data.vehicles) data.vehicles = [];

        var editId = document.getElementById('addVehicleBtn').dataset.editId;
        if (editId) {
            var idx = data.vehicles.findIndex(function(v) { return v.id === editId; });
            if (idx > -1) {
                data.vehicles[idx] = { ...data.vehicles[idx], vehicleNo: vehicleNo, driver: driver, fuel: fuel, insurance: insurance, service: service, updatedAt: nowISO() };
            }
            delete document.getElementById('addVehicleBtn').dataset.editId;
            document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        } else {
            data.vehicles.push({ id: generateId(), vehicleNo: vehicleNo, driver: driver, fuel: fuel, insurance: insurance, service: service, status: 'active', createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        renderFleet();
        showToast('✅ Vehicle saved.');
        document.getElementById('vehicleNo').value = '';
        document.getElementById('vehicleDriver').value = '';
        document.getElementById('vehicleFuel').value = '';
        document.getElementById('vehicleInsurance').value = '';
        document.getElementById('vehicleService').value = '';
        document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        delete document.getElementById('addVehicleBtn').dataset.editId;
    });

    // -------------------- REPORTS --------------------
    document.getElementById('generateReportBtn')?.addEventListener('click', renderReports);
    document.getElementById('reportType')?.addEventListener('change', renderReports);
    document.getElementById('applyReportFilters')?.addEventListener('click', renderReports);
    document.getElementById('clearReportFilters')?.addEventListener('click', function() {
        document.getElementById('reportFrom').value = '';
        document.getElementById('reportTo').value = '';
        renderReports();
    });

    document.getElementById('exportReportBtn')?.addEventListener('click', function() {
        var content = document.getElementById('reportContent');
        if (!content) return;
        var tables = content.querySelectorAll('table');
        if (tables.length === 0) { showToast('No data.', 'warning'); return; }
        var csv = '';
        tables.forEach(function(table) {
            table.querySelectorAll('tr').forEach(function(row) {
                var cells = row.querySelectorAll('th, td');
                var rowData = [];
                cells.forEach(function(cell) { rowData.push(cell.textContent.trim().replace(/,/g, '')); });
                csv += rowData.join(',') + '\n';
            });
            csv += '\n';
        });
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'report_' + todayStr() + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 CSV exported.');
    });

    document.getElementById('printReportBtn')?.addEventListener('click', function() { window.print(); });

    // -------------------- SETTINGS --------------------
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async function() {
        var data = getAppData();
        if (!data.settings) data.settings = {};
        data.settings.company = document.getElementById('settingsCompany').value.trim();
        data.settings.address = document.getElementById('settingsAddress').value.trim();
        data.settings.phone = document.getElementById('settingsPhone').value.trim();
        data.settings.email = document.getElementById('settingsEmail').value.trim();
        setAppData(data);
        await saveAllData();
        showToast('✅ Settings saved.');
    });

    document.getElementById('saveSettingsBtn2')?.addEventListener('click', async function() {
        var data = getAppData();
        if (!data.settings) data.settings = {};
        data.settings.company = document.getElementById('settingsCompany').value.trim();
        data.settings.address = document.getElementById('settingsAddress').value.trim();
        data.settings.phone = document.getElementById('settingsPhone').value.trim();
        data.settings.email = document.getElementById('settingsEmail').value.trim();
        setAppData(data);
        await saveAllData();
        showToast('✅ Settings saved.');
    });

    document.getElementById('backupDataBtn')?.addEventListener('click', function() {
        var data = getAppData();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'jayasinghe_erp_backup_' + todayStr() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Backup downloaded.');
    });

    document.getElementById('restoreDataBtn')?.addEventListener('click', function() {
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
                    showToast('✅ Data restored.');
                } catch(err) {
                    showToast('❌ Invalid file.', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    document.getElementById('clearDataBtn')?.addEventListener('click', async function() {
        if (!confirm('⚠️ Delete ALL data? Cannot undo!')) return;
        var data = getAppData();
        Object.keys(data).forEach(function(key) {
            if (Array.isArray(data[key])) data[key] = [];
            else if (typeof data[key] === 'object' && data[key] !== null) data[key] = {};
        });
        setAppData(data);
        await saveAllData();
        renderAll();
        showToast('🗑️ All data cleared.');
    });

    document.getElementById('clearLogsBtn')?.addEventListener('click', async function() {
        if (!confirm('Clear logs?')) return;
        var data = getAppData();
        data.logs = [];
        setAppData(data);
        await saveAllData();
        renderAdministration();
        showToast('🧹 Logs cleared.');
    });

    // -------------------- SET DEFAULTS --------------------
    var setDefaultDate = function(id) {
        var el = document.getElementById(id);
        if (el && !el.value) {
            if (id === 'delScheduledDate') el.value = nowISO().slice(0, 16);
            else if (id === 'payrollMonth') el.value = todayStr().slice(0, 7);
            else el.value = todayStr();
        }
    };
    ['voucherDate', 'salesOrderDate', 'delScheduledDate', 'payrollMonth', 'leaveFrom', 'leaveTo'].forEach(setDefaultDate);

    // Load data and initialize
    loadAllData().then(function() {
        var user = getCurrentUser();
        if (user) {
            renderSidebar();
            switchPanel('dashboard');
        }
        populateItemDropdowns();
        populateDeliveryDropdowns();
    });

    console.log('✅ ERP initialized.');
}

// ============================================================
// START – ensure init runs
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
