// ============================================================
// UI RENDERING MODULE (FULL ENTERPRISE - COMPLETE FILE - FIXED)
// ============================================================

const ALL_NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', group: 'Main' },
    { id: 'administration', icon: '🏢', label: 'Administration', group: 'Admin' },
    { id: 'employees', icon: '👤', label: 'Employees', group: 'HR' },
    { id: 'attendance', icon: '⏱️', label: 'Attendance', group: 'HR' },
    { id: 'leave', icon: '🏖️', label: 'Leave', group: 'HR' },
    { id: 'payroll', icon: '💰', label: 'Payroll', group: 'HR' },
    { id: 'inventory', icon: '📋', label: 'Inventory', group: 'Store' },
    { id: 'products', icon: '🏷️', label: 'Products', group: 'Store' },
    { id: 'purchasing', icon: '📦', label: 'Purchasing', group: 'Store' },
    { id: 'sales', icon: '🛒', label: 'Sales Orders', group: 'Sales' },
    { id: 'customers', icon: '👥', label: 'Customers', group: 'Sales' },
    { id: 'deliveries', icon: '🚚', label: 'Deliveries', group: 'Distribution' },
    { id: 'fleet', icon: '🚗', label: 'Fleet', group: 'Distribution' },
    { id: 'finance', icon: '💳', label: 'Finance', group: 'Finance' },
    { id: 'voucher', icon: '🧾', label: 'Vouchers', group: 'Finance' },
    { id: 'reports', icon: '📈', label: 'Reports', group: 'Reports' },
    { id: 'settings', icon: '⚙️', label: 'Settings', group: 'Settings' }
];

let currentLang = 'en';
let salesCart = [];
let deliveryCart = [];
let salesChartInstance = null;

// ============================================================
// SIDEBAR
// ============================================================
function renderSidebar() {
    var container = document.getElementById('sidebarNav');
    if (!container) return;
    var user = window.getCurrentUser();
    var role = (user && user.role) || 'superadmin';
    var roleConfig = window.ROLES ? window.ROLES[role] : null;
    if (!roleConfig) roleConfig = { nav: ['dashboard'] };
    var allowedIds = roleConfig.nav || ['dashboard'];
    
    var html = '';
    var groups = ['Main', 'Admin', 'HR', 'Store', 'Sales', 'Distribution', 'Finance', 'Reports', 'Settings'];
    groups.forEach(function(group) {
        var items = ALL_NAV_ITEMS.filter(function(item) {
            return item.group === group && allowedIds.indexOf(item.id) !== -1;
        });
        if (items.length === 0) return;
        html += '<div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); padding:8px 12px 4px; font-weight:700; letter-spacing:0.5px;">' + group + '</div>';
        items.forEach(function(item) {
            var label = (currentLang === 'si' && item.labelSI) ? item.labelSI : item.label;
            html += '<button class="nav-item" data-panel="' + item.id + '"><span class="icon">' + item.icon + '</span>' + label + '</button>';
        });
    });
    container.innerHTML = html;

    var activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        var id = activePanel.id.replace('panel-', '');
        container.querySelectorAll('.nav-item').forEach(function(b) {
            b.classList.toggle('active', b.dataset.panel === id);
        });
    }
    container.querySelectorAll('.nav-item').forEach(function(b) {
        b.addEventListener('click', function() {
            switchPanel(b.dataset.panel);
        });
    });
}

// ============================================================
// SWITCH PANEL
// ============================================================
function switchPanel(id) {
    var user = window.getCurrentUser();
    if (!user) { showToast('Login first.', 'error'); return; }
    var navItem = ALL_NAV_ITEMS.find(function(n) { return n.id === id; });
    if (navItem && !window.canView(navItem.id)) { showAccessDenied(id); return; }
    document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(function(b) {
        b.classList.toggle('active', b.dataset.panel === id);
    });
    var found = ALL_NAV_ITEMS.find(function(n) { return n.id === id; });
    if (found) document.getElementById('pageTitle').textContent = found.label;
    
    switch (id) {
        case 'dashboard': renderDashboard(); break;
        case 'administration': renderAdministration(); break;
        case 'employees': if(window.canView('employees')) renderEmployees(); else showAccessDenied('employees'); break;
        case 'attendance': if(window.canView('attendance')) renderAttendance(); else showAccessDenied('attendance'); break;
        case 'leave': if(window.canView('leave')) renderLeave(); else showAccessDenied('leave'); break;
        case 'payroll': if(window.canView('payroll')) renderPayroll(); else showAccessDenied('payroll'); break;
        case 'inventory': if(window.canView('inventory')) renderInventory(); else showAccessDenied('inventory'); break;
        case 'products': if(window.canView('inventory')) renderProducts(); else showAccessDenied('products'); break;
        case 'purchasing': if(window.canView('purchasing') || window.canView('inventory')) renderPurchasing(); else showAccessDenied('purchasing'); break;
        case 'sales': if(window.canView('sales') || window.canView('deliveries')) renderSales(); else showAccessDenied('sales'); break;
        case 'deliveries': if(window.canView('deliveries')) renderDeliveries(); else showAccessDenied('deliveries'); break;
        case 'customers': if(window.canView('customers')) renderCustomers(); else showAccessDenied('customers'); break;
        case 'finance': if(window.canView('finance')) renderFinance(); else showAccessDenied('finance'); break;
        case 'voucher': if(window.canView('voucher')) renderVouchers(); else showAccessDenied('voucher'); break;
        case 'fleet': if(window.canView('fleet') || window.canView('vehicles')) renderFleet(); else showAccessDenied('fleet'); break;
        case 'reports': if(window.canView('reports')) renderReports(); else showAccessDenied('reports'); break;
        case 'settings': if(window.canView('settings')) renderSettings(); else showAccessDenied('settings'); break;
    }
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

function showAccessDenied(module) {
    var panel = document.getElementById('panel-' + module);
    if (panel) {
        panel.innerHTML = '<div class="card" style="text-align:center;padding:40px;"><div style="font-size:60px;">⛔</div><h3>Access Denied</h3><button class="btn btn-primary mt-2" onclick="switchPanel(\'dashboard\')">Go to Dashboard</button></div>';
        panel.classList.add('active');
    }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
    var data = getAppData();
    var items = data.items || [];
    var employees = data.employees || [];
    var deliveries = data.deliveries || [];
    var salesData = data.salesData || [];
    
    var totalItems = items.length;
    var totalQty = items.reduce(function(s, i) { return s + (i.qty || 0); }, 0);
    var lowItems = items.filter(function(i) { return (i.qty || 0) <= 5 && i.status !== 'inactive'; });
    var totalValue = items.reduce(function(s, i) { return s + ((i.qty || 0) * (i.price || 0)); }, 0);
    var today = new Date().toISOString().slice(0, 10);
    var todayDeliveries = deliveries.filter(function(d) { return d.date && d.date.slice(0, 10) === today; });
    var todaySales = salesData.filter(function(s) { return s.date && s.date.slice(0, 10) === today; });
    var salesTotal = todaySales.reduce(function(s, d) { return s + (d.total || 0); }, 0);
    var pendingDeliveries = deliveries.filter(function(d) { return d.status !== 'delivered'; });

    var statsContainer = document.getElementById('dashStats');
    if (statsContainer) {
        statsContainer.innerHTML = 
            '<div class="stat-box blue"><div class="num">' + totalItems + '</div><div class="label">Total Items</div></div>' +
            '<div class="stat-box green"><div class="num">' + totalQty + '</div><div class="label">Total Stock</div></div>' +
            '<div class="stat-box red"><div class="num">' + lowItems.length + '</div><div class="label">Low Stock</div></div>' +
            '<div class="stat-box purple"><div class="num">' + employees.length + '</div><div class="label">Employees</div></div>' +
            '<div class="stat-box teal"><div class="num">' + todayDeliveries.length + '</div><div class="label">Today Deliveries</div></div>' +
            '<div class="stat-box orange"><div class="num">LKR ' + formatCurrency(totalValue) + '</div><div class="label">Inventory Value</div></div>' +
            '<div class="stat-box blue"><div class="num">LKR ' + formatCurrency(salesTotal) + '</div><div class="label">Today Sales</div></div>' +
            '<div class="stat-box red"><div class="num">' + pendingDeliveries.length + '</div><div class="label">Pending Del.</div></div>';
    }
    var lowContainer = document.getElementById('dashLowStockList');
    if (lowContainer) {
        if (lowItems.length === 0) {
            lowContainer.innerHTML = '<div class="empty-state"><span class="icon">✅</span><p>All items well-stocked.</p></div>';
        } else {
            var lowHtml = '';
            lowItems.forEach(function(i) {
                lowHtml += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>⚠️ ' + escapeHtml(i.name) + '</span><span style="color:var(--danger);font-weight:600;">' + i.qty + ' left</span></div>';
            });
            lowContainer.innerHTML = lowHtml;
        }
    }
    var ctx = document.getElementById('salesChart') ? document.getElementById('salesChart').getContext('2d') : null;
    if (ctx) {
        var labels = [];
        var values = [];
        for (var i = 6; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            var key = d.toISOString().slice(0, 10);
            labels.push(d.toLocaleDateString('en', { weekday: 'short' }));
            var daySales = salesData.filter(function(s) { return s.date && s.date.slice(0, 10) === key; });
            var total = daySales.reduce(function(s, item) { return s + (item.total || 0); }, 0);
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
                    backgroundColor: 'rgba(59,130,246,0.7)', 
                    borderColor: '#3b82f6', 
                    borderWidth: 2, 
                    borderRadius: 6 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { y: { beginAtZero: true } } 
            } 
        });
    }
}

// ============================================================
// ADMINISTRATION
// ============================================================
function renderAdministration() {
    var data = getAppData();
    var logs = data.logs || [];
    var tbody = document.getElementById('logsTableBody');
    if (!tbody) return;
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No logs.</td></tr>';
        return;
    }
    var html = '';
    logs.slice().reverse().slice(0, 50).forEach(function(l) {
        html += '<tr><td>' + formatDateTime(l.date) + '</td><td>' + escapeHtml(l.user || 'System') + '</td><td>' + escapeHtml(l.action) + '</td><td>' + escapeHtml(l.details) + '</td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// EMPLOYEES
// ============================================================
function renderEmployees() {
    if (!window.canView('employees')) return;
    var data = getAppData();
    var employees = data.employees || [];
    var search = document.getElementById('empSearch') ? document.getElementById('empSearch').value.toLowerCase().trim() : '';
    var deptFilter = document.getElementById('empDeptFilter') ? document.getElementById('empDeptFilter').value : 'all';
    var statusFilter = document.getElementById('empStatusFilter') ? document.getElementById('empStatusFilter').value : 'all';
    var depts = [];
    employees.forEach(function(e) {
        var dept = e.department || 'Other';
        if (depts.indexOf(dept) === -1) depts.push(dept);
    });
    var deptSelect = document.getElementById('empDeptFilter');
    if (deptSelect) {
        var current = deptSelect.value;
        deptSelect.innerHTML = '<option value="all">All Depts</option>';
        depts.forEach(function(d) {
            deptSelect.innerHTML += '<option value="' + d + '">' + d + '</option>';
        });
        if (current && deptSelect.querySelector('option[value="' + current + '"]')) deptSelect.value = current;
    }
    var filtered = employees.filter(function(e) {
        var matchName = (e.name || '').toLowerCase().indexOf(search) !== -1;
        var matchDept = deptFilter === 'all' || e.department === deptFilter;
        var matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchName && matchDept && matchStatus;
    });
    var countEl = document.getElementById('empCount');
    if (countEl) countEl.textContent = filtered.length;
    var tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No employees.</td></tr>';
        return;
    }
    var canEdit = window.canManage('employees');
    var html = '';
    filtered.forEach(function(e) {
        var statusBadge = e.status === 'active' ? 'badge-success' : 'badge-danger';
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editEmployee(\'' + e.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteEmployee(\'' + e.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td>' + e.id.slice(0, 6) + '</td><td><strong>' + escapeHtml(e.name) + '</strong></td><td>' + escapeHtml(e.department || '—') + '</td><td>' + escapeHtml(e.designation || '—') + '</td><td><span class="badge ' + statusBadge + '">' + (e.status || 'active') + '</span></td><td class="text-center">' + actions + '</td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// ATTENDANCE
// ============================================================
function renderAttendance() {
    if (!window.canView('attendance')) return;
    var data = getAppData();
    var attendance = data.attendance || [];
    var user = window.getCurrentUser();
    var filtered = attendance;
    if (user && (user.role === 'employee' || user.role === 'hr')) {
        filtered = attendance.filter(function(a) { return a.employeeId === user.uid; });
    }
    var tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No records.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var html = '';
    filtered.forEach(function(a) {
        var hours = (a.checkIn && a.checkOut) ? ((new Date(a.checkOut) - new Date(a.checkIn)) / (1000 * 60 * 60)).toFixed(1) : '—';
        html += '<tr><td>' + formatDate(a.date) + '</td><td>' + (a.checkIn ? formatDateTime(a.checkIn) : '—') + '</td><td>' + (a.checkOut ? formatDateTime(a.checkOut) : '—') + '</td><td>' + hours + '</td><td><span class="badge badge-success">Present</span></td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// LEAVE
// ============================================================
function renderLeave() {
    if (!window.canView('leave')) return;
    var data = getAppData();
    var employees = data.employees || [];
    var leaves = data.leaves || [];
    var user = window.getCurrentUser();
    var balances = data.leaveBalances || {};
    var empId = user ? user.uid : '';
    var bal = balances[empId] || { sick: 0, casual: 0, annual: 0 };
    document.getElementById('lbSick').textContent = bal.sick || 0;
    document.getElementById('lbCasual').textContent = bal.casual || 0;
    document.getElementById('lbAnnual').textContent = bal.annual || 0;
    var select = document.getElementById('leaveEmployeeSelect');
    var canManageLeave = window.canManage('leave') || window.canManage('employees');
    if (select) {
        if (canManageLeave) {
            var val = select.value;
            select.innerHTML = '<option value="">-- Select --</option>';
            employees.forEach(function(e) {
                select.innerHTML += '<option value="' + e.id + '">' + escapeHtml(e.name) + '</option>';
            });
            if (val && select.querySelector('option[value="' + val + '"]')) select.value = val;
            select.disabled = false;
        } else {
            var emp = employees.find(function(e) { return e.id === user.uid; });
            if (emp) {
                select.innerHTML = '<option value="' + emp.id + '">' + escapeHtml(emp.name) + '</option>';
                select.value = emp.id;
            } else {
                select.innerHTML = '<option value="' + (user ? user.uid : '') + '">' + (user ? user.name : 'You') + '</option>';
                select.value = user ? user.uid : '';
            }
            select.disabled = true;
        }
    }
    var filtered = leaves;
    if (!canManageLeave && user) {
        filtered = leaves.filter(function(l) { return l.employeeId === user.uid; });
    }
    var tbody = document.getElementById('leaveTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No requests.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return new Date(b.from) - new Date(a.from); });
    var html = '';
    filtered.forEach(function(l) {
        var statusClass = l.status === 'approved' ? 'badge-success' : (l.status === 'rejected' ? 'badge-danger' : 'badge-warning');
        html += '<tr><td>' + escapeHtml(l.employeeName || '—') + '</td><td>' + l.type + '</td><td>' + formatDate(l.from) + '</td><td>' + formatDate(l.to) + '</td><td><span class="badge ' + statusClass + '">' + (l.status || 'pending') + '</span></td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// PAYROLL
// ============================================================
function renderPayroll() {
    if (!window.canView('payroll')) return;
    var data = getAppData();
    var employees = data.employees || [];
    var payroll = data.payroll || [];
    var user = window.getCurrentUser();
    var select = document.getElementById('payrollEmployeeSelect');
    var canManagePayroll = window.canManage('payroll');
    if (select) {
        if (canManagePayroll) {
            var val = select.value;
            select.innerHTML = '<option value="">-- Select --</option>';
            employees.forEach(function(e) {
                select.innerHTML += '<option value="' + e.id + '">' + escapeHtml(e.name) + '</option>';
            });
            if (val && select.querySelector('option[value="' + val + '"]')) select.value = val;
            select.disabled = false;
        } else {
            var emp = employees.find(function(e) { return e.id === user.uid; });
            if (emp) {
                select.innerHTML = '<option value="' + emp.id + '">' + escapeHtml(emp.name) + '</option>';
                select.value = emp.id;
            } else {
                select.innerHTML = '<option value="' + (user ? user.uid : '') + '">' + (user ? user.name : 'You') + '</option>';
                select.value = user ? user.uid : '';
            }
            select.disabled = true;
        }
    }
    var filtered = payroll;
    if (!canManagePayroll && user) {
        filtered = payroll.filter(function(p) { return p.employeeId === user.uid; });
    }
    var tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No records.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return (b.month || '').localeCompare(a.month || ''); });
    var html = '';
    filtered.forEach(function(p) {
        var net = p.net || ((p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0));
        var epf = p.epf || ((p.basic || 0) * 0.08);
        var etf = p.etf || ((p.basic || 0) * 0.03);
        html += '<tr><td>' + escapeHtml(p.employeeName || '—') + '</td><td>' + (p.month || '—') + '</td><td>LKR ' + formatCurrency(p.basic || 0) + '</td><td>LKR ' + formatCurrency(p.allowances || 0) + '</td><td>LKR ' + formatCurrency(p.deductions || 0) + '</td><td>LKR ' + formatCurrency(epf) + '</td><td>LKR ' + formatCurrency(etf) + '</td><td><strong>LKR ' + formatCurrency(net) + '</strong></td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// INVENTORY
// ============================================================
function renderInventory() {
    if (!window.canView('inventory')) return;
    var data = getAppData();
    var items = data.items || [];
    var search = document.getElementById('invSearch') ? document.getElementById('invSearch').value.toLowerCase().trim() : '';
    var catFilter = document.getElementById('invCatFilter') ? document.getElementById('invCatFilter').value : 'all';
    var sort = document.getElementById('invSort') ? document.getElementById('invSort').value : 'name';
    var cats = [];
    items.forEach(function(i) {
        if (i.category && cats.indexOf(i.category) === -1) cats.push(i.category);
    });
    var catSelect = document.getElementById('invCatFilter');
    if (catSelect) {
        var val = catSelect.value;
        catSelect.innerHTML = '<option value="all">All Categories</option>';
        cats.forEach(function(c) {
            catSelect.innerHTML += '<option value="' + c + '">' + c + '</option>';
        });
        if (val && catSelect.querySelector('option[value="' + val + '"]')) catSelect.value = val;
    }
    var filtered = items.filter(function(i) {
        var matchName = (i.name || '').toLowerCase().indexOf(search) !== -1;
        var matchBarcode = i.barcode && i.barcode.indexOf(search) !== -1;
        var matchCat = catFilter === 'all' || i.category === catFilter;
        return (matchName || matchBarcode) && matchCat;
    });
    filtered.sort(function(a, b) {
        if (sort === 'qty') return (a.qty || 0) - (b.qty || 0);
        if (sort === 'price') return (a.price || 0) - (b.price || 0);
        return (a.name || '').localeCompare(b.name || '');
    });
    var countEl = document.getElementById('invCount');
    if (countEl) countEl.textContent = filtered.length;
    var tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No items.</td></tr>';
        return;
    }
    var canEdit = window.canManage('inventory');
    var html = '';
    filtered.forEach(function(i) {
        var qtyClass = (i.qty || 0) <= 5 ? 'text-danger' : '';
        var statusBadge = i.status === 'active' ? 'badge-success' : 'badge-danger';
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editItem(\'' + i.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'' + i.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><code>' + escapeHtml(i.productCode || '—') + '</code></td><td><code>' + escapeHtml(i.barcode || '—') + '</code></td><td><strong>' + escapeHtml(i.name) + '</strong></td><td>' + escapeHtml(i.category || '—') + '</td><td class="' + qtyClass + '">' + (i.qty || 0) + '</td><td>LKR ' + formatCurrency(i.price || 0) + '</td><td><span class="badge ' + statusBadge + '">' + (i.status || 'active') + '</span></td><td class="text-center">' + actions + '</td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// PRODUCTS (Enhanced)
// ============================================================
function renderProducts() {
    if (!window.canView('inventory')) return;
    var data = getAppData();
    var categories = data.categories || [];
    var brands = data.brands || [];
    var items = data.items || [];

    var canEdit = window.canManage('inventory');
    var catHtml = '';
    categories.forEach(function(c) {
        var removeBtn = canEdit ? '<span style="cursor:pointer;color:var(--danger);" onclick="removeCategory(\'' + c + '\')">✕</span>' : '';
        catHtml += '<span class="badge badge-info" style="margin:2px;">' + escapeHtml(c) + ' ' + removeBtn + '</span>';
    });
    document.getElementById('categoryChips').innerHTML = catHtml || '<span class="text-muted">None</span>';

    var brandHtml = '';
    brands.forEach(function(b) {
        var removeBtn = canEdit ? '<span style="cursor:pointer;color:var(--danger);" onclick="removeBrand(\'' + b + '\')">✕</span>' : '';
        brandHtml += '<span class="badge badge-success" style="margin:2px;">' + escapeHtml(b) + ' ' + removeBtn + '</span>';
    });
    document.getElementById('brandChips').innerHTML = brandHtml || '<span class="text-muted">None</span>';

    var firstItem = items[0];
    var codeEl = document.getElementById('productCode');
    var unitEl = document.getElementById('productUnit');
    var costEl = document.getElementById('productCostPrice');
    var taxEl = document.getElementById('productTaxRate');
    var reorderEl = document.getElementById('productReorderLevel');
    var alertEl = document.getElementById('productStockAlert');

    if (firstItem) {
        if (codeEl) codeEl.value = firstItem.productCode || ('PRD-' + String(items.length).padStart(4, '0'));
        if (unitEl) unitEl.value = firstItem.unit || 'Pcs';
        if (costEl) costEl.value = firstItem.costPrice || 0;
        if (taxEl) taxEl.value = firstItem.taxRate || 0;
        if (reorderEl) reorderEl.value = firstItem.reorderLevel || 0;
        if (alertEl) alertEl.value = firstItem.stockAlert || 'enabled';
    } else {
        if (codeEl) codeEl.value = 'PRD-' + String(items.length + 1).padStart(4, '0');
        if (unitEl) unitEl.value = 'Pcs';
        if (costEl) costEl.value = 0;
        if (taxEl) taxEl.value = 0;
        if (reorderEl) reorderEl.value = 0;
        if (alertEl) alertEl.value = 'enabled';
    }
}
window.renderProducts = renderProducts;

// ============================================================
// PURCHASING
// ============================================================
function renderPurchasing() {
    if (!window.canView('purchasing') && !window.canView('inventory')) return;
    var data = getAppData();
    var suppliers = data.suppliers || [];
    var purchaseOrders = data.purchaseOrders || [];
    var tbody = document.getElementById('supplierTableBody');
    if (tbody) {
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No suppliers.</td></tr>';
        } else {
            var html = '';
            suppliers.forEach(function(s) {
                html += '<tr><td>' + escapeHtml(s.name) + '</td><td>' + escapeHtml(s.contact) + '</td><td>' + escapeHtml(s.address) + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteSupplier(\'' + s.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            tbody.innerHTML = html;
        }
    }
    var poTbody = document.getElementById('poTableBody');
    if (poTbody) {
        if (purchaseOrders.length === 0) {
            poTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No POs.</td></tr>';
        } else {
            var poHtml = '';
            purchaseOrders.forEach(function(p) {
                poHtml += '<tr><td>' + escapeHtml(p.supplierName) + '</td><td>' + escapeHtml(p.itemName) + '</td><td>' + p.qty + '</td><td>LKR ' + formatCurrency(p.price) + '</td><td><span class="badge badge-warning">Pending</span></td></tr>';
            });
            poTbody.innerHTML = poHtml;
        }
    }
    var supSelect = document.getElementById('poSupplierSelect');
    if (supSelect) {
        var val = supSelect.value;
        supSelect.innerHTML = '<option value="">Select</option>';
        suppliers.forEach(function(s) {
            supSelect.innerHTML += '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>';
        });
        if (val && supSelect.querySelector('option[value="' + val + '"]')) supSelect.value = val;
    }
    var itemSelect = document.getElementById('poItemSelect');
    if (itemSelect) {
        var val2 = itemSelect.value;
        itemSelect.innerHTML = '<option value="">Select</option>';
        (data.items || []).forEach(function(i) {
            itemSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + '</option>';
        });
        if (val2 && itemSelect.querySelector('option[value="' + val2 + '"]')) itemSelect.value = val2;
    }
}

// ============================================================
// SALES (Enhanced - Multi-Item Cart)
// ============================================================
function renderSales() {
    if (!window.canView('sales')) return;
    var data = getAppData();
    var customers = data.customers || [];
    var items = data.items || [];
    var salesOrders = data.salesOrders || [];

    var orderDate = document.getElementById('salesOrderDate');
    if (orderDate && !orderDate.value) orderDate.value = todayStr();

    var custSelect = document.getElementById('salesCustomerSelect');
    if (custSelect) {
        var val = custSelect.value;
        custSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(function(c) {
            custSelect.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
        });
        if (val && custSelect.querySelector('option[value="' + val + '"]')) custSelect.value = val;
    }

    var cartItemSelect = document.getElementById('salesCartItemSelect');
    if (cartItemSelect) {
        var val2 = cartItemSelect.value;
        cartItemSelect.innerHTML = '<option value="">Select Item</option>';
        items.filter(function(i) { return i.status !== 'inactive'; }).forEach(function(i) {
            cartItemSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + ' (' + (i.qty || 0) + ' available) - LKR ' + formatCurrency(i.price || 0) + '</option>';
        });
        if (val2 && cartItemSelect.querySelector('option[value="' + val2 + '"]')) cartItemSelect.value = val2;
    }

    renderSalesCart();

    var tbody = document.getElementById('salesOrderTableBody');
    if (tbody) {
        if (salesOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders.</td></tr>';
        } else {
            var html = '';
            salesOrders.slice().reverse().forEach(function(o) {
                var itemCount = o.items ? o.items.length : 0;
                html += '<tr><td><strong>#' + (o.orderNo || o.id.slice(0, 6)) + '</strong></td><td>' + formatDate(o.date) + '</td><td>' + escapeHtml(o.customerName) + '</td><td>' + itemCount + ' items</td><td><strong>LKR ' + formatCurrency(o.total) + '</strong></td><td><span class="badge badge-success">Completed</span></td></tr>';
            });
            tbody.innerHTML = html;
        }
    }
}
window.renderSales = renderSales;

function renderSalesCart() {
    var tbody = document.getElementById('salesCartBody');
    var totalEl = document.getElementById('salesCartTotal');
    if (!tbody) return;
    if (salesCart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Cart is empty.</td></tr>';
        if (totalEl) totalEl.textContent = 'LKR 0';
        return;
    }
    var grandTotal = 0;
    var html = '';
    salesCart.forEach(function(item, index) {
        var total = item.qty * item.price;
        grandTotal += total;
        html += '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + item.qty + '</td><td>LKR ' + formatCurrency(item.price) + '</td><td>LKR ' + formatCurrency(total) + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="removeFromSalesCart(' + index + ')"><i class="fas fa-trash"></i></button></td></tr>';
    });
    tbody.innerHTML = html;
    if (totalEl) totalEl.textContent = 'LKR ' + formatCurrency(grandTotal);
}
window.removeFromSalesCart = function(index) { salesCart.splice(index, 1); renderSalesCart(); };

// ============================================================
// DELIVERIES (Enhanced - Multi-Item + Status)
// ============================================================
function renderDeliveries() {
    if (!window.canView('deliveries')) return;
    var data = getAppData();
    if (typeof window.populateDeliveryDropdowns === 'function') {
        window.populateDeliveryDropdowns();
    }

    var cartItemSelect = document.getElementById('delCartItemSelect');
    if (cartItemSelect) {
        var val = cartItemSelect.value;
        cartItemSelect.innerHTML = '<option value="">Select Item</option>';
        (data.items || []).filter(function(i) { return i.status !== 'inactive'; }).forEach(function(i) {
            cartItemSelect.innerHTML += '<option value="' + i.id + '">' + escapeHtml(i.name) + ' (' + (i.qty || 0) + ' available)</option>';
        });
        if (val && cartItemSelect.querySelector('option[value="' + val + '"]')) cartItemSelect.value = val;
    }

    var dateFilter = document.getElementById('delDateFilter') ? document.getElementById('delDateFilter').value : '';
    var statusFilter = document.getElementById('delStatusFilter') ? document.getElementById('delStatusFilter').value : 'all';
    var filtered = data.deliveries || [];
    if (dateFilter) filtered = filtered.filter(function(d) { return d.date && d.date.slice(0, 10) === dateFilter; });
    if (statusFilter !== 'all') filtered = filtered.filter(function(d) { return d.status === statusFilter; });
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

    var tbody = document.getElementById('deliveryTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No deliveries.</td></tr>';
        renderDeliveryCart();
        return;
    }

    var statusColors = { 'pending': 'badge-warning', 'in-progress': 'badge-info', 'delivered': 'badge-success', 'cancelled': 'badge-danger' };
    var canUpdate = window.canManage('deliveries') || window.hasPermission('update_deliveries');
    var html = '';
    filtered.forEach(function(d) {
        var itemsCount = d.items ? d.items.length : 0;
        var statusHtml = '';
        if (canUpdate) {
            statusHtml = '<select class="delivery-status-select" data-id="' + d.id + '" style="padding:4px 8px; border-radius:6px; border:2px solid var(--border); font-size:12px;">' +
                '<option value="pending" ' + (d.status === 'pending' ? 'selected' : '') + '>Pending</option>' +
                '<option value="in-progress" ' + (d.status === 'in-progress' ? 'selected' : '') + '>In-Progress</option>' +
                '<option value="delivered" ' + (d.status === 'delivered' ? 'selected' : '') + '>Delivered</option>' +
                '<option value="cancelled" ' + (d.status === 'cancelled' ? 'selected' : '') + '>Cancelled</option>' +
                '</select>';
        } else {
            statusHtml = '<span class="badge ' + (statusColors[d.status] || 'badge-warning') + '">' + (d.status || 'pending') + '</span>';
        }
        html += '<tr><td>' + formatDate(d.date) + '</td><td>' + escapeHtml(d.customerName || '—') + '</td><td>' + itemsCount + ' items</td><td>' + escapeHtml(d.driverName || '—') + '</td><td>' + escapeHtml(d.vehicleNo || '—') + '</td><td>' + statusHtml + '</td><td class="text-center"><button class="btn btn-sm btn-outline" onclick="viewDeliveryDetails(\'' + d.id + '\')"><i class="fas fa-eye"></i></button></td></tr>';
    });
    tbody.innerHTML = html;

    document.querySelectorAll('.delivery-status-select').forEach(function(select) {
        select.removeEventListener('change', handleStatusChange);
        select.addEventListener('change', handleStatusChange);
    });

    renderDeliveryCart();
}
window.renderDeliveries = renderDeliveries;

function handleStatusChange(e) {
    var id = e.target.dataset.id;
    var status = e.target.value;
    updateDeliveryStatus(id, status);
}

async function updateDeliveryStatus(id, status) {
    var data = getAppData();
    var delivery = data.deliveries.find(function(d) { return d.id === id; });
    if (!delivery) { showToast('Delivery not found.', 'error'); return; }
    delivery.status = status;
    delivery.updatedAt = nowISO();
    setAppData(data);
    await saveAllData();
    renderDeliveries();
    showToast('✅ Status updated to: ' + status);
}
window.updateDeliveryStatus = updateDeliveryStatus;

function renderDeliveryCart() {
    var tbody = document.getElementById('delCartBody');
    if (!tbody) return;
    if (deliveryCart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No items added.</td></tr>';
        return;
    }
    var html = '';
    deliveryCart.forEach(function(item, index) {
        html += '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + item.qty + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="removeFromDeliveryCart(' + index + ')"><i class="fas fa-trash"></i></button></td></tr>';
    });
    tbody.innerHTML = html;
}
window.removeFromDeliveryCart = function(index) { deliveryCart.splice(index, 1); renderDeliveryCart(); };

window.viewDeliveryDetails = function(id) {
    var data = getAppData();
    var delivery = data.deliveries.find(function(d) { return d.id === id; });
    if (!delivery) { showToast('Not found.', 'error'); return; }
    var items = delivery.items ? delivery.items.map(function(i) { return i.name + ' x' + i.qty; }).join(', ') : '—';
    showToast('📦 ' + delivery.customerName + ' | Items: ' + items + ' | Status: ' + delivery.status, 'info');
};

// ============================================================
// CUSTOMERS
// ============================================================
function renderCustomers() {
    if (!window.canView('customers')) return;
    var data = getAppData();
    var customers = data.customers || [];
    var search = document.getElementById('custSearch') ? document.getElementById('custSearch').value.toLowerCase().trim() : '';
    var filtered = customers.filter(function(c) { return (c.name || '').toLowerCase().indexOf(search) !== -1; });
    var countEl = document.getElementById('custCount');
    if (countEl) countEl.textContent = filtered.length;
    var tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No customers.</td></tr>';
        return;
    }
    var canEdit = window.canManage('customers');
    var html = '';
    filtered.forEach(function(c) {
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteCustomer(\'' + c.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><strong>' + escapeHtml(c.name) + '</strong></td><td>' + escapeHtml(c.contact || '—') + '</td><td>LKR ' + formatCurrency(c.creditLimit || 0) + '</td><td>LKR ' + formatCurrency(c.balance || 0) + '</td><td class="text-center">' + actions + '</td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// FINANCE (Enhanced - Check Details)
// ============================================================
function renderFinance() {
    if (!window.canView('finance')) return;
    var data = getAppData();
    var finance = data.finance || [];

    var tbody = document.getElementById('financeTableBody');
    if (finance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions.</td></tr>';
    } else {
        finance.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        var html = '';
        finance.forEach(function(f) {
            var methodDisplay = f.paymentMethod || 'cash';
            if (methodDisplay === 'cheque' && f.chequeNo) {
                methodDisplay = 'Cheque #' + f.chequeNo;
            }
            var typeBadge = f.type === 'income' ? 'badge-success' : 'badge-danger';
            var sign = f.type === 'income' ? '+' : '-';
            html += '<tr><td>' + formatDate(f.date) + '</td><td><span class="badge ' + typeBadge + '">' + f.type + '</span></td><td>' + escapeHtml(f.category || '—') + '</td><td>' + escapeHtml(methodDisplay) + '</td><td>' + escapeHtml(f.desc || '—') + '</td><td>' + sign + ' LKR ' + formatCurrency(f.amount || 0) + '</td></tr>';
        });
        tbody.innerHTML = html;
    }

    var totalIncome = finance.filter(function(f) { return f.type === 'income'; }).reduce(function(s, f) { return s + (f.amount || 0); }, 0);
    var totalExpense = finance.filter(function(f) { return f.type === 'expense'; }).reduce(function(s, f) { return s + (f.amount || 0); }, 0);
    document.getElementById('financeTotalIncome').textContent = 'LKR ' + formatCurrency(totalIncome);
    document.getElementById('financeTotalExpense').textContent = 'LKR ' + formatCurrency(totalExpense);
    document.getElementById('financeBalance').textContent = 'LKR ' + formatCurrency(totalIncome - totalExpense);

    var budget = data.budget || {};
    var container = document.getElementById('budgetDisplay');
    if (container) {
        if (!budget.category || Object.keys(budget.category).length === 0) {
            container.innerHTML = '<div class="text-muted">No budget set.</div>';
        } else {
            var budgetHtml = '<strong>📊 Budget vs Actual</strong><br/>';
            var totalB = 0, totalA = 0;
            for (var cat in budget.category) {
                if (budget.category.hasOwnProperty(cat)) {
                    var amt = budget.category[cat];
                    var actual = finance.filter(function(f) { return f.category === cat && f.type === 'expense'; }).reduce(function(s, f) { return s + (f.amount || 0); }, 0);
                    totalB += amt;
                    totalA += actual;
                    var diff = amt - actual;
                    var status = diff >= 0 ? '✅' : '⚠️';
                    budgetHtml += '<span>' + cat + ': Budget ' + formatCurrency(amt) + ' | Actual ' + formatCurrency(actual) + ' | ' + status + ' ' + formatCurrency(Math.abs(diff)) + '</span><br/>';
                }
            }
            var totalDiff = totalB - totalA;
            var totalStatus = totalDiff >= 0 ? '✅' : '⚠️';
            budgetHtml += '<hr/><strong>Total:</strong> Budget ' + formatCurrency(totalB) + ' | Actual ' + formatCurrency(totalA) + ' | ' + totalStatus + ' ' + formatCurrency(Math.abs(totalDiff));
            container.innerHTML = budgetHtml;
        }
    }
}
window.renderFinance = renderFinance;

// ============================================================
// VOUCHERS
// ============================================================
function renderVouchers() {
    if (!window.canView('voucher')) return;
    var data = getAppData();
    var vouchers = data.vouchers || [];
    var countEl = document.getElementById('voucherCount');
    if (countEl) countEl.textContent = vouchers.length;
    var tbody = document.getElementById('voucherTableBody');
    if (!tbody) return;
    if (vouchers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No vouchers.</td></tr>';
        return;
    }
    var canEdit = window.canManage('voucher') || window.canManage('finance');
    var html = '';
    vouchers.slice().reverse().forEach(function(v) {
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-danger" onclick="deleteVoucher(\'' + v.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        var paymentTypes = v.paymentTypes ? v.paymentTypes.join(', ') : '—';
        html += '<tr><td><strong>' + escapeHtml(v.voucherNo || '—') + '</strong></td><td>' + formatDate(v.date) + '</td><td>' + escapeHtml(v.paidTo || '—') + '</td><td>LKR ' + formatCurrency(v.amount || 0) + '</td><td>' + escapeHtml(paymentTypes) + '</td><td><span class="badge badge-success">Paid</span></td><td class="text-center">' + actions + '</td></tr>';
    });
    tbody.innerHTML = html;
}
window.deleteVoucher = async function(id) {
    if (!confirm('Delete?')) return;
    var data = getAppData();
    data.vouchers = data.vouchers.filter(function(v) { return v.id !== id; });
    setAppData(data);
    await saveAllData();
    renderVouchers();
    showToast('🗑️ Removed.');
};

// ============================================================
// FLEET
// ============================================================
function renderFleet() {
    if (!window.canView('fleet') && !window.canView('vehicles')) return;
    var data = getAppData();
    var vehicles = data.vehicles || [];
    var tbody = document.getElementById('vehicleTableBody');
    if (!tbody) return;
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No vehicles.</td></tr>';
        return;
    }
    var canEdit = window.canManage('vehicles');
    var html = '';
    vehicles.forEach(function(v) {
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editVehicle(\'' + v.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteVehicle(\'' + v.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><strong>' + escapeHtml(v.vehicleNo || '—') + '</strong></td><td>' + escapeHtml(v.driver || '—') + '</td><td>' + escapeHtml(v.fuel || '—') + '</td><td>' + escapeHtml(v.insurance || '—') + '</td><td>' + (v.service ? formatDate(v.service) : '—') + '</td><td><span class="badge badge-success">Active</span></td><td class="text-center">' + actions + '</td></tr>';
    });
    tbody.innerHTML = html;
}

// ============================================================
// REPORTS
// ============================================================
function renderReports() {
    if (!window.canView('reports')) return;
    var type = document.getElementById('reportType') ? document.getElementById('reportType').value : 'stock';
    var from = document.getElementById('reportFrom') ? document.getElementById('reportFrom').value : '';
    var to = document.getElementById('reportTo') ? document.getElementById('reportTo').value : '';
    var container = document.getElementById('reportContent');
    var data = getAppData();
    var html = '';

    function filterByDate(arr, field) {
        return arr.filter(function(item) {
            if (!item[field]) return true;
            var d = item[field].slice(0, 10);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    }

    switch (type) {
        case 'stock': {
            var items = filterByDate(data.items || [], 'updatedAt');
            if (items.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var stockHtml = '<table><thead><tr><th>Code</th><th>Item</th><th>Category</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead><tbody>';
                items.forEach(function(i) {
                    stockHtml += '<tr><td>' + escapeHtml(i.productCode || '—') + '</td><td>' + escapeHtml(i.name) + '</td><td>' + escapeHtml(i.category || '—') + '</td><td>' + (i.qty || 0) + '</td><td>LKR ' + formatCurrency(i.price || 0) + '</td><td>LKR ' + formatCurrency((i.qty || 0) * (i.price || 0)) + '</td></tr>';
                });
                stockHtml += '</tbody></table>';
                html = stockHtml;
            }
            break;
        }
        case 'sales': {
            var sales = filterByDate(data.salesData || [], 'date');
            if (sales.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var total = sales.reduce(function(s, item) { return s + (item.total || 0); }, 0);
                var salesHtml = '<table><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>';
                sales.forEach(function(s) {
                    salesHtml += '<tr><td>' + formatDate(s.date) + '</td><td>' + escapeHtml(s.customer || '—') + '</td><td>' + escapeHtml(s.item || '—') + '</td><td>' + (s.qty || 0) + '</td><td>LKR ' + formatCurrency(s.total || 0) + '</td></tr>';
                });
                salesHtml += '</tbody><tfoot><tr><td colspan="4"><strong>Grand Total</strong></td><td><strong>LKR ' + formatCurrency(total) + '</strong></td></tr></tfoot></table>';
                html = salesHtml;
            }
            break;
        }
        case 'attendance': {
            var att = filterByDate(data.attendance || [], 'date');
            if (att.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var attHtml = '<table><thead><tr><th>Date</th><th>Employee</th><th>Check In</th><th>Check Out</th></tr></thead><tbody>';
                att.forEach(function(a) {
                    attHtml += '<tr><td>' + formatDate(a.date) + '</td><td>' + escapeHtml(a.employeeName || '—') + '</td><td>' + (a.checkIn ? formatDateTime(a.checkIn) : '—') + '</td><td>' + (a.checkOut ? formatDateTime(a.checkOut) : '—') + '</td></tr>';
                });
                attHtml += '</tbody></table>';
                html = attHtml;
            }
            break;
        }
        case 'payroll': {
            var pay = filterByDate(data.payroll || [], 'updatedAt');
            if (pay.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var payHtml = '<table><thead><tr><th>Employee</th><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>EPF</th><th>ETF</th><th>Net</th></tr></thead><tbody>';
                pay.forEach(function(p) {
                    var net = p.net || ((p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0));
                    var epf = p.epf || ((p.basic || 0) * 0.08);
                    var etf = p.etf || ((p.basic || 0) * 0.03);
                    payHtml += '<tr><td>' + escapeHtml(p.employeeName || '—') + '</td><td>' + (p.month || '—') + '</td><td>LKR ' + formatCurrency(p.basic || 0) + '</td><td>LKR ' + formatCurrency(p.allowances || 0) + '</td><td>LKR ' + formatCurrency(p.deductions || 0) + '</td><td>LKR ' + formatCurrency(epf) + '</td><td>LKR ' + formatCurrency(etf) + '</td><td><strong>LKR ' + formatCurrency(net) + '</strong></td></tr>';
                });
                payHtml += '</tbody></table>';
                html = payHtml;
            }
            break;
        }
        case 'customers': {
            var cust = filterByDate(data.customers || [], 'updatedAt');
            if (cust.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var custHtml = '<table><thead><tr><th>Name</th><th>Contact</th><th>Category</th><th>Credit Limit</th><th>Balance</th></tr></thead><tbody>';
                cust.forEach(function(c) {
                    custHtml += '<tr><td>' + escapeHtml(c.name) + '</td><td>' + escapeHtml(c.contact || '—') + '</td><td>' + escapeHtml(c.category || 'Retail') + '</td><td>LKR ' + formatCurrency(c.creditLimit || 0) + '</td><td>LKR ' + formatCurrency(c.balance || 0) + '</td></tr>';
                });
                custHtml += '</tbody></table>';
                html = custHtml;
            }
            break;
        }
        case 'purchasing': {
            var po = filterByDate(data.purchaseOrders || [], 'createdAt');
            if (po.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var poHtml = '<table><thead><tr><th>Supplier</th><th>Item</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead><tbody>';
                po.forEach(function(p) {
                    poHtml += '<tr><td>' + escapeHtml(p.supplierName) + '</td><td>' + escapeHtml(p.itemName) + '</td><td>' + p.qty + '</td><td>LKR ' + formatCurrency(p.price) + '</td><td><span class="badge badge-warning">Pending</span></td></tr>';
                });
                poHtml += '</tbody></table>';
                html = poHtml;
            }
            break;
        }
        case 'finance': {
            var fin = filterByDate(data.finance || [], 'date');
            if (fin.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var inc = fin.filter(function(f) { return f.type === 'income'; }).reduce(function(s, f) { return s + (f.amount || 0); }, 0);
                var exp = fin.filter(function(f) { return f.type === 'expense'; }).reduce(function(s, f) { return s + (f.amount || 0); }, 0);
                var finHtml = '<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Method</th><th>Description</th><th>Amount</th></tr></thead><tbody>';
                fin.forEach(function(f) {
                    finHtml += '<tr><td>' + formatDate(f.date) + '</td><td><span class="badge ' + (f.type === 'income' ? 'badge-success' : 'badge-danger') + '">' + f.type + '</span></td><td>' + escapeHtml(f.category || '—') + '</td><td>' + escapeHtml(f.paymentMethod || 'cash') + '</td><td>' + escapeHtml(f.desc || '—') + '</td><td>' + (f.type === 'income' ? '+' : '-') + ' LKR ' + formatCurrency(f.amount || 0) + '</td></tr>';
                });
                finHtml += '</tbody><tfoot><tr><td colspan="5"><strong>Income: ' + formatCurrency(inc) + ' | Expense: ' + formatCurrency(exp) + ' | Balance: ' + formatCurrency(inc - exp) + '</strong></td></tr></tfoot></table>';
                html = finHtml;
            }
            break;
        }
        default: {
            html = '<div class="text-muted text-center">Select a report.</div>';
        }
    }
    if (container) container.innerHTML = html;
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
    if (!window.canView('settings')) return;
    var data = getAppData();
    var settings = data.settings || {};
    var companyEl = document.getElementById('settingsCompany');
    var addressEl = document.getElementById('settingsAddress');
    var phoneEl = document.getElementById('settingsPhone');
    var emailEl = document.getElementById('settingsEmail');
    if (companyEl) companyEl.value = settings.company || '';
    if (addressEl) addressEl.value = settings.address || '';
    if (phoneEl) phoneEl.value = settings.phone || '';
    if (emailEl) emailEl.value = settings.email || '';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
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
window.renderDashboard = renderDashboard;
window.renderAdministration = renderAdministration;
window.renderEmployees = renderEmployees;
window.renderAttendance = renderAttendance;
window.renderLeave = renderLeave;
window.renderPayroll = renderPayroll;
window.renderInventory = renderInventory;
window.renderProducts = renderProducts;
window.renderPurchasing = renderPurchasing;
window.renderSales = renderSales;
window.renderDeliveries = renderDeliveries;
window.renderCustomers = renderCustomers;
window.renderFinance = renderFinance;
window.renderVouchers = renderVouchers;
window.renderFleet = renderFleet;
window.renderReports = renderReports;
window.renderSettings = renderSettings;
window.renderSidebar = renderSidebar;

// ============================================================
// EDIT/DELETE FUNCTIONS
// ============================================================
window.editEmployee = function(id) {
    var data = getAppData();
    var emp = data.employees.find(function(e) { return e.id === id; });
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
    document.getElementById('empUsername').value = emp.email || '';
    document.getElementById('empPassword').value = '';
    document.getElementById('empStatus').value = emp.status || 'active';
    document.getElementById('employeeModalTitle').textContent = '✏️ Edit Employee';
    document.getElementById('employeeModal').classList.add('open');
};

window.deleteEmployee = async function(id) {
    if (!confirm('Delete this employee?')) return;
    var data = getAppData();
    data.employees = data.employees.filter(function(e) { return e.id !== id; });
    if (data.leaveBalances) delete data.leaveBalances[id];
    setAppData(data);
    await saveAllData();
    renderEmployees();
    showToast('🗑️ Employee removed.');
};

window.editItem = function(id) {
    var data = getAppData();
    var item = data.items.find(function(i) { return i.id === id; });
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
    document.getElementById('itemProductCode').value = item.productCode || '';
    document.getElementById('itemUnit').value = item.unit || 'Pcs';
    document.getElementById('itemCostPrice').value = item.costPrice || 0;
    document.getElementById('itemReorderLevel').value = item.reorderLevel || 0;
    document.getElementById('itemTaxRate').value = item.taxRate || 0;
    document.getElementById('itemStockAlert').value = item.stockAlert || 'enabled';
    document.getElementById('itemModalTitle').textContent = '✏️ Edit Item';
    document.getElementById('itemModal').classList.add('open');
    populateItemDropdowns();
};

window.deleteItem = async function(id) {
    if (!confirm('Delete this item?')) return;
    var data = getAppData();
    data.items = data.items.filter(function(i) { return i.id !== id; });
    setAppData(data);
    await saveAllData();
    renderInventory();
    showToast('🗑️ Item removed.');
};

window.editCustomer = function(id) {
    var data = getAppData();
    var c = data.customers.find(function(cust) { return cust.id === id; });
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
    var data = getAppData();
    data.customers = data.customers.filter(function(c) { return c.id !== id; });
    setAppData(data);
    await saveAllData();
    renderCustomers();
    showToast('🗑️ Customer removed.');
};

window.editVehicle = function(id) {
    var data = getAppData();
    var v = data.vehicles.find(function(veh) { return veh.id === id; });
    if (!v) return;
    document.getElementById('vehicleNo').value = v.vehicleNo || '';
    document.getElementById('vehicleDriver').value = v.driver || '';
    document.getElementById('vehicleFuel').value = v.fuel || '';
    document.getElementById('vehicleInsurance').value = v.insurance || '';
    document.getElementById('vehicleService').value = v.service || '';
    var btn = document.getElementById('addVehicleBtn');
    if (btn) {
        btn.dataset.editId = v.id;
        btn.textContent = '💾 Update Vehicle';
    }
    showToast('✏️ Editing vehicle. Update and save.');
};

window.deleteVehicle = async function(id) {
    if (!confirm('Delete this vehicle?')) return;
    var data = getAppData();
    data.vehicles = data.vehicles.filter(function(v) { return v.id !== id; });
    setAppData(data);
    await saveAllData();
    renderFleet();
    showToast('🗑️ Vehicle removed.');
};

window.deleteSupplier = async function(id) {
    if (!confirm('Delete supplier?')) return;
    var data = getAppData();
    data.suppliers = data.suppliers.filter(function(s) { return s.id !== id; });
    setAppData(data);
    await saveAllData();
    renderPurchasing();
    showToast('🗑️ Supplier removed.');
};

window.removeCategory = async function(cat) {
    if (!confirm('Remove category "' + cat + '"?')) return;
    var data = getAppData();
    data.categories = data.categories.filter(function(c) { return c !== cat; });
    data.items.forEach(function(i) { if (i.category === cat) i.category = ''; });
    setAppData(data);
    await saveAllData();
    renderProducts();
    renderInventory();
    showToast('🗑️ Removed "' + cat + '"');
};

window.removeBrand = async function(brand) {
    if (!confirm('Remove brand "' + brand + '"?')) return;
    var data = getAppData();
    data.brands = data.brands.filter(function(b) { return b !== brand; });
    data.items.forEach(function(i) { if (i.brand === brand) i.brand = ''; });
    setAppData(data);
    await saveAllData();
    renderProducts();
    showToast('🗑️ Removed "' + brand + '"');
};
