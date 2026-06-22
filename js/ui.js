// ============================================================
// REPORTS
// ============================================================
function renderReports() {
    if (!window.canView('reports')) {
        showAccessDenied('reports');
        return;
    }

    const type = document.getElementById('reportType').value;
    const container = document.getElementById('reportContent');

    let html = '';
    switch (type) {
        case 'stock': html = generateStockReport(); break;
        case 'sales': html = generateSalesReport(); break;
        case 'attendance': html = generateAttendanceReport(); break;
        case 'payroll': html = generatePayrollReport(); break;
        case 'customers': html = generateCustomerReport(); break;
        default: html = '<div class="text-muted text-center" style="padding:20px;">Select a report type.</div>';
    }
    container.innerHTML = html;
}

function generateStockReport() {
    const data = getAppData();
    const items = data.items || [];
    if (items.length === 0) return '<div class="text-muted text-center" style="padding:20px;">No items.</div>';
    let rows = items.map(i =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.category||'—')}</td><td>${i.qty||0}</td><td>LKR ${formatCurrency(i.price||0)}</td><td>LKR ${formatCurrency((i.qty||0)*(i.price||0))}</td></tr>`
    ).join('');
    return `<table><thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function generateSalesReport() {
    const data = getAppData();
    const sales = data.salesData || [];
    if (sales.length === 0) return '<div class="text-muted text-center" style="padding:20px;">No sales data.</div>';
    let rows = sales.map(s =>
        `<tr><td>${formatDate(s.date)}</td><td>${escapeHtml(s.customer||'—')}</td><td>${escapeHtml(s.item||'—')}</td><td>${s.qty||0}</td><td>LKR ${formatCurrency(s.total||0)}</td></tr>`
    ).join('');
    const total = sales.reduce((s, item) => s + (item.total || 0), 0);
    return `<table><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4" class="text-right"><strong>Grand Total</strong></td><td><strong>LKR ${formatCurrency(total)}</strong></td></tr></tfoot></table>`;
}

function generateAttendanceReport() {
    const data = getAppData();
    const att = data.attendance || [];
    if (att.length === 0) return '<div class="text-muted text-center" style="padding:20px;">No attendance records.</div>';
    let rows = att.map(a =>
        `<tr><td>${formatDate(a.date)}</td><td>${escapeHtml(a.employeeName||'—')}</td><td>${a.checkIn ? formatDateTime(a.checkIn) : '—'}</td><td>${a.checkOut ? formatDateTime(a.checkOut) : '—'}</td></tr>`
    ).join('');
    return `<table><thead><tr><th>Date</th><th>Employee</th><th>Check In</th><th>Check Out</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function generatePayrollReport() {
    const data = getAppData();
    const pay = data.payroll || [];
    if (pay.length === 0) return '<div class="text-muted text-center" style="padding:20px;">No payroll records.</div>';
    let rows = pay.map(p => {
        const net = (p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0);
        return `<tr><td>${escapeHtml(p.employeeName||'—')}</td><td>${p.month||'—'}</td><td>LKR ${formatCurrency(p.basic||0)}</td><td>LKR ${formatCurrency(p.allowances||0)}</td><td>LKR ${formatCurrency(p.deductions||0)}</td><td>LKR ${formatCurrency(net)}</td></tr>`;
    }).join('');
    return `<table><thead><tr><th>Employee</th><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function generateCustomerReport() {
    const data = getAppData();
    const cust = data.customers || [];
    if (cust.length === 0) return '<div class="text-muted text-center" style="padding:20px;">No customers.</div>';
    let rows = cust.map(c =>
        `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.contact||'—')}</td><td>${escapeHtml(c.category||'Retail')}</td><td>LKR ${formatCurrency(c.creditLimit||0)}</td><td>LKR ${formatCurrency(c.balance||0)}</td></tr>`
    ).join('');
    return `<table><thead><tr><th>Name</th><th>Contact</th><th>Category</th><th>Credit Limit</th><th>Balance</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ============================================================
// VEHICLES
// ============================================================
function renderVehicles() {
    if (!window.canView('vehicles')) {
        showAccessDenied('vehicles');
        return;
    }

    const data = getAppData();
    const vehicles = data.vehicles || [];

    const tbody = document.getElementById('vehicleTableBody');
    if (vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:20px;">No vehicles.</td></tr>`;
        return;
    }
    const canEdit = window.canManage('vehicles');
    tbody.innerHTML = vehicles.map(v =>
        `<tr>
                    <td><strong>${escapeHtml(v.vehicleNo || '—')}</strong></td>
                    <td>${escapeHtml(v.driver || '—')}</td>
                    <td>${escapeHtml(v.fuel || '—')}</td>
                    <td><span class="badge badge-success">Active</span></td>
                    <td class="text-center">
                        ${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editVehicle('${v.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${v.id}')"><i class="fas fa-trash"></i></button>` : '—'}
                    </td>
                </tr>`
    ).join('');
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
    if (!window.canView('settings')) {
        showAccessDenied('settings');
        return;
    }

    const data = getAppData();
    const settings = data.settings || {};
    document.getElementById('settingsCompany').value = settings.company || '';
    document.getElementById('settingsAddress').value = settings.address || '';
    document.getElementById('settingsPhone').value = settings.phone || '';
    document.getElementById('settingsEmail').value = settings.email || '';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function formatCurrency(val) {
    return Number(val).toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-LK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function nowISO() {
    return new Date().toISOString();
}

// ============================================================
// GLOBAL EXPOSURES
// ============================================================
window.switchPanel = switchPanel;
window.showAccessDenied = showAccessDenied;
window.renderDashboard = renderDashboard;
window.renderEmployees = renderEmployees;
window.renderInventory = renderInventory;
window.renderProducts = renderProducts;
window.renderDeliveries = renderDeliveries;
window.renderAttendance = renderAttendance;
window.renderLeave = renderLeave;
window.renderPayroll = renderPayroll;
window.renderCustomers = renderCustomers;
window.renderFinance = renderFinance;
window.renderReports = renderReports;
window.renderVehicles = renderVehicles;
window.renderSettings = renderSettings;
window.renderSidebar = renderSidebar;

window.editEmployee = function(id) {
    const data = getAppData();
    const emp = data.employees.find(e => e.id === id);
    if (!emp) return;
    document.getElementById('empEditId').value = emp.id;
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empNIC').value = emp.nic || '';
    document.getElementById('empDept').value = emp.department || 'Admin';
    document.getElementById('empDesignation').value = emp.designation || '';
    document.getElementById('empContact').value = emp.contact || '';
    document.getElementById('empEmergency').value = emp.emergency || '';
    document.getElementById('empAddress').value = emp.address || '';
    document.getElementById('empJoined').value = emp.joinedDate || '';
    document.getElementById('empSalary').value = emp.salary || '';
    document.getElementById('empEpf').value = emp.epf || '';
    document.getElementById('empStatus').value = emp.status || 'active';
    document.getElementById('employeeModalTitle').textContent = '✏️ Edit Employee';
    document.getElementById('employeeModal').classList.add('open');
};

window.deleteEmployee = async function(id) {
    if (!confirm('Delete this employee?')) return;
    const data = getAppData();
    data.employees = data.employees.filter(e => e.id !== id);
    setAppData(data);
    await saveAllData();
    renderEmployees();
    showToast('🗑️ Employee removed.');
};

window.editItem = function(id) {
    const data = getAppData();
    const item = data.items.find(i => i.id === id);
    if (!item) return;
    document.getElementById('itemEditId').value = item.id;
    document.getElementById('itemBarcode').value = item.barcode || '';
    document.getElementById('itemName').value = item.name || '';
    document.getElementById('itemQty').value = item.qty || 0;
    document.getElementById('itemPrice').value = item.price || 0;
    document.getElementById('itemCategory').value = item.category || '';
    document.getElementById('itemBrand').value = item.brand || '';
    document.getElementById('itemDesc').value = item.desc || '';
    document.getElementById('itemExpiry').value = item.expiry || '';
    document.getElementById('itemBatch').value = item.batch || '';
    document.getElementById('itemStatus').value = item.status || 'active';
    document.getElementById('itemModalTitle').textContent = '✏️ Edit Item';
    document.getElementById('itemModal').classList.add('open');
    populateItemDropdowns();
};

window.deleteItem = async function(id) {
    if (!confirm('Delete this item?')) return;
    const data = getAppData();
    data.items = data.items.filter(i => i.id !== id);
    setAppData(data);
    await saveAllData();
    renderInventory();
    showToast('🗑️ Item removed.');
};

window.editCustomer = function(id) {
    const data = getAppData();
    const c = data.customers.find(c => c.id === id);
    if (!c) return;
    document.getElementById('custEditId').value = c.id;
    document.getElementById('custName').value = c.name || '';
    document.getElementById('custContact').value = c.contact || '';
    document.getElementById('custCategory').value = c.category || 'Retail';
    document.getElementById('custAddress').value = c.address || '';
    document.getElementById('custCreditLimit').value = c.creditLimit || 0;
    document.getElementById('custBalance').value = c.balance || 0;
    document.getElementById('customerModalTitle').textContent = '✏️ Edit Customer';
    document.getElementById('customerModal').classList.add('open');
};

window.deleteCustomer = async function(id) {
    if (!confirm('Delete this customer?')) return;
    const data = getAppData();
    data.customers = data.customers.filter(c => c.id !== id);
    setAppData(data);
    await saveAllData();
    renderCustomers();
    showToast('🗑️ Customer removed.');
};

window.editVehicle = function(id) {
    const data = getAppData();
    const v = data.vehicles.find(v => v.id === id);
    if (!v) return;
    document.getElementById('vehicleNo').value = v.vehicleNo || '';
    document.getElementById('vehicleDriver').value = v.driver || '';
    document.getElementById('vehicleFuel').value = v.fuel || '';
    document.getElementById('addVehicleBtn').dataset.editId = v.id;
    document.getElementById('addVehicleBtn').textContent = '💾 Update Vehicle';
    showToast('✏️ Editing vehicle. Update and save.');
};

window.deleteVehicle = async function(id) {
    if (!confirm('Delete this vehicle?')) return;
    const data = getAppData();
    data.vehicles = data.vehicles.filter(v => v.id !== id);
    setAppData(data);
    await saveAllData();
    renderVehicles();
    showToast('🗑️ Vehicle removed.');
};

window.removeCategory = async function(cat) {
    if (!confirm(`Remove category "${cat}"?`)) return;
    const data = getAppData();
    data.categories = data.categories.filter(c => c !== cat);
    data.items.forEach(i => { if (i.category === cat) i.category = ''; });
    setAppData(data);
    await saveAllData();
    renderProducts();
    renderInventory();
    showToast(`🗑️ Removed "${cat}"`);
};

window.removeBrand = async function(brand) {
    if (!confirm(`Remove brand "${brand}"?`)) return;
    const data = getAppData();
    data.brands = data.brands.filter(b => b !== brand);
    data.items.forEach(i => { if (i.brand === brand) i.brand = ''; });
    setAppData(data);
    await saveAllData();
    renderProducts();
    showToast(`🗑️ Removed "${brand}"`);
};
