// ============================================================
// UI RENDERING MODULE (FULL ENTERPRISE - COMPLETE FILE)
// ============================================================

// Global cart arrays (will be exposed at the end)
var salesCart = [];
var deliveryCart = [];

var ALL_NAV_ITEMS = [
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

var currentLang = 'en';
var salesChartInstance = null;

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
    
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var items = [];
        for (var i = 0; i < ALL_NAV_ITEMS.length; i++) {
            var item = ALL_NAV_ITEMS[i];
            if (item.group === group && allowedIds.indexOf(item.id) !== -1) {
                items.push(item);
            }
        }
        if (items.length === 0) continue;
        html += '<div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); padding:8px 12px 4px; font-weight:700; letter-spacing:0.5px;">' + group + '</div>';
        for (var j = 0; j < items.length; j++) {
            var it = items[j];
            var label = (currentLang === 'si' && it.labelSI) ? it.labelSI : it.label;
            html += '<button class="nav-item" data-panel="' + it.id + '"><span class="icon">' + it.icon + '</span>' + label + '</button>';
        }
    }
    container.innerHTML = html;

    var activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        var id = activePanel.id.replace('panel-', '');
        var btns = container.querySelectorAll('.nav-item');
        for (var k = 0; k < btns.length; k++) {
            btns[k].classList.toggle('active', btns[k].dataset.panel === id);
        }
    }
    var btns = container.querySelectorAll('.nav-item');
    for (var m = 0; m < btns.length; m++) {
        btns[m].addEventListener('click', function() {
            switchPanel(this.dataset.panel);
        });
    }
}

function switchPanel(id) {
    var user = window.getCurrentUser();
    if (!user) { showToast('Login first.', 'error'); return; }
    
    var navItem = null;
    for (var i = 0; i < ALL_NAV_ITEMS.length; i++) {
        if (ALL_NAV_ITEMS[i].id === id) { navItem = ALL_NAV_ITEMS[i]; break; }
    }
    if (navItem && !window.canView(navItem.id)) { showAccessDenied(id); return; }
    
    var panels = document.querySelectorAll('.panel');
    for (var p = 0; p < panels.length; p++) {
        panels[p].classList.remove('active');
    }
    var panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');
    
    var btns = document.querySelectorAll('.nav-item');
    for (var b = 0; b < btns.length; b++) {
        btns[b].classList.toggle('active', btns[b].dataset.panel === id);
    }
    
    var found = null;
    for (var f = 0; f < ALL_NAV_ITEMS.length; f++) {
        if (ALL_NAV_ITEMS[f].id === id) { found = ALL_NAV_ITEMS[f]; break; }
    }
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

function renderDashboard() {
    var data = getAppData();
    var items = data.items || [];
    var employees = data.employees || [];
    var deliveries = data.deliveries || [];
    var salesData = data.salesData || [];
    
    var totalItems = items.length;
    var totalQty = 0;
    for (var i = 0; i < items.length; i++) { totalQty += (items[i].qty || 0); }
    
    var lowItems = [];
    for (var l = 0; l < items.length; l++) {
        if ((items[l].qty || 0) <= 5 && items[l].status !== 'inactive') {
            lowItems.push(items[l]);
        }
    }
    
    var totalValue = 0;
    for (var v = 0; v < items.length; v++) {
        totalValue += ((items[v].qty || 0) * (items[v].price || 0));
    }
    
    var today = new Date().toISOString().slice(0, 10);
    var todayDeliveries = [];
    for (var td = 0; td < deliveries.length; td++) {
        if (deliveries[td].date && deliveries[td].date.slice(0, 10) === today) {
            todayDeliveries.push(deliveries[td]);
        }
    }
    
    var todaySales = [];
    for (var ts = 0; ts < salesData.length; ts++) {
        if (salesData[ts].date && salesData[ts].date.slice(0, 10) === today) {
            todaySales.push(salesData[ts]);
        }
    }
    
    var salesTotal = 0;
    for (var st = 0; st < todaySales.length; st++) {
        salesTotal += (todaySales[st].total || 0);
    }
    
    var pendingDeliveries = [];
    for (var pd = 0; pd < deliveries.length; pd++) {
        if (deliveries[pd].status !== 'delivered') {
            pendingDeliveries.push(deliveries[pd]);
        }
    }

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
            for (var li = 0; li < lowItems.length; li++) {
                lowHtml += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>⚠️ ' + escapeHtml(lowItems[li].name) + '</span><span style="color:var(--danger);font-weight:600;">' + lowItems[li].qty + ' left</span></div>';
            }
            lowContainer.innerHTML = lowHtml;
        }
    }
    
    var ctx = document.getElementById('salesChart') ? document.getElementById('salesChart').getContext('2d') : null;
    if (ctx) {
        var labels = [];
        var values = [];
        for (var d = 6; d >= 0; d--) {
            var dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - d);
            var key = dateObj.toISOString().slice(0, 10);
            labels.push(dateObj.toLocaleDateString('en', { weekday: 'short' }));
            var dayTotal = 0;
            for (var sd = 0; sd < salesData.length; sd++) {
                if (salesData[sd].date && salesData[sd].date.slice(0, 10) === key) {
                    dayTotal += (salesData[sd].total || 0);
                }
            }
            values.push(dayTotal);
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

    renderQuickActions();
}

function renderQuickActions() {
    var container = document.getElementById('quickActionsContainer');
    if (!container) return;
    var user = window.getCurrentUser();
    if (!user) {
        container.innerHTML = '<p class="text-muted" style="font-size:13px;">Login to see quick actions.</p>';
        return;
    }
    var role = user.role || 'employee';
    var actions = [];
    var actionMap = {
        superadmin: [
            { label: '👤 Add Employee', panel: 'employees', action: 'addEmployee' },
            { label: '📦 Add Item', panel: 'inventory', action: 'addItem' },
            { label: '👥 Add Customer', panel: 'customers', action: 'addCustomer' },
            { label: '📈 Reports', panel: 'reports', action: 'view' }
        ],
        admin: [
            { label: '👤 Add Employee', panel: 'employees', action: 'addEmployee' },
            { label: '📦 Add Item', panel: 'inventory', action: 'addItem' },
            { label: '👥 Add Customer', panel: 'customers', action: 'addCustomer' },
            { label: '📈 Reports', panel: 'reports', action: 'view' }
        ],
        hr: [
            { label: '👤 Add Employee', panel: 'employees', action: 'addEmployee' },
            { label: '⏱️ Attendance', panel: 'attendance', action: 'view' },
            { label: '🏖️ Leave', panel: 'leave', action: 'view' }
        ],
        finance: [
            { label: '💰 Add Finance Entry', panel: 'finance', action: 'addFinance' },
            { label: '🧾 Payroll', panel: 'payroll', action: 'view' },
            { label: '🧾 Voucher', panel: 'voucher', action: 'view' }
        ],
        sales: [
            { label: '👥 Add Customer', panel: 'customers', action: 'addCustomer' },
            { label: '🛒 New Sales Order', panel: 'sales', action: 'view' },
            { label: '🚚 Deliveries', panel: 'deliveries', action: 'view' }
        ],
        store: [
            { label: '📦 Add Item', panel: 'inventory', action: 'addItem' },
            { label: '📦 Purchasing', panel: 'purchasing', action: 'view' },
            { label: '📈 Reports', panel: 'reports', action: 'view' }
        ],
        delivery: [
            { label: '🚚 Deliveries', panel: 'deliveries', action: 'view' },
            { label: '⏱️ Attendance', panel: 'attendance', action: 'view' }
        ],
        employee: [
            { label: '⏱️ Attendance', panel: 'attendance', action: 'view' },
            { label: '🏖️ Leave', panel: 'leave', action: 'view' },
            { label: '🧾 Payroll', panel: 'payroll', action: 'view' }
        ]
    };
    actions = actionMap[role] || actionMap.employee || [];
    if (actions.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-size:13px;">No quick actions available.</p>';
        return;
    }
    var html = '';
    for (var a = 0; a < actions.length; a++) {
        html += '<button class="btn btn-outline btn-sm quick-action-btn" data-panel="' + actions[a].panel + '" data-action="' + (actions[a].action || 'view') + '">' + actions[a].label + '</button>';
    }
    container.innerHTML = html;
    
    var btns = container.querySelectorAll('.quick-action-btn');
    for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function() {
            var panel = this.dataset.panel;
            var action = this.dataset.action;
            if (action === 'addEmployee') {
                var btn = document.getElementById('addEmployeeBtn');
                if (btn) btn.click();
            } else if (action === 'addItem') {
                var btn2 = document.getElementById('addItemBtn');
                if (btn2) btn2.click();
            } else if (action === 'addCustomer') {
                var btn3 = document.getElementById('addCustomerBtn');
                if (btn3) btn3.click();
            } else if (action === 'addFinance') {
                switchPanel('finance');
                setTimeout(function() {
                    var el = document.getElementById('financeAmount');
                    if (el) el.focus();
                }, 300);
            } else {
                switchPanel(panel);
            }
        });
    }
}

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
    for (var i = logs.length - 1; i >= Math.max(0, logs.length - 50); i--) {
        var l = logs[i];
        html += '<tr><td>' + formatDateTime(l.date) + '</td><td>' + escapeHtml(l.user || 'System') + '</td><td>' + escapeHtml(l.action) + '</td><td>' + escapeHtml(l.details) + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderEmployees() {
    if (!window.canView('employees')) return;
    var data = getAppData();
    var employees = data.employees || [];
    var search = document.getElementById('empSearch') ? document.getElementById('empSearch').value.toLowerCase().trim() : '';
    var deptFilter = document.getElementById('empDeptFilter') ? document.getElementById('empDeptFilter').value : 'all';
    var statusFilter = document.getElementById('empStatusFilter') ? document.getElementById('empStatusFilter').value : 'all';
    
    var depts = [];
    for (var d = 0; d < employees.length; d++) {
        var dept = employees[d].department || 'Other';
        if (depts.indexOf(dept) === -1) depts.push(dept);
    }
    var deptSelect = document.getElementById('empDeptFilter');
    if (deptSelect) {
        var current = deptSelect.value;
        deptSelect.innerHTML = '<option value="all">All Depts</option>';
        for (var dp = 0; dp < depts.length; dp++) {
            deptSelect.innerHTML += '<option value="' + depts[dp] + '">' + depts[dp] + '</option>';
        }
        if (current && deptSelect.querySelector('option[value="' + current + '"]')) deptSelect.value = current;
    }
    
    var filtered = [];
    for (var e = 0; e < employees.length; e++) {
        var emp = employees[e];
        var matchName = (emp.name || '').toLowerCase().indexOf(search) !== -1;
        var matchDept = deptFilter === 'all' || emp.department === deptFilter;
        var matchStatus = statusFilter === 'all' || emp.status === statusFilter;
        if (matchName && matchDept && matchStatus) filtered.push(emp);
    }
    
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
    for (var f = 0; f < filtered.length; f++) {
        var em = filtered[f];
        var statusBadge = em.status === 'active' ? 'badge-success' : 'badge-danger';
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editEmployee(\'' + em.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteEmployee(\'' + em.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td>' + em.id.slice(0, 6) + '</td><td><strong>' + escapeHtml(em.name) + '</strong></td><td>' + escapeHtml(em.department || '—') + '</td><td>' + escapeHtml(em.designation || '—') + '</td><td><span class="badge ' + statusBadge + '">' + (em.status || 'active') + '</span></td><td class="text-center">' + actions + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderAttendance() {
    if (!window.canView('attendance')) return;
    var data = getAppData();
    var attendance = data.attendance || [];
    var user = window.getCurrentUser();
    var filtered = attendance;
    if (user && (user.role === 'employee' || user.role === 'hr')) {
        filtered = [];
        for (var a = 0; a < attendance.length; a++) {
            if (attendance[a].employeeId === user.uid) filtered.push(attendance[a]);
        }
    }
    var tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No records.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var html = '';
    for (var at = 0; at < filtered.length; at++) {
        var a = filtered[at];
        var hours = (a.checkIn && a.checkOut) ? ((new Date(a.checkOut) - new Date(a.checkIn)) / (1000 * 60 * 60)).toFixed(1) : '—';
        html += '<tr><td>' + formatDate(a.date) + '</td><td>' + (a.checkIn ? formatDateTime(a.checkIn) : '—') + '</td><td>' + (a.checkOut ? formatDateTime(a.checkOut) : '—') + '</td><td>' + hours + '</td><td><span class="badge badge-success">Present</span></td></tr>';
    }
    tbody.innerHTML = html;
}

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
            for (var e = 0; e < employees.length; e++) {
                select.innerHTML += '<option value="' + employees[e].id + '">' + escapeHtml(employees[e].name) + '</option>';
            }
            if (val && select.querySelector('option[value="' + val + '"]')) select.value = val;
            select.disabled = false;
        } else {
            var emp = null;
            for (var em = 0; em < employees.length; em++) {
                if (employees[em].id === user.uid) { emp = employees[em]; break; }
            }
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
        filtered = [];
        for (var lv = 0; lv < leaves.length; lv++) {
            if (leaves[lv].employeeId === user.uid) filtered.push(leaves[lv]);
        }
    }
    var tbody = document.getElementById('leaveTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No requests.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return new Date(b.from) - new Date(a.from); });
    var html = '';
    for (var lv2 = 0; lv2 < filtered.length; lv2++) {
        var l = filtered[lv2];
        var statusClass = l.status === 'approved' ? 'badge-success' : (l.status === 'rejected' ? 'badge-danger' : 'badge-warning');
        html += '<tr><td>' + escapeHtml(l.employeeName || '—') + '</td><td>' + l.type + '</td><td>' + formatDate(l.from) + '</td><td>' + formatDate(l.to) + '</td><td><span class="badge ' + statusClass + '">' + (l.status || 'pending') + '</span></td></tr>';
    }
    tbody.innerHTML = html;
}

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
            for (var e = 0; e < employees.length; e++) {
                select.innerHTML += '<option value="' + employees[e].id + '">' + escapeHtml(employees[e].name) + '</option>';
            }
            if (val && select.querySelector('option[value="' + val + '"]')) select.value = val;
            select.disabled = false;
        } else {
            var emp = null;
            for (var em = 0; em < employees.length; em++) {
                if (employees[em].id === user.uid) { emp = employees[em]; break; }
            }
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
        filtered = [];
        for (var p = 0; p < payroll.length; p++) {
            if (payroll[p].employeeId === user.uid) filtered.push(payroll[p]);
        }
    }
    var tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No records.</td></tr>';
        return;
    }
    filtered.sort(function(a, b) { return (b.month || '').localeCompare(a.month || ''); });
    var html = '';
    for (var pr = 0; pr < filtered.length; pr++) {
        var p = filtered[pr];
        var net = p.net || ((p.basic || 0) + (p.allowances || 0) + (p.ot || 0) - (p.deductions || 0));
        var epf = p.epf || ((p.basic || 0) * 0.08);
        var etf = p.etf || ((p.basic || 0) * 0.03);
        html += '<tr><td>' + escapeHtml(p.employeeName || '—') + '</td><td>' + (p.month || '—') + '</td><td>LKR ' + formatCurrency(p.basic || 0) + '</td><td>LKR ' + formatCurrency(p.allowances || 0) + '</td><td>LKR ' + formatCurrency(p.deductions || 0) + '</td><td>LKR ' + formatCurrency(epf) + '</td><td>LKR ' + formatCurrency(etf) + '</td><td><strong>LKR ' + formatCurrency(net) + '</strong></td></tr>';
    }
    tbody.innerHTML = html;
}

function renderInventory() {
    if (!window.canView('inventory')) return;
    var data = getAppData();
    var items = data.items || [];
    var search = document.getElementById('invSearch') ? document.getElementById('invSearch').value.toLowerCase().trim() : '';
    var catFilter = document.getElementById('invCatFilter') ? document.getElementById('invCatFilter').value : 'all';
    var sort = document.getElementById('invSort') ? document.getElementById('invSort').value : 'name';
    var cats = [];
    for (var c = 0; c < items.length; c++) {
        if (items[c].category && cats.indexOf(items[c].category) === -1) cats.push(items[c].category);
    }
    var catSelect = document.getElementById('invCatFilter');
    if (catSelect) {
        var val = catSelect.value;
        catSelect.innerHTML = '<option value="all">All Categories</option>';
        for (var ct = 0; ct < cats.length; ct++) {
            catSelect.innerHTML += '<option value="' + cats[ct] + '">' + cats[ct] + '</option>';
        }
        if (val && catSelect.querySelector('option[value="' + val + '"]')) catSelect.value = val;
    }
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var matchName = (it.name || '').toLowerCase().indexOf(search) !== -1;
        var matchBarcode = it.barcode && it.barcode.indexOf(search) !== -1;
        var matchCat = catFilter === 'all' || it.category === catFilter;
        if ((matchName || matchBarcode) && matchCat) filtered.push(it);
    }
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
    for (var inv = 0; inv < filtered.length; inv++) {
        var itm = filtered[inv];
        var qtyClass = (itm.qty || 0) <= 5 ? 'text-danger' : '';
        var statusBadge = itm.status === 'active' ? 'badge-success' : 'badge-danger';
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editItem(\'' + itm.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'' + itm.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><code>' + escapeHtml(itm.productCode || '—') + '</code></td><td><code>' + escapeHtml(itm.barcode || '—') + '</code></td><td><strong>' + escapeHtml(itm.name) + '</strong></td><td>' + escapeHtml(itm.category || '—') + '</td><td class="' + qtyClass + '">' + (itm.qty || 0) + '</td><td>LKR ' + formatCurrency(itm.price || 0) + '</td><td><span class="badge ' + statusBadge + '">' + (itm.status || 'active') + '</span></td><td class="text-center">' + actions + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderProducts() {
    if (!window.canView('inventory')) return;
    var data = getAppData();
    var categories = data.categories || [];
    var brands = data.brands || [];
    var items = data.items || [];

    var canEdit = window.canManage('inventory');
    var catHtml = '';
    for (var c = 0; c < categories.length; c++) {
        var removeBtn = canEdit ? '<span style="cursor:pointer;color:var(--danger);" onclick="removeCategory(\'' + categories[c] + '\')">✕</span>' : '';
        catHtml += '<span class="badge badge-info" style="margin:2px;">' + escapeHtml(categories[c]) + ' ' + removeBtn + '</span>';
    }
    document.getElementById('categoryChips').innerHTML = catHtml || '<span class="text-muted">None</span>';

    var brandHtml = '';
    for (var b = 0; b < brands.length; b++) {
        var removeBtn2 = canEdit ? '<span style="cursor:pointer;color:var(--danger);" onclick="removeBrand(\'' + brands[b] + '\')">✕</span>' : '';
        brandHtml += '<span class="badge badge-success" style="margin:2px;">' + escapeHtml(brands[b]) + ' ' + removeBtn2 + '</span>';
    }
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
            for (var s = 0; s < suppliers.length; s++) {
                html += '<tr><td>' + escapeHtml(suppliers[s].name) + '</td><td>' + escapeHtml(suppliers[s].contact) + '</td><td>' + escapeHtml(suppliers[s].address) + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteSupplier(\'' + suppliers[s].id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
            }
            tbody.innerHTML = html;
        }
    }
    var poTbody = document.getElementById('poTableBody');
    if (poTbody) {
        if (purchaseOrders.length === 0) {
            poTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No POs.</td></tr>';
        } else {
            var poHtml = '';
            for (var po = 0; po < purchaseOrders.length; po++) {
                poHtml += '<tr><td>' + escapeHtml(purchaseOrders[po].supplierName) + '</td><td>' + escapeHtml(purchaseOrders[po].itemName) + '</td><td>' + purchaseOrders[po].qty + '</td><td>LKR ' + formatCurrency(purchaseOrders[po].price) + '</td><td><span class="badge badge-warning">Pending</span></td></tr>';
            }
            poTbody.innerHTML = poHtml;
        }
    }
    var supSelect = document.getElementById('poSupplierSelect');
    if (supSelect) {
        var val = supSelect.value;
        supSelect.innerHTML = '<option value="">Select</option>';
        for (var sp = 0; sp < suppliers.length; sp++) {
            supSelect.innerHTML += '<option value="' + suppliers[sp].id + '">' + escapeHtml(suppliers[sp].name) + '</option>';
        }
        if (val && supSelect.querySelector('option[value="' + val + '"]')) supSelect.value = val;
    }
    var itemSelect = document.getElementById('poItemSelect');
    if (itemSelect) {
        var val2 = itemSelect.value;
        itemSelect.innerHTML = '<option value="">Select</option>';
        var items = data.items || [];
        for (var it = 0; it < items.length; it++) {
            itemSelect.innerHTML += '<option value="' + items[it].id + '">' + escapeHtml(items[it].name) + '</option>';
        }
        if (val2 && itemSelect.querySelector('option[value="' + val2 + '"]')) itemSelect.value = val2;
    }
}

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
        for (var c = 0; c < customers.length; c++) {
            custSelect.innerHTML += '<option value="' + customers[c].id + '">' + escapeHtml(customers[c].name) + '</option>';
        }
        if (val && custSelect.querySelector('option[value="' + val + '"]')) custSelect.value = val;
    }

    var cartItemSelect = document.getElementById('salesCartItemSelect');
    if (cartItemSelect) {
        var val2 = cartItemSelect.value;
        cartItemSelect.innerHTML = '<option value="">Select Item</option>';
        for (var i = 0; i < items.length; i++) {
            if (items[i].status === 'inactive') continue;
            cartItemSelect.innerHTML += '<option value="' + items[i].id + '">' + escapeHtml(items[i].name) + ' (' + (items[i].qty || 0) + ' available) - LKR ' + formatCurrency(items[i].price || 0) + '</option>';
        }
        if (val2 && cartItemSelect.querySelector('option[value="' + val2 + '"]')) cartItemSelect.value = val2;
    }

    renderSalesCart();

    var tbody = document.getElementById('salesOrderTableBody');
    if (tbody) {
        if (salesOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders.</td></tr>';
        } else {
            var html = '';
            for (var so = salesOrders.length - 1; so >= 0; so--) {
                var o = salesOrders[so];
                var itemCount = o.items ? o.items.length : 0;
                html += '<tr><td><strong>#' + (o.orderNo || o.id.slice(0, 6)) + '</strong></td><td>' + formatDate(o.date) + '</td><td>' + escapeHtml(o.customerName) + '</td><td>' + itemCount + ' items</td><td><strong>LKR ' + formatCurrency(o.total) + '</strong></td><td><span class="badge badge-success">Completed</span></td></tr>';
            }
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
    for (var i = 0; i < salesCart.length; i++) {
        var item = salesCart[i];
        var total = item.qty * item.price;
        grandTotal += total;
        html += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + item.qty + '</td><td>LKR ' + formatCurrency(item.price) + '</td><td>LKR ' + formatCurrency(total) + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="removeFromSalesCart(' + i + ')"><i class="fas fa-trash"></i></button></td></tr>';
    }
    tbody.innerHTML = html;
    if (totalEl) totalEl.textContent = 'LKR ' + formatCurrency(grandTotal);
}
window.removeFromSalesCart = function(index) { salesCart.splice(index, 1); renderSalesCart(); };

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
        var items = data.items || [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].status === 'inactive') continue;
            cartItemSelect.innerHTML += '<option value="' + items[i].id + '">' + escapeHtml(items[i].name) + ' (' + (items[i].qty || 0) + ' available)</option>';
        }
        if (val && cartItemSelect.querySelector('option[value="' + val + '"]')) cartItemSelect.value = val;
    }

    var dateFilter = document.getElementById('delDateFilter') ? document.getElementById('delDateFilter').value : '';
    var statusFilter = document.getElementById('delStatusFilter') ? document.getElementById('delStatusFilter').value : 'all';
    var filtered = data.deliveries || [];
    if (dateFilter) {
        var newFiltered = [];
        for (var df = 0; df < filtered.length; df++) {
            if (filtered[df].date && filtered[df].date.slice(0, 10) === dateFilter) {
                newFiltered.push(filtered[df]);
            }
        }
        filtered = newFiltered;
    }
    if (statusFilter !== 'all') {
        var newFiltered2 = [];
        for (var sf = 0; sf < filtered.length; sf++) {
            if (filtered[sf].status === statusFilter) newFiltered2.push(filtered[sf]);
        }
        filtered = newFiltered2;
    }
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
    for (var d = 0; d < filtered.length; d++) {
        var del = filtered[d];
        var itemsCount = del.items ? del.items.length : 0;
        var statusHtml = '';
        if (canUpdate) {
            statusHtml = '<select class="delivery-status-select" data-id="' + del.id + '" style="padding:4px 8px; border-radius:6px; border:2px solid var(--border); font-size:12px;">' +
                '<option value="pending" ' + (del.status === 'pending' ? 'selected' : '') + '>Pending</option>' +
                '<option value="in-progress" ' + (del.status === 'in-progress' ? 'selected' : '') + '>In-Progress</option>' +
                '<option value="delivered" ' + (del.status === 'delivered' ? 'selected' : '') + '>Delivered</option>' +
                '<option value="cancelled" ' + (del.status === 'cancelled' ? 'selected' : '') + '>Cancelled</option>' +
                '</select>';
        } else {
            statusHtml = '<span class="badge ' + (statusColors[del.status] || 'badge-warning') + '">' + (del.status || 'pending') + '</span>';
        }
        html += '<tr><td>' + formatDate(del.date) + '</td><td>' + escapeHtml(del.customerName || '—') + '</td><td>' + itemsCount + ' items</td><td>' + escapeHtml(del.driverName || '—') + '</td><td>' + escapeHtml(del.vehicleNo || '—') + '</td><td>' + statusHtml + '</td><td class="text-center"><button class="btn btn-sm btn-outline" onclick="viewDeliveryDetails(\'' + del.id + '\')"><i class="fas fa-eye"></i></button></td></tr>';
    }
    tbody.innerHTML = html;

    var selects = document.querySelectorAll('.delivery-status-select');
    for (var sl = 0; sl < selects.length; sl++) {
        selects[sl].removeEventListener('change', handleStatusChange);
        selects[sl].addEventListener('change', handleStatusChange);
    }

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
    var delivery = null;
    for (var d = 0; d < data.deliveries.length; d++) {
        if (data.deliveries[d].id === id) { delivery = data.deliveries[d]; break; }
    }
    if (!delivery) { showToast('Delivery not found.', 'error'); return; }
    delivery.status = status;
    delivery.updatedAt = nowISO();
    setAppData(data);
    await saveAllData();
    renderDeliveries();
    showToast('Status updated to: ' + status);
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
    for (var i = 0; i < deliveryCart.length; i++) {
        var item = deliveryCart[i];
        html += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + item.qty + '</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="removeFromDeliveryCart(' + i + ')"><i class="fas fa-trash"></i></button></td></tr>';
    }
    tbody.innerHTML = html;
}
window.removeFromDeliveryCart = function(index) { deliveryCart.splice(index, 1); renderDeliveryCart(); };

window.viewDeliveryDetails = function(id) {
    var data = getAppData();
    var delivery = null;
    for (var d = 0; d < data.deliveries.length; d++) {
        if (data.deliveries[d].id === id) { delivery = data.deliveries[d]; break; }
    }
    if (!delivery) { showToast('Not found.', 'error'); return; }
    var items = delivery.items ? delivery.items.map(function(i) { return i.name + ' x' + i.qty; }).join(', ') : '—';
    showToast('📦 ' + delivery.customerName + ' | Items: ' + items + ' | Status: ' + delivery.status, 'info');
};

function renderCustomers() {
    if (!window.canView('customers')) return;
    var data = getAppData();
    var customers = data.customers || [];
    var search = document.getElementById('custSearch') ? document.getElementById('custSearch').value.toLowerCase().trim() : '';
    var filtered = [];
    for (var c = 0; c < customers.length; c++) {
        if ((customers[c].name || '').toLowerCase().indexOf(search) !== -1) {
            filtered.push(customers[c]);
        }
    }
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
    for (var f = 0; f < filtered.length; f++) {
        var c = filtered[f];
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editCustomer(\'' + c.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteCustomer(\'' + c.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><strong>' + escapeHtml(c.name) + '</strong></td><td>' + escapeHtml(c.contact || '—') + '</td><td>LKR ' + formatCurrency(c.creditLimit || 0) + '</td><td>LKR ' + formatCurrency(c.balance || 0) + '</td><td class="text-center">' + actions + '</td></tr>';
    }
    tbody.innerHTML = html;
}

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
        for (var f = 0; f < finance.length; f++) {
            var fin = finance[f];
            var methodDisplay = fin.paymentMethod || 'cash';
            if (methodDisplay === 'cheque' && fin.chequeNo) {
                methodDisplay = 'Cheque #' + fin.chequeNo;
            }
            var typeBadge = fin.type === 'income' ? 'badge-success' : 'badge-danger';
            var sign = fin.type === 'income' ? '+' : '-';
            html += '<tr><td>' + formatDate(fin.date) + '</td><td><span class="badge ' + typeBadge + '">' + fin.type + '</span></td><td>' + escapeHtml(fin.category || '—') + '</td><td>' + escapeHtml(methodDisplay) + '</td><td>' + escapeHtml(fin.desc || '—') + '</td><td>' + sign + ' LKR ' + formatCurrency(fin.amount || 0) + '</td></tr>';
        }
        tbody.innerHTML = html;
    }

    var totalIncome = 0;
    for (var inc = 0; inc < finance.length; inc++) {
        if (finance[inc].type === 'income') totalIncome += (finance[inc].amount || 0);
    }
    var totalExpense = 0;
    for (var exp = 0; exp < finance.length; exp++) {
        if (finance[exp].type === 'expense') totalExpense += (finance[exp].amount || 0);
    }
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
                    var actual = 0;
                    for (var f2 = 0; f2 < finance.length; f2++) {
                        if (finance[f2].category === cat && finance[f2].type === 'expense') {
                            actual += (finance[f2].amount || 0);
                        }
                    }
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
    for (var v = vouchers.length - 1; v >= 0; v--) {
        var voucher = vouchers[v];
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-danger" onclick="deleteVoucher(\'' + voucher.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        var paymentTypes = voucher.paymentTypes ? voucher.paymentTypes.join(', ') : '—';
        html += '<tr><td><strong>' + escapeHtml(voucher.voucherNo || '—') + '</strong></td><td>' + formatDate(voucher.date) + '</td><td>' + escapeHtml(voucher.paidTo || '—') + '</td><td>LKR ' + formatCurrency(voucher.amount || 0) + '</td><td>' + escapeHtml(paymentTypes) + '</td><td><span class="badge badge-success">Paid</span></td><td class="text-center">' + actions + '</td></tr>';
    }
    tbody.innerHTML = html;
}
window.deleteVoucher = async function(id) {
    if (!confirm('Delete?')) return;
    var data = getAppData();
    var newVouchers = [];
    for (var v = 0; v < data.vouchers.length; v++) {
        if (data.vouchers[v].id !== id) newVouchers.push(data.vouchers[v]);
    }
    data.vouchers = newVouchers;
    setAppData(data);
    await saveAllData();
    renderVouchers();
    showToast('Removed.');
};

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
    for (var v = 0; v < vehicles.length; v++) {
        var veh = vehicles[v];
        var actions = '—';
        if (canEdit) {
            actions = '<button class="btn btn-sm btn-outline" onclick="editVehicle(\'' + veh.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteVehicle(\'' + veh.id + '\')"><i class="fas fa-trash"></i></button>';
        }
        html += '<tr><td><strong>' + escapeHtml(veh.vehicleNo || '—') + '</strong></td><td>' + escapeHtml(veh.driver || '—') + '</td><td>' + escapeHtml(veh.fuel || '—') + '</td><td>' + escapeHtml(veh.insurance || '—') + '</td><td>' + (veh.service ? formatDate(veh.service) : '—') + '</td><td><span class="badge badge-success">Active</span></td><td class="text-center">' + actions + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderReports() {
    if (!window.canView('reports')) return;
    var type = document.getElementById('reportType') ? document.getElementById('reportType').value : 'stock';
    var from = document.getElementById('reportFrom') ? document.getElementById('reportFrom').value : '';
    var to = document.getElementById('reportTo') ? document.getElementById('reportTo').value : '';
    var container = document.getElementById('reportContent');
    var data = getAppData();
    var html = '';

    function filterByDate(arr, field) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i][field]) { result.push(arr[i]); continue; }
            var d = arr[i][field].slice(0, 10);
            if (from && d < from) continue;
            if (to && d > to) continue;
            result.push(arr[i]);
        }
        return result;
    }

    switch (type) {
        case 'stock': {
            var items = filterByDate(data.items || [], 'updatedAt');
            if (items.length === 0) {
                html = '<div class="text-muted text-center">No data.</div>';
            } else {
                var stockHtml = '<table><thead><tr><th>Code</th><th>Item</th><th>Category</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead><tbody>';
                for (var i = 0; i < items.length; i++) {
                    var it = items[i];
                    stockHtml += '<tr><td>' + escapeHtml(it.productCode || '—') + '</td><td>' + escapeHtml(it.name) + '</td><td>' + escapeHtml(it.category || '—') + '</td><td>' + (it.qty || 0) + '</td><td>LKR ' + formatCurrency(it.price || 0) + '</td><td>LKR ' + formatCurrency((it.qty || 0) * (it.price || 0)) + '</td></tr>';
                }
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
                var total = 0;
                for (var s = 0; s < sales.length; s++) total += (sales[s].total || 0);
                var salesHtml = '<table><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>';
                for (var s2 = 0; s2 < sales.length; s2++) {
                    var sl = sales[s2];
                    salesHtml += '<tr><td>' + formatDate(sl.date) + '</td><td>' + escapeHtml(sl.customer || '—') + '</td><td>' + escapeHtml(sl.item || '—') + '</td><td>' + (sl.qty || 0) + '</td><td>LKR ' + formatCurrency(sl.total || 0) + '</td></tr>';
                }
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
                for (var a = 0; a < att.length; a++) {
                    var at = att[a];
                    attHtml += '<tr><td>' + formatDate(at.date) + '</td><td>' + escapeHtml(at.employeeName || '—') + '</td><td>' + (at.checkIn ? formatDateTime(at.checkIn) : '—') + '</td><td>' + (at.checkOut ? formatDateTime(at.checkOut) : '—') + '</td></tr>';
                }
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
                for (var p = 0; p < pay.length; p++) {
                    var pr = pay[p];
                    var net = pr.net || ((pr.basic || 0) + (pr.allowances || 0) + (pr.ot || 0) - (pr.deductions || 0));
                    var epf = pr.epf || ((pr.basic || 0) * 0.08);
                    var etf = pr.etf || ((pr.basic || 0) * 0.03);
                    payHtml += '<tr><td>' + escapeHtml(pr.employeeName || '—') + '</td><td>' + (pr.month || '—') + '</td><td>LKR ' + formatCurrency(pr.basic || 0) + '</td><td>LKR ' + formatCurrency(pr.allowances || 0) + '</td><td>LKR ' + formatCurrency(pr.deductions || 0) + '</td><td>LKR ' + formatCurrency(epf) + '</td><td>LKR ' + formatCurrency(etf) + '</td><td><strong>LKR ' + formatCurrency(net) + '</strong></td></tr>';
                }
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
                for (var c = 0; c < cust.length; c++) {
                    var cu = cust[c];
                    custHtml += '<tr><td>' + escapeHtml(cu.name) + '</td><td>' + escapeHtml(cu.contact || '—') + '</td><td>' + escapeHtml(cu.category || 'Retail') + '</td><td>LKR ' + formatCurrency(cu.creditLimit || 0) + '</td><td>LKR ' + formatCurrency(cu.balance || 0) + '</td></tr>';
                }
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
                for (var p = 0; p < po.length; p++) {
                    var por = po[p];
                    poHtml += '<tr><td>' + escapeHtml(por.supplierName) + '</td><td>' + escapeHtml(por.itemName) + '</td><td>' + por.qty + '</td><td>LKR ' + formatCurrency(por.price) + '</td><td><span class="badge badge-warning">Pending</span></td></tr>';
                }
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
                var inc = 0, exp = 0;
                for (var f = 0; f < fin.length; f++) {
                    if (fin[f].type === 'income') inc += (fin[f].amount || 0);
                    else exp += (fin[f].amount || 0);
                }
                var finHtml = '<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Method</th><th>Description</th><th>Amount</th></tr></thead><tbody>';
                for (var f2 = 0; f2 < fin.length; f2++) {
                    var fn = fin[f2];
                    finHtml += '<tr><td>' + formatDate(fn.date) + '</td><td><span class="badge ' + (fn.type === 'income' ? 'badge-success' : 'badge-danger') + '">' + fn.type + '</span></td><td>' + escapeHtml(fn.category || '—') + '</td><td>' + escapeHtml(fn.paymentMethod || 'cash') + '</td><td>' + escapeHtml(fn.desc || '—') + '</td><td>' + (fn.type === 'income' ? '+' : '-') + ' LKR ' + formatCurrency(fn.amount || 0) + '</td></tr>';
                }
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
    var emp = null;
    for (var e = 0; e < data.employees.length; e++) {
        if (data.employees[e].id === id) { emp = data.employees[e]; break; }
    }
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
    var newEmployees = [];
    for (var e = 0; e < data.employees.length; e++) {
        if (data.employees[e].id !== id) newEmployees.push(data.employees[e]);
    }
    data.employees = newEmployees;
    if (data.leaveBalances) delete data.leaveBalances[id];
    setAppData(data);
    await saveAllData();
    renderEmployees();
    showToast('Employee removed.');
};

window.editItem = function(id) {
    var data = getAppData();
    var item = null;
    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].id === id) { item = data.items[i]; break; }
    }
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
    var newItems = [];
    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].id !== id) newItems.push(data.items[i]);
    }
    data.items = newItems;
    setAppData(data);
    await saveAllData();
    renderInventory();
    showToast('Item removed.');
};

window.editCustomer = function(id) {
    var data = getAppData();
    var c = null;
    for (var cu = 0; cu < data.customers.length; cu++) {
        if (data.customers[cu].id === id) { c = data.customers[cu]; break; }
    }
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
    var newCustomers = [];
    for (var c = 0; c < data.customers.length; c++) {
        if (data.customers[c].id !== id) newCustomers.push(data.customers[c]);
    }
    data.customers = newCustomers;
    setAppData(data);
    await saveAllData();
    renderCustomers();
    showToast('Customer removed.');
};

window.editVehicle = function(id) {
    var data = getAppData();
    var v = null;
    for (var ve = 0; ve < data.vehicles.length; ve++) {
        if (data.vehicles[ve].id === id) { v = data.vehicles[ve]; break; }
    }
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
    showToast('Editing vehicle. Update and save.');
};

window.deleteVehicle = async function(id) {
    if (!confirm('Delete this vehicle?')) return;
    var data = getAppData();
    var newVehicles = [];
    for (var v = 0; v < data.vehicles.length; v++) {
        if (data.vehicles[v].id !== id) newVehicles.push(data.vehicles[v]);
    }
    data.vehicles = newVehicles;
    setAppData(data);
    await saveAllData();
    renderFleet();
    showToast('Vehicle removed.');
};

window.deleteSupplier = async function(id) {
    if (!confirm('Delete supplier?')) return;
    var data = getAppData();
    var newSuppliers = [];
    for (var s = 0; s < data.suppliers.length; s++) {
        if (data.suppliers[s].id !== id) newSuppliers.push(data.suppliers[s]);
    }
    data.suppliers = newSuppliers;
    setAppData(data);
    await saveAllData();
    renderPurchasing();
    showToast('Supplier removed.');
};

window.removeCategory = async function(cat) {
    if (!confirm('Remove category "' + cat + '"?')) return;
    var data = getAppData();
    var newCategories = [];
    for (var c = 0; c < data.categories.length; c++) {
        if (data.categories[c] !== cat) newCategories.push(data.categories[c]);
    }
    data.categories = newCategories;
    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].category === cat) data.items[i].category = '';
    }
    setAppData(data);
    await saveAllData();
    renderProducts();
    renderInventory();
    showToast('Removed "' + cat + '"');
};

window.removeBrand = async function(brand) {
    if (!confirm('Remove brand "' + brand + '"?')) return;
    var data = getAppData();
    var newBrands = [];
    for (var b = 0; b < data.brands.length; b++) {
        if (data.brands[b] !== brand) newBrands.push(data.brands[b]);
    }
    data.brands = newBrands;
    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].brand === brand) data.items[i].brand = '';
    }
    setAppData(data);
    await saveAllData();
    renderProducts();
    showToast('Removed "' + brand + '"');
};

// ============================================================
// EXPOSE CART ARRAYS GLOBALLY
// ============================================================
window.salesCart = salesCart;
window.deliveryCart = deliveryCart;

// ============================================================
// END OF FILE
// ============================================================
