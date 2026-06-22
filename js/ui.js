// ============================================================
// UI RENDERING MODULE (FIXED - NO ROLES REDECLARATION)
// ============================================================

// Define all nav items with permissions
const ALL_NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', labelSI: 'උපකරණ පුවරුව', perm: 'view_dashboard' },
    { id: 'employees', icon: '👤', label: 'Employees', labelSI: 'සේවකයින්', perm: 'view_employees' },
    { id: 'inventory', icon: '📋', label: 'Inventory', labelSI: 'ඉන්වෙන්ටරි', perm: 'view_inventory' },
    { id: 'products', icon: '🏷️', label: 'Products', labelSI: 'නිෂ්පාදන', perm: 'view_inventory' },
    { id: 'deliveries', icon: '🚚', label: 'Deliveries', labelSI: 'බෙදාහැරීම්', perm: 'view_deliveries' },
    { id: 'attendance', icon: '⏱️', label: 'Attendance', labelSI: 'පැමිණීම', perm: 'view_attendance' },
    { id: 'leave', icon: '🏖️', label: 'Leave', labelSI: 'නිවාඩු', perm: 'view_leave' },
    { id: 'payroll', icon: '💰', label: 'Payroll', labelSI: 'වැටුප්', perm: 'view_payroll' },
    { id: 'customers', icon: '👥', label: 'Customers', labelSI: 'පාරිභෝගිකයින්', perm: 'view_customers' },
    { id: 'finance', icon: '💳', label: 'Finance', labelSI: 'මුල්‍ය', perm: 'view_finance' },
    { id: 'reports', icon: '📈', label: 'Reports', labelSI: 'වාර්තා', perm: 'view_reports' },
    { id: 'vehicles', icon: '🚗', label: 'Vehicles', labelSI: 'වාහන', perm: 'view_vehicles' },
    { id: 'settings', icon: '⚙️', label: 'Settings', labelSI: 'සැකසුම්', perm: 'view_settings' }
];

let currentLang = 'en';

// ============================================================
// SIDEBAR
// ============================================================
function renderSidebar() {
    const container = document.getElementById('sidebarNav');
    const user = window.getCurrentUser();
    const role = user?.role || 'admin';
    const roleConfig = window.ROLES?.[role] || window.ROLES?.admin || { nav: ['dashboard'] };

    let html = '';
    const allowedNavIds = roleConfig?.nav || ['dashboard'];

    ALL_NAV_ITEMS.forEach(item => {
        if (!allowedNavIds.includes(item.id)) return;
        const label = currentLang === 'si' && item.labelSI ? item.labelSI : item.label;
        html += `<button class="nav-item" data-panel="${item.id}">
                    <span class="icon">${item.icon}</span>${label}
                </button>`;
    });

    container.innerHTML = html;

    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        const id = activePanel.id.replace('panel-', '');
        container.querySelectorAll('.nav-item').forEach(b => {
            b.classList.toggle('active', b.dataset.panel === id);
        });
    }

    container.querySelectorAll('.nav-item').forEach(b => {
        b.addEventListener('click', () => {
            switchPanel(b.dataset.panel);
        });
    });
}

// ============================================================
// SWITCH PANEL
// ============================================================
function switchPanel(id) {
    const user = window.getCurrentUser();
    if (!user) {
        showToast('⛔ Please login first.', 'error');
        return;
    }

    const navItem = ALL_NAV_ITEMS.find(n => n.id === id);
    if (navItem && !window.canView(navItem.perm.replace('view_', ''))) {
        showAccessDenied(id);
        return;
    }

    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.panel === id);
    });

    const navItemFound = ALL_NAV_ITEMS.find(n => n.id === id);
    if (navItemFound) {
        const label = currentLang === 'si' && navItemFound.labelSI ? navItemFound.labelSI : navItemFound.label;
        document.getElementById('pageTitle').textContent = label;
    }

    // Refresh panel content
    switch (id) {
        case 'dashboard': renderDashboard(); break;
        case 'employees': if (window.canView('employees')) renderEmployees(); else showAccessDenied('employees'); break;
        case 'inventory': if (window.canView('inventory')) renderInventory(); else showAccessDenied('inventory'); break;
        case 'products': if (window.canView('inventory')) renderProducts(); else showAccessDenied('products'); break;
        case 'deliveries': if (window.canView('deliveries')) renderDeliveries(); else showAccessDenied('deliveries'); break;
        case 'attendance': if (window.canView('attendance')) renderAttendance(); else showAccessDenied('attendance'); break;
        case 'leave': if (window.canView('leave')) renderLeave(); else showAccessDenied('leave'); break;
        case 'payroll': if (window.canView('payroll')) renderPayroll(); else showAccessDenied('payroll'); break;
        case 'customers': if (window.canView('customers')) renderCustomers(); else showAccessDenied('customers'); break;
        case 'finance': if (window.canView('finance')) renderFinance(); else showAccessDenied('finance'); break;
        case 'reports': if (window.canView('reports')) renderReports(); else showAccessDenied('reports'); break;
        case 'vehicles': if (window.canView('vehicles')) renderVehicles(); else showAccessDenied('vehicles'); break;
        case 'settings': if (window.canView('settings')) renderSettings(); else showAccessDenied('settings'); break;
    }

    document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// ACCESS DENIED
// ============================================================
function showAccessDenied(module) {
    const panel = document.getElementById('panel-' + module);
    if (panel) {
        panel.innerHTML = `
            <div class="card" style="text-align:center; padding:40px;">
                <div style="font-size:60px; margin-bottom:16px;">⛔</div>
                <h3>Access Denied</h3>
                <p class="text-muted">You don't have permission to view this module.</p>
                <button class="btn btn-primary mt-2" onclick="switchPanel('dashboard')">Go to Dashboard</button>
            </div>
        `;
        panel.classList.add('active');
    }
}

// ============================================================
// DASHBOARD
// ============================================================
let salesChartInstance = null;

function renderDashboard() {
    const data = getAppData();
    const user = window.getCurrentUser();
    const role = user?.role || 'admin';
    const roleConfig = window.ROLES?.[role] || window.ROLES?.admin || {};
    const dashboardWidgets = roleConfig?.dashboard || ['stats_all'];

    const items = data.items || [];
    const employees = data.employees || [];
    const deliveries = data.deliveries || [];
    const salesData = data.salesData || [];
    const customers = data.customers || [];
    const finance = data.finance || [];
    const payroll = data.payroll || [];
    const attendance = data.attendance || [];

    // Stats calculations
    const totalItems = items.length;
    const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
    const lowItems = items.filter(i => (i.qty || 0) <= 5 && i.status !== 'inactive');
    const totalValue = items.reduce((s, i) => s + ((i.qty || 0) * (i.price || 0)), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayDeliveries = deliveries.filter(d => d.date && d.date.slice(0, 10) === today);
    const todaySales = salesData.filter(s => s.date && s.date.slice(0, 10) === today);
    const salesTotal = todaySales.reduce((s, d) => s + (d.total || 0), 0);
    const pendingDeliveries = deliveries.filter(d => d.status !== 'delivered');
    const totalIncome = finance.filter(f => f.type === 'income').reduce((s, f) => s + (f.amount || 0), 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    const balance = totalIncome - totalExpense;
    const totalPayroll = payroll.reduce((s, p) => s + ((p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0)), 0);

    let statsHTML = '';
    function addStat(cls, num, label) {
        statsHTML += `<div class="stat-box ${cls}"><div class="num">${num}</div><div class="label">${label}</div></div>`;
    }

    if (dashboardWidgets.includes('stats_all') || role === 'admin') {
        addStat('blue', totalItems, 'Total Items');
        addStat('green', totalQty, 'Total Stock');
        addStat('red', lowItems.length, 'Low Stock');
        addStat('purple', employees.length, 'Employees');
        addStat('teal', todayDeliveries.length, 'Today Deliveries');
        addStat('orange', 'LKR ' + formatCurrency(totalValue), 'Inventory Value');
        addStat('blue', 'LKR ' + formatCurrency(salesTotal), 'Today Sales');
        addStat('red', pendingDeliveries.length, 'Pending Deliveries');
    } else {
        if (dashboardWidgets.includes('stats_employees')) {
            addStat('purple', employees.length, 'Employees');
            addStat('blue', employees.filter(e => e.status === 'active').length, 'Active Employees');
        }
        if (dashboardWidgets.includes('stats_inventory')) {
            addStat('blue', totalItems, 'Total Items');
            addStat('orange', 'LKR ' + formatCurrency(totalValue), 'Inventory Value');
        }
        if (dashboardWidgets.includes('stats_low_stock')) {
            addStat('red', lowItems.length, 'Low Stock Items');
        }
        if (dashboardWidgets.includes('stats_deliveries')) {
            addStat('teal', todayDeliveries.length, 'Today Deliveries');
            addStat('red', pendingDeliveries.length, 'Pending');
        }
        if (dashboardWidgets.includes('stats_customers')) {
            addStat('blue', customers.length, 'Total Customers');
        }
        if (dashboardWidgets.includes('stats_finance')) {
            addStat('green', 'LKR ' + formatCurrency(totalIncome), 'Income');
            addStat('red', 'LKR ' + formatCurrency(totalExpense), 'Expense');
            addStat('orange', 'LKR ' + formatCurrency(balance), 'Balance');
        }
        if (dashboardWidgets.includes('stats_payroll')) {
            addStat('purple', 'LKR ' + formatCurrency(totalPayroll), 'Total Payroll');
        }
        if (dashboardWidgets.includes('stats_attendance')) {
            const todayAtt = attendance.filter(a => a.date && a.date.slice(0, 10) === today);
            addStat('green', todayAtt.length, 'Today Present');
            addStat('red', employees.length - todayAtt.length, 'Today Absent');
        }
        if (dashboardWidgets.includes('stats_leave')) {
            const pendingLeave = data.leaves?.filter(l => l.status === 'pending').length || 0;
            addStat('orange', pendingLeave, 'Pending Leave');
        }
    }

    document.getElementById('dashStats').innerHTML = statsHTML;

    // Low Stock List
    const lowStockContainer = document.getElementById('dashLowStockList');
    if (dashboardWidgets.includes('low_stock') || dashboardWidgets.includes('stats_all') || role === 'admin' || dashboardWidgets.includes('stats_low_stock')) {
        if (lowItems.length === 0) {
            lowStockContainer.innerHTML = `<div class="empty-state"><span class="icon">✅</span><p>All items well-stocked.</p></div>`;
        } else {
            lowStockContainer.innerHTML = lowItems.map(i =>
                `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px;">
                            <span>⚠️ ${escapeHtml(i.name)}</span>
                            <span style="color:var(--danger); font-weight:600;">${i.qty} left</span>
                        </div>`
            ).join('');
        }
    } else {
        lowStockContainer.innerHTML = '';
    }

    // Sales Chart
    const chartContainer = document.getElementById('salesChart').parentElement;
    if (dashboardWidgets.includes('sales_chart') || dashboardWidgets.includes('stats_all') || role === 'admin' || dashboardWidgets.includes('finance_chart') || dashboardWidgets.includes('inventory_chart')) {
        chartContainer.style.display = 'block';
        renderSalesChart(salesData);
    } else {
        chartContainer.style.display = 'none';
        if (salesChartInstance) { salesChartInstance.destroy(); salesChartInstance = null; }
    }

    // Quick Actions
    const quickActionsContainer = document.querySelector('.quick-actions');
    if (quickActionsContainer) {
        let actionsHTML = '';
        const qaWidgets = dashboardWidgets.filter(w => w.startsWith('quick_actions_'));

        if (qaWidgets.includes('quick_actions_all') || role === 'admin') {
            actionsHTML = `
                <button class="btn btn-primary" id="quickAddItem"><i class="fas fa-plus"></i> Add Item</button>
                <button class="btn btn-success" id="quickNewDelivery"><i class="fas fa-truck"></i> New Delivery</button>
                <button class="btn btn-warning" id="quickAddEmployee"><i class="fas fa-user-plus"></i> Add Employee</button>
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        } else if (qaWidgets.includes('quick_actions_ops') || qaWidgets.includes('quick_actions_employee')) {
            actionsHTML = `
                <button class="btn btn-primary" id="quickAddEmployee"><i class="fas fa-user-plus"></i> Add Employee</button>
                <button class="btn btn-success" id="quickNewDelivery"><i class="fas fa-truck"></i> New Delivery</button>
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        } else if (qaWidgets.includes('quick_actions_sales')) {
            actionsHTML = `
                <button class="btn btn-primary" id="quickAddItem"><i class="fas fa-plus"></i> Add Item</button>
                <button class="btn btn-success" id="quickNewDelivery"><i class="fas fa-truck"></i> New Delivery</button>
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        } else if (qaWidgets.includes('quick_actions_delivery')) {
            actionsHTML = `
                <button class="btn btn-success" id="quickNewDelivery"><i class="fas fa-truck"></i> New Delivery</button>
                <button class="btn btn-outline" id="checkInBtn"><i class="fas fa-check-circle"></i> Check In</button>
            `;
        } else if (qaWidgets.includes('quick_actions_store')) {
            actionsHTML = `
                <button class="btn btn-primary" id="quickAddItem"><i class="fas fa-plus"></i> Add Item</button>
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        } else if (qaWidgets.includes('quick_actions_finance')) {
            actionsHTML = `
                <button class="btn btn-primary" id="addFinanceBtn"><i class="fas fa-plus"></i> Add Entry</button>
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        } else {
            actionsHTML = `
                <button class="btn btn-outline" id="quickPrint"><i class="fas fa-print"></i> Print</button>
            `;
        }

        quickActionsContainer.innerHTML = actionsHTML;

        // Re-bind quick action events
        document.getElementById('quickAddItem')?.addEventListener('click', () => {
            document.getElementById('addItemBtn').click();
        });
        document.getElementById('quickNewDelivery')?.addEventListener('click', () => {
            switchPanel('deliveries');
        });
        document.getElementById('quickAddEmployee')?.addEventListener('click', () => {
            document.getElementById('addEmployeeBtn').click();
        });
        document.getElementById('quickPrint')?.addEventListener('click', () => {
            window.print();
        });
        // NOTE: addFinanceBtn and checkInBtn are handled in app.js,
        // so we do NOT bind them here to avoid duplication/recursion.
    }
}

function renderSalesChart(salesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const labels = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        labels.push(d.toLocaleDateString('en', { weekday: 'short' }));
        const daySales = salesData.filter(s => s.date && s.date.slice(0, 10) === key);
        const total = daySales.reduce((s, item) => s + (item.total || 0), 0);
        values.push(total);
    }

    if (salesChartInstance) salesChartInstance.destroy();

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales (LKR)',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { font: { size: 10 } } },
                x: { ticks: { font: { size: 10 } } }
            }
        }
    });
}

// ============================================================
// EMPLOYEES
// ============================================================
function renderEmployees() {
    if (!window.canView('employees')) {
        showAccessDenied('employees');
        return;
    }

    const data = getAppData();
    const employees = data.employees || [];
    const search = document.getElementById('empSearch').value.toLowerCase().trim();
    const deptFilter = document.getElementById('empDeptFilter').value;
    const statusFilter = document.getElementById('empStatusFilter').value;

    const depts = [...new Set(employees.map(e => e.department || 'Other'))];
    const deptSelect = document.getElementById('empDeptFilter');
    const currentDept = deptSelect.value;
    deptSelect.innerHTML = '<option value="all">All Depts</option>' + depts.map(d =>
        `<option value="${d}">${d}</option>`).join('');
    if (currentDept && [...deptSelect.options].some(o => o.value === currentDept)) deptSelect.value = currentDept;

    let filtered = employees.filter(e => {
        const matchName = (e.name || '').toLowerCase().includes(search);
        const matchDept = deptFilter === 'all' || e.department === deptFilter;
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchName && matchDept && matchStatus;
    });

    document.getElementById('empCount').textContent = filtered.length;

    const tbody = document.getElementById('employeeTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No employees found.</td></tr>`;
        return;
    }

    const canEdit = window.canManage('employees');

    tbody.innerHTML = filtered.map(e =>
        `<tr>
                    <td>${e.id || '—'}</td>
                    <td><strong>${escapeHtml(e.name)}</strong></td>
                    <td>${escapeHtml(e.department || '—')}</td>
                    <td>${escapeHtml(e.designation || '—')}</td>
                    <td><span class="badge ${e.status === 'active' ? 'badge-success' : 'badge-danger'}">${e.status || 'active'}</span></td>
                    <td class="text-center">
                        ${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editEmployee('${e.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e.id}')"><i class="fas fa-trash"></i></button>` : '—'}
                    </td>
                </tr>`
    ).join('');
}

// ============================================================
// INVENTORY
// ============================================================
function renderInventory() {
    if (!window.canView('inventory')) {
        showAccessDenied('inventory');
        return;
    }

    const data = getAppData();
    const items = data.items || [];
    const search = document.getElementById('invSearch').value.toLowerCase().trim();
    const catFilter = document.getElementById('invCatFilter').value;
    const sort = document.getElementById('invSort').value;

    const catSelect = document.getElementById('invCatFilter');
    const currentCat = catSelect.value;
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    catSelect.innerHTML = '<option value="all">All Categories</option>' + cats.map(c =>
        `<option value="${c}">${c}</option>`).join('');
    if (currentCat && [...catSelect.options].some(o => o.value === currentCat)) catSelect.value = currentCat;

    let filtered = items.filter(i => {
        const matchName = (i.name || '').toLowerCase().includes(search);
        const matchBarcode = i.barcode && i.barcode.includes(search);
        const matchCat = catFilter === 'all' || i.category === catFilter;
        return (matchName || matchBarcode) && matchCat;
    });

    filtered.sort((a, b) => {
        if (sort === 'qty') return (a.qty || 0) - (b.qty || 0);
        if (sort === 'price') return (a.price || 0) - (b.price || 0);
        return (a.name || '').localeCompare(b.name || '');
    });

    document.getElementById('invCount').textContent = filtered.length;

    const tbody = document.getElementById('inventoryTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:20px;">No items found.</td></tr>`;
        return;
    }

    const canEdit = window.canManage('inventory');

    tbody.innerHTML = filtered.map(i =>
        `<tr>
                    <td><code style="font-size:11px;">${escapeHtml(i.barcode || '—')}</code></td>
                    <td><strong>${escapeHtml(i.name)}</strong></td>
                    <td>${escapeHtml(i.category || '—')}</td>
                    <td class="${(i.qty || 0) <= 5 ? 'text-danger' : ''}" style="font-weight:600;">${i.qty || 0}</td>
                    <td>LKR ${formatCurrency(i.price || 0)}</td>
                    <td><span class="badge ${i.status === 'active' ? 'badge-success' : 'badge-danger'}">${i.status || 'active'}</span></td>
                    <td class="text-center">
                        ${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editItem('${i.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem('${i.id}')"><i class="fas fa-trash"></i></button>` : '—'}
                    </td>
                </tr>`
    ).join('');
}

// ============================================================
// PRODUCTS
// ============================================================
function renderProducts() {
    if (!window.canView('inventory')) {
        showAccessDenied('products');
        return;
    }

    const data = getAppData();
    const categories = data.categories || [];
    const brands = data.brands || [];

    const catChips = document.getElementById('categoryChips');
    const brandChips = document.getElementById('brandChips');
    const canEdit = window.canManage('inventory');

    catChips.innerHTML = categories.map(c =>
        `<span class="badge badge-info" style="margin:2px;">${escapeHtml(c)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeCategory('${c}')">✕</span>` : ''}</span>`
    ).join('') || '<span class="text-muted">No categories</span>';

    brandChips.innerHTML = brands.map(b =>
        `<span class="badge badge-success" style="margin:2px;">${escapeHtml(b)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeBrand('${b}')">✕</span>` : ''}</span>`
    ).join('') || '<span class="text-muted">No brands</span>';
}

// ============================================================
// DELIVERIES
// ============================================================
function renderDeliveries() {
    if (!window.canView('deliveries')) {
        showAccessDenied('deliveries');
        return;
    }

    const data = getAppData();
    const items = data.items || [];
    const deliveries = data.deliveries || [];

    const select = document.getElementById('delItemSelect');
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select --</option>' + items.filter(i => i.status !== 'inactive')
        .map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0})</option>`).join('');
    if (currentVal && [...select.options].some(o => o.value === currentVal)) select.value = currentVal;

    const dateFilter = document.getElementById('delDateFilter').value;
    let filtered = [...deliveries];
    if (dateFilter) {
        filtered = filtered.filter(d => d.date && d.date.slice(0, 10) === dateFilter);
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('deliveryTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No deliveries.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(d =>
        `<tr>
                    <td>${formatDate(d.date)}</td>
                    <td>${escapeHtml(d.customer || '—')}</td>
                    <td>${escapeHtml(d.itemName || '—')}</td>
                    <td>${d.qty || 0}</td>
                    <td>${escapeHtml(d.driver || '—')}</td>
                    <td>${escapeHtml(d.route || '—')}</td>
                </tr>`
    ).join('');
}

// ============================================================
// ATTENDANCE
// ============================================================
function renderAttendance() {
    if (!window.canView('attendance')) {
        showAccessDenied('attendance');
        return;
    }

    const data = getAppData();
    const attendance = data.attendance || [];
    const user = window.getCurrentUser();
    const userId = user?.uid || '';

    let filtered = attendance;
    if (user?.role === 'employee') {
        filtered = attendance.filter(a => a.employeeId === userId);
    }

    const tbody = document.getElementById('attendanceTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:20px;">No attendance records.</td></tr>`;
        return;
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    tbody.innerHTML = filtered.map(a => {
        const hours = a.checkIn && a.checkOut ? ((new Date(a.checkOut) - new Date(a.checkIn)) / (1000 * 60 * 60)).toFixed(1) : '—';
        return `<tr>
                    <td>${formatDate(a.date)}</td>
                    <td>${a.checkIn ? formatDateTime(a.checkIn) : '—'}</td>
                    <td>${a.checkOut ? formatDateTime(a.checkOut) : '—'}</td>
                    <td>${hours}</td>
                    <td><span class="badge badge-success">Present</span></td>
                </tr>`;
    }).join('');
}

// ============================================================
// LEAVE (FIXED - NULL CHECK ADDED)
// ============================================================
function renderLeave() {
    if (!window.canView('leave')) {
        showAccessDenied('leave');
        return;
    }

    const data = getAppData();
    const employees = data.employees || [];
    const leaves = data.leaves || [];
    const user = window.getCurrentUser();

    const select = document.getElementById('leaveEmployeeSelect');
    // ✅ NULL CHECK - if element not found, exit
    if (!select) {
        console.warn('leaveEmployeeSelect not found in DOM');
        return;
    }

    const canManageLeave = window.canManage('leave') || window.canManage('employees');
    if (canManageLeave) {
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Select --</option>' + employees.map(e =>
            `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
        if (currentVal && [...select.options].some(o => o.value === currentVal)) select.value = currentVal;
        select.disabled = false;
    } else {
        const emp = employees.find(e => e.id === user?.uid);
        if (emp) {
            select.innerHTML = `<option value="${emp.id}">${escapeHtml(emp.name)}</option>`;
            select.value = emp.id;
        } else {
            select.innerHTML = `<option value="${user?.uid || ''}">${user?.name || 'You'}</option>`;
            select.value = user?.uid || '';
        }
        select.disabled = true;
    }

    const tbody = document.getElementById('leaveTableBody');
    if (!tbody) {
        console.warn('leaveTableBody not found');
        return;
    }

    let filtered = leaves;
    if (!canManageLeave) {
        filtered = leaves.filter(l => l.employeeId === user?.uid);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:20px;">No leave requests.</td></tr>`;
        return;
    }
    filtered.sort((a, b) => new Date(b.from) - new Date(a.from));
    tbody.innerHTML = filtered.map(l => {
        const statusColor = l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning';
        return `<tr>
                    <td>${escapeHtml(l.employeeName || '—')}</td>
                    <td>${l.type || '—'}</td>
                    <td>${formatDate(l.from)}</td>
                    <td>${formatDate(l.to)}</td>
                    <td><span class="badge ${statusColor}">${l.status || 'pending'}</span></td>
                </tr>`;
    }).join('');
}

// ============================================================
// PAYROLL (FIXED - NULL CHECK ADDED)
// ============================================================
function renderPayroll() {
    if (!window.canView('payroll')) {
        showAccessDenied('payroll');
        return;
    }

    const data = getAppData();
    const employees = data.employees || [];
    const payroll = data.payroll || [];
    const user = window.getCurrentUser();

    const canManagePayroll = window.canManage('payroll');
    const select = document.getElementById('payrollEmployeeSelect');
    // ✅ NULL CHECK
    if (!select) {
        console.warn('payrollEmployeeSelect not found in DOM');
        return;
    }

    if (canManagePayroll) {
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Select --</option>' + employees.map(e =>
            `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
        if (currentVal && [...select.options].some(o => o.value === currentVal)) select.value = currentVal;
        select.disabled = false;
    } else {
        const emp = employees.find(e => e.id === user?.uid);
        if (emp) {
            select.innerHTML = `<option value="${emp.id}">${escapeHtml(emp.name)}</option>`;
            select.value = emp.id;
        } else {
            select.innerHTML = `<option value="${user?.uid || ''}">${user?.name || 'You'}</option>`;
            select.value = user?.uid || '';
        }
        select.disabled = true;
    }

    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) {
        console.warn('payrollTableBody not found');
        return;
    }

    let filtered = payroll;
    if (!canManagePayroll) {
        filtered = payroll.filter(p => p.employeeId === user?.uid);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No payroll records.</td></tr>`;
        return;
    }
    filtered.sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    tbody.innerHTML = filtered.map(p => {
        const net = (p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0);
        return `<tr>
                    <td>${escapeHtml(p.employeeName || '—')}</td>
                    <td>${p.month || '—'}</td>
                    <td>LKR ${formatCurrency(p.basic || 0)}</td>
                    <td>LKR ${formatCurrency(p.allowances || 0)}</td>
                    <td>LKR ${formatCurrency(p.deductions || 0)}</td>
                    <td><strong>LKR ${formatCurrency(net)}</strong></td>
                </tr>`;
    }).join('');
}

// ============================================================
// CUSTOMERS
// ============================================================
function renderCustomers() {
    if (!window.canView('customers')) {
        showAccessDenied('customers');
        return;
    }

    const data = getAppData();
    const customers = data.customers || [];
    const search = document.getElementById('custSearch').value.toLowerCase().trim();

    let filtered = customers.filter(c => (c.name || '').toLowerCase().includes(search));
    document.getElementById('custCount').textContent = filtered.length;

    const tbody = document.getElementById('customerTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:20px;">No customers.</td></tr>`;
        return;
    }
    const canEdit = window.canManage('customers');
    tbody.innerHTML = filtered.map(c =>
        `<tr>
                    <td><strong>${escapeHtml(c.name)}</strong></td>
                    <td>${escapeHtml(c.contact || '—')}</td>
                    <td>LKR ${formatCurrency(c.creditLimit || 0)}</td>
                    <td>LKR ${formatCurrency(c.balance || 0)}</td>
                    <td class="text-center">
                        ${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editCustomer('${c.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>` : '—'}
                    </td>
                </tr>`
    ).join('');
}

// ============================================================
// FINANCE
// ============================================================
function renderFinance() {
    if (!window.canView('finance')) {
        showAccessDenied('finance');
        return;
    }

    const data = getAppData();
    const finance = data.finance || [];

    const tbody = document.getElementById('financeTableBody');
    if (finance.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:20px;">No transactions.</td></tr>`;
    } else {
        finance.sort((a, b) => new Date(b.date) - new Date(a.date));
        tbody.innerHTML = finance.map(f =>
            `<tr>
                        <td>${formatDate(f.date)}</td>
                        <td><span class="badge ${f.type === 'income' ? 'badge-success' : 'badge-danger'}">${f.type}</span></td>
                        <td>${escapeHtml(f.desc || '—')}</td>
                        <td>${f.type === 'income' ? '+' : '-'} LKR ${formatCurrency(f.amount || 0)}</td>
                    </tr>`
        ).join('');
    }

    const totalIncome = finance.filter(f => f.type === 'income').reduce((s, f) => s + (f.amount || 0), 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    document.getElementById('financeTotalIncome').textContent = 'LKR ' + formatCurrency(totalIncome);
    document.getElementById('financeTotalExpense').textContent = 'LKR ' + formatCurrency(totalExpense);
    document.getElementById('financeBalance').textContent = 'LKR ' + formatCurrency(totalIncome - totalExpense);
}

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
