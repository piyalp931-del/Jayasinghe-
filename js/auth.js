// ============================================================
// AUTHENTICATION MODULE (Safe syntax)
// ============================================================
var currentUser = null;

var ROLES = {
    superadmin: { label: 'Super Admin', icon: '👑', permissions: ['all'], nav: ['dashboard','administration','employees','attendance','leave','payroll','inventory','products','purchasing','sales','deliveries','customers','finance','voucher','fleet','reports','settings'] },
    admin: { label: 'Administrator', icon: '🏢', permissions: ['view_dashboard','view_employees','view_inventory','view_deliveries','view_attendance','view_leave','view_reports','manage_employees','manage_inventory'], nav: ['dashboard','administration','employees','attendance','leave','payroll','inventory','deliveries','reports','voucher'] },
    hr: { label: 'HR Officer', icon: '👤', permissions: ['view_dashboard','view_employees','view_attendance','view_leave','view_payroll','manage_employees','manage_attendance','manage_leave'], nav: ['dashboard','employees','attendance','leave','payroll','reports'] },
    finance: { label: 'Accountant', icon: '💰', permissions: ['view_dashboard','view_finance','manage_finance','view_reports','view_payroll','manage_voucher'], nav: ['dashboard','finance','payroll','voucher','reports'] },
    sales: { label: 'Sales Manager', icon: '🛒', permissions: ['view_dashboard','view_inventory','view_customers','view_deliveries','create_deliveries','view_reports','view_voucher','manage_voucher'], nav: ['dashboard','sales','inventory','customers','deliveries','reports','voucher'] },
    delivery: { label: 'Delivery Staff', icon: '🚚', permissions: ['view_dashboard','view_deliveries','update_deliveries','view_attendance','view_voucher'], nav: ['dashboard','deliveries','attendance','fleet','voucher'] },
    store: { label: 'Store Keeper', icon: '🏪', permissions: ['view_dashboard','view_inventory','manage_inventory','view_reports','view_purchasing'], nav: ['dashboard','inventory','products','purchasing','reports'] },
    employee: { label: 'Employee', icon: '👤', permissions: ['view_dashboard','view_attendance','view_leave','view_payroll','view_voucher'], nav: ['dashboard','attendance','leave','payroll','voucher'] }
};

window.ROLES = ROLES;
window.getCurrentUser = function() { return currentUser; };

var loginScreen = document.getElementById('loginScreen');
var loginBtn = document.getElementById('loginBtn');
var loginUsername = document.getElementById('loginUsername');
var loginPassword = document.getElementById('loginPassword');
var loginError = document.getElementById('loginError');
var logoutBtn = document.getElementById('logoutBtn');
var userAvatar = document.getElementById('userAvatar');
var userName = document.getElementById('userName');
var userRole = document.getElementById('userRole');
var roleOptions = document.querySelectorAll('.role-option');

function hasPermission(p) {
    if (!currentUser) return false;
    var perms = currentUser.permissions || [];
    return perms.indexOf('all') !== -1 || perms.indexOf(p) !== -1;
}
function canView(module) {
    if (currentUser && currentUser.role === 'superadmin') return true;
    return hasPermission('view_' + module) || hasPermission('all') || hasPermission('manage_' + module);
}
function canManage(module) {
    if (currentUser && currentUser.role === 'superadmin') return true;
    return hasPermission('manage_' + module) || hasPermission('all');
}
window.hasPermission = hasPermission;
window.canView = canView;
window.canManage = canManage;

var USER_STORAGE_KEY = 'jayasinghe_erp_user';
function saveUserToStorage(u) { try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u)); } catch(e){} }
function loadUserFromStorage() { try { var raw = localStorage.getItem(USER_STORAGE_KEY); if(raw){ var u = JSON.parse(raw); if(u && u.uid && u.role) return u; } } catch(e){} return null; }
function clearUserStorage(){ localStorage.removeItem(USER_STORAGE_KEY); }

async function handleLogin() {
    var email = loginUsername.value.trim();
    var password = loginPassword.value.trim();
    var selectedRole = document.querySelector('.role-option.active') ? document.querySelector('.role-option.active').dataset.role : 'superadmin';
    if (!email || !password) { loginError.textContent = 'Enter credentials.'; loginError.style.display = 'block'; return; }
    try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging...';
        var userCredential = await auth.signInWithEmailAndPassword(email, password);
        var user = userCredential.user;
        await loadAllData();
        var data = getAppData();
        var employees = data.employees || [];
        var employee = null;
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].email && employees[i].email.toLowerCase() === email.toLowerCase()) {
                employee = employees[i];
                break;
            }
        }
        var role = selectedRole;
        if (employee && employee.department) {
            var dept = employee.department.toLowerCase();
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
        currentUser = { uid: user.uid, email: user.email, name: user.displayName || email.split('@')[0], role: role, permissions: ROLES[role].permissions || [] };
        saveUserToStorage(currentUser);
        loginScreen.classList.add('hidden');
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userRole.textContent = ROLES[role].label || role;
        renderSidebar();
        switchPanel('dashboard');
        showToast('👋 Welcome, ' + currentUser.name + '! (' + ROLES[role].label + ')', 'success');
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
        var opts = document.querySelectorAll('.role-option');
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove('active');
        var superOpt = document.querySelector('.role-option[data-role="superadmin"]');
        if (superOpt) superOpt.classList.add('active');
        showToast('👋 Logged out.');
    } catch (error) { showToast('❌ Logout failed.', 'error'); }
}

loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keydown', function(e) { if(e.key === 'Enter') handleLogin(); });
loginUsername.addEventListener('keydown', function(e) { if(e.key === 'Enter') handleLogin(); });
for (var i = 0; i < roleOptions.length; i++) {
    roleOptions[i].addEventListener('click', function() {
        for (var j = 0; j < roleOptions.length; j++) roleOptions[j].classList.remove('active');
        this.classList.add('active');
    });
}
logoutBtn.addEventListener('click', handleLogout);

auth.onAuthStateChanged(function(user) {
    if (user) {
        var storedUser = loadUserFromStorage();
        if (storedUser && storedUser.uid === user.uid) {
            currentUser = storedUser;
            loginScreen.classList.add('hidden');
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            userName.textContent = currentUser.name;
            userRole.textContent = ROLES[currentUser.role] ? ROLES[currentUser.role].label : currentUser.role;
            loadAllData().then(function() { renderSidebar(); switchPanel('dashboard'); showToast('👋 Welcome back, ' + currentUser.name + '!', 'success'); });
        } else {
            loginScreen.classList.remove('hidden');
        }
    } else {
        currentUser = null;
        clearUserStorage();
        loginScreen.classList.remove('hidden');
    }
});
