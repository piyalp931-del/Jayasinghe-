let currentUser = null;
const ROLES = {
    superadmin: { label: 'Super Admin', icon: '👑', permissions: ['all'], nav: ['dashboard', 'administration', 'employees', 'attendance', 'leave', 'payroll', 'inventory', 'products', 'purchasing', 'sales', 'deliveries', 'customers', 'finance', 'voucher', 'fleet', 'reports', 'settings'] },
    admin: { label: 'Administrator', icon: '🏢', permissions: ['view_dashboard', 'view_employees', 'view_inventory', 'view_deliveries', 'view_attendance', 'view_leave', 'view_reports', 'manage_employees', 'manage_inventory'], nav: ['dashboard', 'administration', 'employees', 'attendance', 'leave', 'payroll', 'inventory', 'deliveries', 'reports', 'voucher'] },
    hr: { label: 'HR Officer', icon: '👤', permissions: ['view_dashboard', 'view_employees', 'view_attendance', 'view_leave', 'view_payroll', 'manage_employees', 'manage_attendance', 'manage_leave'], nav: ['dashboard', 'employees', 'attendance', 'leave', 'payroll', 'reports'] },
    finance: { label: 'Accountant', icon: '💰', permissions: ['view_dashboard', 'view_finance', 'manage_finance', 'view_reports', 'view_payroll', 'manage_voucher'], nav: ['dashboard', 'finance', 'payroll', 'voucher', 'reports'] },
    sales: { label: 'Sales Manager', icon: '🛒', permissions: ['view_dashboard', 'view_inventory', 'view_customers', 'view_deliveries', 'create_deliveries', 'view_reports', 'view_voucher', 'manage_voucher'], nav: ['dashboard', 'sales', 'inventory', 'customers', 'deliveries', 'reports', 'voucher'] },
    delivery: { label: 'Delivery Staff', icon: '🚚', permissions: ['view_dashboard', 'view_deliveries', 'update_deliveries', 'view_attendance', 'view_voucher'], nav: ['dashboard', 'deliveries', 'attendance', 'fleet', 'voucher'] },
    store: { label: 'Store Keeper', icon: '🏪', permissions: ['view_dashboard', 'view_inventory', 'manage_inventory', 'view_reports', 'view_purchasing'], nav: ['dashboard', 'inventory', 'products', 'purchasing', 'reports'] },
    employee: { label: 'Employee', icon: '👤', permissions: ['view_dashboard', 'view_attendance', 'view_leave', 'view_payroll', 'view_voucher'], nav: ['dashboard', 'attendance', 'leave', 'payroll', 'voucher'] }
};
window.ROLES = ROLES;
window.getCurrentUser = () => currentUser;

const loginScreen = document.getElementById('loginScreen');
const loginBtn = document.getElementById('loginBtn');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const roleOptions = document.querySelectorAll('.role-option');

function hasPermission(p) {
    if (!currentUser) return false;
    const perms = currentUser.permissions || [];
    return perms.includes('all') || perms.includes(p);
}
function canView(module) {
    if (currentUser?.role === 'superadmin') return true;
    return hasPermission('view_' + module) || hasPermission('all') || hasPermission('manage_' + module);
}
function canManage(module) {
    if (currentUser?.role === 'superadmin') return true;
    return hasPermission('manage_' + module) || hasPermission('all');
}
window.hasPermission = hasPermission;
window.canView = canView;
window.canManage = canManage;

const USER_STORAGE_KEY = 'jayasinghe_erp_user';
function saveUserToStorage(u) { try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u)); } catch(e){} }
function loadUserFromStorage() { try { const raw = localStorage.getItem(USER_STORAGE_KEY); if(raw){ const u=JSON.parse(raw); if(u?.uid && u?.role) return u; } } catch(e){} return null; }
function clearUserStorage(){ localStorage.removeItem(USER_STORAGE_KEY); }

async function handleLogin() {
    const email = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    const selectedRole = document.querySelector('.role-option.active')?.dataset.role || 'superadmin';
    if (!email || !password) { loginError.textContent = 'Enter credentials.'; loginError.style.display='block'; return; }
    try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging...';
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await loadAllData();
        const data = getAppData();
        const employees = data.employees || [];
        const employee = employees.find(e => e.email && e.email.toLowerCase() === email.toLowerCase());
        let role = selectedRole;
        if (employee && employee.department) {
            const dept = employee.department.toLowerCase();
            if (dept === 'super admin') role = 'superadmin';
            else if (dept === 'admin') role = 'admin';
            else if (dept === 'hr') role = 'hr';
            else if (dept === 'finance') role = 'finance';
            else if (dept === 'sales') role = 'sales';
            else if (dept === 'delivery') role = 'delivery';
            else if (dept === 'store') role = 'store';
            else role = 'employee';
        }
        if (!ROLES[role]) role = 'employee';
        currentUser = { uid: user.uid, email: user.email, name: user.displayName || email.split('@')[0], role, permissions: ROLES[role].permissions || [] };
        saveUserToStorage(currentUser);
        loginScreen.classList.add('hidden');
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userRole.textContent = ROLES[role].label || role;
        renderSidebar();
        switchPanel('dashboard');
        showToast(`👋 Welcome, ${currentUser.name}! (${ROLES[role].label})`, 'success');
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        clearUserStorage();
        loginScreen.classList.remove('hidden');
        loginPassword.value = '';
        loginUsername.value = 'admin@example.com';
        loginError.style.display = 'none';
        document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.role-option[data-role="superadmin"]')?.classList.add('active');
        showToast('👋 Logged out.');
    } catch (error) { showToast('❌ Logout failed.', 'error'); }
}

loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleLogin(); });
loginUsername.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleLogin(); });
roleOptions.forEach(opt => {
    opt.addEventListener('click', () => { roleOptions.forEach(o => o.classList.remove('active')); opt.classList.add('active'); });
});
logoutBtn.addEventListener('click', handleLogout);

auth.onAuthStateChanged((user) => {
    if (user) {
        const storedUser = loadUserFromStorage();
        if (storedUser && storedUser.uid === user.uid) {
            currentUser = storedUser;
            loginScreen.classList.add('hidden');
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            userName.textContent = currentUser.name;
            userRole.textContent = ROLES[currentUser.role]?.label || currentUser.role;
            loadAllData().then(() => { renderSidebar(); switchPanel('dashboard'); showToast(`👋 Welcome back, ${currentUser.name}!`, 'success'); });
        } else {
            loginScreen.classList.remove('hidden');
        }
    } else {
        currentUser = null;
        clearUserStorage();
        loginScreen.classList.remove('hidden');
    }
});
