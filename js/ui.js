// ============================================================
// UI RENDERING MODULE (Enterprise)
// ============================================================

const ALL_NAV_ITEMS = [
    // Core
    { id: 'dashboard', icon: '📊', label: 'Dashboard', group: 'Main' },
    // Admin
    { id: 'administration', icon: '🏢', label: 'Administration', group: 'Admin' },
    // HR
    { id: 'employees', icon: '👤', label: 'Employees', group: 'HR' },
    { id: 'attendance', icon: '⏱️', label: 'Attendance', group: 'HR' },
    { id: 'leave', icon: '🏖️', label: 'Leave', group: 'HR' },
    { id: 'payroll', icon: '💰', label: 'Payroll', group: 'HR' },
    // Inventory
    { id: 'inventory', icon: '📋', label: 'Inventory', group: 'Store' },
    { id: 'products', icon: '🏷️', label: 'Products', group: 'Store' },
    { id: 'purchasing', icon: '📦', label: 'Purchasing', group: 'Store' },
    // Sales
    { id: 'sales', icon: '🛒', label: 'Sales Orders', group: 'Sales' },
    { id: 'customers', icon: '👥', label: 'Customers', group: 'Sales' },
    // Distribution
    { id: 'deliveries', icon: '🚚', label: 'Deliveries', group: 'Distribution' },
    { id: 'fleet', icon: '🚗', label: 'Fleet', group: 'Distribution' },
    // Finance
    { id: 'finance', icon: '💳', label: 'Finance', group: 'Finance' },
    { id: 'voucher', icon: '🧾', label: 'Vouchers', group: 'Finance' },
    // Reports & Settings
    { id: 'reports', icon: '📈', label: 'Reports', group: 'Reports' },
    { id: 'settings', icon: '⚙️', label: 'Settings', group: 'Settings' }
];

let currentLang = 'en';

function renderSidebar() {
    const container = document.getElementById('sidebarNav');
    if (!container) return;
    const user = window.getCurrentUser();
    const role = user?.role || 'superadmin';
    const roleConfig = window.ROLES?.[role] || window.ROLES?.superadmin || { nav: ['dashboard'] };
    const allowedIds = roleConfig?.nav || ['dashboard'];
    
    let html = '';
    const groups = ['Main', 'Admin', 'HR', 'Store', 'Sales', 'Distribution', 'Finance', 'Reports', 'Settings'];
    groups.forEach(group => {
        const items = ALL_NAV_ITEMS.filter(item => item.group === group && allowedIds.includes(item.id));
        if (items.length === 0) return;
        html += `<div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); padding:8px 12px 4px; font-weight:700; letter-spacing:0.5px;">${group}</div>`;
        items.forEach(item => {
            const label = currentLang === 'si' && item.labelSI ? item.labelSI : item.label;
            html += `<button class="nav-item" data-panel="${item.id}"><span class="icon">${item.icon}</span>${label}</button>`;
        });
    });
    container.innerHTML = html;

    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
        const id = activePanel.id.replace('panel-', '');
        container.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.panel === id));
    }
    container.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => switchPanel(b.dataset.panel)));
}

function switchPanel(id) {
    const user = window.getCurrentUser();
    if (!user) { showToast('Login first.', 'error'); return; }
    const navItem = ALL_NAV_ITEMS.find(n => n.id === id);
    if (!window.canView(navItem?.id || id)) { showAccessDenied(id); return; }
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.panel === id));
    const found = ALL_NAV_ITEMS.find(n => n.id === id);
    if (found) document.getElementById('pageTitle').textContent = found.label;
    // Render logic
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
    document.getElementById('sidebar')?.classList.remove('open');
}

function showAccessDenied(module) {
    const panel = document.getElementById('panel-' + module);
    if(panel) { panel.innerHTML = `<div class="card" style="text-align:center;padding:40px;"><div style="font-size:60px;">⛔</div><h3>Access Denied</h3><button class="btn btn-primary mt-2" onclick="switchPanel('dashboard')">Go to Dashboard</button></div>`; panel.classList.add('active'); }
}

// ---- DASHBOARD (Reused) ----
let salesChartInstance = null;
function renderDashboard() {
    const data = getAppData();
    const items = data.items || []; const employees = data.employees || []; const deliveries = data.deliveries || []; const salesData = data.salesData || [];
    const totalItems = items.length; const totalQty = items.reduce((s,i) => s+(i.qty||0),0); const lowItems = items.filter(i => (i.qty||0)<=5 && i.status !== 'inactive');
    const totalValue = items.reduce((s,i) => s+((i.qty||0)*(i.price||0)),0);
    const today = new Date().toISOString().slice(0,10);
    const todayDeliveries = deliveries.filter(d => d.date && d.date.slice(0,10) === today);
    const todaySales = salesData.filter(s => s.date && s.date.slice(0,10) === today);
    const salesTotal = todaySales.reduce((s,d) => s+(d.total||0),0);
    const pendingDeliveries = deliveries.filter(d => d.status !== 'delivered');

    const statsContainer = document.getElementById('dashStats');
    if(statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-box blue"><div class="num">${totalItems}</div><div class="label">Total Items</div></div>
            <div class="stat-box green"><div class="num">${totalQty}</div><div class="label">Total Stock</div></div>
            <div class="stat-box red"><div class="num">${lowItems.length}</div><div class="label">Low Stock</div></div>
            <div class="stat-box purple"><div class="num">${employees.length}</div><div class="label">Employees</div></div>
            <div class="stat-box teal"><div class="num">${todayDeliveries.length}</div><div class="label">Today Deliveries</div></div>
            <div class="stat-box orange"><div class="num">LKR ${formatCurrency(totalValue)}</div><div class="label">Inventory Value</div></div>
            <div class="stat-box blue"><div class="num">LKR ${formatCurrency(salesTotal)}</div><div class="label">Today Sales</div></div>
            <div class="stat-box red"><div class="num">${pendingDeliveries.length}</div><div class="label">Pending Del.</div></div>
        `;
    }
    const lowContainer = document.getElementById('dashLowStockList');
    if(lowContainer) {
        if(lowItems.length === 0) lowContainer.innerHTML = `<div class="empty-state"><span class="icon">✅</span><p>All items well-stocked.</p></div>`;
        else lowContainer.innerHTML = lowItems.map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>⚠️ ${escapeHtml(i.name)}</span><span style="color:var(--danger);font-weight:600;">${i.qty} left</span></div>`).join('');
    }
    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if(ctx) {
        const labels=[]; const values=[];
        for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const key=d.toISOString().slice(0,10); labels.push(d.toLocaleDateString('en',{weekday:'short'})); const daySales = salesData.filter(s => s.date && s.date.slice(0,10) === key); values.push(daySales.reduce((s,item)=>s+(item.total||0),0)); }
        if(salesChartInstance) salesChartInstance.destroy();
        salesChartInstance = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Sales (LKR)', data:values, backgroundColor:'rgba(59,130,246,0.7)', borderColor:'#3b82f6', borderWidth:2, borderRadius:6 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true} } } });
    }
}

// ---- ADMINISTRATION ----
function renderAdministration() {
    const data = getAppData();
    const logs = data.logs || [];
    const tbody = document.getElementById('logsTableBody');
    if(!tbody) return;
    if(logs.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No logs.</td></tr>`; return; }
    tbody.innerHTML = logs.slice().reverse().slice(0,50).map(l => `<tr><td>${formatDateTime(l.date)}</td><td>${escapeHtml(l.user||'System')}</td><td>${escapeHtml(l.action)}</td><td>${escapeHtml(l.details)}</td></tr>`).join('');
}

// ---- EMPLOYEES ----
function renderEmployees() {
    if(!window.canView('employees')) return;
    const data = getAppData(); const employees = data.employees || [];
    const search = document.getElementById('empSearch')?.value.toLowerCase().trim() || '';
    const deptFilter = document.getElementById('empDeptFilter')?.value || 'all';
    const statusFilter = document.getElementById('empStatusFilter')?.value || 'all';
    const depts = [...new Set(employees.map(e => e.department || 'Other'))];
    const deptSelect = document.getElementById('empDeptFilter');
    if(deptSelect) { const current = deptSelect.value; deptSelect.innerHTML = '<option value="all">All Depts</option>' + depts.map(d => `<option value="${d}">${d}</option>`).join(''); if(current && [...deptSelect.options].some(o=>o.value===current)) deptSelect.value = current; }
    let filtered = employees.filter(e => (e.name||'').toLowerCase().includes(search) && (deptFilter==='all'||e.department===deptFilter) && (statusFilter==='all'||e.status===statusFilter));
    document.getElementById('empCount').textContent = filtered.length;
    const tbody = document.getElementById('employeeTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No employees.</td></tr>`; return; }
    const canEdit = window.canManage('employees');
    tbody.innerHTML = filtered.map(e => `<tr><td>${e.id.slice(0,6)}</td><td><strong>${escapeHtml(e.name)}</strong></td><td>${escapeHtml(e.department||'—')}</td><td>${escapeHtml(e.designation||'—')}</td><td><span class="badge ${e.status==='active'?'badge-success':'badge-danger'}">${e.status||'active'}</span></td><td class="text-center">${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editEmployee('${e.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e.id}')"><i class="fas fa-trash"></i></button>` : '—'}</td></tr>`).join('');
}

// ---- ATTENDANCE ----
function renderAttendance() {
    if(!window.canView('attendance')) return;
    const data = getAppData(); const attendance = data.attendance || [];
    const user = window.getCurrentUser();
    let filtered = attendance;
    if(user?.role === 'employee' || user?.role === 'hr') filtered = attendance.filter(a => a.employeeId === user.uid);
    const tbody = document.getElementById('attendanceTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No records.</td></tr>`; return; }
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    tbody.innerHTML = filtered.map(a => { const hours = a.checkIn && a.checkOut ? ((new Date(a.checkOut)-new Date(a.checkIn))/(1000*60*60)).toFixed(1) : '—'; return `<tr><td>${formatDate(a.date)}</td><td>${a.checkIn?formatDateTime(a.checkIn):'—'}</td><td>${a.checkOut?formatDateTime(a.checkOut):'—'}</td><td>${hours}</td><td><span class="badge badge-success">Present</span></td></tr>`; }).join('');
}

// ---- LEAVE ----
function renderLeave() {
    if(!window.canView('leave')) return;
    const data = getAppData(); const employees = data.employees || []; const leaves = data.leaves || [];
    const user = window.getCurrentUser();
    // Balance
    const balances = data.leaveBalances || {};
    let empId = user.uid;
    const emp = employees.find(e => e.id === empId);
    const bal = balances[empId] || { sick:0, casual:0, annual:0 };
    document.getElementById('lbSick').textContent = bal.sick || 0;
    document.getElementById('lbCasual').textContent = bal.casual || 0;
    document.getElementById('lbAnnual').textContent = bal.annual || 0;
    // Select
    const select = document.getElementById('leaveEmployeeSelect');
    const canManageLeave = window.canManage('leave') || window.canManage('employees');
    if(canManageLeave) { const val = select.value; select.innerHTML = '<option value="">-- Select --</option>' + employees.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join(''); if(val) select.value = val; select.disabled = false; }
    else { const emp = employees.find(e => e.id === user.uid); if(emp) { select.innerHTML = `<option value="${emp.id}">${escapeHtml(emp.name)}</option>`; select.value = emp.id; } select.disabled = true; }
    let filtered = leaves;
    if(!canManageLeave) filtered = leaves.filter(l => l.employeeId === user.uid);
    const tbody = document.getElementById('leaveTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No requests.</td></tr>`; return; }
    filtered.sort((a,b) => new Date(b.from) - new Date(a.from));
    tbody.innerHTML = filtered.map(l => `<tr><td>${escapeHtml(l.employeeName||'—')}</td><td>${l.type}</td><td>${formatDate(l.from)}</td><td>${formatDate(l.to)}</td><td><span class="badge ${l.status==='approved'?'badge-success':l.status==='rejected'?'badge-danger':'badge-warning'}">${l.status||'pending'}</span></td></tr>`).join('');
}

// ---- PAYROLL ----
function renderPayroll() {
    if(!window.canView('payroll')) return;
    const data = getAppData(); const employees = data.employees || []; const payroll = data.payroll || [];
    const user = window.getCurrentUser();
    const select = document.getElementById('payrollEmployeeSelect');
    const canManagePayroll = window.canManage('payroll');
    if(canManagePayroll) { const val = select.value; select.innerHTML = '<option value="">-- Select --</option>' + employees.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join(''); if(val) select.value = val; select.disabled = false; }
    else { const emp = employees.find(e => e.id === user.uid); if(emp) { select.innerHTML = `<option value="${emp.id}">${escapeHtml(emp.name)}</option>`; select.value = emp.id; } select.disabled = true; }
    let filtered = payroll;
    if(!canManagePayroll) filtered = payroll.filter(p => p.employeeId === user.uid);
    const tbody = document.getElementById('payrollTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No records.</td></tr>`; return; }
    filtered.sort((a,b) => (b.month||'').localeCompare(a.month||''));
    tbody.innerHTML = filtered.map(p => { const net = p.net || ((p.basic||0)+(p.allowances||0)+(p.ot||0)-(p.deductions||0)); const epf = p.epf || ((p.basic||0)*0.08); const etf = p.etf || ((p.basic||0)*0.03); return `<tr><td>${escapeHtml(p.employeeName||'—')}</td><td>${p.month||'—'}</td><td>LKR ${formatCurrency(p.basic||0)}</td><td>LKR ${formatCurrency(p.allowances||0)}</td><td>LKR ${formatCurrency(p.deductions||0)}</td><td>LKR ${formatCurrency(epf)}</td><td>LKR ${formatCurrency(etf)}</td><td><strong>LKR ${formatCurrency(net)}</strong></td></tr>`; }).join('');
}

// ---- INVENTORY ----
function renderInventory() {
    if(!window.canView('inventory')) return;
    const data = getAppData(); const items = data.items || [];
    const search = document.getElementById('invSearch')?.value.toLowerCase().trim() || '';
    const catFilter = document.getElementById('invCatFilter')?.value || 'all';
    const sort = document.getElementById('invSort')?.value || 'name';
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    const catSelect = document.getElementById('invCatFilter');
    if(catSelect) { const val = catSelect.value; catSelect.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join(''); if(val) catSelect.value = val; }
    let filtered = items.filter(i => ((i.name||'').toLowerCase().includes(search) || (i.barcode||'').includes(search)) && (catFilter==='all'||i.category===catFilter));
    filtered.sort((a,b) => { if(sort==='qty') return (a.qty||0)-(b.qty||0); if(sort==='price') return (a.price||0)-(b.price||0); return (a.name||'').localeCompare(b.name||''); });
    document.getElementById('invCount').textContent = filtered.length;
    const tbody = document.getElementById('inventoryTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No items.</td></tr>`; return; }
    const canEdit = window.canManage('inventory');
    tbody.innerHTML = filtered.map(i => `<tr><td><code>${escapeHtml(i.barcode||'—')}</code></td><td><strong>${escapeHtml(i.name)}</strong></td><td>${escapeHtml(i.category||'—')}</td><td class="${(i.qty||0)<=5?'text-danger':''}">${i.qty||0}</td><td>LKR ${formatCurrency(i.price||0)}</td><td><span class="badge ${i.status==='active'?'badge-success':'badge-danger'}">${i.status||'active'}</span></td><td class="text-center">${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editItem('${i.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteItem('${i.id}')"><i class="fas fa-trash"></i></button>` : '—'}</td></tr>`).join('');
}

// ---- PRODUCTS ----
function renderProducts() {
    if(!window.canView('inventory')) return;
    const data = getAppData();
    const categories = data.categories || []; const brands = data.brands || [];
    const canEdit = window.canManage('inventory');
    document.getElementById('categoryChips').innerHTML = categories.map(c => `<span class="badge badge-info" style="margin:2px;">${escapeHtml(c)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeCategory('${c}')">✕</span>` : ''}</span>`).join('') || '<span class="text-muted">None</span>';
    document.getElementById('brandChips').innerHTML = brands.map(b => `<span class="badge badge-success" style="margin:2px;">${escapeHtml(b)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeBrand('${b}')">✕</span>` : ''}</span>`).join('') || '<span class="text-muted">None</span>';
}

// ---- PURCHASING ----
function renderPurchasing() {
    if(!window.canView('purchasing') && !window.canView('inventory')) return;
    const data = getAppData();
    const suppliers = data.suppliers || [];
    const purchaseOrders = data.purchaseOrders || [];
    // Suppliers Table
    const tbody = document.getElementById('supplierTableBody');
    if(tbody) {
        if(suppliers.length === 0) tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No suppliers.</td></tr>`;
        else tbody.innerHTML = suppliers.map(s => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.contact)}</td><td>${escapeHtml(s.address)}</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
    }
    // PO Table
    const poTbody = document.getElementById('poTableBody');
    if(poTbody) {
        if(purchaseOrders.length === 0) poTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No POs.</td></tr>`;
        else poTbody.innerHTML = purchaseOrders.map(p => `<tr><td>${escapeHtml(p.supplierName)}</td><td>${escapeHtml(p.itemName)}</td><td>${p.qty}</td><td>LKR ${formatCurrency(p.price)}</td><td><span class="badge badge-warning">Pending</span></td></tr>`).join('');
    }
    // Dropdowns
    const supSelect = document.getElementById('poSupplierSelect');
    if(supSelect) { const val = supSelect.value; supSelect.innerHTML = '<option value="">Select</option>' + suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join(''); if(val) supSelect.value = val; }
    const itemSelect = document.getElementById('poItemSelect');
    if(itemSelect) { const val = itemSelect.value; itemSelect.innerHTML = '<option value="">Select</option>' + (data.items||[]).map(i => `<option value="${i.id}">${escapeHtml(i.name)}</option>`).join(''); if(val) itemSelect.value = val; }
}

// ---- SALES ----
function renderSales() {
    if(!window.canView('sales')) return;
    const data = getAppData();
    const customers = data.customers || [];
    const items = data.items || [];
    const salesOrders = data.salesOrders || [];
    // Dropdowns
    const custSelect = document.getElementById('salesCustomerSelect');
    if(custSelect) { const val = custSelect.value; custSelect.innerHTML = '<option value="">Select</option>' + customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join(''); if(val) custSelect.value = val; }
    const itemSelect = document.getElementById('salesItemSelect');
    if(itemSelect) { const val = itemSelect.value; itemSelect.innerHTML = '<option value="">Select</option>' + items.map(i => `<option value="${i.id}">${escapeHtml(i.name)}</option>`).join(''); if(val) itemSelect.value = val; }
    // Table
    const tbody = document.getElementById('salesOrderTableBody');
    if(tbody) {
        if(salesOrders.length === 0) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders.</td></tr>`;
        else tbody.innerHTML = salesOrders.map(s => `<tr><td>${escapeHtml(s.customerName)}</td><td>${escapeHtml(s.itemName)}</td><td>${s.qty}</td><td>LKR ${formatCurrency(s.total)}</td><td><span class="badge badge-success">Completed</span></td></tr>`).join('');
    }
}

// ---- DELIVERIES ----
function renderDeliveries() {
    if(!window.canView('deliveries')) return;
    const data = getAppData();
    populateDeliveryDropdowns();
    const dateFilter = document.getElementById('delDateFilter')?.value || '';
    const statusFilter = document.getElementById('delStatusFilter')?.value || 'all';
    let filtered = data.deliveries || [];
    if(dateFilter) filtered = filtered.filter(d => d.date && d.date.slice(0,10) === dateFilter);
    if(statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    const tbody = document.getElementById('deliveryTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No deliveries.</td></tr>`; return; }
    const statusColors = { 'pending':'badge-warning', 'in-progress':'badge-info', 'delivered':'badge-success', 'cancelled':'badge-danger' };
    tbody.innerHTML = filtered.map(d => `<tr><td>${formatDate(d.date)}</td><td>${escapeHtml(d.customerName||'—')}</td><td>${escapeHtml(d.itemName||'—')}</td><td>${d.qty||0}</td><td>${escapeHtml(d.driverName||'—')}</td><td><span class="badge ${statusColors[d.status]||'badge-warning'}">${d.status||'pending'}</span></td></tr>`).join('');
}

// ---- CUSTOMERS ----
function renderCustomers() {
    if(!window.canView('customers')) return;
    const data = getAppData(); const customers = data.customers || [];
    const search = document.getElementById('custSearch')?.value.toLowerCase().trim() || '';
    let filtered = customers.filter(c => (c.name||'').toLowerCase().includes(search));
    document.getElementById('custCount').textContent = filtered.length;
    const tbody = document.getElementById('customerTableBody');
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No customers.</td></tr>`; return; }
    const canEdit = window.canManage('customers');
    tbody.innerHTML = filtered.map(c => `<tr><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.contact||'—')}</td><td>LKR ${formatCurrency(c.creditLimit||0)}</td><td>LKR ${formatCurrency(c.balance||0)}</td><td class="text-center">${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editCustomer('${c.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>` : '—'}</td></tr>`).join('');
}

// ============================================================
// UI RENDERING MODULE (Enhanced - Enterprise)
// ============================================================

// ... (ALL_NAV_ITEMS, renderSidebar, switchPanel, showAccessDenied, renderDashboard ආදිය පෙර පරිදිම)

// ============================================================
// PRODUCTS (Enhanced with Extended Attributes)
// ============================================================
function renderProducts() {
    if (!window.canView('inventory')) return;
    const data = getAppData();
    const categories = data.categories || [];
    const brands = data.brands || [];
    const items = data.items || [];

    const canEdit = window.canManage('inventory');
    document.getElementById('categoryChips').innerHTML = categories.map(c => 
        `<span class="badge badge-info" style="margin:2px;">${escapeHtml(c)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeCategory('${c}')">✕</span>` : ''}</span>`
    ).join('') || '<span class="text-muted">None</span>';
    document.getElementById('brandChips').innerHTML = brands.map(b => 
        `<span class="badge badge-success" style="margin:2px;">${escapeHtml(b)} ${canEdit ? `<span style="cursor:pointer;color:var(--danger);" onclick="removeBrand('${b}')">✕</span>` : ''}</span>`
    ).join('') || '<span class="text-muted">None</span>';

    // Fill product dropdown for attribute update
    const productCodeInput = document.getElementById('productCode');
    const productUnit = document.getElementById('productUnit');
    const productCostPrice = document.getElementById('productCostPrice');
    const productTaxRate = document.getElementById('productTaxRate');
    const productReorderLevel = document.getElementById('productReorderLevel');
    const productStockAlert = document.getElementById('productStockAlert');

    // Add event listener for product code auto-generation
    if (productCodeInput && !productCodeInput.value) {
        const nextCode = items.length + 1;
        productCodeInput.value = 'PRD-' + String(nextCode).padStart(4, '0');
    }
}
window.renderProducts = renderProducts;

// ============================================================
// SALES (Enhanced - Multi-Item Cart)
// ============================================================
let salesCart = [];

function renderSales() {
    if (!window.canView('sales')) return;
    const data = getAppData();
    const customers = data.customers || [];
    const items = data.items || [];
    const salesOrders = data.salesOrders || [];

    // Set default date
    const orderDate = document.getElementById('salesOrderDate');
    if (orderDate && !orderDate.value) orderDate.value = todayStr();

    // Populate Customer dropdown
    const custSelect = document.getElementById('salesCustomerSelect');
    if (custSelect) {
        const val = custSelect.value;
        custSelect.innerHTML = '<option value="">Select Customer</option>' + 
            customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        if (val && [...custSelect.options].some(o => o.value === val)) custSelect.value = val;
    }

    // Populate Cart Item dropdown
    const cartItemSelect = document.getElementById('salesCartItemSelect');
    if (cartItemSelect) {
        const val = cartItemSelect.value;
        cartItemSelect.innerHTML = '<option value="">Select Item</option>' + 
            items.filter(i => i.status !== 'inactive').map(i => 
                `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0} available) - LKR ${formatCurrency(i.price||0)}</option>`
            ).join('');
        if (val && [...cartItemSelect.options].some(o => o.value === val)) cartItemSelect.value = val;
    }

    // Render Cart
    renderSalesCart();

    // Render Orders Table
    const tbody = document.getElementById('salesOrderTableBody');
    if (tbody) {
        if (salesOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders.</td></tr>`;
        } else {
            tbody.innerHTML = salesOrders.slice().reverse().map(o => {
                const itemCount = o.items ? o.items.length : 0;
                return `<tr>
                    <td><strong>#${o.orderNo || o.id.slice(0,6)}</strong></td>
                    <td>${formatDate(o.date)}</td>
                    <td>${escapeHtml(o.customerName)}</td>
                    <td>${itemCount} items</td>
                    <td><strong>LKR ${formatCurrency(o.total)}</strong></td>
                    <td><span class="badge badge-success">Completed</span></td>
                </tr>`;
            }).join('');
        }
    }
}
window.renderSales = renderSales;

function renderSalesCart() {
    const tbody = document.getElementById('salesCartBody');
    const totalEl = document.getElementById('salesCartTotal');
    if (!tbody) return;

    if (salesCart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Cart is empty.</td></tr>`;
        if (totalEl) totalEl.textContent = 'LKR 0';
        return;
    }

    let grandTotal = 0;
    tbody.innerHTML = salesCart.map((item, index) => {
        const total = item.qty * item.price;
        grandTotal += total;
        return `<tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.qty}</td>
            <td>LKR ${formatCurrency(item.price)}</td>
            <td>LKR ${formatCurrency(total)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger" onclick="removeFromSalesCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    if (totalEl) totalEl.textContent = 'LKR ' + formatCurrency(grandTotal);
}

window.removeFromSalesCart = function(index) {
    salesCart.splice(index, 1);
    renderSalesCart();
};

// ============================================================
// DELIVERIES (Enhanced - Multi-Item + Status Update)
// ============================================================
let deliveryCart = [];

function renderDeliveries() {
    if (!window.canView('deliveries')) return;
    const data = getAppData();
    populateDeliveryDropdowns();

    const dateFilter = document.getElementById('delDateFilter')?.value || '';
    const statusFilter = document.getElementById('delStatusFilter')?.value || 'all';

    let filtered = data.deliveries || [];
    if (dateFilter) filtered = filtered.filter(d => d.date && d.date.slice(0, 10) === dateFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('deliveryTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No deliveries.</td></tr>`;
        return;
    }

    const statusColors = {
        'pending': 'badge-warning',
        'in-progress': 'badge-info',
        'delivered': 'badge-success',
        'cancelled': 'badge-danger'
    };

    tbody.innerHTML = filtered.map(d => {
        const itemsCount = d.items ? d.items.length : 0;
        const canUpdate = window.canManage('deliveries') || window.hasPermission('update_deliveries');
        return `<tr>
            <td>${formatDate(d.date)}</td>
            <td>${escapeHtml(d.customerName || '—')}</td>
            <td>${itemsCount} items</td>
            <td>${escapeHtml(d.driverName || '—')}</td>
            <td>${escapeHtml(d.vehicleNo || '—')}</td>
            <td>
                ${canUpdate ? `
                <select class="delivery-status-select" data-id="${d.id}" style="padding:4px 8px; border-radius:6px; border:2px solid var(--border); font-size:12px;">
                    <option value="pending" ${d.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${d.status === 'in-progress' ? 'selected' : ''}>In-Progress</option>
                    <option value="delivered" ${d.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${d.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                ` : `<span class="badge ${statusColors[d.status] || 'badge-warning'}">${d.status || 'pending'}</span>`}
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline" onclick="viewDeliveryDetails('${d.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>`;
    }).join('');

    // Add event listeners for status update
    document.querySelectorAll('.delivery-status-select').forEach(select => {
        select.addEventListener('change', async function() {
            const id = this.dataset.id;
            const status = this.value;
            await updateDeliveryStatus(id, status);
        });
    });

    // Render Delivery Cart
    renderDeliveryCart();
}
window.renderDeliveries = renderDeliveries;

async function updateDeliveryStatus(id, status) {
    const data = getAppData();
    const delivery = data.deliveries.find(d => d.id === id);
    if (!delivery) { showToast('Delivery not found.', 'error'); return; }
    delivery.status = status;
    delivery.updatedAt = nowISO();
    setAppData(data);
    await saveAllData();
    renderDeliveries();
    showToast(`✅ Status updated to: ${status}`);
}
window.updateDeliveryStatus = updateDeliveryStatus;

function renderDeliveryCart() {
    const tbody = document.getElementById('delCartBody');
    if (!tbody) return;

    if (deliveryCart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No items added.</td></tr>`;
        return;
    }

    tbody.innerHTML = deliveryCart.map((item, index) => 
        `<tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.qty}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger" onclick="removeFromDeliveryCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`
    ).join('');
}

window.removeFromDeliveryCart = function(index) {
    deliveryCart.splice(index, 1);
    renderDeliveryCart();
};

window.viewDeliveryDetails = function(id) {
    const data = getAppData();
    const delivery = data.deliveries.find(d => d.id === id);
    if (!delivery) { showToast('Not found.', 'error'); return; }
    const items = delivery.items ? delivery.items.map(i => `${i.name} x${i.qty}`).join(', ') : '—';
    showToast(`📦 ${delivery.customerName} | Items: ${items} | Status: ${delivery.status}`, 'info');
};

// ============================================================
// FINANCE (Enhanced - Check Details)
// ============================================================
function renderFinance() {
    if (!window.canView('finance')) return;
    const data = getAppData();
    const finance = data.finance || [];

    const tbody = document.getElementById('financeTableBody');
    if (finance.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions.</td></tr>`;
    } else {
        finance.sort((a, b) => new Date(b.date) - new Date(a.date));
        tbody.innerHTML = finance.map(f => {
            let methodDisplay = f.paymentMethod || 'cash';
            if (methodDisplay === 'cheque' && f.chequeNo) {
                methodDisplay = `Cheque #${f.chequeNo}`;
            }
            return `<tr>
                <td>${formatDate(f.date)}</td>
                <td><span class="badge ${f.type === 'income' ? 'badge-success' : 'badge-danger'}">${f.type}</span></td>
                <td>${escapeHtml(f.category || '—')}</td>
                <td>${escapeHtml(methodDisplay)}</td>
                <td>${escapeHtml(f.desc || '—')}</td>
                <td>${f.type === 'income' ? '+' : '-'} LKR ${formatCurrency(f.amount || 0)}</td>
            </tr>`;
        }).join('');
    }

    const totalIncome = finance.filter(f => f.type === 'income').reduce((s, f) => s + (f.amount || 0), 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    document.getElementById('financeTotalIncome').textContent = 'LKR ' + formatCurrency(totalIncome);
    document.getElementById('financeTotalExpense').textContent = 'LKR ' + formatCurrency(totalExpense);
    document.getElementById('financeBalance').textContent = 'LKR ' + formatCurrency(totalIncome - totalExpense);

    // Budget
    const budget = data.budget || {};
    const container = document.getElementById('budgetDisplay');
    if (container) {
        if (!budget.category || Object.keys(budget.category).length === 0) {
            container.innerHTML = '<div class="text-muted">No budget set.</div>';
        } else {
            let html = '<strong>📊 Budget vs Actual</strong><br/>';
            let totalB = 0, totalA = 0;
            for (const [cat, amt] of Object.entries(budget.category)) {
                const actual = finance.filter(f => f.category === cat && f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
                totalB += amt;
                totalA += actual;
                html += `<span>${cat}: Budget ${formatCurrency(amt)} | Actual ${formatCurrency(actual)} | ${amt - actual >= 0 ? '✅' : '⚠️'} ${formatCurrency(Math.abs(amt - actual))}</span><br/>`;
            }
            html += `<hr/><strong>Total:</strong> Budget ${formatCurrency(totalB)} | Actual ${formatCurrency(totalA)} | ${totalB - totalA >= 0 ? '✅' : '⚠️'} ${formatCurrency(Math.abs(totalB - totalA))}`;
            container.innerHTML = html;
        }
    }
}
window.renderFinance = renderFinance;

// ... (ඉතිරි functions - renderEmployees, renderAttendance, renderLeave, renderPayroll, renderInventory, renderPurchasing, renderCustomers, renderVouchers, renderFleet, renderReports, renderSettings, renderAdministration ආදිය පෙර පරිදිම)
// ---- VOUCHERS ----
function renderVouchers() {
    if(!window.canView('voucher')) return;
    const data = getAppData(); const vouchers = data.vouchers || [];
    document.getElementById('voucherCount').textContent = vouchers.length;
    const tbody = document.getElementById('voucherTableBody');
    if(vouchers.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No vouchers.</td></tr>`; return; }
    const canEdit = window.canManage('voucher') || window.canManage('finance');
    tbody.innerHTML = vouchers.slice().reverse().map(v => `<tr><td><strong>${escapeHtml(v.voucherNo||'—')}</strong></td><td>${formatDate(v.date)}</td><td>${escapeHtml(v.paidTo||'—')}</td><td>LKR ${formatCurrency(v.amount||0)}</td><td>${escapeHtml(v.paymentTypes? v.paymentTypes.join(', '):'—')}</td><td><span class="badge badge-success">Paid</span></td><td class="text-center">${canEdit ? `<button class="btn btn-sm btn-danger" onclick="deleteVoucher('${v.id}')"><i class="fas fa-trash"></i></button>` : '—'}</td></tr>`).join('');
}
window.deleteVoucher = async function(id) { if(!confirm('Delete?')) return; const data = getAppData(); data.vouchers = data.vouchers.filter(v => v.id !== id); setAppData(data); await saveAllData(); renderVouchers(); showToast('🗑️ Removed.'); };

// ---- FLEET ----
function renderFleet() {
    if(!window.canView('fleet') && !window.canView('vehicles')) return;
    const data = getAppData(); const vehicles = data.vehicles || [];
    const tbody = document.getElementById('vehicleTableBody');
    if(vehicles.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No vehicles.</td></tr>`; return; }
    const canEdit = window.canManage('vehicles');
    tbody.innerHTML = vehicles.map(v => `<tr><td><strong>${escapeHtml(v.vehicleNo||'—')}</strong></td><td>${escapeHtml(v.driver||'—')}</td><td>${escapeHtml(v.fuel||'—')}</td><td>${escapeHtml(v.insurance||'—')}</td><td>${v.service?formatDate(v.service):'—'}</td><td><span class="badge badge-success">Active</span></td><td class="text-center">${canEdit ? `<button class="btn btn-sm btn-outline" onclick="editVehicle('${v.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteVehicle('${v.id}')"><i class="fas fa-trash"></i></button>` : '—'}</td></tr>`).join('');
}

// ---- REPORTS ----
function renderReports() {
    if(!window.canView('reports')) return;
    const type = document.getElementById('reportType').value;
    const from = document.getElementById('reportFrom').value || '';
    const to = document.getElementById('reportTo').value || '';
    const container = document.getElementById('reportContent');
    const data = getAppData();
    let html = '';
    const filter = (arr, field) => arr.filter(item => { if(!item[field]) return true; const d = item[field].slice(0,10); if(from && d < from) return false; if(to && d > to) return false; return true; });
    switch(type) {
        case 'stock': {
            let items = filter(data.items || [], 'updatedAt');
            if(items.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else html = `<table><thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead><tbody>${items.map(i => `<tr><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.category||'—')}</td><td>${i.qty||0}</td><td>LKR ${formatCurrency(i.price||0)}</td><td>LKR ${formatCurrency((i.qty||0)*(i.price||0))}</td></tr>`).join('')}</tbody></table>`;
            break;
        }
        case 'sales': {
            let sales = filter(data.salesData || [], 'date');
            if(sales.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else { const total = sales.reduce((s,item) => s+(item.total||0),0); html = `<table><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>${sales.map(s => `<tr><td>${formatDate(s.date)}</td><td>${escapeHtml(s.customer||'—')}</td><td>${escapeHtml(s.item||'—')}</td><td>${s.qty||0}</td><td>LKR ${formatCurrency(s.total||0)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="4"><strong>Grand Total</strong></td><td><strong>LKR ${formatCurrency(total)}</strong></td></tr></tfoot></table>`; }
            break;
        }
        case 'attendance': {
            let att = filter(data.attendance || [], 'date');
            if(att.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else html = `<table><thead><tr><th>Date</th><th>Employee</th><th>Check In</th><th>Check Out</th></tr></thead><tbody>${att.map(a => `<tr><td>${formatDate(a.date)}</td><td>${escapeHtml(a.employeeName||'—')}</td><td>${a.checkIn?formatDateTime(a.checkIn):'—'}</td><td>${a.checkOut?formatDateTime(a.checkOut):'—'}</td></tr>`).join('')}</tbody></table>`;
            break;
        }
        case 'payroll': {
            let pay = filter(data.payroll || [], 'updatedAt');
            if(pay.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else html = `<table><thead><tr><th>Employee</th><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>EPF</th><th>ETF</th><th>Net</th></tr></thead><tbody>${pay.map(p => { const net = p.net || ((p.basic||0)+(p.allowances||0)+(p.ot||0)-(p.deductions||0)); const epf = p.epf || ((p.basic||0)*0.08); const etf = p.etf || ((p.basic||0)*0.03); return `<tr><td>${escapeHtml(p.employeeName||'—')}</td><td>${p.month||'—'}</td><td>LKR ${formatCurrency(p.basic||0)}</td><td>LKR ${formatCurrency(p.allowances||0)}</td><td>LKR ${formatCurrency(p.deductions||0)}</td><td>LKR ${formatCurrency(epf)}</td><td>LKR ${formatCurrency(etf)}</td><td><strong>LKR ${formatCurrency(net)}</strong></td></tr>`; }).join('')}</tbody></table>`;
            break;
        }
        case 'customers': {
            let cust = filter(data.customers || [], 'updatedAt');
            if(cust.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else html = `<table><thead><tr><th>Name</th><th>Contact</th><th>Category</th><th>Credit Limit</th><th>Balance</th></tr></thead><tbody>${cust.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.contact||'—')}</td><td>${escapeHtml(c.category||'Retail')}</td><td>LKR ${formatCurrency(c.creditLimit||0)}</td><td>LKR ${formatCurrency(c.balance||0)}</td></tr>`).join('')}</tbody></table>`;
            break;
        }
        case 'purchasing': {
            let po = filter(data.purchaseOrders || [], 'createdAt');
            if(po.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else html = `<table><thead><tr><th>Supplier</th><th>Item</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead><tbody>${po.map(p => `<tr><td>${escapeHtml(p.supplierName)}</td><td>${escapeHtml(p.itemName)}</td><td>${p.qty}</td><td>LKR ${formatCurrency(p.price)}</td><td><span class="badge badge-warning">Pending</span></td></tr>`).join('')}</tbody></table>`;
            break;
        }
        case 'finance': {
            let fin = filter(data.finance || [], 'date');
            if(fin.length === 0) html = '<div class="text-muted text-center">No data.</div>';
            else { const inc = fin.filter(f => f.type==='income').reduce((s,f) => s+(f.amount||0),0); const exp = fin.filter(f => f.type==='expense').reduce((s,f) => s+(f.amount||0),0); html = `<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${fin.map(f => `<tr><td>${formatDate(f.date)}</td><td><span class="badge ${f.type==='income'?'badge-success':'badge-danger'}">${f.type}</span></td><td>${escapeHtml(f.category||'—')}</td><td>${escapeHtml(f.desc||'—')}</td><td>${f.type==='income'?'+':'-'} LKR ${formatCurrency(f.amount||0)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="4"><strong>Income: ${formatCurrency(inc)} | Expense: ${formatCurrency(exp)} | Balance: ${formatCurrency(inc-exp)}</strong></td></tr></tfoot></table>`; }
            break;
        }
        default: html = '<div class="text-muted text-center">Select a report.</div>';
    }
    container.innerHTML = html;
}

// ---- SETTINGS ----
function renderSettings() {
    if(!window.canView('settings')) return;
    const data = getAppData(); const settings = data.settings || {};
    document.getElementById('settingsCompany').value = settings.company || '';
    document.getElementById('settingsAddress').value = settings.address || '';
    document.getElementById('settingsPhone').value = settings.phone || '';
    document.getElementById('settingsEmail').value = settings.email || '';
}

// ---- UTILITIES ----
function escapeHtml(str) { if(!str) return ''; const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
function formatCurrency(val) { return Number(val).toLocaleString('en-LK', {minimumFractionDigits:0, maximumFractionDigits:0}); }
function formatDate(d) { if(!d) return '—'; return new Date(d).toLocaleDateString('en-LK', {year:'numeric', month:'short', day:'numeric'}); }
function formatDateTime(d) { if(!d) return '—'; return new Date(d).toLocaleString('en-LK', {year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}); }
function todayStr() { return new Date().toISOString().slice(0,10); }
function nowISO() { return new Date().toISOString(); }

// ---- GLOBAL FUNCTIONS ----
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

window.editEmployee = function(id) { const data=getAppData(); const emp=data.employees.find(e=>e.id===id); if(!emp) return; const setVal=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val;}; setVal('empEditId', emp.id); setVal('empName', emp.name||''); setVal('empNIC', emp.nic||''); setVal('empDept', emp.department||'Admin'); setVal('empDesignation', emp.designation||''); setVal('empContact', emp.contact||''); setVal('empEmergency', emp.emergency||''); setVal('empAddress', emp.address||''); setVal('empJoined', emp.joinedDate||''); setVal('empSalary', emp.salary||''); setVal('empEpf', emp.epf||''); setVal('empUsername', emp.email||''); setVal('empPassword', ''); setVal('empStatus', emp.status||'active'); document.getElementById('employeeModalTitle').textContent='✏️ Edit Employee'; document.getElementById('employeeModal').classList.add('open'); };
window.deleteEmployee = async function(id) { if(!confirm('Delete?')) return; const data=getAppData(); data.employees=data.employees.filter(e=>e.id!==id); if(data.leaveBalances) delete data.leaveBalances[id]; setAppData(data); await saveAllData(); renderEmployees(); showToast('🗑️ Removed.'); };
window.editItem = function(id) { const data=getAppData(); const item=data.items.find(i=>i.id===id); if(!item) return; const setVal=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val;}; setVal('itemEditId', item.id); setVal('itemBarcode', item.barcode||''); setVal('itemName', item.name||''); setVal('itemQty', item.qty||0); setVal('itemPrice', item.price||0); setVal('itemCategory', item.category||''); setVal('itemBrand', item.brand||''); setVal('itemDesc', item.desc||''); setVal('itemExpiry', item.expiry||''); setVal('itemBatch', item.batch||''); setVal('itemStatus', item.status||'active'); document.getElementById('itemModalTitle').textContent='✏️ Edit Item'; document.getElementById('itemModal').classList.add('open'); populateItemDropdowns(); };
window.deleteItem = async function(id) { if(!confirm('Delete?')) return; const data=getAppData(); data.items=data.items.filter(i=>i.id!==id); setAppData(data); await saveAllData(); renderInventory(); showToast('🗑️ Removed.'); };
window.editCustomer = function(id) { const data=getAppData(); const c=data.customers.find(c=>c.id===id); if(!c) return; const setVal=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val;}; setVal('custEditId', c.id); setVal('custName', c.name||''); setVal('custContact', c.contact||''); setVal('custCategory', c.category||'Retail'); setVal('custAddress', c.address||''); setVal('custCreditLimit', c.creditLimit||0); setVal('custBalance', c.balance||0); document.getElementById('customerModalTitle').textContent='✏️ Edit Customer'; document.getElementById('customerModal').classList.add('open'); };
window.deleteCustomer = async function(id) { if(!confirm('Delete?')) return; const data=getAppData(); data.customers=data.customers.filter(c=>c.id!==id); setAppData(data); await saveAllData(); renderCustomers(); showToast('🗑️ Removed.'); };
window.editVehicle = function(id) { const data=getAppData(); const v=data.vehicles.find(v=>v.id===id); if(!v) return; const setVal=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val;}; setVal('vehicleNo', v.vehicleNo||''); setVal('vehicleDriver', v.driver||''); setVal('vehicleFuel', v.fuel||''); setVal('vehicleInsurance', v.insurance||''); setVal('vehicleService', v.service||''); const btn=document.getElementById('addVehicleBtn'); if(btn) { btn.dataset.editId=v.id; btn.textContent='💾 Update Vehicle'; } showToast('✏️ Editing.'); };
window.deleteVehicle = async function(id) { if(!confirm('Delete?')) return; const data=getAppData(); data.vehicles=data.vehicles.filter(v=>v.id!==id); setAppData(data); await saveAllData(); renderFleet(); showToast('🗑️ Removed.'); };
window.deleteSupplier = async function(id) { if(!confirm('Delete supplier?')) return; const data=getAppData(); data.suppliers=data.suppliers.filter(s=>s.id!==id); setAppData(data); await saveAllData(); renderPurchasing(); showToast('🗑️ Removed.'); };
window.removeCategory = async function(cat) { if(!confirm(`Remove "${cat}"?`)) return; const data=getAppData(); data.categories=data.categories.filter(c=>c!==cat); data.items.forEach(i=>{if(i.category===cat) i.category='';}); setAppData(data); await saveAllData(); renderProducts(); renderInventory(); showToast('🗑️ Removed.'); };
window.removeBrand = async function(brand) { if(!confirm(`Remove "${brand}"?`)) return; const data=getAppData(); data.brands=data.brands.filter(b=>b!==brand); data.items.forEach(i=>{if(i.brand===brand) i.brand='';}); setAppData(data); await saveAllData(); renderProducts(); showToast('🗑️ Removed.'); };
