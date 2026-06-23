// ============================================================
// MAIN APP MODULE (Enterprise)
// ============================================================

function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast ' + type;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}
window.showToast = showToast;

function renderAll() {
    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        const id = activePanel.id.replace('panel-', '');
        switch (id) {
            case 'dashboard': renderDashboard(); break;
            case 'administration': renderAdministration(); break;
            case 'employees': renderEmployees(); break;
            case 'attendance': renderAttendance(); break;
            case 'leave': renderLeave(); break;
            case 'payroll': renderPayroll(); break;
            case 'inventory': renderInventory(); break;
            case 'products': renderProducts(); break;
            case 'purchasing': renderPurchasing(); break;
            case 'sales': renderSales(); break;
            case 'deliveries': renderDeliveries(); break;
            case 'customers': renderCustomers(); break;
            case 'finance': renderFinance(); break;
            case 'voucher': renderVouchers(); break;
            case 'fleet': renderFleet(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
            default: break;
        }
    } else { renderDashboard(); }
    renderSidebar();
}
window.renderAll = renderAll;

function populateItemDropdowns() {
    const data = getAppData();
    const catSelect = document.getElementById('itemCategory');
    const brandSelect = document.getElementById('itemBrand');
    if (!catSelect || !brandSelect) return;
    const currentCat = catSelect.value;
    const currentBrand = brandSelect.value;
    catSelect.innerHTML = '<option value="">Select...</option>' + (data.categories || []).map(c => `<option value="${c}">${c}</option>`).join('');
    if (currentCat && [...catSelect.options].some(o => o.value === currentCat)) catSelect.value = currentCat;
    brandSelect.innerHTML = '<option value="">Select...</option>' + (data.brands || []).map(b => `<option value="${b}">${b}</option>`).join('');
    if (currentBrand && [...brandSelect.options].some(o => o.value === currentBrand)) brandSelect.value = currentBrand;
}
window.populateItemDropdowns = populateItemDropdowns;

function populateDeliveryDropdowns() {
    const data = getAppData();
    const customerSelect = document.getElementById('delCustomerSelect');
    if (customerSelect) {
        const val = customerSelect.value;
        customerSelect.innerHTML = '<option value="">-- Select --</option>' + (data.customers || []).map(c => `<option value="${c.id}">${escapeHtml(c.name)} ${c.balance > 0 ? '⚠️' : ''}</option>`).join('');
        if (val && [...customerSelect.options].some(o => o.value === val)) customerSelect.value = val;
    }
    const itemSelect = document.getElementById('delItemSelect');
    if (itemSelect) {
        const val = itemSelect.value;
        itemSelect.innerHTML = '<option value="">-- Select --</option>' + (data.items || []).filter(i => i.status !== 'inactive').map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0})</option>`).join('');
        if (val && [...itemSelect.options].some(o => o.value === val)) itemSelect.value = val;
    }
    const driverSelect = document.getElementById('delDriverSelect');
    if (driverSelect) {
        const val = driverSelect.value;
        const employees = data.employees || [];
        const deliveryStaff = employees.filter(e => e.status === 'active' && (e.department === 'Delivery' || e.designation?.toLowerCase().includes('driver')));
        const staffList = deliveryStaff.length > 0 ? deliveryStaff : employees.filter(e => e.status === 'active');
        driverSelect.innerHTML = '<option value="">-- Select --</option>' + staffList.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
        if (val && [...driverSelect.options].some(o => o.value === val)) driverSelect.value = val;
    }
    const vehicleSelect = document.getElementById('delVehicleSelect');
    if (vehicleSelect) {
        const val = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="">-- Select --</option>' + (data.vehicles || []).map(v => `<option value="${v.id}">${escapeHtml(v.vehicleNo)} (${escapeHtml(v.driver||'No Driver')})</option>`).join('');
        if (val && [...vehicleSelect.options].some(o => o.value === val)) vehicleSelect.value = val;
    }
    const scheduledDate = document.getElementById('delScheduledDate');
    if (scheduledDate && !scheduledDate.value) {
        const now = new Date(); now.setHours(now.getHours() + 1);
        scheduledDate.value = now.toISOString().slice(0, 16);
    }
}
window.populateDeliveryDropdowns = populateDeliveryDropdowns;

// ============================================================
// PROFILE MODAL
// ============================================================
function openProfileModal() {
    const user = window.getCurrentUser();
    if (!user) { showToast('Please login first.', 'error'); return; }
    const data = getAppData();
    const employees = data.employees || [];
    const emp = employees.find(e => e.email === user.email) || employees.find(e => e.id === user.uid) || { name: user.name, email: user.email, department: user.role };
    document.getElementById('profileName').textContent = emp.name || user.name;
    document.getElementById('profileRole').textContent = (emp.department || user.role || 'Employee');
    const detailsEl = document.getElementById('profileDetails');
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div><strong>📧 Email</strong><br/>${emp.email || user.email || '—'}</div>
            <div><strong>🆔 NIC</strong><br/>${emp.nic || '—'}</div>
            <div><strong>🏢 Department</strong><br/>${emp.department || '—'}</div>
            <div><strong>💼 Designation</strong><br/>${emp.designation || '—'}</div>
            <div><strong>📞 Contact</strong><br/>${emp.contact || '—'}</div>
            <div><strong>📅 Joined</strong><br/>${emp.joinedDate ? formatDate(emp.joinedDate) : '—'}</div>
            <div><strong>💰 Salary</strong><br/>LKR ${formatCurrency(emp.salary || 0)}</div>
            <div><strong>📌 Status</strong><br/><span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">${emp.status || 'Active'}</span></div>
        `;
    }
    const attendance = data.attendance || []; const leaves = data.leaves || []; const payroll = data.payroll || []; const vouchers = data.vouchers || [];
    const empAttendance = attendance.filter(a => a.employeeId === emp.id || a.employeeId === user.uid);
    const empLeaves = leaves.filter(l => l.employeeId === emp.id || l.employeeId === user.uid);
    const empPayroll = payroll.filter(p => p.employeeId === emp.id || p.employeeId === user.uid);
    const empVouchers = vouchers.filter(v => v.paidTo === emp.name || v.createdBy === emp.id);
    document.getElementById('profileStats').innerHTML = `
        <div style="text-align:center;background:var(--bg);padding:10px;border-radius:8px;"><div style="font-size:18px;font-weight:700;color:var(--success);">${empAttendance.length}</div><div style="font-size:10px;color:var(--text-muted);">✅ Present</div></div>
        <div style="text-align:center;background:var(--bg);padding:10px;border-radius:8px;"><div style="font-size:18px;font-weight:700;color:var(--warning);">${empLeaves.filter(l => l.status === 'pending').length}</div><div style="font-size:10px;color:var(--text-muted);">⏳ Pending Leave</div></div>
        <div style="text-align:center;background:var(--bg);padding:10px;border-radius:8px;"><div style="font-size:18px;font-weight:700;color:var(--primary);">LKR ${formatCurrency(empPayroll.reduce((s, p) => s + (p.net || 0), 0))}</div><div style="font-size:10px;color:var(--text-muted);">💰 Payroll</div></div>
        <div style="text-align:center;background:var(--bg);padding:10px;border-radius:8px;"><div style="font-size:18px;font-weight:700;color:var(--purple);">${empVouchers.length}</div><div style="font-size:10px;color:var(--text-muted);">🧾 Vouchers</div></div>
    `;
    document.getElementById('profileModal').classList.add('open');
}
window.openProfileModal = openProfileModal;

// ============================================================
// INIT EVENTS
// ============================================================
function initEvents() {
    console.log('🔧 Initializing events...');

    // Sidebar
    document.getElementById('menuToggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
    document.getElementById('sidebarClose')?.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));

    // Profile
    document.getElementById('userBadge')?.addEventListener('click', function(e) { if (e.target.closest('.logout-btn')) return; openProfileModal(); });
    document.getElementById('profileModalClose')?.addEventListener('click', () => document.getElementById('profileModal').classList.remove('open'));
    document.getElementById('profileModal')?.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });

    // Dark Mode
    let isDark = false;
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            isDark = !isDark;
            document.body.classList.toggle('dark', isDark);
            darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', isDark ? 'true' : 'false');
        });
        if (localStorage.getItem('darkMode') === 'true') { isDark = true; document.body.classList.add('dark'); darkToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    }

    // Language
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'si' : 'en';
            langToggle.textContent = currentLang === 'en' ? '🇱🇰 SI' : '🇬🇧 EN';
            renderSidebar();
            const activePanel = document.querySelector('.panel.active');
            if (activePanel) {
                const id = activePanel.id.replace('panel-', '');
                const navItem = ALL_NAV_ITEMS.find(n => n.id === id);
                if (navItem) document.getElementById('pageTitle').textContent = navItem.label;
            }
            showToast(currentLang === 'en' ? '🌐 English' : '🌐 සිංහල');
        });
    }

    // Clear Login
    document.getElementById('clearLoginBtn')?.addEventListener('click', () => {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        showToast('🧹 Fields cleared', 'info');
    });

    // Employee Modal
    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => {
        if (!window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('empEditId').value = '';
        document.getElementById('employeeModalTitle').textContent = '👤 Add Employee';
        ['empName','empNIC','empDesignation','empContact','empEmergency','empAddress','empJoined','empSalary','empEpf','empUsername','empPassword'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('empDept').value = 'Admin';
        document.getElementById('empStatus').value = 'active';
        document.getElementById('employeeModal').classList.add('open');
    });
    document.getElementById('empModalClose')?.addEventListener('click', () => document.getElementById('employeeModal').classList.remove('open'));

    document.getElementById('empSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('empEditId').value;
        const name = document.getElementById('empName').value.trim();
        const username = document.getElementById('empUsername').value.trim();
        const password = document.getElementById('empPassword').value.trim();
        if (!name) { showToast('Enter name.', 'error'); return; }
        if (!id && !username) { showToast('Enter username.', 'error'); return; }
        if (!id && !password) { showToast('Enter password.', 'error'); return; }
        if (!id && password.length < 6) { showToast('Password min 6 chars.', 'error'); return; }
        const data = getAppData();
        const empData = {
            name, nic: document.getElementById('empNIC').value.trim(),
            department: document.getElementById('empDept').value,
            designation: document.getElementById('empDesignation').value.trim(),
            contact: document.getElementById('empContact').value.trim(),
            emergency: document.getElementById('empEmergency').value.trim(),
            address: document.getElementById('empAddress').value.trim(),
            joinedDate: document.getElementById('empJoined').value,
            salary: parseFloat(document.getElementById('empSalary').value) || 0,
            epf: document.getElementById('empEpf').value.trim(),
            status: document.getElementById('empStatus').value,
            updatedAt: nowISO()
        };
        try {
            if (id) {
                const idx = data.employees.findIndex(e => e.id === id);
                if (idx > -1) data.employees[idx] = { ...data.employees[idx], ...empData };
            } else {
                const userCredential = await auth.createUserWithEmailAndPassword(username, password);
                const user = userCredential.user;
                empData.uid = user.uid;
                empData.email = username;
                empData.id = generateId();
                empData.createdAt = nowISO();
                data.employees.push(empData);
                if (!data.leaveBalances) data.leaveBalances = {};
                data.leaveBalances[empData.id] = { sick: 10, casual: 5, annual: 12 };
                showToast(`✅ Employee added!`);
            }
            setAppData(data);
            await saveAllData();
            document.getElementById('employeeModal').classList.remove('open');
            renderEmployees();
            document.getElementById('empPassword').value = '';
            if (!id) document.getElementById('empUsername').value = '';
        } catch (error) { showToast('❌ ' + error.message, 'error'); }
    });

    // Item Modal
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('itemEditId').value = '';
        document.getElementById('itemModalTitle').textContent = '📦 Add Item';
        ['itemBarcode','itemName','itemDesc','itemExpiry','itemBatch'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('itemQty').value = '1';
        document.getElementById('itemPrice').value = '0';
        document.getElementById('itemStatus').value = 'active';
        populateItemDropdowns();
        closeScanner();
        document.getElementById('itemModal').classList.add('open');
    });
    document.getElementById('itemModalClose')?.addEventListener('click', () => { closeScanner(); document.getElementById('itemModal').classList.remove('open'); });
    document.getElementById('itemSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('itemEditId').value;
        const name = document.getElementById('itemName').value.trim();
        if (!name) { showToast('Enter name.', 'error'); return; }
        const data = getAppData();
        const itemData = {
            barcode: document.getElementById('itemBarcode').value.trim(),
            name, qty: parseInt(document.getElementById('itemQty').value) || 0,
            price: parseFloat(document.getElementById('itemPrice').value) || 0,
            category: document.getElementById('itemCategory').value,
            brand: document.getElementById('itemBrand').value,
            desc: document.getElementById('itemDesc').value.trim(),
            expiry: document.getElementById('itemExpiry').value,
            batch: document.getElementById('itemBatch').value.trim(),
            status: document.getElementById('itemStatus').value,
            updatedAt: nowISO()
        };
        if (id) { const idx = data.items.findIndex(i => i.id === id); if (idx > -1) data.items[idx] = { ...data.items[idx], ...itemData }; }
        else { itemData.id = generateId(); itemData.createdAt = nowISO(); data.items.push(itemData); }
        setAppData(data); await saveAllData(); closeScanner(); document.getElementById('itemModal').classList.remove('open'); renderInventory(); renderDashboard(); showToast(id ? '✅ Updated!' : '✅ Added!');
    });

    // Barcode Scanner
    let html5QrCode = null;
    function closeScanner() {
        const container = document.getElementById('scannerContainer');
        if (html5QrCode) { try { html5QrCode.stop(); html5QrCode.clear(); } catch(e) {} html5QrCode = null; }
        if (container) container.style.display = 'none';
    }
    window.closeScanner = closeScanner;
    document.getElementById('scanBarcodeBtn')?.addEventListener('click', async () => {
        const container = document.getElementById('scannerContainer');
        const readerElement = document.getElementById('scannerReader');
        const barcodeInput = document.getElementById('itemBarcode');
        if (!container || !readerElement) return;
        if (container.style.display === 'block') { closeScanner(); return; }
        try { await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); } catch(err) { showToast('⚠️ Camera access denied.', 'error'); return; }
        container.style.display = 'block'; readerElement.innerHTML = '';
        try {
            html5QrCode = new Html5Qrcode("scannerReader");
            await html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 150 } }, (decodedText) => {
                barcodeInput.value = decodedText;
                showToast('✅ Scanned: ' + decodedText, 'success');
                closeScanner();
            }, (error) => {});
        } catch(err) { showToast('❌ Camera error.', 'error'); closeScanner(); }
    });
    document.getElementById('closeScannerBtn')?.addEventListener('click', closeScanner);

    // Customer Modal
    document.getElementById('addCustomerBtn')?.addEventListener('click', () => {
        if (!window.canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('custEditId').value = '';
        document.getElementById('customerModalTitle').textContent = '👤 Add Customer';
        ['custName','custContact','custAddress'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('custCategory').value = 'Retail';
        document.getElementById('custCreditLimit').value = '0';
        document.getElementById('custBalance').value = '0';
        document.getElementById('customerModal').classList.add('open');
    });
    document.getElementById('custModalClose')?.addEventListener('click', () => document.getElementById('customerModal').classList.remove('open'));
    document.getElementById('custSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('custEditId').value;
        const name = document.getElementById('custName').value.trim();
        if (!name) { showToast('Enter name.', 'error'); return; }
        const data = getAppData();
        const custData = { name, contact: document.getElementById('custContact').value.trim(), category: document.getElementById('custCategory').value, address: document.getElementById('custAddress').value.trim(), creditLimit: parseFloat(document.getElementById('custCreditLimit').value) || 0, balance: parseFloat(document.getElementById('custBalance').value) || 0, updatedAt: nowISO() };
        if (id) { const idx = data.customers.findIndex(c => c.id === id); if (idx > -1) data.customers[idx] = { ...data.customers[idx], ...custData }; }
        else { custData.id = generateId(); custData.createdAt = nowISO(); data.customers.push(custData); }
        setAppData(data); await saveAllData(); document.getElementById('customerModal').classList.remove('open'); renderCustomers(); showToast(id ? '✅ Updated!' : '✅ Added!');
    });

    // Quick Actions
    document.getElementById('quickAddItem')?.addEventListener('click', () => { if (window.canManage('inventory')) document.getElementById('addItemBtn')?.click(); else showToast('⛔ No permission.', 'error'); });
    document.getElementById('quickNewDelivery')?.addEventListener('click', () => { if (window.canView('deliveries')) switchPanel('deliveries'); else showToast('⛔ No permission.', 'error'); });
    document.getElementById('quickAddEmployee')?.addEventListener('click', () => { if (window.canManage('employees')) document.getElementById('addEmployeeBtn')?.click(); else showToast('⛔ No permission.', 'error'); });
    document.getElementById('quickPrint')?.addEventListener('click', () => window.print());

    // Deliveries
    document.getElementById('quickAddCustomerBtn')?.addEventListener('click', () => { if (window.canManage('customers')) document.getElementById('addCustomerBtn')?.click(); else showToast('⛔ No permission.', 'error'); });
    document.getElementById('deliverSubmitBtn')?.addEventListener('click', async () => {
        if (!window.canManage('deliveries') && !window.hasPermission('create_deliveries')) { showToast('⛔ No permission.', 'error'); return; }
        const customerId = document.getElementById('delCustomerSelect')?.value;
        const itemId = document.getElementById('delItemSelect')?.value;
        const qty = parseInt(document.getElementById('delQty')?.value);
        const driverId = document.getElementById('delDriverSelect')?.value;
        const vehicleId = document.getElementById('delVehicleSelect')?.value;
        const status = document.getElementById('delStatusSelect')?.value || 'pending';
        const route = document.getElementById('delRoute')?.value.trim() || '';
        const notes = document.getElementById('delNotes')?.value.trim() || '';
        if (!customerId || !itemId || !qty || qty < 1) { showToast('Fill all required fields.', 'error'); return; }
        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        const item = data.items.find(i => i.id === itemId);
        const driver = data.employees.find(e => e.id === driverId);
        const vehicle = data.vehicles.find(v => v.id === vehicleId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast(`Insufficient stock! Available: ${item.qty}`, 'error'); return; }
        if (status === 'delivered') { item.qty = (item.qty || 0) - qty; item.updatedAt = nowISO(); }
        const delivery = { id: generateId(), customerId, customerName: customer ? customer.name : 'Unknown', itemId: item.id, itemName: item.name, qty, driverId, driverName: driver ? driver.name : '—', vehicleId, vehicleNo: vehicle ? vehicle.vehicleNo : '—', status, route, notes, date: nowISO(), updatedAt: nowISO() };
        data.deliveries.push(delivery);
        if (status === 'delivered') { data.salesData.push({ id: generateId(), customer: customer ? customer.name : 'Unknown', item: item.name, qty, total: qty * (item.price || 0), date: nowISO() }); }
        // Log
        if (!data.logs) data.logs = [];
        data.logs.push({ id: generateId(), user: window.getCurrentUser()?.name || 'System', action: 'Delivery Created', details: `${delivery.customerName} - ${delivery.itemName} x${delivery.qty}`, date: nowISO() });
        setAppData(data); await saveAllData();
        renderDeliveries(); renderDashboard(); renderReports();
        document.getElementById('delQty').value = '';
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        populateDeliveryDropdowns();
        showToast(`✅ Delivery ${status === 'delivered' ? 'completed' : 'created'}!`);
    });
    document.getElementById('clearDeliveryForm')?.addEventListener('click', () => {
        document.getElementById('delQty').value = '';
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        showToast('🧹 Form cleared.');
    });
    document.getElementById('delDateFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('delStatusFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('clearDelFilter')?.addEventListener('click', () => { document.getElementById('delDateFilter').value = ''; document.getElementById('delStatusFilter').value = 'all'; renderDeliveries(); });

    // Attendance
    document.getElementById('checkInBtn')?.addEventListener('click', async () => {
        const user = window.getCurrentUser(); if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData(); const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === user.uid && a.date.slice(0, 10) === today);
        if (existing && existing.checkIn) { showToast('Already checked in.', 'warning'); return; }
        const record = { id: generateId(), employeeId: user.uid, employeeName: user.name, date: nowISO(), checkIn: nowISO(), checkOut: null, location: document.getElementById('attendanceLocation').value || 'Colombo' };
        if (existing) { existing.checkIn = record.checkIn; existing.location = record.location; } else data.attendance.push(record);
        setAppData(data); await saveAllData(); renderAttendance(); showToast('✅ Checked in.');
    });
    document.getElementById('checkOutBtn')?.addEventListener('click', async () => {
        const user = window.getCurrentUser(); if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData(); const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === user.uid && a.date.slice(0, 10) === today);
        if (!existing) { showToast('No check-in found.', 'error'); return; }
        if (existing.checkOut) { showToast('Already checked out.', 'warning'); return; }
        existing.checkOut = nowISO(); setAppData(data); await saveAllData(); renderAttendance(); showToast('✅ Checked out.');
    });
    document.getElementById('attendanceRefreshBtn')?.addEventListener('click', () => { renderAttendance(); showToast('🔄 Refreshed.'); });
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => { document.getElementById('attendanceLocation').value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`; }, () => { document.getElementById('attendanceLocation').value = '📍 Location unavailable'; });
    }

    // Leave
    document.getElementById('applyLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canView('leave')) { showToast('⛔ No permission.', 'error'); return; }
        const user = window.getCurrentUser();
        let empId = document.getElementById('leaveEmployeeSelect').value;
        const type = document.getElementById('leaveType').value;
        const from = document.getElementById('leaveFrom').value;
        const to = document.getElementById('leaveTo').value;
        const reason = document.getElementById('leaveReason').value.trim();
        if (user?.role === 'employee' || user?.role === 'hr') { const data = getAppData(); const emp = data.employees.find(e => e.id === user.uid); empId = emp ? emp.id : user.uid; }
        if (!empId || !from || !to) { showToast('Fill all fields.', 'error'); return; }
        const data = getAppData(); if (!data.leaveBalances) data.leaveBalances = {};
        const empBalance = data.leaveBalances[empId] || { sick: 0, casual: 0, annual: 0 };
        if (empBalance[type] <= 0) { showToast(`No ${type} leave left!`, 'error'); return; }
        const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
        if (empBalance[type] < days) { showToast(`Only ${empBalance[type]} ${type} days available.`, 'error'); return; }
        empBalance[type] -= days; data.leaveBalances[empId] = empBalance;
        const emp = data.employees.find(e => e.id === empId);
        data.leaves.push({ id: generateId(), employeeId: empId, employeeName: emp ? emp.name : (user?.name || 'Unknown'), type, from, to, reason, days, status: 'pending', appliedAt: nowISO() });
        setAppData(data); await saveAllData(); renderLeave(); showToast('✅ Leave applied!'); document.getElementById('leaveReason').value = '';
    });
    document.getElementById('approveLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('leave') && !window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData(); const leaves = data.leaves.filter(l => l.status === 'pending');
        if (leaves.length === 0) { showToast('No pending leaves.', 'warning'); return; }
        leaves[leaves.length - 1].status = 'approved'; setAppData(data); await saveAllData(); renderLeave(); showToast('✅ Approved.');
    });
    document.getElementById('rejectLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('leave') && !window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData(); const leaves = data.leaves.filter(l => l.status === 'pending');
        if (leaves.length === 0) { showToast('No pending leaves.', 'warning'); return; }
        leaves[leaves.length - 1].status = 'rejected'; setAppData(data); await saveAllData(); renderLeave(); showToast('❌ Rejected.');
    });

    // Payroll
    document.getElementById('calculatePayrollBtn')?.addEventListener('click', async () => {
        if (!window.canManage('payroll')) { showToast('⛔ No permission.', 'error'); return; }
        const empId = document.getElementById('payrollEmployeeSelect').value;
        const month = document.getElementById('payrollMonth').value;
        const basic = parseFloat(document.getElementById('payrollBasic').value) || 0;
        const allowances = parseFloat(document.getElementById('payrollAllowances').value) || 0;
        const deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
        const ot = parseFloat(document.getElementById('payrollOT').value) || 0;
        if (!empId || !month) { showToast('Select employee and month.', 'error'); return; }
        const data = getAppData(); const emp = data.employees.find(e => e.id === empId);
        if (!emp) { showToast('Employee not found.', 'error'); return; }
        const epf = basic * 0.08; const etf = basic * 0.03; const net = basic + allowances + ot - deductions - epf - etf;
        const existing = data.payroll.find(p => p.employeeId === empId && p.month === month);
        const payData = { employeeId: empId, employeeName: emp.name, month, basic: basic || (emp.salary || 0), allowances, deductions, ot, epf, etf, net, updatedAt: nowISO() };
        if (existing) Object.assign(existing, payData);
        else { payData.id = generateId(); payData.createdAt = nowISO(); data.payroll.push(payData); }
        setAppData(data); await saveAllData(); renderPayroll(); showToast('✅ Calculated!');
    });
    document.getElementById('generatePayslipBtn')?.addEventListener('click', () => { showToast('📄 Payslip generated.', 'success'); });

    // Finance
    document.getElementById('addFinanceBtn')?.addEventListener('click', async () => {
        if (!window.canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('financeType').value;
        const amount = parseFloat(document.getElementById('financeAmount').value);
        const category = document.getElementById('financeCategory').value;
        const desc = document.getElementById('financeDesc').value.trim();
        const budgetInput = document.getElementById('financeBudget').value.trim();
        if (!amount || amount <= 0 || !desc) { showToast('Enter valid amount and description.', 'error'); return; }
        const data = getAppData();
        if (!data.budget) data.budget = { monthly: 0, category: {} };
        if (budgetInput !== '') data.budget.category[category] = parseFloat(budgetInput) || 0;
        data.finance.push({ id: generateId(), type, amount, category, desc, date: nowISO() });
        setAppData(data); await saveAllData(); renderFinance();
        document.getElementById('financeAmount').value = ''; document.getElementById('financeDesc').value = ''; document.getElementById('financeBudget').value = '';
        showToast(`✅ ${type} recorded.`);
    });

    // Purchasing
    document.getElementById('addSupplierBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory') && !window.canView('purchasing')) { showToast('⛔ No permission.', 'error'); return; }
        const name = document.getElementById('supplierName').value.trim();
        const contact = document.getElementById('supplierContact').value.trim();
        const address = document.getElementById('supplierAddress').value.trim();
        if (!name) { showToast('Enter supplier name.', 'error'); return; }
        const data = getAppData(); if (!data.suppliers) data.suppliers = [];
        data.suppliers.push({ id: generateId(), name, contact, address, createdAt: nowISO() });
        setAppData(data); await saveAllData(); renderPurchasing();
        document.getElementById('supplierName').value = ''; document.getElementById('supplierContact').value = ''; document.getElementById('supplierAddress').value = '';
        showToast('✅ Supplier added.');
    });
    document.getElementById('clearSupplierBtn')?.addEventListener('click', () => {
        document.getElementById('supplierName').value = '';
        document.getElementById('supplierContact').value = '';
        document.getElementById('supplierAddress').value = '';
        showToast('🧹 Cleared.');
    });

    document.getElementById('addPurchaseOrderBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory') && !window.canView('purchasing')) { showToast('⛔ No permission.', 'error'); return; }
        const supplierId = document.getElementById('poSupplierSelect').value;
        const itemId = document.getElementById('poItemSelect').value;
        const qty = parseInt(document.getElementById('poQty').value);
        const price = parseFloat(document.getElementById('poPrice').value);
        if (!supplierId || !itemId || !qty || qty < 1) { showToast('Fill all fields.', 'error'); return; }
        const data = getAppData();
        const supplier = data.suppliers.find(s => s.id === supplierId);
        const item = data.items.find(i => i.id === itemId);
        if (!supplier || !item) { showToast('Invalid selection.', 'error'); return; }
        if (!data.purchaseOrders) data.purchaseOrders = [];
        data.purchaseOrders.push({ id: generateId(), supplierId, supplierName: supplier.name, itemId, itemName: item.name, qty, price, status: 'Pending', createdAt: nowISO() });
        setAppData(data); await saveAllData(); renderPurchasing();
        document.getElementById('poQty').value = ''; document.getElementById('poPrice').value = '';
        showToast('✅ Purchase Order created.');
    });

    // Sales Orders
    document.getElementById('addSalesOrderBtn')?.addEventListener('click', async () => {
        if (!window.canView('sales') && !window.canManage('sales')) { showToast('⛔ No permission.', 'error'); return; }
        const customerId = document.getElementById('salesCustomerSelect').value;
        const itemId = document.getElementById('salesItemSelect').value;
        const qty = parseInt(document.getElementById('salesQty').value);
        const price = parseFloat(document.getElementById('salesPrice').value);
        if (!customerId || !itemId || !qty || qty < 1) { showToast('Fill all fields.', 'error'); return; }
        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        const item = data.items.find(i => i.id === itemId);
        if (!customer || !item) { showToast('Invalid selection.', 'error'); return; }
        if (!data.salesOrders) data.salesOrders = [];
        const total = qty * price;
        data.salesOrders.push({ id: generateId(), customerId, customerName: customer.name, itemId, itemName: item.name, qty, price, total, status: 'Completed', createdAt: nowISO() });
        // Add to sales data
        data.salesData.push({ id: generateId(), customer: customer.name, item: item.name, qty, total, date: nowISO() });
        setAppData(data); await saveAllData(); renderSales();
        document.getElementById('salesQty').value = ''; document.getElementById('salesPrice').value = '';
        showToast('✅ Sales Order created.');
    });

    // Vehicles / Fleet
    document.getElementById('addVehicleBtn')?.addEventListener('click', async () => {
        if (!window.canManage('vehicles')) { showToast('⛔ No permission.', 'error'); return; }
        const editId = document.getElementById('addVehicleBtn').dataset.editId;
        const vehicleNo = document.getElementById('vehicleNo').value.trim();
        const driver = document.getElementById('vehicleDriver').value.trim();
        const fuel = document.getElementById('vehicleFuel').value.trim();
        const insurance = document.getElementById('vehicleInsurance').value.trim();
        const service = document.getElementById('vehicleService').value;
        if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }
        const data = getAppData();
        if (editId) {
            const idx = data.vehicles.findIndex(v => v.id === editId);
            if (idx > -1) data.vehicles[idx] = { ...data.vehicles[idx], vehicleNo, driver, fuel, insurance, service, updatedAt: nowISO() };
            document.getElementById('addVehicleBtn').dataset.editId = '';
            document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        } else {
            data.vehicles.push({ id: generateId(), vehicleNo, driver, fuel, insurance, service, status: 'active', createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data); await saveAllData(); renderFleet();
        document.getElementById('vehicleNo').value = ''; document.getElementById('vehicleDriver').value = ''; document.getElementById('vehicleFuel').value = ''; document.getElementById('vehicleInsurance').value = ''; document.getElementById('vehicleService').value = '';
        showToast(editId ? '✅ Updated!' : '✅ Added!');
    });

    // Settings
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'superadmin') { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData();
        data.settings = {
            company: document.getElementById('settingsCompany').value.trim(),
            address: document.getElementById('settingsAddress').value.trim(),
            phone: document.getElementById('settingsPhone').value.trim(),
            email: document.getElementById('settingsEmail').value.trim()
        };
        setAppData(data); await saveAllData(); showToast('✅ Settings saved!');
    });
    document.getElementById('backupDataBtn')?.addEventListener('click', () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'superadmin') { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_${todayStr()}.json`; a.click(); URL.revokeObjectURL(url); showToast('💾 Backup downloaded!');
    });
    document.getElementById('restoreDataBtn')?.addEventListener('click', () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'superadmin') { showToast('⛔ No permission.', 'error'); return; }
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
        input.onchange = async function(e) {
            const file = this.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(ev) {
                try { const data = JSON.parse(ev.target.result); if (!confirm('Replace ALL data?')) return; setAppData(data); await saveAllData(); renderAll(); showToast('✅ Restored!'); } catch (_) { showToast('Failed to restore.', 'error'); }
            }; reader.readAsText(file);
        }; input.click();
    });
    document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
        if (window.getCurrentUser()?.role !== 'superadmin') { showToast('⛔ Only Super Admin can clear data.', 'error'); return; }
        if (!confirm('⚠️ Delete ALL data? This cannot be undone!')) return;
        if (!confirm('Are you sure?')) return;
        const emptyData = {
            items: [], categories: ['Cosmetics', 'Electronics', 'Food', 'Beverages', 'Clothing'],
            brands: ['Nike', 'Apple', 'Samsung', 'Adidas', 'Pepsi'],
            employees: [], deliveries: [], attendance: [], leaves: [], payroll: [], customers: [],
            finance: [], vehicles: [], notifications: [], salesData: [],
            settings: { company: 'Jayasinghe Distributors', address: 'Colombo, Sri Lanka', phone: '+94 77 123 4567', email: 'info@jayasinghe.lk' },
            leaveBalances: {}, budget: { monthly: 0, category: {} }, vouchers: [], suppliers: [], purchaseOrders: [], salesOrders: [], logs: []
        };
        setAppData(emptyData); await saveAllData(); renderAll(); showToast('🗑️ All data cleared.');
    });
    document.getElementById('clearLogsBtn')?.addEventListener('click', async () => {
        if (window.getCurrentUser()?.role !== 'superadmin' && !window.canManage('settings')) { showToast('⛔ No permission.', 'error'); return; }
        if (!confirm('Clear all logs?')) return;
        const data = getAppData(); data.logs = []; setAppData(data); await saveAllData(); renderAdministration(); showToast('🧹 Logs cleared.');
    });

    // Filters Clear
    document.getElementById('clearEmpFilters')?.addEventListener('click', () => {
        document.getElementById('empSearch').value = '';
        document.getElementById('empDeptFilter').value = 'all';
        document.getElementById('empStatusFilter').value = 'all';
        renderEmployees();
    });
    document.getElementById('clearInvFilters')?.addEventListener('click', () => {
        document.getElementById('invSearch').value = '';
        document.getElementById('invCatFilter').value = 'all';
        document.getElementById('invSort').value = 'name';
        renderInventory();
    });
    document.getElementById('clearCustSearch')?.addEventListener('click', () => {
        document.getElementById('custSearch').value = '';
        renderCustomers();
    });
    document.getElementById('clearReportFilters')?.addEventListener('click', () => {
        document.getElementById('reportFrom').value = '';
        document.getElementById('reportTo').value = '';
        renderReports();
    });

    // Vouchers
    const voucherDate = document.getElementById('voucherDate');
    if (voucherDate) voucherDate.value = todayStr();
    const voucherNoInput = document.getElementById('voucherNo');
    if (voucherNoInput && !voucherNoInput.value) {
        const data = getAppData(); const vouchers = data.vouchers || [];
        voucherNoInput.value = 'JV-' + String(vouchers.length + 1).padStart(4, '0');
    }
    document.getElementById('addVoucherBtn')?.addEventListener('click', async () => {
        if (!window.canManage('voucher') && !window.canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        const voucherNo = document.getElementById('voucherNo').value.trim();
        const date = document.getElementById('voucherDate').value;
        const paidTo = document.getElementById('voucherPaidTo').value.trim();
        const amount = parseFloat(document.getElementById('voucherAmount').value);
        const description = document.getElementById('voucherDescription').value.trim();
        const approvedBy = document.getElementById('voucherApprovedBy').value.trim();
        const receivedBy = document.getElementById('voucherReceivedBy').value.trim();
        const signature = document.getElementById('voucherSignature').value.trim();
        const checkboxes = document.querySelectorAll('.voucher-payment-type:checked');
        const paymentTypes = Array.from(checkboxes).map(cb => cb.value);
        const otherText = document.getElementById('voucherOtherText').value.trim();
        if (paymentTypes.includes('Other') && otherText) paymentTypes[paymentTypes.indexOf('Other')] = 'Other: ' + otherText;
        if (!paidTo || !amount || amount <= 0) { showToast('Fill required fields.', 'error'); return; }
        const data = getAppData(); if (!data.vouchers) data.vouchers = [];
        const voucherData = { id: generateId(), voucherNo: voucherNo || 'JV-' + String(data.vouchers.length + 1).padStart(4, '0'), date: date || nowISO(), paidTo, amount, paymentTypes, description, approvedBy: approvedBy || '—', receivedBy: receivedBy || '—', signature: signature || '—', createdAt: nowISO(), updatedAt: nowISO() };
        data.vouchers.push(voucherData);
        setAppData(data); await saveAllData();
        document.getElementById('voucherPaidTo').value = ''; document.getElementById('voucherAmount').value = ''; document.getElementById('voucherDescription').value = ''; document.getElementById('voucherApprovedBy').value = ''; document.getElementById('voucherReceivedBy').value = ''; document.getElementById('voucherSignature').value = ''; document.getElementById('voucherOtherText').value = ''; document.querySelectorAll('.voucher-payment-type').forEach(cb => cb.checked = false);
        const nextNo = data.vouchers.length + 1; document.getElementById('voucherNo').value = 'JV-' + String(nextNo).padStart(4, '0');
        renderVouchers(); showToast('✅ Voucher #' + voucherData.voucherNo + ' saved!');
    });
    document.getElementById('clearVoucherForm')?.addEventListener('click', () => {
        document.getElementById('voucherPaidTo').value = ''; document.getElementById('voucherAmount').value = ''; document.getElementById('voucherDescription').value = ''; document.getElementById('voucherApprovedBy').value = ''; document.getElementById('voucherReceivedBy').value = ''; document.getElementById('voucherSignature').value = ''; document.getElementById('voucherOtherText').value = ''; document.querySelectorAll('.voucher-payment-type').forEach(cb => cb.checked = false);
        showToast('🧹 Form cleared.');
    });
    document.getElementById('printVoucherBtn')?.addEventListener('click', () => {
        const data = getAppData(); const vouchers = data.vouchers || [];
        if (vouchers.length === 0) { showToast('No vouchers to print.', 'error'); return; }
        const latest = vouchers[vouchers.length - 1];
        const paymentTypes = latest.paymentTypes ? latest.paymentTypes.join(', ') : '—';
        const win = window.open('', '_blank', 'width=800,height=600');
        win.document.write(`<html><head><title>Voucher #${latest.voucherNo}</title><style>body{font-family:Arial;padding:40px;}.card{max-width:600px;margin:auto;border:2px solid #000;padding:30px;border-radius:8px;}h2{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;}.label{font-weight:bold;}.amount{font-size:24px;color:#2563eb;}.footer{margin-top:30px;display:flex;justify-content:space-between;}.signature-line{border-top:1px solid #000;width:150px;margin-top:30px;text-align:center;font-size:12px;}</style></head><body><div class="card"><h2>🧾 CASH PAYMENT VOUCHER</h2><p style="text-align:center;">P.M. Jayasinghe Distributors</p><div class="row"><span class="label">Voucher No</span><span>${latest.voucherNo}</span></div><div class="row"><span class="label">Date</span><span>${formatDate(latest.date)}</span></div><div class="row"><span class="label">Paid To</span><span>${latest.paidTo}</span></div><div class="row" style="border-bottom:2px solid #000;"><span class="label">Amount</span><span class="amount">LKR ${formatCurrency(latest.amount)}</span></div><div class="row"><span class="label">Payment For</span><span>${paymentTypes}</span></div><div class="row"><span class="label">Description</span><span>${latest.description || '—'}</span></div><div style="margin-top:20px;"><div class="row"><span class="label">Approved By</span><span>${latest.approvedBy}</span></div><div class="row"><span class="label">Received By</span><span>${latest.receivedBy}</span></div><div class="row"><span class="label">Signature</span><span>${latest.signature}</span></div></div><div class="footer"><div><div class="signature-line">Approved Signature</div></div><div><div class="signature-line">Receiver Signature</div></div></div></div><script>window.onload=function(){window.print();window.close();}<\/script></body></html>`);
        win.document.close();
    });
    document.getElementById('downloadVoucherBtn')?.addEventListener('click', async () => {
        const data = getAppData(); const vouchers = data.vouchers || [];
        if (vouchers.length === 0) { showToast('No vouchers.', 'error'); return; }
        const latest = vouchers[vouchers.length - 1];
        const paymentTypes = latest.paymentTypes ? latest.paymentTypes.join(', ') : '—';
        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:-9999px;top:0;width:600px;background:#fff;padding:30px;font-family:Arial;border:2px solid #000;border-radius:8px;';
        div.innerHTML = `<h2 style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;">🧾 CASH PAYMENT VOUCHER</h2><p style="text-align:center;">P.M. Jayasinghe Distributors</p><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;"><strong>Voucher No</strong><span>${latest.voucherNo}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;"><strong>Date</strong><span>${formatDate(latest.date)}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;"><strong>Paid To</strong><span>${latest.paidTo}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:2px solid #000;font-size:24px;color:#2563eb;"><strong>Amount</strong><span>LKR ${formatCurrency(latest.amount)}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;"><strong>Payment For</strong><span>${paymentTypes}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ccc;"><strong>Description</strong><span>${latest.description || '—'}</span></div><div style="margin-top:20px;"><div style="display:flex;justify-content:space-between;padding:4px 0;"><strong>Approved By</strong><span>${latest.approvedBy}</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;"><strong>Received By</strong><span>${latest.receivedBy}</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;"><strong>Signature</strong><span>${latest.signature}</span></div></div><div style="margin-top:30px;display:flex;justify-content:space-between;"><div><div style="border-top:1px solid #000;width:150px;margin-top:30px;text-align:center;font-size:12px;">Approved Signature</div></div><div><div style="border-top:1px solid #000;width:150px;margin-top:30px;text-align:center;font-size:12px;">Receiver Signature</div></div></div>`;
        document.body.appendChild(div);
        try {
            const canvas = await html2canvas(div, { scale: 2, backgroundColor: '#ffffff', logging: false });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Voucher_${latest.voucherNo}.pdf`);
            showToast('✅ PDF Downloaded!');
        } catch(err) { showToast('❌ PDF Error.', 'error'); }
        finally { document.body.removeChild(div); }
    });

    // Reports
    document.getElementById('generateReportBtn')?.addEventListener('click', () => { if(window.canView('reports')) renderReports(); else showToast('⛔ No permission.', 'error'); });
    document.getElementById('reportType')?.addEventListener('change', () => { if(window.canView('reports')) renderReports(); });
    document.getElementById('applyReportFilters')?.addEventListener('click', () => { if(window.canView('reports')) renderReports(); });
    document.getElementById('exportReportBtn')?.addEventListener('click', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('reportType').value;
        const data = getAppData();
        let exportData = [];
        switch(type) {
            case 'stock': exportData = data.items || []; break;
            case 'sales': exportData = data.salesData || []; break;
            case 'attendance': exportData = data.attendance || []; break;
            case 'payroll': exportData = data.payroll || []; break;
            case 'customers': exportData = data.customers || []; break;
            case 'purchasing': exportData = data.purchaseOrders || []; break;
            case 'finance': exportData = data.finance || []; break;
        }
        if (!exportData || exportData.length === 0) { showToast('No data to export.', 'error'); return; }
        let csv = Object.keys(exportData[0]).join(',') + '\n';
        exportData.forEach(row => { csv += Object.values(row).map(v => `"${v}"`).join(',') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${type}_${todayStr()}.csv`; a.click(); URL.revokeObjectURL(url); showToast('📥 CSV exported!');
    });
    document.getElementById('printReportBtn')?.addEventListener('click', () => { if(window.canView('reports')) window.print(); else showToast('⛔ No permission.', 'error'); });

    // Notifications
    document.getElementById('notifBell')?.addEventListener('click', () => {
        const data = getAppData(); const list = document.getElementById('notifList');
        const notifs = data.notifications || [];
        if (notifs.length === 0) list.innerHTML = '<div class="text-muted text-center" style="padding:20px;">No notifications.</div>';
        else list.innerHTML = notifs.slice().reverse().map(n => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;"><div><strong>${escapeHtml(n.title||'')}</strong></div><div class="text-muted">${escapeHtml(n.message||'')} · ${formatDateTime(n.date)}</div></div>`).join('');
        document.getElementById('notifModal').classList.add('open');
        document.getElementById('notifDot').style.display = 'none';
    });
    document.getElementById('notifModalClose')?.addEventListener('click', () => document.getElementById('notifModal').classList.remove('open'));

    // Modal close on overlay
    document.querySelectorAll('.modal-overlay').forEach(m => { m.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); }); });

    // Products
    document.getElementById('addCategoryBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const val = document.getElementById('newCategoryInput').value.trim();
        if (!val) { showToast('Enter category.', 'error'); return; }
        const data = getAppData();
        if (data.categories.includes(val)) { showToast('Already exists.', 'warning'); return; }
        data.categories.push(val); setAppData(data); await saveAllData(); renderProducts(); document.getElementById('newCategoryInput').value = ''; showToast(`✅ "${val}" added.`);
    });
    document.getElementById('addBrandBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const val = document.getElementById('newBrandInput').value.trim();
        if (!val) { showToast('Enter brand.', 'error'); return; }
        const data = getAppData();
        if (data.brands.includes(val)) { showToast('Already exists.', 'warning'); return; }
        data.brands.push(val); setAppData(data); await saveAllData(); renderProducts(); document.getElementById('newBrandInput').value = ''; showToast(`✅ "${val}" added.`);
    });

    console.log('✅ All events initialized!');
}

// ============================================================
// CREATE DEFAULT ADMIN ACCOUNT
// ============================================================
async function createDefaultAdmin() {
    const email = 'admin@example.com';
    const password = 'admin123';
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Admin exists.');
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                console.log('✅ Default admin created.');
                showToast('👑 Default admin created: admin@example.com', 'success');
            } catch(e) { console.warn(e.message); }
        }
    }
}

// ============================================================
// INIT
// ============================================================
async function init() {
    console.log('🚀 Initializing Enterprise ERP...');
    try {
        await loadAllData();
        await createDefaultAdmin();
        const payrollMonth = document.getElementById('payrollMonth');
        if (payrollMonth) payrollMonth.value = new Date().toISOString().slice(0, 7);
        const leaveFrom = document.getElementById('leaveFrom');
        if (leaveFrom) leaveFrom.value = todayStr();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('leaveTo').value = nextWeek.toISOString().slice(0, 10);
        document.getElementById('delDateFilter').value = todayStr();
        initEvents();
        renderAll();
        const data = getAppData();
        if (!data.notifications || data.notifications.length === 0) {
            data.notifications = [{ id: generateId(), title: 'Welcome to Enterprise ERP', message: 'All modules are ready.', date: nowISO() }];
            setAppData(data); await saveAllData();
        }
        showToast('🔥 Firebase connected! ERP ready.', 'success');
        console.log('✅ App initialized successfully!');
    } catch (error) {
        console.error('❌ Init error:', error);
        showToast('❌ Init failed.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', init);
