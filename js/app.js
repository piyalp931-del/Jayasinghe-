// ============================================================
// MAIN APP MODULE
// ============================================================

function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast ' + type;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

function renderAll() {
    renderDashboard();
    renderEmployees();
    renderInventory();
    renderProducts();
    renderDeliveries();
    renderAttendance();
    renderLeave();
    renderPayroll();
    renderCustomers();
    renderFinance();
    renderReports();
    renderVehicles();
    renderSettings();
    renderSidebar();
}

function populateItemDropdowns() {
    const data = getAppData();
    const catSelect = document.getElementById('itemCategory');
    const brandSelect = document.getElementById('itemBrand');
    const currentCat = catSelect.value;
    const currentBrand = brandSelect.value;

    catSelect.innerHTML = '<option value="">Select...</option>' + (data.categories || []).map(c =>
        `<option value="${c}">${c}</option>`).join('');
    if (currentCat && [...catSelect.options].some(o => o.value === currentCat)) catSelect.value = currentCat;

    brandSelect.innerHTML = '<option value="">Select...</option>' + (data.brands || []).map(b =>
        `<option value="${b}">${b}</option>`).join('');
    if (currentBrand && [...brandSelect.options].some(o => o.value === currentBrand)) brandSelect.value = currentBrand;
}

// ============================================================
// EVENT BINDINGS
// ============================================================
function initEvents() {
    // ── Sidebar toggle ──
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('sidebarClose').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    // ── Dark Mode ──
    let isDark = false;
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        isDark = !isDark;
        document.body.classList.toggle('dark', isDark);
        document.getElementById('darkModeToggle').innerHTML = isDark ? '<i class="fas fa-sun"></i>' :
            '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    });
    if (localStorage.getItem('darkMode') === 'true') {
        isDark = true;
        document.body.classList.add('dark');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }

    // ── Language Toggle ──
    document.getElementById('langToggle').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'si' : 'en';
        document.getElementById('langToggle').textContent = currentLang === 'en' ? '🇱🇰 SI' : '🇬🇧 EN';
        renderSidebar();
        const activePanel = document.querySelector('.panel.active');
        if (activePanel) {
            const id = activePanel.id.replace('panel-', '');
            const navItem = navItems.find(n => n.id === id);
            if (navItem) {
                const label = currentLang === 'si' && navItem.labelSI ? navItem.labelSI : navItem.label;
                document.getElementById('pageTitle').textContent = label;
            }
        }
        showToast(currentLang === 'en' ? '🌐 English' : '🌐 සිංහල');
    });

    // ── Employee Modal ──
    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
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
        document.getElementById('empStatus').value = 'active';
        document.getElementById('employeeModal').classList.add('open');
    });

    document.getElementById('empModalClose').addEventListener('click', () => {
        document.getElementById('employeeModal').classList.remove('open');
    });

    document.getElementById('empSaveBtn').addEventListener('click', async () => {
        const id = document.getElementById('empEditId').value;
        const name = document.getElementById('empName').value.trim();
        if (!name) { showToast('Enter employee name.', 'error'); return; }
        const data = getAppData();
        const empData = {
            name,
            nic: document.getElementById('empNIC').value.trim(),
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
        if (id) {
            const idx = data.employees.findIndex(e => e.id === id);
            if (idx > -1) { data.employees[idx] = { ...data.employees[idx], ...empData }; }
        } else {
            empData.id = generateId();
            empData.createdAt = nowISO();
            data.employees.push(empData);
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('employeeModal').classList.remove('open');
        renderEmployees();
        showToast(id ? '✅ Employee updated!' : '✅ Employee added!');
    });

    // ── Item Modal ──
    document.getElementById('addItemBtn').addEventListener('click', () => {
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
        document.getElementById('itemModal').classList.add('open');
    });

    document.getElementById('itemModalClose').addEventListener('click', () => {
        document.getElementById('itemModal').classList.remove('open');
    });

    document.getElementById('itemSaveBtn').addEventListener('click', async () => {
        const id = document.getElementById('itemEditId').value;
        const name = document.getElementById('itemName').value.trim();
        if (!name) { showToast('Enter item name.', 'error'); return; }
        const data = getAppData();
        const itemData = {
            barcode: document.getElementById('itemBarcode').value.trim(),
            name,
            qty: parseInt(document.getElementById('itemQty').value) || 0,
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
            if (idx > -1) { data.items[idx] = { ...data.items[idx], ...itemData }; }
        } else {
            itemData.id = generateId();
            itemData.createdAt = nowISO();
            data.items.push(itemData);
        }
        setAppData(data);
        await saveAllData();
        document.getElementById('itemModal').classList.remove('open');
        renderInventory();
        renderDashboard();
        showToast(id ? '✅ Item updated!' : '✅ Item added!');
    });

    // ── Customer Modal ──
    document.getElementById('addCustomerBtn').addEventListener('click', () => {
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

    document.getElementById('custModalClose').addEventListener('click', () => {
        document.getElementById('customerModal').classList.remove('open');
    });

    document.getElementById('custSaveBtn').addEventListener('click', async () => {
        const id = document.getElementById('custEditId').value;
        const name = document.getElementById('custName').value.trim();
        if (!name) { showToast('Enter customer name.', 'error'); return; }
        const data = getAppData();
        const custData = {
            name,
            contact: document.getElementById('custContact').value.trim(),
            category: document.getElementById('custCategory').value,
            address: document.getElementById('custAddress').value.trim(),
            creditLimit: parseFloat(document.getElementById('custCreditLimit').value) || 0,
            balance: parseFloat(document.getElementById('custBalance').value) || 0,
            updatedAt: nowISO()
        };
        if (id) {
            const idx = data.customers.findIndex(c => c.id === id);
            if (idx > -1) { data.customers[idx] = { ...data.customers[idx], ...custData }; }
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
    document.getElementById('quickAddItem').addEventListener('click', () => {
        document.getElementById('addItemBtn').click();
    });
    document.getElementById('quickNewDelivery').addEventListener('click', () => {
        switchPanel('deliveries');
    });
    document.getElementById('quickAddEmployee').addEventListener('click', () => {
        document.getElementById('addEmployeeBtn').click();
    });
    document.getElementById('quickPrint').addEventListener('click', () => {
        window.print();
    });

    // ── Deliveries ──
    document.getElementById('deliverSubmitBtn').addEventListener('click', async () => {
        const customer = document.getElementById('delCustomer').value.trim();
        const itemId = document.getElementById('delItemSelect').value;
        const qty = parseInt(document.getElementById('delQty').value);
        const driver = document.getElementById('delDriver').value.trim();
        const route = document.getElementById('delRoute').value.trim();

        if (!customer) { showToast('Enter customer name.', 'error'); return; }
        if (!itemId) { showToast('Select an item.', 'error'); return; }
        if (!qty || qty < 1) { showToast('Enter valid qty.', 'error'); return; }

        const data = getAppData();
        const item = data.items.find(i => i.id === itemId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) { showToast(`Insufficient stock! Available: ${item.qty}`, 'error'); return; }

        item.qty = (item.qty || 0) - qty;
        item.updatedAt = nowISO();

        const delivery = {
            id: generateId(),
            customer,
            itemId: item.id,
            itemName: item.name,
            qty,
            driver,
            route,
            status: 'delivered',
            date: nowISO()
        };
        data.deliveries.push(delivery);

        data.salesData.push({
            id: generateId(),
            customer,
            item: item.name,
            qty,
            total: qty * (item.price || 0),
            date: nowISO()
        });

        setAppData(data);
        await saveAllData();
        renderDeliveries();
        renderDashboard();
        document.getElementById('delCustomer').value = '';
        document.getElementById('delQty').value = '';
        document.getElementById('delDriver').value = '';
        document.getElementById('delRoute').value = '';
        showToast(`✅ ${qty} ${item.name} delivered to ${customer}!`);
    });

    document.getElementById('clearDelFilter').addEventListener('click', () => {
        document.getElementById('delDateFilter').value = '';
        renderDeliveries();
    });

    // ── Attendance ──
    document.getElementById('checkInBtn').addEventListener('click', async () => {
        if (!currentUser) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === currentUser.uid && a.date.slice(0, 10) === today);
        if (existing && existing.checkIn) { showToast('Already checked in today.', 'warning'); return; }
        const record = {
            id: generateId(),
            employeeId: currentUser.uid,
            employeeName: currentUser.name,
            date: nowISO(),
            checkIn: nowISO(),
            checkOut: null,
            location: document.getElementById('attendanceLocation').value || 'Colombo'
        };
        if (existing) {
            existing.checkIn = record.checkIn;
            existing.location = record.location;
        } else {
            data.attendance.push(record);
        }
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked in at ' + new Date().toLocaleTimeString());
    });

    document.getElementById('checkOutBtn').addEventListener('click', async () => {
        if (!currentUser) { showToast('Login first.', 'error'); return; }
        const data = getAppData();
        const today = todayStr();
        const existing = data.attendance.find(a => a.employeeId === currentUser.uid && a.date.slice(0, 10) === today);
        if (!existing) { showToast('No check-in found today.', 'error'); return; }
        if (existing.checkOut) { showToast('Already checked out.', 'warning'); return; }
        existing.checkOut = nowISO();
        setAppData(data);
        await saveAllData();
        renderAttendance();
        showToast('✅ Checked out at ' + new Date().toLocaleTimeString());
    });

    document.getElementById('attendanceRefreshBtn').addEventListener('click', () => {
        renderAttendance();
        showToast('🔄 Refreshed.');
    });

    // GPS Location
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            document.getElementById('attendanceLocation').value =
                `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        }, () => {
            document.getElementById('attendanceLocation').value = '📍 Location unavailable';
        });
    }

    // ── Leave ──
    document.getElementById('applyLeaveBtn').addEventListener('click', async () => {
        const empId = document.getElementById('leaveEmployeeSelect').value;
        const type = document.getElementById('leaveType').value;
        const from = document.getElementById('leaveFrom').value;
        const to = document.getElementById('leaveTo').value;
        const reason = document.getElementById('leaveReason').value.trim();

        if (!empId) { showToast('Select employee.', 'error'); return; }
        if (!from || !to) { showToast('Select dates.', 'error'); return; }
        const data = getAppData();
        const emp = data.employees.find(e => e.id === empId);
        data.leaves.push({
            id: generateId(),
            employeeId: empId,
            employeeName: emp ? emp.name : 'Unknown',
            type,
            from,
            to,
            reason,
            status: 'pending',
            appliedAt: nowISO()
        });
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave applied!');
        document.getElementById('leaveReason').value = '';
    });

    document.getElementById('approveLeaveBtn').addEventListener('click', async () => {
        const data = getAppData();
        const leaves = data.leaves.filter(l => l.status === 'pending');
        if (leaves.length === 0) { showToast('No pending leaves.', 'warning'); return; }
        leaves[leaves.length - 1].status = 'approved';
        setAppData(data);
        await saveAllData();
        renderLeave();
        showToast('✅ Leave approved.');
    });

    document.getElementById('rejectLeaveBtn').addEventListener('click', async () => {
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
    document.getElementById('calculatePayrollBtn').addEventListener('click', async () => {
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

        const existing = data.payroll.find(p => p.employeeId === empId && p.month === month);
        const payData = {
            employeeId: empId,
            employeeName: emp.name,
            month,
            basic: basic || (emp.salary || 0),
            allowances,
            deductions,
            ot,
            updatedAt: nowISO()
        };
        if (existing) {
            Object.assign(existing, payData);
        } else {
            payData.id = generateId();
            payData.createdAt = nowISO();
            data.payroll.push(payData);
        }
        setAppData(data);
        await saveAllData();
        renderPayroll();
        showToast('✅ Payroll calculated!');
    });

    document.getElementById('generatePayslipBtn').addEventListener('click', () => {
        showToast('📄 Payslip PDF generated (simulated).', 'success');
    });

    // ── Finance ──
    document.getElementById('addFinanceBtn').addEventListener('click', async () => {
        const type = document.getElementById('financeType').value;
        const amount = parseFloat(document.getElementById('financeAmount').value);
        const desc = document.getElementById('financeDesc').value.trim();

        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
        if (!desc) { showToast('Enter description.', 'error'); return; }

        const data = getAppData();
        data.finance.push({
            id: generateId(),
            type,
            amount,
            desc,
            date: nowISO()
        });
        setAppData(data);
        await saveAllData();
        renderFinance();
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        showToast(`✅ ${type} recorded.`);
    });

    // ── Reports ──
    document.getElementById('generateReportBtn').addEventListener('click', renderReports);
    document.getElementById('reportType').addEventListener('change', renderReports);

    document.getElementById('exportReportBtn').addEventListener('click', () => {
        const type = document.getElementById('reportType').value;
        const data = getAppData();
        let exportData = [];
        switch (type) {
            case 'stock':
                exportData = data.items || [];
                break;
            case 'sales':
                exportData = data.salesData || [];
                break;
            case 'attendance':
                exportData = data.attendance || [];
                break;
            case 'payroll':
                exportData = data.payroll || [];
                break;
            case 'customers':
                exportData = data.customers || [];
                break;
        }
        if (!exportData || exportData.length === 0) { showToast('No data to export.', 'error'); return; }
        let csv = Object.keys(exportData[0]).join(',') + '\n';
        exportData.forEach(row => {
            csv += Object.values(row).map(v => `"${v}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${todayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 CSV exported!');
    });

    document.getElementById('printReportBtn').addEventListener('click', () => {
        window.print();
    });

    // ── Products (Categories & Brands) ──
    document.getElementById('addCategoryBtn').addEventListener('click', async () => {
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

    document.getElementById('addBrandBtn').addEventListener('click', async () => {
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
    document.getElementById('addVehicleBtn').addEventListener('click', async () => {
        const editId = document.getElementById('addVehicleBtn').dataset.editId;
        const vehicleNo = document.getElementById('vehicleNo').value.trim();
        const driver = document.getElementById('vehicleDriver').value.trim();
        const fuel = document.getElementById('vehicleFuel').value.trim();

        if (!vehicleNo) { showToast('Enter vehicle number.', 'error'); return; }

        const data = getAppData();
        if (editId) {
            const idx = data.vehicles.findIndex(v => v.id === editId);
            if (idx > -1) {
                data.vehicles[idx] = { ...data.vehicles[idx], vehicleNo, driver, fuel, updatedAt: nowISO() };
            }
            document.getElementById('addVehicleBtn').dataset.editId = '';
            document.getElementById('addVehicleBtn').textContent = '🚗 Add Vehicle';
        } else {
            data.vehicles.push({ id: generateId(), vehicleNo, driver, fuel, status: 'active', createdAt: nowISO(),
                updatedAt: nowISO() });
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
    document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
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

    document.getElementById('backupDataBtn').addEventListener('click', () => {
        const data = getAppData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${todayStr()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('💾 Backup downloaded!');
    });

    document.getElementById('restoreDataBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.
