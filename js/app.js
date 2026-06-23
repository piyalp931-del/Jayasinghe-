// ============================================================
// MAIN APP MODULE (FULLY INTEGRATED - WITH PROFILE MODAL)
// ============================================================

// ============================================================
// TOAST
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

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
    console.log('🔄 Rendering active panel...');
    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        const id = activePanel.id.replace('panel-', '');
        switch (id) {
            case 'dashboard': renderDashboard(); break;
            case 'employees': renderEmployees(); break;
            case 'inventory': renderInventory(); break;
            case 'products': renderProducts(); break;
            case 'deliveries': renderDeliveries(); break;
            case 'attendance': renderAttendance(); break;
            case 'leave': renderLeave(); break;
            case 'payroll': renderPayroll(); break;
            case 'customers': renderCustomers(); break;
            case 'finance': renderFinance(); break;
            case 'reports': renderReports(); break;
            case 'vehicles': renderVehicles(); break;
            case 'settings': renderSettings(); break;
            case 'voucher': renderVouchers(); break;
            default: break;
        }
    } else {
        renderDashboard();
    }
    renderSidebar();
}
window.renderAll = renderAll;

// ============================================================
// POPULATE ITEM DROPDOWNS
// ============================================================
function populateItemDropdowns() {
    const data = getAppData();
    const catSelect = document.getElementById('itemCategory');
    const brandSelect = document.getElementById('itemBrand');
    if (!catSelect || !brandSelect) return;
    const currentCat = catSelect.value;
    const currentBrand = brandSelect.value;
    catSelect.innerHTML = '<option value="">Select...</option>' + (data.categories || []).map(c =>
        `<option value="${c}">${c}</option>`).join('');
    if (currentCat && [...catSelect.options].some(o => o.value === currentCat)) catSelect.value = currentCat;
    brandSelect.innerHTML = '<option value="">Select...</option>' + (data.brands || []).map(b =>
        `<option value="${b}">${b}</option>`).join('');
    if (currentBrand && [...brandSelect.options].some(o => o.value === currentBrand)) brandSelect.value = currentBrand;
}
window.populateItemDropdowns = populateItemDropdowns;

// ============================================================
// POPULATE DELIVERY DROPDOWNS
// ============================================================
function populateDeliveryDropdowns() {
    const data = getAppData();
    const customerSelect = document.getElementById('delCustomerSelect');
    if (customerSelect) {
        const currentVal = customerSelect.value;
        customerSelect.innerHTML = '<option value="">-- Select Customer --</option>' + 
            (data.customers || []).map(c => `<option value="${c.id}">${escapeHtml(c.name)} ${c.balance > 0 ? '⚠️' : ''}</option>`).join('');
        if (currentVal && [...customerSelect.options].some(o => o.value === currentVal)) customerSelect.value = currentVal;
        customerSelect.onchange = function() {
            const customer = data.customers.find(c => c.id === this.value);
            const balanceDisplay = document.getElementById('customerBalanceDisplay');
            if (customer && balanceDisplay) {
                balanceDisplay.textContent = customer.balance > 0 ? 
                    `⚠️ Outstanding Balance: LKR ${formatCurrency(customer.balance)}` : 
                    `✅ Balance: LKR ${formatCurrency(customer.balance || 0)}`;
                balanceDisplay.style.color = customer.balance > 0 ? 'var(--danger)' : 'var(--success)';
            } else if (balanceDisplay) balanceDisplay.textContent = '';
        };
        if (customerSelect.value) customerSelect.dispatchEvent(new Event('change'));
    }
    const itemSelect = document.getElementById('delItemSelect');
    if (itemSelect) {
        const currentVal = itemSelect.value;
        itemSelect.innerHTML = '<option value="">-- Select --</option>' + 
            (data.items || []).filter(i => i.status !== 'inactive').map(i =>
                `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0} available)</option>`).join('');
        if (currentVal && [...itemSelect.options].some(o => o.value === currentVal)) itemSelect.value = currentVal;
        itemSelect.onchange = function() {
            const item = data.items.find(i => i.id === this.value);
            const stockDisplay = document.getElementById('itemStockDisplay');
            if (item && stockDisplay) {
                const qty = item.qty || 0;
                stockDisplay.textContent = qty <= 5 ? `⚠️ Low Stock: ${qty} left` : `✅ Available: ${qty} units`;
                stockDisplay.style.color = qty <= 5 ? 'var(--danger)' : 'var(--success)';
            } else if (stockDisplay) stockDisplay.textContent = '';
        };
        if (itemSelect.value) itemSelect.dispatchEvent(new Event('change'));
    }
    const driverSelect = document.getElementById('delDriverSelect');
    if (driverSelect) {
        const currentVal = driverSelect.value;
        const employees = data.employees || [];
        const deliveryStaff = employees.filter(e => e.status === 'active' && 
            (e.department === 'Delivery' || e.designation?.toLowerCase().includes('driver')));
        const staffList = deliveryStaff.length > 0 ? deliveryStaff : employees.filter(e => e.status === 'active');
        driverSelect.innerHTML = '<option value="">-- Select Driver --</option>' + 
            staffList.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
        if (currentVal && [...driverSelect.options].some(o => o.value === currentVal)) driverSelect.value = currentVal;
    }
    const vehicleSelect = document.getElementById('delVehicleSelect');
    if (vehicleSelect) {
        const currentVal = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>' + 
            (data.vehicles || []).map(v => `<option value="${v.id}">${escapeHtml(v.vehicleNo)} (${escapeHtml(v.driver || 'No Driver')})</option>`).join('');
        if (currentVal && [...vehicleSelect.options].some(o => o.value === currentVal)) vehicleSelect.value = currentVal;
    }
    const scheduledDate = document.getElementById('delScheduledDate');
    if (scheduledDate && !scheduledDate.value) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
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
    const emp = employees.find(e => e.email === user.email) || 
                employees.find(e => e.id === user.uid) || 
                { name: user.name, email: user.email, department: user.role };
    const nameEl = document.getElementById('profileName');
    const roleEl = document.getElementById('profileRole');
    const detailsEl = document.getElementById('profileDetails');
    const statsEl = document.getElementById('profileStats');
    if (nameEl) nameEl.textContent = emp.name || user.name;
    if (roleEl) roleEl.textContent = (emp.department || user.role || 'Employee');
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
    const attendance = data.attendance || [];
    const leaves = data.leaves || [];
    const payroll = data.payroll || [];
    const vouchers = data.vouchers || [];
    const empAttendance = attendance.filter(a => a.employeeId === emp.id || a.employeeId === user.uid);
    const empLeaves = leaves.filter(l => l.employeeId === emp.id || l.employeeId === user.uid);
    const empPayroll = payroll.filter(p => p.employeeId === emp.id || p.employeeId === user.uid);
    const empVouchers = vouchers.filter(v => v.paidTo === emp.name || v.createdBy === emp.id);
    const totalPresent = empAttendance.length;
    const pendingLeaves = empLeaves.filter(l => l.status === 'pending').length;
    const totalPayroll = empPayroll.reduce((s, p) => s + (p.net || 0), 0);
    const totalVouchers = empVouchers.length;
    if (statsEl) {
        statsEl.innerHTML = `
            <div style="text-align:center; background:var(--bg); padding:10px; border-radius:8px;">
                <div style="font-size:18px; font-weight:700; color:var(--success);">${totalPresent}</div>
                <div style="font-size:10px; color:var(--text-muted);">✅ Present</div>
            </div>
            <div style="text-align:center; background:var(--bg); padding:10px; border-radius:8px;">
                <div style="font-size:18px; font-weight:700; color:var(--warning);">${pendingLeaves}</div>
                <div style="font-size:10px; color:var(--text-muted);">⏳ Pending Leave</div>
            </div>
            <div style="text-align:center; background:var(--bg); padding:10px; border-radius:8px;">
                <div style="font-size:18px; font-weight:700; color:var(--primary);">LKR ${formatCurrency(totalPayroll)}</div>
                <div style="font-size:10px; color:var(--text-muted);">💰 Payroll</div>
            </div>
            <div style="text-align:center; background:var(--bg); padding:10px; border-radius:8px;">
                <div style="font-size:18px; font-weight:700; color:var(--purple);">${totalVouchers}</div>
                <div style="font-size:10px; color:var(--text-muted);">🧾 Vouchers</div>
            </div>
        `;
    }
    document.getElementById('profileModal').classList.add('open');
}
window.openProfileModal = openProfileModal;

// ============================================================
// EVENT BINDINGS
// ============================================================
function initEvents() {
    console.log('🔧 Initializing events...');

    // ── Sidebar toggle ──
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));

    // ── User Badge Click → Profile Modal ──
    document.getElementById('userBadge')?.addEventListener('click', function(e) {
        if (e.target.closest('.logout-btn')) return;
        openProfileModal();
    });

    // ── Profile Modal Close ──
    document.getElementById('profileModalClose')?.addEventListener('click', () => {
        document.getElementById('profileModal').classList.remove('open');
    });
    document.getElementById('profileModal')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });

    // ── Dark Mode ──
    let isDark = false;
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            isDark = !isDark;
            document.body.classList.toggle('dark', isDark);
            darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', isDark ? 'true' : 'false');
        });
        if (localStorage.getItem('darkMode') === 'true') {
            isDark = true;
            document.body.classList.add('dark');
            darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ── Language Toggle ──
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
                if (navItem) {
                    const label = currentLang === 'si' && navItem.labelSI ? navItem.labelSI : navItem.label;
                    document.getElementById('pageTitle').textContent = label;
                }
            }
            showToast(currentLang === 'en' ? '🌐 English' : '🌐 සිංහල');
        });
    }

    // ── Sync Button ──
    document.getElementById('syncBtn')?.addEventListener('click', async () => {
        showToast('🔄 Syncing...', 'warning');
        await saveAllData();
        await loadAllData();
        renderAll();
        showToast('✅ Sync complete!');
    });

    // ── Clear Login Fields ──
    document.getElementById('clearLoginBtn')?.addEventListener('click', () => {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        showToast('🧹 Fields cleared', 'info');
    });

    // ── Employee Modal ──
    const addEmpBtn = document.getElementById('addEmployeeBtn');
    if (addEmpBtn) {
        addEmpBtn.addEventListener('click', () => {
            if (!window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
            document.getElementById('empEditId').value = '';
            document.getElementById('employeeModalTitle').textContent = '👤 Add Employee';
            document.getElementById('empName').value = '';
            document.getElementById('empNIC').value = '';
            document.getElementById('empDept').value = 'Admin';
            document.getElementById('empDesignation').value = '';
            document.getElementById('empContact').value = '';
            document.getElementById('empEmergency').value = '';
            document.getElementById('empAddress').value = '';
            document.getElementById('empJoined').value = '';
            document.getElementById('empSalary').value = '';
            document.getElementById('empEpf').value = '';
            document.getElementById('empUsername').value = '';
            document.getElementById('empPassword').value = '';
            document.getElementById('empStatus').value = 'active';
            document.getElementById('employeeModal').classList.add('open');
        });
    }
    document.getElementById('empModalClose')?.addEventListener('click', () => {
        document.getElementById('employeeModal').classList.remove('open');
    });

    // ── Save Employee ──
    document.getElementById('empSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('empEditId').value;
        const name = document.getElementById('empName').value.trim();
        const username = document.getElementById('empUsername').value.trim();
        const password = document.getElementById('empPassword').value.trim();
        if (!name) { showToast('Enter employee name.', 'error'); return; }
        if (!id && !username) { showToast('Enter username (email) for new employee.', 'error'); return; }
        if (!id && !password) { showToast('Enter password for new employee.', 'error'); return; }
        if (!id && password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
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
                showToast(`✅ Employee added! They can login with ${username}`);
            }
            setAppData(data);
            await saveAllData();
            document.getElementById('employeeModal').classList.remove('open');
            renderEmployees();
            document.getElementById('empPassword').value = '';
            if (!id) document.getElementById('empUsername').value = '';
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('❌ ' + (error.message || 'Failed to save employee.'), 'error');
        }
    });

    // ── Item Modal ──
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('itemEditId').value = '';
        document.getElementById('itemModalTitle').textContent = '📦 Add Item';
        document.getElementById('itemBarcode').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('itemQty').value = '1';
        document.getElementById('itemPrice').value = '0';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemBrand').value = '';
        document.getElementById('itemDesc').value = '';
        document.getElementById('itemExpiry').value = '';
        document.getElementById('itemBatch').value = '';
        document.getElementById('itemStatus').value = 'active';
        populateItemDropdowns();
        closeScanner();
        document.getElementById('itemModal').classList.add('open');
    });
    document.getElementById('itemModalClose')?.addEventListener('click', () => {
        closeScanner();
        document.getElementById('itemModal').classList.remove('open');
    });
    document.getElementById('itemSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('itemEditId').value;
        const name = document.getElementById('itemName').value.trim();
        if (!name) { showToast('Enter item name.', 'error'); return; }
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
        if (id) {
            const idx = data.items.findIndex(i => i.id === id);
            if (idx > -1) data.items[idx] = { ...data.items[idx], ...itemData };
        } else {
            itemData.id = generateId();
            itemData.createdAt = nowISO();
            data.items.push(itemData);
        }
        setAppData(data);
        await saveAllData();
        closeScanner();
        document.getElementById('itemModal').classList.remove('open');
        renderInventory();
        renderDashboard();
        showToast(id ? '✅ Item updated!' : '✅ Item added!');
    });

    // ── Barcode Scanner ──
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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            showToast('⚠️ Camera access denied. Please allow camera permission.', 'error');
            return;
        }
        container.style.display = 'block';
        readerElement.innerHTML = '';
        try {
            html5QrCode = new Html5Qrcode("scannerReader");
            const config = { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 };
            await html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
                barcodeInput.value = decodedText;
                showToast('✅ Barcode scanned: ' + decodedText, 'success');
                closeScanner();
            }, (error) => {});
        } catch (err) {
            console.error('Scanner error:', err);
            showToast('❌ Failed to start camera. Please try again.', 'error');
            closeScanner();
        }
    });
    document.getElementById('closeScannerBtn')?.addEventListener('click', closeScanner);

    // ── Customer Modal ──
    document.getElementById('addCustomerBtn')?.addEventListener('click', () => {
        if (!window.canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('custEditId').value = '';
        document.getElementById('customerModalTitle').textContent = '👤 Add Customer';
        document.getElementById('custName').value = '';
        document.getElementById('custContact').value = '';
        document.getElementById('custCategory').value = 'Retail';
        document.getElementById('custAddress').value = '';
        document.getElementById('custCreditLimit').value = '0';
        document.getElementById('custBalance').value = '0';
        document.getElementById('customerModal').classList.add('open');
    });
    document.getElementById('custModalClose')?.addEventListener('click', () => {
        document.getElementById('customerModal').classList.remove('open');
    });
    document.getElementById('custSaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        const id = document.getElementById('custEditId').value;
        const name = document.getElementById('custName').value.trim();
        if (!name) { showToast('Enter customer name.', 'error'); return; }
        const data = getAppData();
        const custData = {
            name, contact: document.getElementById('custContact').value.trim(),
            category: document.getElementById('custCategory').value,
            address: document.getElementById('custAddress').value.trim(),
            creditLimit: parseFloat(document.getElementById('custCreditLimit').value) || 0,
            balance: parseFloat(document.getElementById('custBalance').value) || 0,
            updatedAt: nowISO()
        };
        if (id) {
            const idx = data.customers.findIndex(c => c.id === id);
            if (idx > -1) data.customers[idx] = { ...data.customers[idx], ...custData };
        } else {
            custData.id = generateId();
            custData.createdAt = nowISO();
            data.customers.push(custData);
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('customerModal').classList.remove('open');
        renderCustomers();
        showToast(id ? '✅ Customer updated!' : '✅ Customer added!');
    });

    // ── Quick Actions ──
    document.getElementById('quickAddItem')?.addEventListener('click', () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('addItemBtn')?.click();
    });
    document.getElementById('quickNewDelivery')?.addEventListener('click', () => {
        if (!window.canManage('deliveries') && !window.canView('deliveries')) { showToast('⛔ No permission.', 'error'); return; }
        switchPanel('deliveries');
    });
    document.getElementById('quickAddEmployee')?.addEventListener('click', () => {
        if (!window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('addEmployeeBtn')?.click();
    });
    document.getElementById('quickPrint')?.addEventListener('click', () => window.print());

    // ── Deliveries ──
    document.getElementById('quickAddCustomerBtn')?.addEventListener('click', () => {
        if (!window.canManage('customers')) { showToast('⛔ No permission.', 'error'); return; }
        document.getElementById('addCustomerBtn')?.click();
    });
    document.getElementById('deliverSubmitBtn')?.addEventListener('click', async () => {
        if (!window.canManage('deliveries') && !window.hasPermission('create_deliveries')) {
            showToast('⛔ No permission.', 'error'); return;
        }
        const customerId = document.getElementById('delCustomerSelect')?.value;
        const itemId = document.getElementById('delItemSelect')?.value;
        const qty = parseInt(document.getElementById('delQty')?.value);
        const driverId = document.getElementById('delDriverSelect')?.value;
        const vehicleId = document.getElementById('delVehicleSelect')?.value;
        const status = document.getElementById('delStatusSelect')?.value || 'pending';
        const route = document.getElementById('delRoute')?.value.trim() || '';
        const notes = document.getElementById('delNotes')?.value.trim() || '';
        if (!customerId) { showToast('Select a customer.', 'error'); return; }
        if (!itemId) { showToast('Select an item.', 'error'); return; }
        if (!qty || qty < 1) { showToast('Enter valid qty.', 'error'); return; }
        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        const item = data.items.find(i => i.id === itemId);
        const driver = data.employees.find(e => e.id === driverId);
        const vehicle = data.vehicles.find(v => v.id === vehicleId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast(`Insufficient stock! Available: ${item.qty}`, 'error'); return; }
        if (status === 'delivered') {
            item.qty = (item.qty || 0) - qty;
            item.updatedAt = nowISO();
        }
        const delivery = {
            id: generateId(), customerId, customerName: customer ? customer.name : 'Unknown',
            itemId: item.id, itemName: item.name, qty,
            driverId, driverName: driver ? driver.name : '—',
            vehicleId, vehicleNo: vehicle ? vehicle.vehicleNo : '—',
            status, route, notes, date: nowISO(), updatedAt: nowISO()
        };
        data.deliveries.push(delivery);
        if (status === 'delivered') {
            data.salesData.push({ id: generateId(), customer: customer ? customer.name : 'Unknown',
                item: item.name, qty, total: qty * (item.price || 0), date: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        renderDeliveries();
        renderDashboard();
        renderReports();
        document.getElementById('delQty').value = '';
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        populateDeliveryDropdowns();
        showToast(`✅ Delivery ${status === 'delivered' ? 'completed' : 'created'}!`);
    });
    document.getElementById('delDateFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('delStatusFilter')?.addEventListener('change', renderDeliveries);
    document.getElementById('clearDelFilter')?.addEventListener('click', () => {
        document.getElementById('delDateFilter').value = '';
        document.getElementById('delStatusFilter').value = 'all';
        renderDeliveries();
    });

    // ── Attendance ──
    document.getElementById('checkInBtn')?.addEventListener('click', async () => {
        const user = window.getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === user.uid && a.date.slice(0, 10) === today);
        if (existing && existing.checkIn) { showToast('Already checked in today.', 'warning'); return; }
        const record = { id: generateId(), employeeId: user.uid, employeeName: user.name, date: nowISO(),
            checkIn: nowISO(), checkOut: null, location: document.getElementById('attendanceLocation').value || 'Colombo' };
        if (existing) { existing.checkIn = record.checkIn; existing.location = record.location; }
        else data.attendance.push(record);
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked in at ' + new Date().toLocaleTimeString());
    });
    document.getElementById('checkOutBtn')?.addEventListener('click', async () => {
        const user = window.getCurrentUser();
        if (!user) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === user.uid && a.date.slice(0, 10) === today);
        if (!existing) { showToast('No check-in found today.', 'error'); return; }
        if (existing.checkOut) { showToast('Already checked out.', 'warning'); return; }
        existing.checkOut = nowISO();
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked out at ' + new Date().toLocaleTimeString());
    });
    document.getElementById('attendanceRefreshBtn')?.addEventListener('click', () => { renderAttendance(); showToast('🔄 Refreshed.'); });
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            document.getElementById('attendanceLocation').value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        }, () => { document.getElementById('attendanceLocation').value = '📍 Location unavailable'; });
    }

    // ── Leave ──
    document.getElementById('applyLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canView('leave')) { showToast('⛔ No permission.', 'error'); return; }
        const user = window.getCurrentUser();
        let empId = document.getElementById('leaveEmployeeSelect').value;
        const type = document.getElementById('leaveType').value;
        const from = document.getElementById('leaveFrom').value;
        const to = document.getElementById('leaveTo').value;
        const reason = document.getElementById('leaveReason').value.trim();
        if (user?.role === 'employee') {
            const data = getAppData();
            const emp = data.employees.find(e => e.id === user.uid);
            empId = emp ? emp.id : user.uid;
        }
        if (!empId) { showToast('Select employee.', 'error'); return; }
        if (!from || !to) { showToast('Select dates.', 'error'); return; }
        const data = getAppData();
        if (!data.leaveBalances) data.leaveBalances = {};
        const empBalance = data.leaveBalances[empId] || { sick: 0, casual: 0, annual: 0 };
        if (empBalance[type] <= 0) { showToast(`⚠️ No ${type} leave balance left!`, 'error'); return; }
        const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
        if (empBalance[type] < days) { showToast(`⚠️ Only ${empBalance[type]} ${type} days available.`, 'error'); return; }
        empBalance[type] -= days;
        data.leaveBalances[empId] = empBalance;
        const emp = data.employees.find(e => e.id === empId);
        data.leaves.push({ id: generateId(), employeeId: empId, employeeName: emp ? emp.name : (user?.name || 'Unknown'),
            type, from, to, reason, days, status: 'pending', appliedAt: nowISO() });
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave applied!');
        document.getElementById('leaveReason').value = '';
    });
    document.getElementById('approveLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('leave') && !window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData();
        const leaves = data.leaves.filter(l => l.status === 'pending');
        if (leaves.length === 0) { showToast('No pending leaves.', 'warning'); return; }
        leaves[leaves.length - 1].status = 'approved';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave approved.');
    });
    document.getElementById('rejectLeaveBtn')?.addEventListener('click', async () => {
        if (!window.canManage('leave') && !window.canManage('employees')) { showToast('⛔ No permission.', 'error'); return; }
        const data = getAppData();
        const leaves = data.leaves.filter(l => l.status === 'pending');
        if (leaves.length === 0) { showToast('No pending leaves.', 'warning'); return; }
        leaves[leaves.length - 1].status = 'rejected';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('❌ Leave rejected.');
    });

    // ── Payroll ──
    document.getElementById('calculatePayrollBtn')?.addEventListener('click', async () => {
        if (!window.canManage('payroll')) { showToast('⛔ No permission.', 'error'); return; }
        const empId = document.getElementById('payrollEmployeeSelect').value;
        const month = document.getElementById('payrollMonth').value;
        const basic = parseFloat(document.getElementById('payrollBasic').value) || 0;
        const allowances = parseFloat(document.getElementById('payrollAllowances').value) || 0;
        const deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
        const ot = parseFloat(document.getElementById('payrollOT').value) || 0;
        if (!empId) { showToast('Select employee.', 'error'); return; }
        if (!month) { showToast('Select month.', 'error'); return; }
        const data = getAppData();
        const emp = data.employees.find(e => e.id === empId);
        if (!emp) { showToast('Employee not found.', 'error'); return; }
        const epf = basic * 0.08, etf = basic * 0.03, net = basic + allowances + ot - deductions - epf - etf;
        const existing = data.payroll.find(p => p.employeeId === empId && p.month === month);
        const payData = { employeeId: empId, employeeName: emp.name, month,
            basic: basic || (emp.salary || 0), allowances, deductions, ot, epf, etf, net, updatedAt: nowISO() };
        if (existing) Object.assign(existing, payData);
        else { payData.id = generateId(); payData.createdAt = nowISO(); data.payroll.push(payData); }
        setAppData(data);
        await saveAllData();
        renderPayroll();
        showToast('✅ Payroll calculated!');
    });
    document.getElementById('generatePayslipBtn')?.addEventListener('click', () => {
        if (!window.canView('payroll')) { showToast('⛔ No permission.', 'error'); return; }
        showToast('📄 Payslip PDF generated (simulated).', 'success');
    });

    // ── Finance ──
    document.getElementById('addFinanceBtn')?.addEventListener('click', async () => {
        if (!window.canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('financeType').value;
        const amount = parseFloat(document.getElementById('financeAmount').value);
        const category = document.getElementById('financeCategory').value;
        const desc = document.getElementById('financeDesc').value.trim();
        const budgetInput = document.getElementById('financeBudget').value.trim();
        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
        if (!desc) { showToast('Enter description.', 'error'); return; }
        const data = getAppData();
        if (!data.budget) data.budget = { monthly: 0, category: {} };
        if (budgetInput !== '') data.budget.category[category] = parseFloat(budgetInput) || 0;
        data.finance.push({ id: generateId(), type, amount, category, desc, date: nowISO() });
        setAppData(data);
        await saveAllData();
        renderFinance();
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        document.getElementById('financeBudget').value = '';
        showToast(`✅ ${type} recorded.`);
    });

    // ── Reports ──
    document.getElementById('generateReportBtn')?.addEventListener('click', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        renderReports();
    });
    document.getElementById('reportType')?.addEventListener('change', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        renderReports();
    });
    document.getElementById('applyReportFilters')?.addEventListener('click', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        renderReports();
    });
    document.getElementById('exportReportBtn')?.addEventListener('click', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('reportType').value;
        const data = getAppData();
        let exportData = [];
        switch (type) {
            case 'stock': exportData = data.items || []; break;
            case 'sales': exportData = data.salesData || []; break;
            case 'attendance': exportData = data.attendance || []; break;
            case 'payroll': exportData = data.payroll || []; break;
            case 'customers': exportData = data.customers || []; break;
        }
        if (!exportData || exportData.length === 0) { showToast('No data to export.', 'error'); return; }
        let csv = Object.keys(exportData[0]).join(',') + '\n';
        exportData.forEach(row => { csv += Object.values(row).map(v => `"${v}"`).join(',') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${type}_${todayStr()}.csv`; a.click();
        URL.revokeObjectURL(url);
        showToast('📥 CSV exported!');
    });
    document.getElementById('printReportBtn')?.addEventListener('click', () => {
        if (!window.canView('reports')) { showToast('⛔ No permission.', 'error'); return; }
        window.print();
    });

    // ── Products ──
    document.getElementById('addCategoryBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const val = document.getElementById('newCategoryInput').value.trim();
        if (!val) { showToast('Enter category name.', 'error'); return; }
        const data = getAppData();
        if (data.categories.includes(val)) { showToast('Already exists.', 'warning'); return; }
        data.categories.push(val);
        setAppData(data);
        await saveAllData();
        renderProducts();
        document.getElementById('newCategoryInput').value = '';
        showToast(`✅ "${val}" added.`);
    });
    document.getElementById('addBrandBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const val = document.getElementById('newBrandInput').value.trim();
        if (!val) { showToast('Enter brand name.', 'error'); return; }
        const data = getAppData();
        if (data.brands.includes(val)) { showToast('Already exists.', 'warning'); return; }
        data.brands.push(val);
        setAppData(data);
        await saveAllData();
        renderProducts();
        document.getElementById('newBrandInput').value = '';
        showToast(`✅ "${val}" added.`);
    });

    // ── Vehicles ──
    document.getElementById('addVehicleBtn')?.addEventListener('click', async () => {
        if (!window.canManage('vehicles')) { showToast('⛔ No permission.', 'error'); return; }
        const editId = document.getElementById('addVehicleBtn').dataset.editId;
        const vehicleNo = document.getElementById('vehicleNo').value.trim();
        const driver = document.getElementById('vehicleDriver').value.trim();
        const fuel = document.getElementById('vehicleFuel').value.trim();
        if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }
        const data = getAppData();
        if (editId) {
            const idx = data.vehicles.findIndex(v => v.id === editId);
            if (idx > -1) data.vehicles[idx] = { ...data.vehicles[idx], vehicleNo, driver, fuel, updatedAt: nowISO() };
            document.getElementById('addVehicleBtn').dataset.editId = '';
            document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        } else {
            data.vehicles.push({ id: generateId(), vehicleNo, driver, fuel, status: 'active', createdAt: nowISO(), updatedAt: nowISO() });
        }
        setAppData(data);
        await saveAllData();
        renderVehicles();
        document.getElementById('vehicleNo').value = '';
        document.getElementById('vehicleDriver').value = '';
        document.getElementById('vehicleFuel').value = '';
        showToast(editId ? '✅ Vehicle updated!' : '✅ Vehicle added!');
    });

    // ── Settings ──
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'admin') {
            showToast('⛔ No permission.', 'error'); return;
        }
        const data = getAppData();
        data.settings = {
            company: document.getElementById('settingsCompany').value.trim(),
            address: document.getElementById('settingsAddress').value.trim(),
            phone: document.getElementById('settingsPhone').value.trim(),
            email: document.getElementById('settingsEmail').value.trim()
        };
        setAppData(data);
        await saveAllData();
        showToast('✅ Settings saved!');
    });
    document.getElementById('backupDataBtn')?.addEventListener('click', () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'admin') {
            showToast('⛔ No permission.', 'error'); return;
        }
        const data = getAppData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `backup_${todayStr()}.json`; a.click();
        URL.revokeObjectURL(url);
        showToast('💾 Backup downloaded!');
    });
    document.getElementById('restoreDataBtn')?.addEventListener('click', () => {
        if (!window.canManage('settings') && window.getCurrentUser()?.role !== 'admin') {
            showToast('⛔ No permission.', 'error'); return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async function(e) {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(ev) {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!confirm('Replace ALL current data?')) return;
                    setAppData(data);
                    await saveAllData();
                    renderAll();
                    showToast('✅ Restored!');
                } catch (_) { showToast('Failed to restore.', 'error'); }
            };
            reader.readAsText(file);
        };
        input.click();
    });
    document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
        if (window.getCurrentUser()?.role !== 'admin') {
            showToast('⛔ Only Admin can clear all data.', 'error'); return;
        }
        if (!confirm('⚠️ Delete ALL data? This cannot be undone!')) return;
        if (!confirm('Are you sure?')) return;
        const emptyData = {
            items: [], categories: ['Cosmetics', 'Electronics', 'Food', 'Beverages', 'Clothing'],
            brands: ['Nike', 'Apple', 'Samsung', 'Adidas', 'Pepsi'],
            employees: [], deliveries: [], attendance: [], leaves: [], payroll: [], customers: [],
            finance: [], vehicles: [], notifications: [], salesData: [],
            settings: { company: 'Jayasinghe Distributors', address: 'Colombo, Sri Lanka', phone: '+94 77 123 4567', email: 'info@jayasinghe.lk' },
            leaveBalances: {}, budget: { monthly: 0, category: {} }, vouchers: []
        };
        setAppData(emptyData);
        await saveAllData();
        renderAll();
        showToast('🗑️ All data cleared.');
    });

    // ── Notifications ──
    document.getElementById('notifBell')?.addEventListener('click', () => {
        const data = getAppData();
        const list = document.getElementById('notifList');
        const notifs = data.notifications || [];
        if (notifs.length === 0) {
            list.innerHTML = '<div class="text-muted text-center" style="padding:20px;">No notifications.</div>';
        } else {
            list.innerHTML = notifs.slice().reverse().map(n =>
                `<div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
                    <div><strong>${escapeHtml(n.title || '')}</strong></div>
                    <div class="text-muted">${escapeHtml(n.message || '')} · ${formatDateTime(n.date)}</div>
                </div>`
            ).join('');
        }
        document.getElementById('notifModal').classList.add('open');
        document.getElementById('notifDot').style.display = 'none';
    });
    document.getElementById('notifModalClose')?.addEventListener('click', () => {
        document.getElementById('notifModal').classList.remove('open');
    });

    // ── Search / Filter events ──
    document.getElementById('empSearch')?.addEventListener('input', renderEmployees);
    document.getElementById('empDeptFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('empStatusFilter')?.addEventListener('change', renderEmployees);
    document.getElementById('invSearch')?.addEventListener('input', renderInventory);
    document.getElementById('invCatFilter')?.addEventListener('change', renderInventory);
    document.getElementById('invSort')?.addEventListener('change', renderInventory);
    document.getElementById('custSearch')?.addEventListener('input', renderCustomers);

    // ── Modal close on overlay click ──
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });
    });

    // ── VOUCHER MODULE ──
    const voucherDate = document.getElementById('voucherDate');
    if (voucherDate) voucherDate.value = todayStr();
    const voucherNoInput = document.getElementById('voucherNo');
    if (voucherNoInput && !voucherNoInput.value) {
        const data = getAppData();
        const vouchers = data.vouchers || [];
        voucherNoInput.value = 'JV-' + String(vouchers.length + 1).padStart(4, '0');
    }
    document.getElementById('addVoucherBtn')?.addEventListener('click', async () => {
        if (!window.canManage('voucher') && !window.canManage('finance')) {
            showToast('⛔ No permission.', 'error'); return;
        }
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
        if (paymentTypes.includes('Other') && otherText) {
            paymentTypes[paymentTypes.indexOf('Other')] = 'Other: ' + otherText;
        }
        if (!paidTo) { showToast('Enter "Paid To" name.', 'error'); return; }
        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
        const data = getAppData();
        if (!data.vouchers) data.vouchers = [];
        const voucherData = {
            id: generateId(),
            voucherNo: voucherNo || 'JV-' + String(data.vouchers.length + 1).padStart(4, '0'),
            date: date || nowISO(),
            paidTo, amount, paymentTypes, description,
            approvedBy: approvedBy || '—',
            receivedBy: receivedBy || '—',
            signature: signature || '—',
            createdAt: nowISO(), updatedAt: nowISO()
        };
        data.vouchers.push(voucherData);
        setAppData(data);
        await saveAllData();
        document.getElementById('voucherPaidTo').value = '';
        document.getElementById('voucherAmount').value = '';
        document.getElementById('voucherDescription').value = '';
        document.getElementById('voucherApprovedBy').value = '';
        document.getElementById('voucherReceivedBy').value = '';
        document.getElementById('voucherSignature').value = '';
        document.getElementById('voucherOtherText').value = '';
        document.querySelectorAll('.voucher-payment-type').forEach(cb => cb.checked = false);
        const nextNo = data.vouchers.length + 1;
        document.getElementById('voucherNo').value = 'JV-' + String(nextNo).padStart(4, '0');
        renderVouchers();
        showToast('✅ Voucher #' + voucherData.voucherNo + ' saved!');
    });

    // ── Print Voucher ──
    document.getElementById('printVoucherBtn')?.addEventListener('click', () => {
        const data = getAppData();
        const vouchers = data.vouchers || [];
        if (vouchers.length === 0) { showToast('No vouchers to print.', 'error'); return; }
        const latest = vouchers[vouchers.length - 1];
        const paymentTypes = latest.paymentTypes ? latest.paymentTypes.join(', ') : '—';
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html><head><title>Voucher #${latest.voucherNo}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
                .voucher-card { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 30px; border-radius: 8px; }
                h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
                .label { font-weight: bold; }
                .amount { font-size: 24px; color: #2563eb; }
                .footer { margin-top: 30px; display: flex; justify-content: space-between; }
                .signature-line { border-top: 1px solid #000; width: 150px; margin-top: 30px; text-align: center; font-size: 12px; }
            </style>
            </head><body>
            <div class="voucher-card">
                <h2>🧾 CASH PAYMENT VOUCHER</h2>
                <p style="text-align:center; font-size:14px; color:#555;">P.M. Jayasinghe Distributors</p>
                <div class="row"><span class="label">Voucher No</span><span>${latest.voucherNo}</span></div>
                <div class="row"><span class="label">Date</span><span>${formatDate(latest.date)}</span></div>
                <div class="row"><span class="label">Paid To</span><span>${latest.paidTo}</span></div>
                <div class="row" style="border-bottom: 2px solid #000;"><span class="label">Amount</span><span class="amount">LKR ${formatCurrency(latest.amount)}</span></div>
                <div class="row"><span class="label">Payment For</span><span>${paymentTypes}</span></div>
                <div class="row"><span class="label">Description</span><span>${latest.description || '—'}</span></div>
                <div style="margin-top: 20px;">
                    <div class="row"><span class="label">Approved By</span><span>${latest.approvedBy}</span></div>
                    <div class="row"><span class="label">Received By</span><span>${latest.receivedBy}</span></div>
                    <div class="row"><span class="label">Signature</span><span>${latest.signature}</span></div>
                </div>
                <div class="footer">
                    <div><div class="signature-line">Approved Signature</div></div>
                    <div><div class="signature-line">Receiver Signature</div></div>
                </div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
            </body></html>
        `);
        printWindow.document.close();
    });

    // ── Download Voucher PDF ──
    document.getElementById('downloadVoucherBtn')?.addEventListener('click', async () => {
        const data = getAppData();
        const vouchers = data.vouchers || [];
        if (vouchers.length === 0) { showToast('No vouchers to download.', 'error'); return; }
        const latest = vouchers[vouchers.length - 1];
        await downloadVoucherPDF(latest);
    });

    async function downloadVoucherPDF(voucher) {
        const paymentTypes = voucher.paymentTypes ? voucher.paymentTypes.join(', ') : '—';
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position:absolute; left:-9999px; top:0; width:600px; background:#fff; padding:30px; font-family:Arial,sans-serif; border:2px solid #000; border-radius:8px;';
        tempDiv.innerHTML = `
            <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">🧾 CASH PAYMENT VOUCHER</h2>
            <p style="text-align:center; font-size:14px; color:#555;">P.M. Jayasinghe Distributors</p>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc;"><strong>Voucher No</strong><span>${voucher.voucherNo}</span></div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc;"><strong>Date</strong><span>${formatDate(voucher.date)}</span></div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc;"><strong>Paid To</strong><span>${voucher.paidTo}</span></div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:2px solid #000; font-size:24px; color:#2563eb;"><strong>Amount</strong><span>LKR ${formatCurrency(voucher.amount)}</span></div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc;"><strong>Payment For</strong><span>${paymentTypes}</span></div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc;"><strong>Description</strong><span>${voucher.description || '—'}</span></div>
            <div style="margin-top:20px;">
                <div style="display:flex; justify-content:space-between; padding:4px 0;"><strong>Approved By</strong><span>${voucher.approvedBy}</span></div>
                <div style="display:flex; justify-content:space-between; padding:4px 0;"><strong>Received By</strong><span>${voucher.receivedBy}</span></div>
                <div style="display:flex; justify-content:space-between; padding:4px 0;"><strong>Signature</strong><span>${voucher.signature}</span></div>
            </div>
            <div style="margin-top:30px; display:flex; justify-content:space-between;">
                <div><div style="border-top:1px solid #000; width:150px; margin-top:30px; text-align:center; font-size:12px;">Approved Signature</div></div>
                <div><div style="border-top:1px solid #000; width:150px; margin-top:30px; text-align:center; font-size:12px;">Receiver Signature</div></div>
            </div>
        `;
        document.body.appendChild(tempDiv);
        try {
            const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: '#ffffff', logging: false });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Voucher_${voucher.voucherNo}.pdf`);
            showToast('✅ PDF Downloaded!');
        } catch (err) {
            console.error('PDF Error:', err);
            showToast('❌ Failed to generate PDF.', 'error');
        } finally {
            document.body.removeChild(tempDiv);
        }
    }

    console.log('✅ Events initialized!');
}

// ============================================================
// CREATE DEFAULT ADMIN ACCOUNT
// ============================================================
async function createDefaultAdmin() {
    const email = 'admin@example.com';
    const password = 'admin123';
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Admin account already exists:', userCredential.user.email);
        return;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                console.log('✅ Default admin account created:', userCredential.user.email);
                showToast('👑 Default admin account created: admin@example.com', 'success');
            } catch (createError) {
                console.warn('⚠️ Could not create admin account:', createError.message);
            }
        } else {
            console.log('ℹ️ Admin login check:', error.message);
        }
    }
}

// ============================================================
// INIT
// ============================================================
async function init() {
    console.log('🚀 Initializing app...');
    try {
        await loadAllData();
        console.log('✅ Data loaded from Firestore');
        await createDefaultAdmin();
        const payrollMonth = document.getElementById('payrollMonth');
        if (payrollMonth) payrollMonth.value = new Date().toISOString().slice(0, 7);
        const leaveFrom = document.getElementById('leaveFrom');
        if (leaveFrom) leaveFrom.value = todayStr();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const leaveTo = document.getElementById('leaveTo');
        if (leaveTo) leaveTo.value = nextWeek.toISOString().slice(0, 10);
        const delDateFilter = document.getElementById('delDateFilter');
        if (delDateFilter) delDateFilter.value = todayStr();
        initEvents();
        renderAll();
        const data = getAppData();
        if (!data.notifications || data.notifications.length === 0) {
            data.notifications = [{ id: generateId(), title: 'Welcome to ERP System',
                message: 'Jayasinghe Distributors · All modules ready.', date: nowISO() }];
            setAppData(data);
            await saveAllData();
        }
        showToast('🔥 Firebase connected! ERP ready.', 'success');
        console.log('✅ App initialized successfully!');
    } catch (error) {
        console.error('❌ Init error:', error);
        showToast('❌ Failed to initialize app. Check console.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', init);
