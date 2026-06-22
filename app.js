// ============================================================
// DATA STORE
// ============================================================
const DB = {
    products: [],
    stock: [],
    customers: [],
    suppliers: [],
    purchases: [],
    sales: [],
    distributions: [],
    accounts: [],
    employees: [],
    attendance: [],
    leaves: [],
    vouchers: [],
    settings: { company: 'Jayasinghe Distributors', currency: 'LKR', theme: 'light' },
    users: [
        { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
        { username: 'manager', password: 'manager123', role: 'manager', name: 'Manager' },
        { username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Cashier' },
        { username: 'delivery', password: 'delivery123', role: 'delivery', name: 'Delivery Staff' }
    ],
    currentUser: null
};

// Load from localStorage
function loadData() {
    try {
        const raw = localStorage.getItem('jd_data');
        if (raw) {
            const data = JSON.parse(raw);
            Object.assign(DB, data);
        }
        // Ensure arrays exist
        ['products', 'stock', 'customers', 'suppliers', 'purchases', 'sales', 'distributions', 'accounts', 'employees', 'attendance', 'leaves', 'vouchers'].forEach(k => {
            if (!DB[k]) DB[k] = [];
        });
        if (!DB.settings) DB.settings = { company: 'Jayasinghe Distributors', currency: 'LKR', theme: 'light' };
        if (!DB.users) DB.users = [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
            { username: 'manager', password: 'manager123', role: 'manager', name: 'Manager' },
            { username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Cashier' },
            { username: 'delivery', password: 'delivery123', role: 'delivery', name: 'Delivery Staff' }
        ];
        applyTheme(DB.settings.theme);
    } catch (e) {
        console.warn('Data load error', e);
    }
}

function saveData() {
    localStorage.setItem('jd_data', JSON.stringify(DB));
}

// ============================================================
// SEED DATA
// ============================================================
function seedData() {
    if (DB.products.length > 0) return;
    const now = new Date().toISOString().slice(0, 10);
    DB.products = [
        { id: 1, name: 'Coca Cola 1.5L', sku: 'CC-001', category: 'Beverages', brand: 'Coca-Cola', unit: 'Piece', buyPrice: 120, sellPrice: 180, wholesale: 150, reorder: 20, stock: 45, image: '' },
        { id: 2, name: 'Pepsi 1.5L', sku: 'PS-001', category: 'Beverages', brand: 'Pepsi', unit: 'Piece', buyPrice: 115, sellPrice: 175, wholesale: 145, reorder: 20, stock: 38, image: '' },
        { id: 3, name: 'Kist Nectar 1L', sku: 'KN-001', category: 'Juices', brand: 'Kist', unit: 'Piece', buyPrice: 90, sellPrice: 140, wholesale: 120, reorder: 15, stock: 22, image: '' },
        { id: 4, name: 'Sunquick Orange 750ml', sku: 'SQ-001', category: 'Juices', brand: 'Sunquick', unit: 'Piece', buyPrice: 180, sellPrice: 260, wholesale: 220, reorder: 10, stock: 12, image: '' },
        { id: 5, name: 'Anchor Milk Powder 400g', sku: 'AM-001', category: 'Dairy', brand: 'Anchor', unit: 'Packet', buyPrice: 380, sellPrice: 450, wholesale: 420, reorder: 25, stock: 30, image: '' },
    ];
    DB.stock = DB.products.map(p => ({
        id: p.id,
        productId: p.id,
        productName: p.name,
        batch: 'BATCH-' + String(p.id).padStart(3, '0'),
        expiry: '2026-12-31',
        qty: p.stock,
        status: 'In Stock'
    }));
    DB.customers = [
        { id: 1, name: 'Aruna Stores', phone: '071-2345678', address: 'Colombo 10', balance: 2500, creditLimit: 50000 },
        { id: 2, name: 'Lakshmi Traders', phone: '072-3456789', address: 'Kandy', balance: 1200, creditLimit: 30000 },
    ];
    DB.suppliers = [
        { id: 1, name: 'Coca-Cola Lanka', contact: 'John Perera', phone: '011-2345678', balance: 0 },
        { id: 2, name: 'Pepsi Lanka', contact: 'Mary Silva', phone: '011-3456789', balance: 0 },
    ];
    DB.purchases = [
        { id: 1, invoice: 'PO-001', supplier: 'Coca-Cola Lanka', date: now, total: 12000, status: 'Completed' },
        { id: 2, invoice: 'PO-002', supplier: 'Pepsi Lanka', date: now, total: 8000, status: 'Pending' },
    ];
    DB.sales = [
        { id: 1, invoice: 'SI-001', customer: 'Aruna Stores', date: now, total: 4500, status: 'Completed' },
        { id: 2, invoice: 'SI-002', customer: 'Lakshmi Traders', date: now, total: 3200, status: 'Pending' },
    ];
    DB.distributions = [
        { id: 1, deliveryNo: 'DEL-001', driver: 'Rajitha', vehicle: 'ABC-1234', route: 'Colombo - Kandy', status: 'In Transit' },
        { id: 2, deliveryNo: 'DEL-002', driver: 'Saman', vehicle: 'DEF-5678', route: 'Colombo - Galle', status: 'Delivered' },
    ];
    DB.accounts = [
        { date: now, description: 'Cash Sale - SI-001', type: 'Income', amount: 4500 },
        { date: now, description: 'Purchase - PO-001', type: 'Expense', amount: 12000 },
        { date: now, description: 'Cash Sale - SI-002', type: 'Income', amount: 3200 },
    ];
    DB.employees = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'manager', phone: '071-1111111', salary: 50000, joinDate: '2023-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'cashier', phone: '071-2222222', salary: 30000, joinDate: '2023-02-01' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'delivery', phone: '071-3333333', salary: 25000, joinDate: '2023-03-01' },
    ];
    DB.attendance = [
        { id: 1, employeeId: 1, date: now, checkIn: '08:00', checkOut: '17:00', status: 'Present' },
        { id: 2, employeeId: 2, date: now, checkIn: '08:30', checkOut: '17:30', status: 'Present' },
    ];
    DB.leaves = [
        { id: 1, employeeId: 3, date: '2024-12-25', type: 'Annual', status: 'Approved' },
    ];
    DB.vouchers = [
        { id: 1, type: 'Cash Payment', date: now, description: 'Office supplies', amount: 2500, ref: 'VP-001' },
        { id: 2, type: 'Cash Receipt', date: now, description: 'Customer payment', amount: 4500, ref: 'VR-001' },
    ];
    saveData();
}

// ============================================================
// AUTHENTICATION
// ============================================================
function handleLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const found = DB.users.find(u => u.username === user && u.password === pass);
    if (found) {
        DB.currentUser = found;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('app').classList.add('active');
        loadData();
        seedData();
        updateUserInfo();
        navigateTo('dashboard');
        showNotification('👋 Welcome, ' + found.name + '!');
        checkLowStock();
        checkExpiringProducts();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        DB.currentUser = null;
        document.getElementById('app').classList.remove('active');
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginUser').value = 'admin';
        document.getElementById('loginPass').value = 'admin123';
        showNotification('👋 Logged out successfully');
    }
}

function updateUserInfo() {
    const user = DB.currentUser;
    if (!user) return;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    
    // Show/hide menu items based on role
    const isAdmin = user.role === 'admin';
    const isManager = user.role === 'manager' || isAdmin;
    const isCashier = user.role === 'cashier' || isManager;
    const isDelivery = user.role === 'delivery' || isManager;
    
    document.querySelectorAll('.nav-items a').forEach(a => {
        const page = a.dataset.page;
        let show = true;
        if (page === 'employees' || page === 'attendance' || page === 'vouchers' || page === 'settings') {
            show = isAdmin;
        }
        if (page === 'accounts' || page === 'reports') {
            show = isManager;
        }
        if (page === 'distribution') {
            show = isDelivery || isManager;
        }
        a.style.display = show ? 'flex' : 'none';
    });
}

// ============================================================
// THEME
// ============================================================
function toggleTheme() {
    const current = DB.settings.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    DB.settings.theme = next;
    applyTheme(next);
    saveData();
    document.getElementById('themeIcon').className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ============================================================
// NAVIGATION
// ============================================================
let currentPage = 'dashboard';
let monthlyChartInstance = null;
let categoryChartInstance = null;
let profitChartInstance = null;

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-items a, .mobile-bottom-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });

    const titles = {
        dashboard: 'Dashboard', products: 'Products', stock: 'Stock Management',
        customers: 'Customers', suppliers: 'Suppliers', purchases: 'Purchases',
        sales: 'Sales', distribution: 'Distribution', accounts: 'Accounts',
        reports: 'Reports', employees: 'Employees', attendance: 'Attendance',
        vouchers: 'Vouchers', settings: 'Settings'
    };
    document.getElementById('pageTitle').innerHTML =
        `${titles[page] || page} <span class="page-sub">${page === 'dashboard' ? 'Overview' : 'Management'}</span>`;

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
    }

    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'products': renderProducts(); break;
        case 'stock': renderStock(); break;
        case 'customers': renderCustomers(); break;
        case 'suppliers': renderSuppliers(); break;
        case 'purchases': renderPurchases(); break;
        case 'sales': renderSales(); break;
        case 'distribution': renderDistribution(); break;
        case 'accounts': renderAccounts(); break;
        case 'reports': break;
        case 'employees': renderEmployees(); break;
        case 'attendance': renderAttendance(); break;
        case 'vouchers': renderVouchers(); break;
        case 'settings': loadSettings(); break;
    }
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function showNotification(msg, type = 'info') {
    const div = document.createElement('div');
    const colors = {
        info: 'var(--primary)',
        success: 'var(--secondary)',
        warning: 'var(--warning)',
        danger: 'var(--danger)'
    };
    div.style.cssText = `
        position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
        background:var(--gray-900); color:var(--white); padding:14px 24px;
        border-radius:12px; font-size:14px; font-weight:500; z-index:9999;
        box-shadow:0 8px 32px rgba(0,0,0,0.2); max-width:90%;
        animation: slideUp 0.3s ease; text-align:center;
        border-left: 4px solid ${colors[type] || colors.info};
    `;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}

// ============================================================
// MODAL SYSTEM
// ============================================================
function openModal(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
    const totalSales = DB.sales.reduce((s, o) => s + (o.status === 'Completed' ? o.total : 0), 0);
    const totalExpenses = DB.accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.amount, 0);
    const cashIn = DB.accounts.filter(a => a.type === 'Income').reduce((s, a) => s + a.amount, 0) - totalExpenses;
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card"><div class="label">Today's Sales</div><div class="value">LKR ${totalSales.toLocaleString()}</div><div class="icon"><i class="fas fa-wallet"></i></div></div>
            <div class="stat-card danger"><div class="label">Today's Expenses</div><div class="value">LKR ${totalExpenses.toLocaleString()}</div><div class="icon"><i class="fas fa-receipt"></i></div></div>
            <div class="stat-card success"><div class="label">Cash in Hand</div><div class="value">LKR ${cashIn.toLocaleString()}</div><div class="icon"><i class="fas fa-money-bill-wave"></i></div></div>
            <div class="stat-card info"><div class="label">Total Customers</div><div class="value">${DB.customers.length}</div><div class="icon"><i class="fas fa-users"></i></div></div>
            <div class="stat-card"><div class="label">Total Suppliers</div><div class="value">${DB.suppliers.length}</div><div class="icon"><i class="fas fa-truck"></i></div></div>
            <div class="stat-card"><div class="label">Total Products</div><div class="value">${DB.products.length}</div><div class="icon"><i class="fas fa-cube"></i></div></div>
            <div class="stat-card warning"><div class="label">Low Stock Alert</div><div class="value">${DB.products.filter(p => p.stock <= p.reorder).length}</div><div class="icon"><i class="fas fa-exclamation-triangle"></i></div></div>
            <div class="stat-card danger"><div class="label">Out of Stock</div><div class="value">${DB.products.filter(p => p.stock <= 0).length}</div><div class="icon"><i class="fas fa-times-circle"></i></div></div>
        </div>
        <div class="dash-grid">
            <div class="card">
                <div class="card-title"><i class="fas fa-chart-line"></i> Monthly Sales</div>
                <div class="chart-container"><canvas id="monthlyChart"></canvas></div>
            </div>
            <div class="card">
                <div class="card-title"><i class="fas fa-fire"></i> Top Selling Products</div>
                <ul class="top-products-list" id="topProducts"></ul>
            </div>
        </div>
        <div class="card" style="background:var(--white);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);margin-bottom:20px;">
            <div class="flex-between">
                <div class="card-title" style="margin:0;"><i class="fas fa-bolt"></i> Quick Actions</div>
            </div>
            <div class="quick-actions">
                <button class="btn primary" onclick="navigateTo('sales')"><i class="fas fa-plus-circle"></i> New Sale</button>
                <button class="btn success" onclick="navigateTo('purchases')"><i class="fas fa-shopping-cart"></i> New Purchase</button>
                <button class="btn warning" onclick="navigateTo('products')"><i class="fas fa-box"></i> Add Product</button>
                <button class="btn" onclick="navigateTo('customers')"><i class="fas fa-user-plus"></i> Add Customer</button>
                <button class="btn" onclick="navigateTo('stock')"><i class="fas fa-arrow-right"></i> Stock In</button>
                <button class="btn" onclick="navigateTo('attendance')"><i class="fas fa-clock"></i> Attendance</button>
            </div>
        </div>
        <div class="card" style="background:var(--white);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
            <div class="card-title"><i class="fas fa-clock"></i> Recent Transactions</div>
            <div class="recent-transactions" id="recentTxns"></div>
        </div>
    `;
    document.getElementById('dashboardContent').innerHTML = html;

    // Top products
    const top = [...DB.products].sort((a, b) => b.stock - a.stock).slice(0, 5);
    const topList = document.getElementById('topProducts');
    if (top.length) {
        topList.innerHTML = top.map(p =>
            `<li><span class="name">${p.name}</span><span class="qty">${p.stock} units</span></li>`
        ).join('');
    } else {
        topList.innerHTML = '<li><span class="name">No products</span><span class="qty">—</span></li>';
    }

    // Recent transactions
    const txns = [...DB.accounts].slice(-5).reverse();
    const txnDiv = document.getElementById('recentTxns');
    if (txns.length) {
        txnDiv.innerHTML = txns.map(t =>
            `<div class="txn-item">
                <div class="txn-info"><span class="txn-name">${t.description}</span><span class="txn-date">${t.date}</span></div>
                <span class="txn-amount ${t.type === 'Income' ? 'positive' : 'negative'}">${t.type === 'Income' ? '+' : '-'} LKR ${t.amount.toLocaleString()}</span>
            </div>`
        ).join('');
    } else {
        txnDiv.innerHTML = '<div class="txn-item"><div class="txn-info"><span class="txn-name">No transactions</span><span class="txn-date">—</span></div><span class="txn-amount">—</span></div>';
    }

    // Chart
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChartInstance) monthlyChartInstance.destroy();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = DB.sales.reduce((acc, s) => {
        const m = new Date(s.date).getMonth();
        acc[m] = (acc[m] || 0) + s.total;
        return acc;
    }, {});
    const data = months.map((_, i) => salesByMonth[i] || 0);
    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Sales (LKR)',
                data: data,
                backgroundColor: 'rgba(26, 115, 232, 0.6)',
                borderColor: 'rgba(26, 115, 232, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
        }
    });
}

// ============================================================
// PRODUCTS
// ============================================================
function renderProducts() {
    const search = document.getElementById('productSearch').value.toLowerCase();
    const list = DB.products.filter(p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
    const tbody = document.getElementById('productTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-box"></i><p>No products found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.sku}</td>
            <td>${p.category || '—'}</td>
            <td>LKR ${p.sellPrice}</td>
            <td><span class="badge-status ${p.stock <= p.reorder ? 'danger' : 'success'}">${p.stock}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="generateBarcode('${p.sku}')"><i class="fas fa-barcode"></i></button>
            </td>
        </tr>
    `).join('');
}

function openProductModal(data) {
    const isEdit = !!data;
    const p = data || {};
    const html = `
        <div class="form-row">
            <div class="form-group"><label>Product Name *</label><input type="text" id="f_p_name" value="${p.name || ''}" /></div>
            <div class="form-group"><label>SKU *</label><input type="text" id="f_p_sku" value="${p.sku || 'SKU-' + String(DB.products.length + 1).padStart(4,'0')}" /></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><input type="text" id="f_p_cat" value="${p.category || ''}" /></div>
            <div class="form-group"><label>Brand</label><input type="text" id="f_p_brand" value="${p.brand || ''}" /></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Unit</label><select id="f_p_unit"><option ${p.unit === 'Piece' ? 'selected' : ''}>Piece</option><option ${p.unit === 'Box' ? 'selected' : ''}>Box</option><option ${p.unit === 'Packet' ? 'selected' : ''}>Packet</option></select></div>
            <div class="form-group"><label>Reorder Level</label><input type="number" id="f_p_reorder" value="${p.reorder || 10}" /></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Buying Price</label><input type="number" id="f_p_buy" value="${p.buyPrice || 0}" /></div>
            <div class="form-group"><label>Selling Price</label><input type="number" id="f_p_sell" value="${p.sellPrice || 0}" /></div>
        </div>
        <div class="form-group"><label>Wholesale Price</label><input type="number" id="f_p_wholesale" value="${p.wholesale || 0}" /></div>
        <div class="form-group"><label>Stock Quantity</label><input type="number" id="f_p_stock" value="${p.stock || 0}" /></div>
        <button class="btn-submit" onclick="saveProduct(${p.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Product</button>
    `;
    openModal(isEdit ? 'Edit Product' : 'Add Product', html);
}

function saveProduct(id) {
    const name = document.getElementById('f_p_name').value.trim();
    const sku = document.getElementById('f_p_sku').value.trim();
    if (!name || !sku) { showNotification('⚠️ Name and SKU are required', 'warning'); return; }
    const data = {
        name, sku,
        category: document.getElementById('f_p_cat').value.trim(),
        brand: document.getElementById('f_p_brand').value.trim(),
        unit: document.getElementById('f_p_unit').value,
        reorder: parseInt(document.getElementById('f_p_reorder').value) || 10,
        buyPrice: parseFloat(document.getElementById('f_p_buy').value) || 0,
        sellPrice: parseFloat(document.getElementById('f_p_sell').value) || 0,
        wholesale: parseFloat(document.getElementById('f_p_wholesale').value) || 0,
        stock: parseInt(document.getElementById('f_p_stock').value) || 0,
        image: ''
    };
    if (id) {
        const idx = DB.products.findIndex(p => p.id === id);
        if (idx > -1) { DB.products[idx] = { ...DB.products[idx], ...data }; }
    } else {
        data.id = Date.now();
        DB.products.push(data);
        DB.stock.push({
            id: data.id,
            productId: data.id,
            productName: data.name,
            batch: 'BATCH-' + String(DB.stock.length + 1).padStart(3, '0'),
            expiry: '2026-12-31',
            qty: data.stock,
            status: data.stock > 0 ? 'In Stock' : 'Out of Stock'
        });
    }
    saveData();
    closeModal();
    renderProducts();
    showNotification('✅ Product saved successfully', 'success');
}

function editProduct(id) {
    const p = DB.products.find(p => p.id === id);
    if (p) openProductModal(p);
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    DB.products = DB.products.filter(p => p.id !== id);
    DB.stock = DB.stock.filter(s => s.productId !== id);
    saveData();
    renderProducts();
    showNotification('🗑️ Product deleted', 'danger');
}

function generateBarcode(sku) {
    const html = `
        <div class="barcode-container">
            <svg id="barcode"></svg>
        </div>
        <p style="text-align:center;color:var(--gray-500);font-size:12px;">SKU: ${sku}</p>
        <button class="btn-submit" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
    `;
    openModal('Barcode', html);
    setTimeout(() => {
        try {
            JsBarcode("#barcode", sku, { format: "CODE128", width: 2, height: 80, displayValue: true });
        } catch(e) { showNotification('⚠️ Barcode generation failed', 'danger'); }
    }, 100);
}

// ============================================================
// STOCK (existing functions maintained)
// ============================================================
// ... (rest of stock functions remain same as before)
// For brevity, I'll include the key functions and keep others intact.
// The full code is available in the complete file.

// ============================================================
// EMPLOYEES
// ============================================================
function renderEmployees() {
    const search = document.getElementById('employeeSearch').value.toLowerCase();
    const list = DB.employees.filter(e => e.name.toLowerCase().includes(search) || e.email.toLowerCase().includes(search));
    const tbody = document.getElementById('employeeTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-users-cog"></i><p>No employees found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(e => `
        <tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.email}</td>
            <td><span class="badge-status info">${e.role}</span></td>
            <td>${e.phone || '—'}</td>
            <td>LKR ${(e.salary || 0).toLocaleString()}</td>
            <td>
                <button class="btn-sm primary" onclick="editEmployee(${e.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteEmployee(${e.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="viewEmployeeDetails(${e.id})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function openEmployeeModal(data) {
    const isEdit = !!data;
    const e = data || {};
    const html = `
        <div class="form-group"><label>Full Name *</label><input type="text" id="f_e_name" value="${e.name || ''}" /></div>
        <div class="form-group"><label>Email *</label><input type="email" id="f_e_email" value="${e.email || ''}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Role</label><select id="f_e_role"><option ${e.role === 'admin' ? 'selected' : ''}>admin</option><option ${e.role === 'manager' ? 'selected' : ''}>manager</option><option ${e.role === 'cashier' ? 'selected' : ''}>cashier</option><option ${e.role === 'delivery' ? 'selected' : ''}>delivery</option></select></div>
            <div class="form-group"><label>Phone</label><input type="text" id="f_e_phone" value="${e.phone || ''}" /></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Salary (LKR)</label><input type="number" id="f_e_salary" value="${e.salary || 0}" /></div>
            <div class="form-group"><label>Join Date</label><input type="date" id="f_e_join" value="${e.joinDate || new Date().toISOString().slice(0,10)}" /></div>
        </div>
        <button class="btn-submit" onclick="saveEmployee(${e.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Employee</button>
    `;
    openModal(isEdit ? 'Edit Employee' : 'Add Employee', html);
}

function saveEmployee(id) {
    const name = document.getElementById('f_e_name').value.trim();
    const email = document.getElementById('f_e_email').value.trim();
    if (!name || !email) { showNotification('⚠️ Name and Email are required', 'warning'); return; }
    const data = {
        name, email,
        role: document.getElementById('f_e_role').value,
        phone: document.getElementById('f_e_phone').value.trim(),
        salary: parseFloat(document.getElementById('f_e_salary').value) || 0,
        joinDate: document.getElementById('f_e_join').value || new Date().toISOString().slice(0,10)
    };
    if (id) {
        const idx = DB.employees.findIndex(e => e.id === id);
        if (idx > -1) DB.employees[idx] = { ...DB.employees[idx], ...data };
    } else {
        data.id = Date.now();
        DB.employees.push(data);
        // Also add to users for login
        DB.users.push({
            username: email.split('@')[0],
            password: 'password123',
            role: data.role,
            name: data.name
        });
    }
    saveData();
    closeModal();
    renderEmployees();
    showNotification('✅ Employee saved', 'success');
}

function editEmployee(id) {
    const e = DB.employees.find(e => e.id === id);
    if (e) openEmployeeModal(e);
}

function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    DB.employees = DB.employees.filter(e => e.id !== id);
    // Also remove from users
    const emp = DB.employees.find(e => e.id === id);
    if (emp) {
        DB.users = DB.users.filter(u => u.name !== emp.name);
    }
    saveData();
    renderEmployees();
    showNotification('🗑️ Employee deleted', 'danger');
}

function viewEmployeeDetails(id) {
    const e = DB.employees.find(emp => emp.id === id);
    if (!e) { showNotification('⚠️ Employee not found', 'warning'); return; }
    const attendance = DB.attendance.filter(a => a.employeeId === id);
    const leaves = DB.leaves.filter(l => l.employeeId === id);
    const html = `
        <div style="padding:8px 0;">
            <p><strong>Name:</strong> ${e.name}</p>
            <p><strong>Email:</strong> ${e.email}</p>
            <p><strong>Role:</strong> ${e.role}</p>
            <p><strong>Phone:</strong> ${e.phone || '—'}</p>
            <p><strong>Salary:</strong> LKR ${(e.salary || 0).toLocaleString()}</p>
            <p><strong>Join Date:</strong> ${e.joinDate || '—'}</p>
            <hr style="margin:12px 0;border-color:var(--gray-200);" />
            <p><strong>Attendance:</strong> ${attendance.length} records</p>
            <p><strong>Leaves:</strong> ${leaves.length} requests</p>
            <div style="margin-top:12px;max-height:150px;overflow-y:auto;">
                ${attendance.slice(-3).map(a => `<div style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--gray-200);">${a.date} - ${a.checkIn} to ${a.checkOut} (${a.status})</div>`).join('')}
            </div>
        </div>
    `;
    openModal('Employee Details', html);
}

// ============================================================
// ATTENDANCE
// ============================================================
function renderAttendance() {
    const search = document.getElementById('attendanceSearch').value.toLowerCase();
    let list = DB.attendance;
    if (search) {
        list = list.filter(a => {
            const emp = DB.employees.find(e => e.id === a.employeeId);
            return emp && emp.name.toLowerCase().includes(search);
        });
    }
    const tbody = document.getElementById('attendanceTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-clock"></i><p>No attendance records</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(a => {
        const emp = DB.employees.find(e => e.id === a.employeeId);
        return `<tr>
            <td><strong>${emp ? emp.name : 'Unknown'}</strong></td>
            <td>${a.date}</td>
            <td>${a.checkIn || '—'}</td>
            <td>${a.checkOut || '—'}</td>
            <td><span class="badge-status ${a.status === 'Present' ? 'success' : a.status === 'Absent' ? 'danger' : 'warning'}">${a.status || '—'}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editAttendance(${a.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteAttendance(${a.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function openAttendanceModal() {
    const html = `
        <div class="form-group"><label>Employee</label><select id="f_att_employee">${DB.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Date</label><input type="date" id="f_att_date" value="${new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Check In</label><input type="time" id="f_att_in" value="08:00" /></div>
            <div class="form-group"><label>Check Out</label><input type="time" id="f_att_out" value="17:00" /></div>
        </div>
        <div class="form-group"><label>Status</label><select id="f_att_status"><option>Present</option><option>Absent</option><option>Half Day</option></select></div>
        <button class="btn-submit" onclick="saveAttendance()"><i class="fas fa-save"></i> Save Attendance</button>
    `;
    openModal('Check In/Out', html);
}

function saveAttendance() {
    const employeeId = parseInt(document.getElementById('f_att_employee').value);
    const date = document.getElementById('f_att_date').value;
    const checkIn = document.getElementById('f_att_in').value;
    const checkOut = document.getElementById('f_att_out').value;
    const status = document.getElementById('f_att_status').value;
    if (!employeeId || !date) { showNotification('⚠️ Employee and Date required', 'warning'); return; }
    DB.attendance.push({
        id: Date.now(),
        employeeId,
        date,
        checkIn,
        checkOut,
        status
    });
    saveData();
    closeModal();
    renderAttendance();
    showNotification('✅ Attendance saved', 'success');
}

function editAttendance(id) {
    const a = DB.attendance.find(at => at.id === id);
    if (!a) return;
    const html = `
        <div class="form-group"><label>Employee</label><select id="f_att_employee_edit">${DB.employees.map(e => `<option ${e.id === a.employeeId ? 'selected' : ''} value="${e.id}">${e.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Date</label><input type="date" id="f_att_date_edit" value="${a.date}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Check In</label><input type="time" id="f_att_in_edit" value="${a.checkIn || '08:00'}" /></div>
            <div class="form-group"><label>Check Out</label><input type="time" id="f_att_out_edit" value="${a.checkOut || '17:00'}" /></div>
        </div>
        <div class="form-group"><label>Status</label><select id="f_att_status_edit"><option ${a.status === 'Present' ? 'selected' : ''}>Present</option><option ${a.status === 'Absent' ? 'selected' : ''}>Absent</option><option ${a.status === 'Half Day' ? 'selected' : ''}>Half Day</option></select></div>
        <button class="btn-submit" onclick="updateAttendance(${a.id})"><i class="fas fa-save"></i> Update</button>
    `;
    openModal('Edit Attendance', html);
}

function updateAttendance(id) {
    const idx = DB.attendance.findIndex(at => at.id === id);
    if (idx === -1) return;
    DB.attendance[idx] = {
        ...DB.attendance[idx],
        employeeId: parseInt(document.getElementById('f_att_employee_edit').value),
        date: document.getElementById('f_att_date_edit').value,
        checkIn: document.getElementById('f_att_in_edit').value,
        checkOut: document.getElementById('f_att_out_edit').value,
        status: document.getElementById('f_att_status_edit').value
    };
    saveData();
    closeModal();
    renderAttendance();
    showNotification('✅ Attendance updated', 'success');
}

function deleteAttendance(id) {
    if (!confirm('Delete this record?')) return;
    DB.attendance = DB.attendance.filter(a => a.id !== id);
    saveData();
    renderAttendance();
    showNotification('🗑️ Record deleted', 'danger');
}

function openLeaveModal() {
    const html = `
        <div class="form-group"><label>Employee</label><select id="f_leave_employee">${DB.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Date</label><input type="date" id="f_leave_date" value="${new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-group"><label>Type</label><select id="f_leave_type"><option>Annual</option><option>Sick</option><option>Casual</option></select></div>
        <div class="form-group"><label>Status</label><select id="f_leave_status"><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
        <button class="btn-submit" onclick="saveLeave()"><i class="fas fa-save"></i> Request Leave</button>
    `;
    openModal('Leave Request', html);
}

function saveLeave() {
    const employeeId = parseInt(document.getElementById('f_leave_employee').value);
    const date = document.getElementById('f_leave_date').value;
    const type = document.getElementById('f_leave_type').value;
    const status = document.getElementById('f_leave_status').value;
    if (!employeeId || !date) { showNotification('⚠️ Employee and Date required', 'warning'); return; }
    DB.leaves.push({ id: Date.now(), employeeId, date, type, status });
    saveData();
    closeModal();
    showNotification('✅ Leave request saved', 'success');
}

// ============================================================
// VOUCHERS
// ============================================================
function renderVouchers() {
    const search = document.getElementById('voucherSearch').value.toLowerCase();
    const list = DB.vouchers.filter(v => v.ref.toLowerCase().includes(search) || v.description.toLowerCase().includes(search));
    const tbody = document.getElementById('voucherTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-receipt"></i><p>No vouchers found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(v => `
        <tr>
            <td><strong>${v.ref || '#' + v.id}</strong></td>
            <td><span class="badge-status info">${v.type}</span></td>
            <td>${v.date}</td>
            <td>${v.description}</td>
            <td>LKR ${(v.amount || 0).toLocaleString()}</td>
            <td>
                <button class="btn-sm primary" onclick="editVoucher(${v.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteVoucher(${v.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="printVoucher(${v.id})"><i class="fas fa-print"></i></button>
            </td>
        </tr>
    `).join('');
}

function openVoucherModal(data) {
    const isEdit = !!data;
    const v = data || {};
    const html = `
        <div class="form-group"><label>Voucher Type</label><select id="f_v_type"><option ${v.type === 'Cash Payment' ? 'selected' : ''}>Cash Payment</option><option ${v.type === 'Cash Receipt' ? 'selected' : ''}>Cash Receipt</option><option ${v.type === 'Bank Payment' ? 'selected' : ''}>Bank Payment</option><option ${v.type === 'Bank Receipt' ? 'selected' : ''}>Bank Receipt</option><option ${v.type === 'Journal' ? 'selected' : ''}>Journal</option></select></div>
        <div class="form-group"><label>Reference #</label><input type="text" id="f_v_ref" value="${v.ref || 'VP-' + String(DB.vouchers.length + 1).padStart(3,'0')}" /></div>
        <div class="form-group"><label>Date</label><input type="date" id="f_v_date" value="${v.date || new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-group"><label>Description</label><textarea id="f_v_desc">${v.description || ''}</textarea></div>
        <div class="form-group"><label>Amount (LKR)</label><input type="number" id="f_v_amount" value="${v.amount || 0}" /></div>
        <button class="btn-submit" onclick="saveVoucher(${v.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Voucher</button>
    `;
    openModal(isEdit ? 'Edit Voucher' : 'New Voucher', html);
}

function saveVoucher(id) {
    const type = document.getElementById('f_v_type').value;
    const ref = document.getElementById('f_v_ref').value.trim();
    const date = document.getElementById('f_v_date').value;
    const description = document.getElementById('f_v_desc').value.trim();
    const amount = parseFloat(document.getElementById('f_v_amount').value) || 0;
    if (!ref || !date) { showNotification('⚠️ Reference and Date required', 'warning'); return; }
    const data = { type, ref, date, description, amount };
    if (id) {
        const idx = DB.vouchers.findIndex(v => v.id === id);
        if (idx > -1) DB.vouchers[idx] = { ...DB.vouchers[idx], ...data };
    } else {
        data.id = Date.now();
        DB.vouchers.push(data);
        // Add to accounts
        const accType = type.includes('Payment') ? 'Expense' : 'Income';
        DB.accounts.push({
            date: date,
            description: description || type + ' - ' + ref,
            type: accType,
            amount: amount
        });
    }
    saveData();
    closeModal();
    renderVouchers();
    showNotification('✅ Voucher saved', 'success');
}

function editVoucher(id) {
    const v = DB.vouchers.find(v => v.id === id);
    if (v) openVoucherModal(v);
}

function deleteVoucher(id) {
    if (!confirm('Delete this voucher?')) return;
    DB.vouchers = DB.vouchers.filter(v => v.id !== id);
    saveData();
    renderVouchers();
    showNotification('🗑️ Voucher deleted', 'danger');
}

function printVoucher(id) {
    const v = DB.vouchers.find(v => v.id === id);
    if (!v) { showNotification('⚠️ Voucher not found', 'warning'); return; }
    const win = window.open('', '_blank');
    if (!win) { showNotification('⚠️ Please allow popups', 'warning'); return; }
    const company = DB.settings.company || 'Jayasinghe Distributors';
    win.document.write(`
        <html><head><title>Voucher ${v.ref}</title>
        <style>body{font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:auto;color:#1a1a2e;}
        .header{text-align:center;border-bottom:2px solid #1a73e8;padding-bottom:16px;margin-bottom:24px;}
        .header h1{font-size:24px;margin:0;color:#1a73e8;}
        .header p{margin:4px 0;color:#5a5a7a;}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;}
        .total{font-size:20px;font-weight:800;text-align:right;margin-top:20px;padding-top:16px;border-top:2px solid #1a73e8;}
        .footer{text-align:center;margin-top:32px;color:#8888a8;font-size:13px;border-top:1px solid #eee;padding-top:16px;}
</style></head>
<body>
    <div class="header">
        <h1>${company}</h1>
        <p>${v.type} Voucher</p>
        <p>Ref: ${v.ref} | Date: ${v.date}</p>
    </div>
    <div style="margin:20px 0;">
        <div class="row"><span>Description</span><span>${v.description || '—'}</span></div>
        <div class="row"><span>Amount</span><span>LKR ${(v.amount || 0).toLocaleString()}</span></div>
    </div>
    <div class="total">Total: LKR ${(v.amount || 0).toLocaleString()}</div>
    <div class="footer">Thank you! | ${company}</div>
    <script>setTimeout(() => window.print(), 500);<\/script>
</body></html>
`);
win.document.close();
}

// ============================================================
// REPORTS
// ============================================================
function generateReport(type) {
    const out = document.getElementById('reportOutput');
    let html = '<h4 style="margin-bottom:16px;">📊 ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Report</h4>';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.toISOString().slice(0,10);

    switch (type) {
        case 'daily': {
            const sales = DB.sales.filter(s => s.date === today);
            const total = sales.reduce((s, o) => s + o.total, 0);
            html += `<p><strong>Date:</strong> ${today}</p><p><strong>Sales:</strong> LKR ${total.toLocaleString()}</p><p><strong>Transactions:</strong> ${sales.length}</p>`;
            if (sales.length) {
                html += '<ul>' + sales.map(s => `<li>${s.invoice} - ${s.customer} - LKR ${s.total}</li>`).join('') + '</ul>';
            } else html += '<p style="color:var(--gray-500);">No sales today</p>';
            break;
        }
        case 'monthly': {
            const sales = DB.sales.filter(s => {
                const d = new Date(s.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });
            const total = sales.reduce((s, o) => s + o.total, 0);
            const monthName = now.toLocaleString('default', { month: 'long' });
            html += `<p><strong>Month:</strong> ${monthName} ${year}</p><p><strong>Total Sales:</strong> LKR ${total.toLocaleString()}</p><p><strong>Transactions:</strong> ${sales.length}</p>`;
            break;
        }
        case 'yearly': {
            const sales = DB.sales.filter(s => new Date(s.date).getFullYear() === year);
            const total = sales.reduce((s, o) => s + o.total, 0);
            html += `<p><strong>Year:</strong> ${year}</p><p><strong>Total Sales:</strong> LKR ${total.toLocaleString()}</p><p><strong>Transactions:</strong> ${sales.length}</p>`;
            break;
        }
        case 'stock': {
            const total = DB.products.reduce((s, p) => s + p.stock, 0);
            html += `<p><strong>Total Products:</strong> ${DB.products.length}</p><p><strong>Total Stock:</strong> ${total} units</p>`;
            html += '<ul>' + DB.products.slice(0, 10).map(p =>
                `<li>${p.name} - ${p.stock} units ${p.stock <= p.reorder ? '⚠️ Low' : '✅'}</li>`
            ).join('') + '</ul>';
            break;
        }
        case 'customers': {
            html += `<p><strong>Total Customers:</strong> ${DB.customers.length}</p>`;
            html += '<ul>' + DB.customers.map(c =>
                `<li>${c.name} - Balance: LKR ${(c.balance || 0).toLocaleString()}</li>`
            ).join('') + '</ul>';
            break;
        }
        case 'suppliers': {
            html += `<p><strong>Total Suppliers:</strong> ${DB.suppliers.length}</p>`;
            html += '<ul>' + DB.suppliers.map(s =>
                `<li>${s.name} - ${s.phone}</li>`
            ).join('') + '</ul>';
            break;
        }
        case 'profit': {
            const income = DB.accounts.filter(a => a.type === 'Income').reduce((s, a) => s + a.amount, 0);
            const expenses = DB.accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.amount, 0);
            const profit = income - expenses;
            html += `<p><strong>Total Income:</strong> LKR ${income.toLocaleString()}</p>`;
            html += `<p><strong>Total Expenses:</strong> LKR ${expenses.toLocaleString()}</p>`;
            html += `<p><strong>Net Profit:</strong> LKR ${profit.toLocaleString()}</p>`;
            break;
        }
        default:
            html += '<p style="color:var(--gray-500);">Report type not found</p>';
    }
    out.innerHTML = html;
    showNotification('📊 ' + type + ' report generated', 'success');
}

function exportPDFReport() {
    const content = document.getElementById('reportOutput').innerHTML;
    if (!content || content.includes('Select a report')) {
        showNotification('⚠️ Please generate a report first', 'warning');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Jayasinghe Distributors - Report', 20, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(content.replace(/<[^>]*>/g, ''), 170);
    doc.text(lines, 20, 30);
    doc.save('report.pdf');
    showNotification('📄 PDF exported', 'success');
}

function exportExcelReport() {
    const content = document.getElementById('reportOutput').innerHTML;
    if (!content || content.includes('Select a report')) {
        showNotification('⚠️ Please generate a report first', 'warning');
        return;
    }
    const text = content.replace(/<[^>]*>/g, '');
    const rows = text.split('\n').filter(r => r.trim());
    const data = rows.map(r => r.split(/\s{2,}/));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'report.xlsx');
    showNotification('📊 Excel exported', 'success');
}

// ============================================================
// CSV IMPORT/EXPORT
// ============================================================
function exportCSV(type) {
    let data = [];
    let headers = [];
    switch (type) {
        case 'products':
            data = DB.products;
            headers = ['id', 'name', 'sku', 'category', 'brand', 'unit', 'buyPrice', 'sellPrice', 'wholesale', 'reorder', 'stock'];
            break;
        case 'customers':
            data = DB.customers;
            headers = ['id', 'name', 'phone', 'address', 'balance', 'creditLimit'];
            break;
        case 'suppliers':
            data = DB.suppliers;
            headers = ['id', 'name', 'contact', 'phone', 'balance'];
            break;
        default: showNotification('⚠️ Invalid type', 'warning'); return;
    }
    const csv = Papa.unparse({ fields: headers, data: data });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📁 CSV exported', 'success');
}

function importCSV(type, event) {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;
            if (!data.length) { showNotification('⚠️ No data found', 'warning'); return; }
            switch (type) {
                case 'products':
                    data.forEach(row => {
                        if (row.name && row.sku) {
                            DB.products.push({
                                id: Date.now() + Math.random(),
                                name: row.name,
                                sku: row.sku,
                                category: row.category || '',
                                brand: row.brand || '',
                                unit: row.unit || 'Piece',
                                buyPrice: parseFloat(row.buyPrice) || 0,
                                sellPrice: parseFloat(row.sellPrice) || 0,
                                wholesale: parseFloat(row.wholesale) || 0,
                                reorder: parseInt(row.reorder) || 10,
                                stock: parseInt(row.stock) || 0,
                                image: ''
                            });
                        }
                    });
                    break;
                case 'customers':
                    data.forEach(row => {
                        if (row.name && row.phone) {
                            DB.customers.push({
                                id: Date.now() + Math.random(),
                                name: row.name,
                                phone: row.phone,
                                address: row.address || '',
                                balance: parseFloat(row.balance) || 0,
                                creditLimit: parseFloat(row.creditLimit) || 0
                            });
                        }
                    });
                    break;
                case 'suppliers':
                    data.forEach(row => {
                        if (row.name && row.phone) {
                            DB.suppliers.push({
                                id: Date.now() + Math.random(),
                                name: row.name,
                                contact: row.contact || '',
                                phone: row.phone,
                                balance: parseFloat(row.balance) || 0
                            });
                        }
                    });
                    break;
                default: showNotification('⚠️ Invalid type', 'warning'); return;
            }
            saveData();
            renderProducts();
            showNotification('✅ CSV imported successfully', 'success');
        },
        error: function(err) {
            showNotification('❌ CSV import failed: ' + err.message, 'danger');
        }
    });
    event.target.value = '';
}

// ============================================================
// SETTINGS
// ============================================================
function loadSettings() {
    document.getElementById('companyName').value = DB.settings.company || 'Jayasinghe Distributors';
    document.getElementById('currencySelect').value = DB.settings.currency || 'LKR';
}

function saveSettings() {
    DB.settings.company = document.getElementById('companyName').value.trim() || 'Jayasinghe Distributors';
    DB.settings.currency = document.getElementById('currencySelect').value;
    saveData();
    showNotification('✅ Settings saved', 'success');
}

// ============================================================
// BACKUP / RESTORE
// ============================================================
function backupData() {
    const data = JSON.stringify(DB, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jd_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('💾 Backup downloaded', 'success');
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            Object.assign(DB, data);
            saveData();
            showNotification('✅ Data restored successfully', 'success');
            navigateTo('dashboard');
        } catch (err) {
            showNotification('❌ Invalid backup file', 'danger');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (!confirm('⚠️ This will delete ALL data. Are you sure?')) return;
    if (!confirm('Final confirmation: Clear all data?')) return;
    localStorage.removeItem('jd_data');
    location.reload();
}

// ============================================================
// LOW STOCK & EXPIRY CHECKS
// ============================================================
function checkLowStock() {
    const low = DB.products.filter(p => p.stock <= p.reorder);
    if (low.length) {
        showNotification(`⚠️ ${low.length} products are low in stock!`, 'warning');
    }
}

function checkExpiringProducts() {
    const today = new Date();
    const thirtyDays = new Date(today);
    thirtyDays.setDate(today.getDate() + 30);
    const expiring = DB.stock.filter(s => {
        if (!s.expiry) return false;
        const exp = new Date(s.expiry);
        return exp <= thirtyDays && exp >= today;
    });
    if (expiring.length) {
        showNotification(`⚠️ ${expiring.length} products expiring within 30 days!`, 'warning');
    }
}

// ============================================================
// ACCOUNTS (existing)
// ============================================================
function renderAccounts() {
    const income = DB.accounts.filter(a => a.type === 'Income').reduce((s, a) => s + a.amount, 0);
    const expenses = DB.accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.amount, 0);
    document.getElementById('accIncome').textContent = 'LKR ' + income.toLocaleString();
    document.getElementById('accExpenses').textContent = 'LKR ' + expenses.toLocaleString();
    document.getElementById('accProfit').textContent = 'LKR ' + (income - expenses).toLocaleString();
    document.getElementById('accCash').textContent = 'LKR ' + (income - expenses).toLocaleString();

    const tbody = document.getElementById('accountTableBody');
    if (!DB.accounts.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fas fa-coins"></i><p>No entries</p></td></tr>`;
        return;
    }
    const list = [...DB.accounts].reverse().slice(0, 50);
    tbody.innerHTML = list.map(a => `
        <tr>
            <td>${a.date}</td>
            <td>${a.description}</td>
            <td><span class="badge-status ${a.type === 'Income' ? 'success' : 'danger'}">${a.type}</span></td>
            <td>${a.type === 'Income' ? '+' : '-'} LKR ${a.amount.toLocaleString()}</td>
        </tr>
    `).join('');
}

// ============================================================
// STOCK FUNCTIONS (existing - kept for completeness)
// ============================================================
function renderStock() {
    const search = document.getElementById('stockSearch').value.toLowerCase();
    const list = DB.stock.filter(s => s.productName.toLowerCase().includes(search));
    const tbody = document.getElementById('stockTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-warehouse"></i><p>No stock entries</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td><strong>${s.productName}</strong></td>
            <td>${s.batch || '—'}</td>
            <td>${s.expiry || '—'}</td>
            <td>${s.qty}</td>
            <td><span class="badge-status ${s.qty <= 5 ? 'danger' : 'success'}">${s.status || 'In Stock'}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editStock(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteStock(${s.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openStockModal() {
    const html = `
        <div class="form-group"><label>Product</label><select id="f_stock_product">${DB.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div class="form-row">
            <div class="form-group"><label>Batch</label><input type="text" id="f_stock_batch" value="BATCH-${String(DB.stock.length + 1).padStart(3,'0')}" /></div>
            <div class="form-group"><label>Expiry Date</label><input type="date" id="f_stock_expiry" value="2026-12-31" /></div>
        </div>
        <div class="form-group"><label>Quantity</label><input type="number" id="f_stock_qty" value="10" /></div>
        <button class="btn-submit" onclick="saveStock()"><i class="fas fa-save"></i> Add Stock</button>
    `;
    openModal('Stock In', html);
}

function saveStock() {
    const productId = parseInt(document.getElementById('f_stock_product').value);
    const product = DB.products.find(p => p.id === productId);
    if (!product) { showNotification('⚠️ Select a product', 'warning'); return; }
    const qty = parseInt(document.getElementById('f_stock_qty').value) || 0;
    const batch = document.getElementById('f_stock_batch').value.trim() || 'BATCH-' + String(DB.stock.length + 1).padStart(3, '0');
    const expiry = document.getElementById('f_stock_expiry').value || '2026-12-31';
    DB.stock.push({
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        batch,
        expiry,
        qty,
        status: qty > 0 ? 'In Stock' : 'Out of Stock'
    });
    product.stock = (product.stock || 0) + qty;
    saveData();
    closeModal();
    renderStock();
    showNotification('✅ Stock added', 'success');
}

function openStockOutModal() {
    const html = `
        <div class="form-group"><label>Product</label><select id="f_stockout_product">${DB.products.map(p => `<option value="${p.id}">${p.name} (${p.stock || 0})</option>`).join('')}</select></div>
        <div class="form-group"><label>Quantity to Remove</label><input type="number" id="f_stockout_qty" value="1" min="1" /></div>
        <button class="btn-submit" style="background:var(--danger);" onclick="saveStockOut()"><i class="fas fa-arrow-right"></i> Remove Stock</button>
    `;
    openModal('Stock Out', html);
}

function saveStockOut() {
    const productId = parseInt(document.getElementById('f_stockout_product').value);
    const product = DB.products.find(p => p.id === productId);
    if (!product) { showNotification('⚠️ Select a product', 'warning'); return; }
    const qty = parseInt(document.getElementById('f_stockout_qty').value) || 0;
    if (qty <= 0 || qty > product.stock) {
        showNotification('⚠️ Invalid quantity or exceeds stock', 'warning');
        return;
    }
    product.stock -= qty;
    const stockEntry = DB.stock.find(s => s.productId === productId);
    if (stockEntry) {
        stockEntry.qty = product.stock;
        stockEntry.status = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    }
    saveData();
    closeModal();
    renderStock();
    showNotification('✅ Stock removed', 'success');
}

function editStock(id) {
    const s = DB.stock.find(s => s.id === id);
    if (!s) return;
    const html = `
        <div class="form-group"><label>Product</label><input type="text" value="${s.productName}" disabled /></div>
        <div class="form-row">
            <div class="form-group"><label>Batch</label><input type="text" id="f_edit_stock_batch" value="${s.batch || ''}" /></div>
            <div class="form-group"><label>Expiry</label><input type="date" id="f_edit_stock_expiry" value="${s.expiry || ''}" /></div>
        </div>
        <div class="form-group"><label>Quantity</label><input type="number" id="f_edit_stock_qty" value="${s.qty}" /></div>
        <button class="btn-submit" onclick="updateStock(${s.id})"><i class="fas fa-save"></i> Update</button>
    `;
    openModal('Edit Stock', html);
}

function updateStock(id) {
    const s = DB.stock.find(s => s.id === id);
    if (!s) return;
    s.batch = document.getElementById('f_edit_stock_batch').value.trim() || s.batch;
    s.expiry = document.getElementById('f_edit_stock_expiry').value || s.expiry;
    s.qty = parseInt(document.getElementById('f_edit_stock_qty').value) || 0;
    s.status = s.qty > 0 ? 'In Stock' : 'Out of Stock';
    const product = DB.products.find(p => p.id === s.productId);
    if (product) product.stock = s.qty;
    saveData();
    closeModal();
    renderStock();
    showNotification('✅ Stock updated', 'success');
}

function deleteStock(id) {
    if (!confirm('Delete this stock entry?')) return;
    DB.stock = DB.stock.filter(s => s.id !== id);
    saveData();
    renderStock();
    showNotification('🗑️ Stock entry deleted', 'danger');
}

// ============================================================
// CUSTOMERS (existing - kept for completeness)
// ============================================================
function renderCustomers() {
    const search = document.getElementById('customerSearch').value.toLowerCase();
    const list = DB.customers.filter(c => c.name.toLowerCase().includes(search) || c.phone.includes(search));
    const tbody = document.getElementById('customerTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-users"></i><p>No customers found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.phone}</td>
            <td>${c.address || '—'}</td>
            <td>LKR ${(c.balance || 0).toLocaleString()}</td>
            <td>
                <button class="btn-sm primary" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="whatsappCustomer('${c.phone}')"><i class="fab fa-whatsapp"></i></button>
            </td>
        </tr>
    `).join('');
}

function openCustomerModal(data) {
    const isEdit = !!data;
    const c = data || {};
    const html = `
        <div class="form-group"><label>Customer Name *</label><input type="text" id="f_c_name" value="${c.name || ''}" /></div>
        <div class="form-group"><label>Phone *</label><input type="text" id="f_c_phone" value="${c.phone || ''}" /></div>
        <div class="form-group"><label>Address</label><input type="text" id="f_c_address" value="${c.address || ''}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Credit Limit</label><input type="number" id="f_c_limit" value="${c.creditLimit || 0}" /></div>
            <div class="form-group"><label>Outstanding Balance</label><input type="number" id="f_c_balance" value="${c.balance || 0}" /></div>
        </div>
        <button class="btn-submit" onclick="saveCustomer(${c.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Customer</button>
    `;
    openModal(isEdit ? 'Edit Customer' : 'Add Customer', html);
}

function saveCustomer(id) {
    const name = document.getElementById('f_c_name').value.trim();
    const phone = document.getElementById('f_c_phone').value.trim();
    if (!name || !phone) { showNotification('⚠️ Name and Phone are required', 'warning'); return; }
    const data = {
        name, phone,
        address: document.getElementById('f_c_address').value.trim(),
        creditLimit: parseFloat(document.getElementById('f_c_limit').value) || 0,
        balance: parseFloat(document.getElementById('f_c_balance').value) || 0,
    };
    if (id) {
        const idx = DB.customers.findIndex(c => c.id === id);
        if (idx > -1) DB.customers[idx] = { ...DB.customers[idx], ...data };
    } else {
        data.id = Date.now();
        DB.customers.push(data);
    }
    saveData();
    closeModal();
    renderCustomers();
    showNotification('✅ Customer saved', 'success');
}

function editCustomer(id) {
    const c = DB.customers.find(c => c.id === id);
    if (c) openCustomerModal(c);
}

function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    DB.customers = DB.customers.filter(c => c.id !== id);
    saveData();
    renderCustomers();
    showNotification('🗑️ Customer deleted', 'danger');
}

function whatsappCustomer(phone) {
    window.open(`https://wa.me/94${phone.replace(/[^0-9]/g, '')}`, '_blank');
}

// ============================================================
// SUPPLIERS (existing - kept for completeness)
// ============================================================
function renderSuppliers() {
    const search = document.getElementById('supplierSearch').value.toLowerCase();
    const list = DB.suppliers.filter(s => s.name.toLowerCase().includes(search) || s.phone.includes(search));
    const tbody = document.getElementById('supplierTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-truck"></i><p>No suppliers found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.contact || '—'}</td>
            <td>${s.phone}</td>
            <td>LKR ${(s.balance || 0).toLocaleString()}</td>
            <td>
                <button class="btn-sm primary" onclick="editSupplier(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteSupplier(${s.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openSupplierModal(data) {
    const isEdit = !!data;
    const s = data || {};
    const html = `
        <div class="form-group"><label>Supplier Name *</label><input type="text" id="f_s_name" value="${s.name || ''}" /></div>
        <div class="form-group"><label>Contact Person</label><input type="text" id="f_s_contact" value="${s.contact || ''}" /></div>
        <div class="form-group"><label>Phone *</label><input type="text" id="f_s_phone" value="${s.phone || ''}" /></div>
        <div class="form-group"><label>Outstanding Balance</label><input type="number" id="f_s_balance" value="${s.balance || 0}" /></div>
        <button class="btn-submit" onclick="saveSupplier(${s.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Supplier</button>
    `;
    openModal(isEdit ? 'Edit Supplier' : 'Add Supplier', html);
}

function saveSupplier(id) {
    const name = document.getElementById('f_s_name').value.trim();
    const phone = document.getElementById('f_s_phone').value.trim();
    if (!name || !phone) { showNotification('⚠️ Name and Phone are required', 'warning'); return; }
    const data = {
        name,
        contact: document.getElementById('f_s_contact').value.trim(),
        phone,
        balance: parseFloat(document.getElementById('f_s_balance').value) || 0,
    };
    if (id) {
        const idx = DB.suppliers.findIndex(s => s.id === id);
        if (idx > -1) DB.suppliers[idx] = { ...DB.suppliers[idx], ...data };
    } else {
        data.id = Date.now();
        DB.suppliers.push(data);
    }
    saveData();
    closeModal();
    renderSuppliers();
    showNotification('✅ Supplier saved', 'success');
}

function editSupplier(id) {
    const s = DB.suppliers.find(s => s.id === id);
    if (s) openSupplierModal(s);
}

function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    DB.suppliers = DB.suppliers.filter(s => s.id !== id);
    saveData();
    renderSuppliers();
    showNotification('🗑️ Supplier deleted', 'danger');
}

// ============================================================
// PURCHASES (existing - kept for completeness)
// ============================================================
function renderPurchases() {
    const search = document.getElementById('purchaseSearch').value.toLowerCase();
    const list = DB.purchases.filter(p => p.invoice.toLowerCase().includes(search) || p.supplier.toLowerCase().includes(search));
    const tbody = document.getElementById('purchaseTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-shopping-cart"></i><p>No purchases found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(p => `
        <tr>
            <td><strong>${p.invoice}</strong></td>
            <td>${p.supplier}</td>
            <td>${p.date}</td>
            <td>LKR ${p.total.toLocaleString()}</td>
            <td><span class="badge-status ${p.status === 'Completed' ? 'success' : 'warning'}">${p.status}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editPurchase(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deletePurchase(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openPurchaseModal(data) {
    const isEdit = !!data;
    const p = data || {};
    const html = `
        <div class="form-group"><label>Supplier *</label><select id="f_pur_supplier">${DB.suppliers.map(s => `<option ${s.name === p.supplier ? 'selected' : ''} value="${s.name}">${s.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Invoice #</label><input type="text" id="f_pur_invoice" value="${p.invoice || 'PO-' + String(DB.purchases.length + 1).padStart(3,'0')}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Date</label><input type="date" id="f_pur_date" value="${p.date || new Date().toISOString().slice(0,10)}" /></div>
            <div class="form-group"><label>Total (LKR)</label><input type="number" id="f_pur_total" value="${p.total || 0}" /></div>
        </div>
        <div class="form-group"><label>Status</label><select id="f_pur_status"><option ${p.status === 'Completed' ? 'selected' : ''}>Completed</option><option ${p.status === 'Pending' ? 'selected' : ''}>Pending</option></select></div>
        <button class="btn-submit" onclick="savePurchase(${p.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Purchase</button>
    `;
    openModal(isEdit ? 'Edit Purchase' : 'New Purchase', html);
}

function savePurchase(id) {
    const supplier = document.getElementById('f_pur_supplier').value;
    const invoice = document.getElementById('f_pur_invoice').value.trim();
    const date = document.getElementById('f_pur_date').value;
    const total = parseFloat(document.getElementById('f_pur_total').value) || 0;
    const status = document.getElementById('f_pur_status').value;
    if (!supplier || !invoice) { showNotification('⚠️ Supplier and Invoice are required', 'warning'); return; }
    const data = { supplier, invoice, date, total, status };
    if (id) {
        const idx = DB.purchases.findIndex(p => p.id === id);
        if (idx > -1) DB.purchases[idx] = { ...DB.purchases[idx], ...data };
    } else {
        data.id = Date.now();
        DB.purchases.push(data);
        DB.accounts.push({
            date: date || new Date().toISOString().slice(0, 10),
            description: 'Purchase - ' + invoice,
            type: 'Expense',
            amount: total
        });
    }
    saveData();
    closeModal();
    renderPurchases();
    showNotification('✅ Purchase saved', 'success');
}

function editPurchase(id) {
    const p = DB.purchases.find(p => p.id === id);
    if (p) openPurchaseModal(p);
}

function deletePurchase(id) {
    if (!confirm('Delete this purchase?')) return;
    DB.purchases = DB.purchases.filter(p => p.id !== id);
    saveData();
    renderPurchases();
    showNotification('🗑️ Purchase deleted', 'danger');
}

// ============================================================
// SALES (existing - kept for completeness)
// ============================================================
function renderSales() {
    const search = document.getElementById('salesSearch').value.toLowerCase();
    const list = DB.sales.filter(s => s.invoice.toLowerCase().includes(search) || s.customer.toLowerCase().includes(search));
    const tbody = document.getElementById('salesTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-cash-register"></i><p>No sales found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td><strong>${s.invoice}</strong></td>
            <td>${s.customer}</td>
            <td>${s.date}</td>
            <td>LKR ${s.total.toLocaleString()}</td>
            <td><span class="badge-status ${s.status === 'Completed' ? 'success' : 'warning'}">${s.status}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editSale(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteSale(${s.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="printInvoice(${s.id})"><i class="fas fa-print"></i></button>
                <button class="btn-sm info" onclick="generateQR('${s.invoice}')"><i class="fas fa-qrcode"></i></button>
            </td>
        </tr>
    `).join('');
}

function openSaleModal(data) {
    const isEdit = !!data;
    const s = data || {};
    const html = `
        <div class="form-group"><label>Customer *</label><select id="f_sale_customer">${DB.customers.map(c => `<option ${c.name === s.customer ? 'selected' : ''} value="${c.name}">${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Invoice #</label><input type="text" id="f_sale_invoice" value="${s.invoice || 'SI-' + String(DB.sales.length + 1).padStart(3,'0')}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Date</label><input type="date" id="f_sale_date" value="${s.date || new Date().toISOString().slice(0,10)}" /></div>
            <div class="form-group"><label>Total (LKR)</label><input type="number" id="f_sale_total" value="${s.total || 0}" /></div>
        </div>
        <div class="form-group"><label>Status</label><select id="f_sale_status"><option ${s.status === 'Completed' ? 'selected' : ''}>Completed</option><option ${s.status === 'Pending' ? 'selected' : ''}>Pending</option></select></div>
        <button class="btn-submit" onclick="saveSale(${s.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Sale</button>
    `;
    openModal(isEdit ? 'Edit Sale' : 'New Sale', html);
}

function saveSale(id) {
    const customer = document.getElementById('f_sale_customer').value;
    const invoice = document.getElementById('f_sale_invoice').value.trim();
    const date = document.getElementById('f_sale_date').value;
    const total = parseFloat(document.getElementById('f_sale_total').value) || 0;
    const status = document.getElementById('f_sale_status').value;
    if (!customer || !invoice) { showNotification('⚠️ Customer and Invoice are required', 'warning'); return; }
    const data = { customer, invoice, date, total, status };
    if (id) {
        const idx = DB.sales.findIndex(s => s.id === id);
        if (idx > -1) DB.sales[idx] = { ...DB.sales[idx], ...data };
    } else {
        data.id = Date.now();
        DB.sales.push(data);
        DB.accounts.push({
            date: date || new Date().toISOString().slice(0, 10),
            description: 'Sale - ' + invoice,
            type: 'Income',
            amount: total
        });
    }
    saveData();
    closeModal();
    renderSales();
    showNotification('✅ Sale saved', 'success');
}

function editSale(id) {
    const s = DB.sales.find(s => s.id === id);
    if (s) openSaleModal(s);
}

function deleteSale(id) {
    if (!confirm('Delete this sale?')) return;
    DB.sales = DB.sales.filter(s => s.id !== id);
    saveData();
    renderSales();
    showNotification('🗑️ Sale deleted', 'danger');
}

function printInvoice(id) {
    const s = DB.sales.find(s => s.id === id);
    if (!s) { showNotification('⚠️ Sale not found', 'warning'); return; }
    const win = window.open('', '_blank');
    if (!win) { showNotification('⚠️ Please allow popups', 'warning'); return; }
    const company = DB.settings.company || 'Jayasinghe Distributors';
    win.document.write(`
        <html><head><title>Invoice ${s.invoice}</title>
        <style>body{font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:auto;color:#1a1a2e;}
        .header{text-align:center;border-bottom:2px solid #1a73e8;padding-bottom:16px;margin-bottom:24px;}
        .header h1{font-size:24px;margin:0;color:#1a73e8;}
        .header p{margin:4px 0;color:#5a5a7a;}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;}
        .total{font-size:20px;font-weight:800;text-align:right;margin-top:20px;padding-top:16px;border-top:2px solid #1a73e8;}
        .status{padding:4px 16px;border-radius:20px;display:inline-block;font-weight:600;}
        .status.completed{background:#d4edda;color:#155724;}
        .status.pending{background:#fff3cd;color:#856404;}
        .footer{text-align:center;margin-top:32px;color:#8888a8;font-size:13px;border-top:1px solid #eee;padding-top:16px;}
</style></head>
<body>
    <div class="header">
        <h1>${company}</h1>
        <p>Invoice #${s.invoice}</p>
        <p>Date: ${s.date} | Customer: ${s.customer}</p>
    </div>
    <div style="margin:20px 0;">
        <div class="row"><span>Item</span><span>Qty</span><span>Price</span></div>
        <div class="row"><span>Product / Service</span><span>1</span><span>LKR ${s.total.toLocaleString()}</span></div>
    </div>
    <div class="total">Total: LKR ${s.total.toLocaleString()}</div>
    <div style="text-align:center;margin:16px 0;">
        <span class="status ${s.status.toLowerCase()}">${s.status}</span>
    </div>
    <div class="footer">Thank you for your business! | ${company}</div>
    <script>setTimeout(() => window.print(), 500);<\/script>
</body></html>
`);
win.document.close();
}

function generateQR(text) {
    const html = `
        <div class="qr-container" id="qrContainer"></div>
        <p style="text-align:center;color:var(--gray-500);font-size:12px;">${text}</p>
        <button class="btn-submit" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
    `;
    openModal('QR Code', html);
    setTimeout(() => {
        try {
            new QRCode(document.getElementById('qrContainer'), {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch(e) { showNotification('⚠️ QR generation failed', 'danger'); }
    }, 100);
}

// ============================================================
// DISTRIBUTION (existing - kept for completeness)
// ============================================================
function renderDistribution() {
    const search = document.getElementById('distSearch').value.toLowerCase();
    const list = DB.distributions.filter(d => d.deliveryNo.toLowerCase().includes(search) || d.driver.toLowerCase().includes(search) || d.route.toLowerCase().includes(search));
    const tbody = document.getElementById('distTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-route"></i><p>No deliveries found</p></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(d => `
        <tr>
            <td><strong>${d.deliveryNo}</strong></td>
            <td>${d.driver}</td>
            <td>${d.vehicle}</td>
            <td>${d.route}</td>
            <td><span class="badge-status ${d.status === 'Delivered' ? 'success' : d.status === 'In Transit' ? 'warning' : 'info'}">${d.status}</span></td>
            <td>
                <button class="btn-sm primary" onclick="editDist(${d.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm danger" onclick="deleteDist(${d.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-sm success" onclick="trackDelivery(${d.id})"><i class="fas fa-map-marker-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

function openDistModal(data) {
    const isEdit = !!data;
    const d = data || {};
    const html = `
        <div class="form-group"><label>Delivery #</label><input type="text" id="f_dist_no" value="${d.deliveryNo || 'DEL-' + String(DB.distributions.length + 1).padStart(3,'0')}" /></div>
        <div class="form-row">
            <div class="form-group"><label>Driver</label><input type="text" id="f_dist_driver" value="${d.driver || ''}" /></div>
            <div class="form-group"><label>Vehicle</label><input type="text" id="f_dist_vehicle" value="${d.vehicle || ''}" /></div>
        </div>
        <div class="form-group"><label>Route</label><input type="text" id="f_dist_route" value="${d.route || ''}" /></div>
        <div class="form-group"><label>Status</label><select id="f_dist_status"><option ${d.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${d.status === 'In Transit' ? 'selected' : ''}>In Transit</option><option ${d.status === 'Delivered' ? 'selected' : ''}>Delivered</option></select></div>
        <button class="btn-submit" onclick="saveDist(${d.id || 'null'})"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Add'} Delivery</button>
    `;
    openModal(isEdit ? 'Edit Delivery' : 'New Delivery', html);
}

function saveDist(id) {
    const deliveryNo = document.getElementById('f_dist_no').value.trim();
    const driver = document.getElementById('f_dist_driver').value.trim();
    const vehicle = document.getElementById('f_dist_vehicle').value.trim();
    const route = document.getElementById('f_dist_route').value.trim();
    const status = document.getElementById('f_dist_status').value;
    if (!deliveryNo) { showNotification('⚠️ Delivery # is required', 'warning'); return; }
    const data = { deliveryNo, driver, vehicle, route, status };
    if (id) {
        const idx = DB.distributions.findIndex(d => d.id === id);
        if (idx > -1) DB.distributions[idx] = { ...DB.distributions[idx], ...data };
    } else {
        data.id = Date.now();
        DB.distributions.push(data);
    }
    saveData();
    closeModal();
    renderDistribution();
    showNotification('✅ Delivery saved', 'success');
}

function editDist(id) {
    const d = DB.distributions.find(d => d.id === id);
    if (d) openDistModal(d);
}

function deleteDist(id) {
    if (!confirm('Delete this delivery?')) return;
    DB.distributions = DB.distributions.filter(d => d.id !== id);
    saveData();
    renderDistribution();
    showNotification('🗑️ Delivery deleted', 'danger');
}

function trackDelivery(id) {
    const d = DB.distributions.find(d => d.id === id);
    if (!d) { showNotification('⚠️ Delivery not found', 'warning'); return; }
    // Simulated GPS location (future implementation)
    const lat = 6.9271 + (Math.random() - 0.5) * 0.1;
    const lng = 79.8612 + (Math.random() - 0.5) * 0.1;
    const html = `
        <div style="text-align:center;padding:12px;">
            <p><strong>Delivery #${d.deliveryNo}</strong></p>
            <p>Driver: ${d.driver} | Vehicle: ${d.vehicle}</p>
            <p>Status: ${d.status}</p>
            <p>📍 GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
            <div style="background:var(--gray-200);height:200px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--gray-500);font-size:14px;margin:12px 0;">
                <i class="fas fa-map" style="font-size:48px;margin-right:12px;"></i> Map View (Future)
            </div>
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn-submit" style="text-decoration:none;display:inline-block;">View on Google Maps</a>
        </div>
    `;
    openModal('Track Delivery', html);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const hasData = localStorage.getItem('jd_data');
    if (hasData) {
        loadData();
        seedData();
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('app').classList.add('active');
        // Auto-login as admin (for demo)
        DB.currentUser = DB.users.find(u => u.username === 'admin');
        updateUserInfo();
        navigateTo('dashboard');
        setTimeout(() => {
            checkLowStock();
            checkExpiringProducts();
        }, 1000);
    } else {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('app').classList.remove('active');
    }
});

// Sidebar nav clicks
document.querySelectorAll('.nav-items a, .mobile-bottom-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const page = a.dataset.page;
        if (page) navigateTo(page);
    });
});

// Keyboard shortcut: Escape to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

console.log('🚀 Jayasinghe Distributors Management System loaded');
console.log('📦 Data:', DB);
