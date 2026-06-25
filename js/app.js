// ============================================================
// MAIN APP MODULE (Complete - Enterprise)
// ============================================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
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
    const data = getAppData();
    const items = data.items || [];
    const categories = data.categories || [];
    const brands = data.brands || [];

    const catSelect = document.getElementById('itemCategory');
    if (catSelect) {
        const val = catSelect.value;
        catSelect.innerHTML = '<option value="">Select...</option>';
        categories.forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);
        if (val && catSelect.querySelector(`option[value="${val}"]`)) catSelect.value = val;
    }

    const brandSelect = document.getElementById('itemBrand');
    if (brandSelect) {
        const val = brandSelect.value;
        brandSelect.innerHTML = '<option value="">Select...</option>';
        brands.forEach(b => brandSelect.innerHTML += `<option value="${b}">${b}</option>`);
        if (val && brandSelect.querySelector(`option[value="${val}"]`)) brandSelect.value = val;
    }

    const cartSelect = document.getElementById('salesCartItemSelect');
    if (cartSelect) {
        const val = cartSelect.value;
        cartSelect.innerHTML = '<option value="">Select Item</option>';
        items.filter(i => i.status !== 'inactive').forEach(i => {
            cartSelect.innerHTML += `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0} avail) - LKR ${formatCurrency(i.price||0)}</option>`;
        });
        if (val && cartSelect.querySelector(`option[value="${val}"]`)) cartSelect.value = val;
    }

    const delSelect = document.getElementById('delCartItemSelect');
    if (delSelect) {
        const val = delSelect.value;
        delSelect.innerHTML = '<option value="">Select Item</option>';
        items.filter(i => i.status !== 'inactive').forEach(i => {
            delSelect.innerHTML += `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0} avail)</option>`;
        });
        if (val && delSelect.querySelector(`option[value="${val}"]`)) delSelect.value = val;
    }

    const poSelect = document.getElementById('poItemSelect');
    if (poSelect) {
        const val = poSelect.value;
        poSelect.innerHTML = '<option value="">Select</option>';
        items.forEach(i => poSelect.innerHTML += `<option value="${i.id}">${escapeHtml(i.name)}</option>`);
        if (val && poSelect.querySelector(`option[value="${val}"]`)) poSelect.value = val;
    }
}
window.populateItemDropdowns = populateItemDropdowns;

function populateDeliveryDropdowns() {
    const data = getAppData();
    const employees = data.employees || [];
    const vehicles = data.vehicles || [];
    const customers = data.customers || [];

    const custSelect = document.getElementById('delCustomerSelect');
    if (custSelect) {
        const val = custSelect.value;
        custSelect.innerHTML = '<option value="">-- Select --</option>';
        customers.forEach(c => custSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)}</option>`);
        if (val && custSelect.querySelector(`option[value="${val}"]`)) custSelect.value = val;
    }

    const driverSelect = document.getElementById('delDriverSelect');
    if (driverSelect) {
        const val = driverSelect.value;
        driverSelect.innerHTML = '<option value="">-- Select --</option>';
        const drivers = employees.filter(e => e.department === 'Delivery' || (e.designation || '').toLowerCase().includes('driver'));
        drivers.forEach(e => driverSelect.innerHTML += `<option value="${e.id}">${escapeHtml(e.name)}</option>`);
        if (val && driverSelect.querySelector(`option[value="${val}"]`)) driverSelect.value = val;
    }

    const vehicleSelect = document.getElementById('delVehicleSelect');
    if (vehicleSelect) {
        const val = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="">-- Select --</option>';
        vehicles.forEach(v => vehicleSelect.innerHTML += `<option value="${v.id}">${escapeHtml(v.vehicleNo)}</option>`);
        if (val && vehicleSelect.querySelector(`option[value="${val}"]`)) vehicleSelect.value = val;
    }
}
window.populateDeliveryDropdowns = populateDeliveryDropdowns;

function renderAll() {
    const active = document.querySelector('.panel.active');
    if (active) switchPanel(active.id.replace('panel-', ''));
    else switchPanel('dashboard');
    renderSidebar();
}
window.renderAll = renderAll;

function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    const user = getCurrentUser();
    if (!user) { showToast('Please login.', 'error'); return; }
    const data = getAppData();
    const emp = data.employees.find(e => e.id === user.uid || e.email === user.email);
    document.getElementById('profileName').textContent = emp?.name || user.name || user.email;
    document.getElementById('profileRole').textContent = emp?.department || user.role || 'Employee';
    const details = document.getElementById('profileDetails');
    if (details) {
        details.innerHTML = `
            <div><strong>Email:</strong> ${emp?.email || user.email}</div>
            <div><strong>NIC:</strong> ${emp?.nic || '—'}</div>
            <div><strong>Contact:</strong> ${emp?.contact || '—'}</div>
            <div><strong>Department:</strong> ${emp?.department || '—'}</div>
            <div><strong>Designation:</strong> ${emp?.designation || '—'}</div>
            <div><strong>Joined:</strong> ${emp?.joinedDate ? formatDate(emp.joinedDate) : '—'}</div>
            <div><strong>Status:</strong> ${emp?.status || 'active'}</div>
        `;
    }
    const stats = document.getElementById('profileStats');
    if (stats) {
        const att = data.attendance?.filter(a => a.employeeId === user.uid) || [];
        const leaves = data.leaves?.filter(l => l.employeeId === user.uid) || [];
        const payroll = data.payroll?.filter(p => p.employeeId === user.uid) || [];
        stats.innerHTML = `
            <div><strong>${att.length}</strong><br><span style="font-size:10px;color:var(--text-muted);">Days Present</span></div>
            <div><strong>${leaves.length}</strong><br><span style="font-size:10px;color:var(--text-muted);">Leave Requests</span></div>
            <div><strong>${payroll.length}</strong><br><span style="font-size:10px;color:var(--text-muted);">Payroll Records</span></div>
            <div><strong>${emp?.salary ? 'LKR ' + formatCurrency(emp.salary) : '—'}</strong><br><span style="font-size:10px;color:var(--text-muted);">Salary</span></div>
        `;
    }
    modal.classList.add('open');
}
window.openProfileModal = openProfileModal;

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const icon = document.getElementById('darkModeToggle')?.querySelector('i');
    if (icon) icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

let currentLang = 'en';
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'si' : 'en';
    document.getElementById('langToggle').textContent = currentLang === 'en' ? '🇱🇰 SI' : '🇺🇸 EN';
    renderSidebar();
    const active = document.querySelector('.panel.active');
    if (active) switchPanel(active.id.replace('panel-', ''));
    showToast(currentLang === 'en' ? '🌐 English' : '🌐 සිංහල');
}

let html5QrCode = null;
function openScanner() {
    const container = document.getElementById('scannerContainer');
    const reader = document.getElementById('scannerReader');
    if (!container || !reader) return;
    container.style.display = 'block';
    if (html5QrCode) { try { html5QrCode.stop(); } catch(e) {} html5QrCode = null; }
    html5QrCode = new Html5Qrcode("scannerReader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 150 } },
        (decodedText) => {
            document.getElementById('itemBarcode').value = decodedText;
            showToast('✅ Scanned: ' + decodedText);
            closeScanner();
        },
        () => {}
    ).catch(err => showToast('⚠️ Camera error: ' + err.message, 'error'));
}
function closeScanner() {
    const container = document.getElementById('scannerContainer');
    if (container) container.style.display = 'none';
    if (html5QrCode) { try { html5QrCode.stop(); } catch(e) {} html5QrCode = null; }
}
window.openScanner = openScanner;
window.closeScanner = closeScanner;

// ============================================================
// INIT (with retry if not called)
// ============================================================
function init() {
    console.log('🚀 Initializing ERP...');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        const icon = document.getElementById('darkModeToggle')?.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
    }

    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
    }
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
    document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);

    // Clear login
    document.getElementById('clearLoginBtn')?.addEventListener('click', () => {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        showToast('🧹 Cleared.');
    });

    // -------------------- EMPLOYEE MODAL --------------------
    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => {
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

    document.getElementById('empModalClose')?.addEventListener('click', () => {
        document.getElementById('employeeModal').classList.remove('open');
    });
    document.getElementById('employeeModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('empSaveBtn')?.addEventListener('click', async () => {
        if (!canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('empEditId').value;
        const name = document.getElementById('empName').value.trim();
        const nic = document.getElementById('empNIC').value.trim();
        const department = document.getElementById('empDept').value;
        const designation = document.getElementById('empDesignation').value.trim();
        const contact = document.getElementById('empContact').value.trim();
        const emergency = document.getElementById('empEmergency').value.trim();
        const address = document.getElementById('empAddress').value.trim();
        const joinedDate = document.getElementById('empJoined').value;
        const salary = parseFloat(document.getElementById('empSalary').value) || 0;
        const epf = document.getElementById('empEpf').value.trim();
        const email = document.getElementById('empUsername').value.trim();
        const password = document.getElementById('empPassword').value;
        const status = document.getElementById('empStatus').value;

        if (!name) { showToast('Enter name.', 'error'); return; }
        if (!email) { showToast('Enter email.', 'error'); return; }

        const data = getAppData();
        if (!data.employees) data.employees = [];

        if (id) {
            const idx = data.employees.findIndex(e => e.id === id);
            if (idx > -1) {
                data.employees[idx] = { ...data.employees[idx], name, nic, department, designation, contact, emergency, address, joinedDate, salary, epf, email, status, updatedAt: nowISO() };
                if (password && password.length >= 6) {
                    data.employees[idx].password = password;
                    try {
                        const user = firebase.auth().currentUser;
                        if (user && user.email === email) await user.updatePassword(password);
                    } catch(e) { console.warn(e); }
                }
            }
        } else {
            const newEmp = { id: generateId(), name, nic, department, designation, contact, emergency, address, joinedDate, salary, epf, email, status, createdAt: nowISO(), updatedAt: nowISO() };
            if (password && password.length >= 6) {
                try {
                    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
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
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
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
        const items = getAppData().items || [];
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

    document.getElementById('itemModalClose')?.addEventListener('click', () => {
        document.getElementById('itemModal').classList.remove('open');
    });
    document.getElementById('itemModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('scanBarcodeBtn')?.addEventListener('click', openScanner);
    document.getElementById('closeScannerBtn')?.addEventListener('click', closeScanner);

    document.getElementById('itemSaveBtn')?.addEventListener('click', async () => {
        if (!canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('itemEditId').value;
        const barcode = document.getElementById('itemBarcode').value.trim() || generateId().slice(0, 8);
        const name = document.getElementById('itemName').value.trim();
        const qty = parseInt(document.getElementById('itemQty').value) || 0;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const category = document.getElementById('itemCategory').value;
        const brand = document.getElementById('itemBrand').value;
        const desc = document.getElementById('itemDesc').value.trim();
        const expiry = document.getElementById('itemExpiry').value;
        const batch = document.getElementById('itemBatch').value.trim();
        const status = document.getElementById('itemStatus').value;
        const productCode = document.getElementById('itemProductCode').value.trim() || ('PRD-' + String((getAppData().items || []).length + 1).padStart(4, '0'));
        const unit = document.getElementById('itemUnit').value;
        const costPrice = parseFloat(document.getElementById('itemCostPrice').value) || 0;
        const reorderLevel = parseInt(document.getElementById('itemReorderLevel').value) || 0;
        const taxRate = parseFloat(document.getElementById('itemTaxRate').value) || 0;
        const stockAlert = document.getElementById('itemStockAlert').value;

        if (!name) { showToast('Enter item name.', 'error'); return; }

        const data = getAppData();
        if (!data.items) data.items = [];

        if (id) {
            const idx = data.items.findIndex(i => i.id === id);
            if (idx > -1) {
                data.items[idx] = { ...data.items[idx], barcode, name, qty, price, category, brand, desc, expiry, batch, status, productCode, unit, costPrice, reorderLevel, taxRate, stockAlert, updatedAt: nowISO() };
            }
        } else {
            data.items.push({ id: generateId(), barcode, name, qty, price, category, brand, desc, expiry, batch, status, productCode, unit, costPrice, reorderLevel, taxRate, stockAlert, createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('itemModal').classList.remove('open');
        renderInventory();
        renderDashboard();
        showToast('✅ Item saved.');
    });

    // -------------------- CUSTOMER MODAL --------------------
    document.getElementById('addCustomerBtn')?.addEventListener('click', () => {
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

    document.getElementById('custModalClose')?.addEventListener('click', () => {
        document.getElementById('customerModal').classList.remove('open');
    });
    document.getElementById('customerModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    document.getElementById('custSaveBtn')?.addEventListener('click', async () => {
        if (!canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('custEditId').value;
        const name = document.getElementById('custName').value.trim();
        const contact = document.getElementById('custContact').value.trim();
        const category = document.getElementById('custCategory').value;
        const address = document.getElementById('custAddress').value.trim();
        const creditLimit = parseFloat(document.getElementById('custCreditLimit').value) || 0;
        const balance = parseFloat(document.getElementById('custBalance').value) || 0;

        if (!name) { showToast('Enter name.', 'error'); return; }

        const data = getAppData();
        if (!data.customers) data.customers = [];
        if (id) {
            const idx = data.customers.findIndex(c => c.id === id);
            if (idx > -1) {
                data.customers[idx] = { ...data.customers[idx], name, contact, category, address, creditLimit, balance, updatedAt: nowISO() };
            }
        } else {
            data.customers.push({ id: generateId(), name, contact, category, address, creditLimit, balance, createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('customerModal').classList.remove('open');
        renderCustomers();
        showToast('✅ Customer saved.');
    });

    // -------------------- PROFILE --------------------
    document.getElementById('userBadge')?.addEventListener('click', openProfileModal);
    document.getElementById('profileModalClose')?.addEventListener('click', () => {
        document.getElementById('profileModal').classList.remove('open');
    });
    document.getElementById('profileModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    // -------------------- NOTIFICATIONS --------------------
    document.getElementById('notifBell')?.addEventListener('click', () => {
        const modal = document.getElementById('notifModal');
        const list = document.getElementById('notifList');
        if (!modal || !list) return;
        const data = getAppData();
        const notifs = data.notifications || [];
        if (notifs.length === 0) {
            list.innerHTML = '<div class="empty-state"><span class="icon">🔔</span><p>No notifications.</p></div>';
        } else {
            let html = '';
            notifs.slice().reverse().forEach(n => {
                html += `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;"><strong>${n.title || 'Notification'}</strong><br>${n.message || ''}<br><span style="font-size:11px;color:var(--text-muted);">${formatDateTime(n.date)}</span></div>`;
            });
            list.innerHTML = html;
        }
        modal.classList.add('open');
    });
    document.getElementById('notifModalClose')?.addEventListener('click', () => {
        document.getElementById('notifModal').classList.remove('open');
    });
    document.getElementById('notifModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    // -------------------- FILTERS --------------------
    document.getElementById('empSearch')?.addEventListener('input', renderEmployees);
    document.getElementById('empDeptFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('empStatusFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('clearEmpFilters')?.addEventListener('click', () => {
        document.getElementById('empSearch').value = '';
        document.getElementById('empDeptFilter').value = 'all';
        document.getElementById('empStatusFilter').value = 'all';
        renderEmployees();
    });

    document.getElementById('invSearch')?.addEventListener('input', renderInventory);
    document.getElementById('invCatFilter')?.addEventListener('change', renderInventory);
    document.getElementById('invSort')?.addEventListener('change', renderInventory);
    document.getElementById('clearInvFilters')?.addEventListener('click', () => {
        document.getElementById('invSearch').value = '';
        document.getElementById('invCatFilter').value = 'all';
        document.getElementById('invSort').value = 'name';
        renderInventory();
    });

    document.getElementById('custSearch')?.addEventListener('input', renderCustomers);
    document.getElementById('clearCustSearch')?.addEventListener('click', () => {
        document.getElementById('custSearch').value = '';
        renderCustomers();
    });

    // -------------------- ATTENDANCE --------------------
    document.getElementById('checkInBtn')?.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        if (!data.attendance) data.attendance = [];
        const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === user.uid && a.date?.slice(0,10) === today);
        if (existing && existing.checkIn) { showToast('Already checked in.', 'warning'); return; }
        const location = document.getElementById('attendanceLocation')?.value || 'GPS not available';
        data.attendance.push({ id: generateId(), employeeId: user.uid, employeeName: user.name || user.email, date: nowISO(), checkIn: nowISO(), checkOut: null, location, status: 'present' });
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked in.');
    });

    document.getElementById('checkOutBtn')?.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        const today = todayStr();
        const record = data.attendance.find(a => a.employeeId === user.uid && a.date?.slice(0,10) === today && a.checkIn && !a.checkOut);
        if (!record) { showToast('No check-in found.', 'warning'); return; }
        record.checkOut = nowISO();
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked out.');
    });

    document.getElementById('attendanceRefreshBtn')?.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => { document.getElementById('attendanceLocation').value = `${pos.coords.latitude}, ${pos.coords.longitude}`; },
                () => { document.getElementById('attendanceLocation').value = 'Location unavailable'; }
            );
        }
        renderAttendance();
    });

    // -------------------- LEAVE --------------------
    document.getElementById('applyLeaveBtn')?.addEventListener('click', async () => {
        const empId = document.getElementById('leaveEmployeeSelect')?.value;
        const type = document.getElementById('leaveType')?.value;
        const from = document.getElementById('leaveFrom')?.value;
        const to = document.getElementById('leaveTo')?.value;
        const reason = document.getElementById('leaveReason')?.value.trim();
        if (!empId) { showToast('Select employee.', 'error'); return; }
        if (!from || !to || from > to) { showToast('Invalid dates.', 'error'); return; }
        const data = getAppData();
        const emp = data.employees.find(e => e.id === empId);
        if (!emp) { showToast('Employee not found.', 'error'); return; }
        if (!data.leaves) data.leaves = [];
        data.leaves.push({ id: generateId(), employeeId: empId, employeeName: emp.name, type, from, to, reason: reason || '', status: 'pending', createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave applied.');
        document.getElementById('leaveReason').value = '';
    });

    document.getElementById('approveLeaveBtn')?.addEventListener('click', async () => {
        const data = getAppData();
        const pending = data.leaves?.find(l => l.status === 'pending');
        if (!pending) { showToast('No pending requests.', 'warning'); return; }
        pending.status = 'approved';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Approved.');
    });

    document.getElementById('rejectLeaveBtn')?.addEventListener('click', async () => {
        const data = getAppData();
        const pending = data.leaves?.find(l => l.status === 'pending');
        if (!pending) { showToast('No pending requests.', 'warning'); return; }
        pending.status = 'rejected';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('❌ Rejected.');
    });

    // -------------------- PAYROLL --------------------
    document.getElementById('calculatePayrollBtn')?.addEventListener('click', async () => {
        if (!canManage('payroll')) { showToast('⛔ No permission.', 'error'); return; }
        const empId = document.getElementById('payrollEmployeeSelect')?.value;
        const month = document.getElementById('payrollMonth')?.value;
        const basic = parseFloat(document.getElementById('payrollBasic').value) || 0;
        const allowances = parseFloat(document.getElementById('payrollAllowances').value) || 0;
        const deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
        const otHours = parseFloat(document.getElementById('payrollOT').value) || 0;
        if (!empId || !month) { showToast('Select employee and month.', 'error'); return; }
        const data = getAppData();
        const emp = data.employees.find(e => e.id === empId);
        if (!emp) { showToast('Employee not found.', 'error'); return; }
        const otRate = (basic / 160) * 1.5 || 0;
        const otPay = otHours * otRate;
        const net = basic + allowances + otPay - deductions;
        const epf = basic * 0.08;
        const etf = basic * 0.03;
        if (!data.payroll) data.payroll = [];
        data.payroll.push({ id: generateId(), employeeId: empId, employeeName: emp.name, month, basic, allowances, deductions, ot: otPay, epf, etf, net, createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderPayroll();
        showToast(`✅ Payroll for ${emp.name}: LKR ${formatCurrency(net)}`);
    });

    document.getElementById('generatePayslipBtn')?.addEventListener('click', () => {
        showToast('📄 Payslip generation coming soon.', 'info');
    });

    // -------------------- PURCHASING --------------------
    document.getElementById('addSupplierBtn')?.addEventListener('click', async () => {
        const name = document.getElementById('supplierName').value.trim();
        const contact = document.getElementById('supplierContact').value.trim();
        const address = document.getElementById('supplierAddress').value.trim();
        if (!name) { showToast('Enter supplier name.', 'error'); return; }
        const data = getAppData();
        if (!data.suppliers) data.suppliers = [];
        data.suppliers.push({ id: generateId(), name, contact, address, createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderPurchasing();
        showToast('✅ Supplier added.');
        document.getElementById('supplierName').value = '';
        document.getElementById('supplierContact').value = '';
        document.getElementById('supplierAddress').value = '';
    });

    document.getElementById('clearSupplierBtn')?.addEventListener('click', () => {
        document.getElementById('supplierName').value = '';
        document.getElementById('supplierContact').value = '';
        document.getElementById('supplierAddress').value = '';
    });

    document.getElementById('addPurchaseOrderBtn')?.addEventListener('click', async () => {
        const supplierId = document.getElementById('poSupplierSelect')?.value;
        const itemId = document.getElementById('poItemSelect')?.value;
        const qty = parseInt(document.getElementById('poQty').value) || 0;
        const price = parseFloat(document.getElementById('poPrice').value) || 0;
        if (!supplierId || !itemId || qty <= 0 || price <= 0) {
            showToast('Fill all fields.', 'error');
            return;
        }
        const data = getAppData();
        const supplier = data.suppliers?.find(s => s.id === supplierId);
        const item = data.items?.find(i => i.id === itemId);
        if (!supplier || !item) { showToast('Not found.', 'error'); return; }
        if (!data.purchaseOrders) data.purchaseOrders = [];
        data.purchaseOrders.push({ id: generateId(), supplierId, supplierName: supplier.name, itemId, itemName: item.name, qty, price, status: 'pending', createdAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderPurchasing();
        showToast('✅ PO created.');
        document.getElementById('poQty').value = '';
        document.getElementById('poPrice').value = '';
    });

    // -------------------- SALES (Cart) --------------------
    let salesCart = [];
    window.salesCart = salesCart;

    document.getElementById('salesAddToCartBtn')?.addEventListener('click', () => {
        const itemId = document.getElementById('salesCartItemSelect').value;
        const qty = parseInt(document.getElementById('salesCartQty').value) || 1;
        if (!itemId) { showToast('Select item.', 'error'); return; }
        const data = getAppData();
        const item = data.items.find(i => i.id === itemId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast(`Insufficient stock: ${item.qty}`, 'error'); return; }
        const existing = salesCart.find(i => i.id === itemId);
        if (existing) existing.qty += qty;
        else salesCart.push({ id: itemId, name: item.name, qty, price: item.price || 0 });
        renderSalesCart();
        showToast(`✅ Added ${qty} x ${item.name}`);
        document.getElementById('salesCartQty').value = '1';
    });

    document.getElementById('salesClearCartBtn')?.addEventListener('click', () => {
        if (salesCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
        if (!confirm('Clear cart?')) return;
        salesCart = [];
        renderSalesCart();
        showToast('🧹 Cleared.');
    });

    document.getElementById('createSalesOrderBtn')?.addEventListener('click', async () => {
        if (!canManage('sales') && !canView('sales')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        if (salesCart.length === 0) { showToast('Cart is empty.', 'error'); return; }
        const customerId = document.getElementById('salesCustomerSelect').value;
        const orderDate = document.getElementById('salesOrderDate').value;
        if (!customerId) { showToast('Select customer.', 'error'); return; }
        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        if (!customer) { showToast('Customer not found.', 'error'); return; }

        let total = 0;
        const orderItems = salesCart.map(item => {
            total += item.qty * item.price;
            return { id: item.id, name: item.name, qty: item.qty, price: item.price };
        });

        // Deduct stock
        let stockError = false;
        salesCart.forEach(cartItem => {
            const item = data.items.find(i => i.id === cartItem.id);
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
        const order = { id: generateId(), orderNo: 'SO-' + String(data.salesOrders.length + 1).padStart(4, '0'), customerId, customerName: customer.name, items: orderItems, total, date: orderDate || nowISO(), createdAt: nowISO() };
        data.salesOrders.push(order);
        orderItems.forEach(item => {
            data.salesData.push({ id: generateId(), customer: customer.name, item: item.name, qty: item.qty, total: item.qty * item.price, date: order.date });
        });
        if (!data.logs) data.logs = [];
        data.logs.push({ id: generateId(), user: getCurrentUser()?.name || 'System', action: 'Sales Order', details: `#${order.orderNo} - ${customer.name} - LKR ${formatCurrency(total)}`, date: nowISO() });

        setAppData(data);
        await saveAllData();
        salesCart = [];
        renderSalesCart();
        renderSales();
        renderDashboard();
        showToast(`✅ Order #${order.orderNo} created! Total: LKR ${formatCurrency(total)}`);
    });

    document.getElementById('salesAddCustomerBtn')?.addEventListener('click', () => {
        if (canManage('customers')) document.getElementById('addCustomerBtn')?.click();
        else showToast('⛔ No permission.', 'error');
    });

    // -------------------- DELIVERIES (Cart + Status) --------------------
    let deliveryCart = [];
    window.deliveryCart = deliveryCart;

    document.getElementById('delAddToCartBtn')?.addEventListener('click', () => {
        const itemId = document.getElementById('delCartItemSelect').value;
        const qty = parseInt(document.getElementById('delCartQty').value) || 1;
        if (!itemId) { showToast('Select item.', 'error'); return; }
        const data = getAppData();
        const item = data.items.find(i => i.id === itemId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast(`Insufficient stock: ${item.qty}`, 'error'); return; }
        const existing = deliveryCart.find(i => i.id === itemId);
        if (existing) existing.qty += qty;
        else deliveryCart.push({ id: itemId, name: item.name, qty });
        renderDeliveryCart();
        showToast(`✅ Added ${qty} x ${item.name}`);
        document.getElementById('delCartQty').value = '1';
    });

    document.getElementById('delClearCartBtn')?.addEventListener('click', () => {
        if (deliveryCart.length === 0) { showToast('Cart empty.', 'warning'); return; }
        if (!confirm('Clear items?')) return;
        deliveryCart = [];
        renderDeliveryCart();
        showToast('🧹 Cleared.');
    });

    document.getElementById('deliverSubmitBtn')?.addEventListener('click', async () => {
        if (!canManage('deliveries') && !hasPermission('create_deliveries')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        const customerId = document.getElementById('delCustomerSelect')?.value;
        const driverId = document.getElementById('delDriverSelect')?.value;
        const vehicleId = document.getElementById('delVehicleSelect')?.value;
        const status = document.getElementById('delStatusSelect')?.value || 'pending';
        const route = document.getElementById('delRoute')?.value.trim() || '';
        const notes = document.getElementById('delNotes')?.value.trim() || '';
        const scheduledDate = document.getElementById('delScheduledDate')?.value || nowISO();

        if (!customerId) { showToast('Select customer.', 'error'); return; }
        if (deliveryCart.length === 0) { showToast('Add at least one item.', 'error'); return; }

        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        const driver = data.employees.find(e => e.id === driverId);
        const vehicle = data.vehicles.find(v => v.id === vehicleId);
        if (!customer) { showToast('Customer not found.', 'error'); return; }

        // Deduct stock
        let stockError = false;
        deliveryCart.forEach(cartItem => {
            const item = data.items.find(i => i.id === cartItem.id);
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

        const delivery = { id: generateId(), customerId, customerName: customer.name, items: deliveryCart.map(i => ({ id: i.id, name: i.name, qty: i.qty })), driverId, driverName: driver ? driver.name : '—', vehicleId, vehicleNo: vehicle ? vehicle.vehicleNo : '—', status, route, notes, date: scheduledDate, updatedAt: nowISO() };
        data.deliveries.push(delivery);
        if (!data.logs) data.logs = [];
        data.logs.push({ id: generateId(), user: getCurrentUser()?.name || 'System', action: 'Delivery Created', details: `${customer.name} - ${delivery.items.length} items - ${status}`, date: nowISO() });

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
        showToast(`✅ Delivery for ${customer.name} created.`);
    });

    document.getElementById('refreshDeliveriesBtn')?.addEventListener('click', () => {
        renderDeliveries();
        showToast('🔄 Refreshed.');
    });

    document.getElementById('delDateFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('delStatusFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('clearDelFilter')?.addEventListener('click', () => {
        document.getElementById('delDateFilter').value = '';
        document.getElementById('delStatusFilter').value = 'all';
        renderDeliveries();
    });

    document.getElementById('clearDeliveryForm')?.addEventListener('click', () => {
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

    document.getElementById('addFinanceBtn')?.addEventListener('click', async () => {
        if (!canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('financeType').value;
        const amount = parseFloat(document.getElementById('financeAmount').value);
        const category = document.getElementById('financeCategory').value;
        const desc = document.getElementById('financeDesc').value.trim();
        const paymentMethod = document.getElementById('financePaymentMethod').value;
        const budgetInput = document.getElementById('financeBudget')?.value.trim();

        const chequeNo = document.getElementById('financeChequeNo').value.trim();
        const bankName = document.getElementById('financeBankName').value.trim();
        const chequeDate = document.getElementById('financeChequeDate').value;
        const chequeAmount = parseFloat(document.getElementById('financeChequeAmount').value) || amount;

        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
        if (!desc) { showToast('Enter description.', 'error'); return; }
        if (paymentMethod === 'cheque' && !chequeNo) { showToast('Enter cheque number.', 'error'); return; }

        const data = getAppData();
        if (!data.budget) data.budget = { monthly: 0, category: {} };
        if (budgetInput !== '') data.budget.category[category] = parseFloat(budgetInput) || 0;

        data.finance.push({ id: generateId(), type, amount, category, desc, paymentMethod, chequeNo: paymentMethod === 'cheque' ? chequeNo : '', bankName: paymentMethod === 'cheque' ? bankName : '', chequeDate: paymentMethod === 'cheque' ? chequeDate : '', chequeAmount: paymentMethod === 'cheque' ? chequeAmount : 0, date: nowISO() });
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
        showToast(`✅ ${type} recorded.`);
    });

    document.getElementById('clearFinanceBtn')?.addEventListener('click', () => {
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
    document.getElementById('updateProductAttributesBtn')?.addEventListener('click', async () => {
        if (!canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData();
        const items = data.items || [];
        const productCode = document.getElementById('productCode').value.trim();
        const unit = document.getElementById('productUnit').value;
        const costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;
        const taxRate = parseFloat(document.getElementById('productTaxRate').value) || 0;
        const reorderLevel = parseInt(document.getElementById('productReorderLevel').value) || 0;
        const stockAlert = document.getElementById('productStockAlert').value;

        let item = items.find(i => i.productCode === productCode);
        if (!item && items.length > 0) item = items[0];
        if (!item) { showToast('No product found. Add items first.', 'error'); return; }

        const idx = data.items.findIndex(i => i.id === item.id);
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
    document.getElementById('addVoucherBtn')?.addEventListener('click', async () => {
        if (!canManage('voucher') && !canManage('finance')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        const voucherNo = document.getElementById('voucherNo').value.trim() || ('VCH-' + String((getAppData().vouchers || []).length + 1).padStart(4, '0'));
        const date = document.getElementById('voucherDate').value || todayStr();
        const paidTo = document.getElementById('voucherPaidTo').value.trim();
        const amount = parseFloat(document.getElementById('voucherAmount').value) || 0;
        const description = document.getElementById('voucherDescription').value.trim();
        const approvedBy = document.getElementById('voucherApprovedBy').value.trim();
        const receivedBy = document.getElementById('voucherReceivedBy').value.trim();
        const signature = document.getElementById('voucherSignature').value.trim();

        const paymentTypes = [];
        document.querySelectorAll('.voucher-payment-type:checked').forEach(cb => paymentTypes.push(cb.value));
        const otherText = document.getElementById('voucherOtherText').value.trim();
        if (otherText) paymentTypes.push(otherText);

        if (!paidTo) { showToast('Enter recipient.', 'error'); return; }
        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }

        const data = getAppData();
        if (!data.vouchers) data.vouchers = [];
        data.vouchers.push({ id: generateId(), voucherNo, date, paidTo, amount, paymentTypes: paymentTypes.length > 0 ? paymentTypes : ['Other'], description: description || '', approvedBy: approvedBy || '', receivedBy: receivedBy || '', signature: signature || '', status: 'paid', createdAt: nowISO() });
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
        document.querySelectorAll('.voucher-payment-type').forEach(cb => cb.checked = false);
        document.getElementById('voucherOtherText').value = '';
    });

    document.getElementById('printVoucherBtn')?.addEventListener('click', () => {
        showToast('🖨️ Print coming soon.', 'info');
    });
    document.getElementById('downloadVoucherBtn')?.addEventListener('click', () => {
        showToast('📄 PDF coming soon.', 'info');
    });
    document.getElementById('clearVoucherForm')?.addEventListener('click', () => {
        document.getElementById('voucherNo').value = '';
        document.getElementById('voucherDate').value = '';
        document.getElementById('voucherPaidTo').value = '';
        document.getElementById('voucherAmount').value = '';
        document.getElementById('voucherDescription').value = '';
        document.getElementById('voucherApprovedBy').value = '';
        document.getElementById('voucherReceivedBy').value = '';
        document.getElementById('voucherSignature').value = '';
        document.querySelectorAll('.voucher-payment-type').forEach(cb => cb.checked = false);
        document.getElementById('voucherOtherText').value = '';
        showToast('🧹 Form cleared.');
    });

    // -------------------- FLEET --------------------
    document.getElementById('addVehicleBtn')?.addEventListener('click', async () => {
        if (!canManage('vehicles') && !canView('fleet')) {
            showToast('⛔ No permission.', 'error');
            return;
        }
        const vehicleNo = document.getElementById('vehicleNo').value.trim();
        const driver = document.getElementById('vehicleDriver').value.trim();
        const fuel = document.getElementById('vehicleFuel').value.trim();
        const insurance = document.getElementById('vehicleInsurance').value.trim();
        const service = document.getElementById('vehicleService').value;

        if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }

        const data = getAppData();
        if (!data.vehicles) data.vehicles = [];

        const editId = document.getElementById('addVehicleBtn').dataset.editId;
        if (editId) {
            const idx = data.vehicles.findIndex(v => v.id === editId);
            if (idx > -1) {
                data.vehicles[idx] = { ...data.vehicles[idx], vehicleNo, driver, fuel, insurance, service, updatedAt: nowISO() };
            }
            delete document.getElementById('addVehicleBtn').dataset.editId;
            document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        } else {
            data.vehicles.push({ id: generateId(), vehicleNo, driver, fuel, insurance, service, status: 'active', createdAt: nowISO(), updatedAt: nowISO() });
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
    document.getElementById('clearReportFilters')?.addEventListener('click', () => {
        document.getElementById('reportFrom').value = '';
        document.getElementById('reportTo').value = '';
        renderReports();
    });

    document.getElementById('exportReportBtn')?.addEventListener('click', () => {
        const content = document.getElementById('reportContent');
        if (!content) return;
        const tables = content.querySelectorAll('table');
        if (tables.length === 0) { showToast('No data.', 'warning'); return; }
        let csv = '';
        tables.forEach(table => {
            table.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('th, td');
                const rowData = [];
                cells.forEach(cell => rowData.push(cell.textContent.trim().replace(/,/g, '')));
                csv += rowData.join(',') + '\n';
            });
            csv += '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report_' + todayStr() + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 CSV exported.');
    });

    document.getElementById('printReportBtn')?.addEventListener('click', () => window.print());

    // -------------------- SETTINGS --------------------
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
        const data = getAppData();
        if (!data.settings) data.settings = {};
        data.settings.company = document.getElementById('settingsCompany').value.trim();
        data.settings.address = document.getElementById('settingsAddress').value.trim();
        data.settings.phone = document.getElementById('settingsPhone').value.trim();
        data.settings.email = document.getElementById('settingsEmail').value.trim();
        setAppData(data);
        await saveAllData();
        showToast('✅ Settings saved.');
    });

    document.getElementById('saveSettingsBtn2')?.addEventListener('click', async () => {
        const data = getAppData();
        if (!data.settings) data.settings = {};
        data.settings.company = document.getElementById('settingsCompany').value.trim();
        data.settings.address = document.getElementById('settingsAddress').value.trim();
        data.settings.phone = document.getElementById('settingsPhone').value.trim();
        data.settings.email = document.getElementById('settingsEmail').value.trim();
        setAppData(data);
        await saveAllData();
        showToast('✅ Settings saved.');
    });

    document.getElementById('backupDataBtn')?.addEventListener('click', () => {
        const data = getAppData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jayasinghe_erp_backup_' + todayStr() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Backup downloaded.');
    });

    document.getElementById('restoreDataBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
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

    document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
        if (!confirm('⚠️ Delete ALL data? Cannot undo!')) return;
        const data = getAppData();
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) data[key] = [];
            else if (typeof data[key] === 'object' && data[key] !== null) data[key] = {};
        });
        setAppData(data);
        await saveAllData();
        renderAll();
        showToast('🗑️ All data cleared.');
    });

    document.getElementById('clearLogsBtn')?.addEventListener('click', async () => {
        if (!confirm('Clear logs?')) return;
        const data = getAppData();
        data.logs = [];
        setAppData(data);
        await saveAllData();
        renderAdministration();
        showToast('🧹 Logs cleared.');
    });

    // -------------------- SET DEFAULTS --------------------
    const setDefaultDate = (id) => {
        const el = document.getElementById(id);
        if (el && !el.value) {
            if (id === 'delScheduledDate') el.value = nowISO().slice(0, 16);
            else if (id === 'payrollMonth') el.value = todayStr().slice(0, 7);
            else el.value = todayStr();
        }
    };
    ['voucherDate', 'salesOrderDate', 'delScheduledDate', 'payrollMonth', 'leaveFrom', 'leaveTo'].forEach(setDefaultDate);

    console.log('✅ ERP initialized successfully.');
}

// Ensure init is called even if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 200);
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// Also export init globally so it can be called from inline fallback
window.init = init;
