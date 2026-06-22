// ============================================================
// AUTHENTICATION MODULE (FIXED - onAuthStateChanged & permissions)
// ============================================================

// Global currentUser variable
let currentUser = null;

// Role-based permissions
const ROLES = {
    admin: {
        label: 'Administrator',
        icon: '👑',
        permissions: ['all'],
        dashboard: ['stats_all', 'sales_chart', 'low_stock', 'quick_actions_all'],
        nav: ['dashboard', 'employees', 'inventory', 'products', 'deliveries', 'attendance', 'leave', 'payroll', 'customers', 'finance', 'reports', 'vehicles', 'settings']
    },
    manager: {
        label: 'Manager',
        icon: '📊',
        permissions: ['view_dashboard', 'view_employees', 'view_inventory', 'view_deliveries', 'view_attendance', 'view_leave', 'view_reports', 'manage_employees', 'manage_inventory'],
        dashboard: ['stats_employees', 'stats_deliveries', 'stats_low_stock', 'sales_chart', 'quick_actions_ops'],
        nav: ['dashboard', 'employees', 'inventory', 'deliveries', 'attendance', 'leave', 'reports']
    },
    sales: {
        label: 'Sales Representative',
        icon: '🛒',
        permissions: ['view_dashboard', 'view_inventory', 'view_customers', 'view_deliveries', 'create_deliveries', 'view_reports'],
        dashboard: ['stats_inventory', 'stats_customers', 'stats_deliveries', 'sales_chart', 'quick_actions_sales'],
        nav: ['dashboard', 'inventory', 'customers', 'deliveries', 'reports']
    },
    delivery: {
        label: 'Delivery Staff',
        icon: '🚚',
        permissions: ['view_dashboard', 'view_deliveries', 'update_deliveries', 'view_attendance'],
        dashboard: ['stats_deliveries', 'stats_attendance', 'delivery_map', 'quick_actions_delivery'],
        nav: ['dashboard', 'deliveries', 'attendance', 'vehicles']
    },
    store: {
        label: 'Store Keeper',
        icon: '🏪',
        permissions: ['view_dashboard', 'view_inventory', 'manage_inventory', 'view_reports'],
        dashboard: ['stats_inventory', 'stats_low_stock', 'inventory_chart', 'quick_actions_store'],
        nav: ['dashboard', 'inventory', 'products', 'reports']
    },
    accountant: {
        label: 'Accountant',
        icon: '💰',
        permissions: ['view_dashboard', 'view_finance', 'manage_finance', 'view_reports', 'view_payroll'],
        dashboard: ['stats_finance', 'stats_payroll', 'finance_chart', 'quick_actions_finance'],
        nav: ['dashboard', 'finance', 'payroll', 'reports']
    },
    employee: {
        label: 'Employee',
        icon: '👤',
        permissions: ['view_dashboard', 'view_attendance', 'view_leave', 'view_payroll'],
        dashboard: ['stats_attendance', 'stats_leave', 'stats_payroll', 'quick_actions_employee'],
        nav: ['dashboard', 'attendance', 'leave', 'payroll']
    }
};

// DOM references
const loginScreen = document.getElementById('loginScreen');
const loginBtn = document.getElementById('loginBtn');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotModal = document.getElementById('forgotModal');
const forgotModalClose = document.getElementById('forgotModalClose');
const forgotUsername = document.getElementById('forgotUsername');
const forgotNewPassword = document.getElementById('forgotNewPassword');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');

// Role selector
const roleOptions = document.querySelectorAll('.role-option');

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.getCurrentUser = function() { return currentUser; };
window.ROLES = ROLES;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function hasPermission(permission) {
    if (!currentUser) return false;
    const perms = currentUser.permissions || [];
    return perms.includes('all') || perms.includes(permission);
}

function canView(module) {
    if (currentUser && currentUser.role === 'admin') return true;
    return hasPermission('view_' + module) || hasPermission('all') || hasPermission('manage_' + module);
}

function canManage(module) {
    if (currentUser && currentUser.role === 'admin') return true;
    return hasPermission('manage_' + module) || hasPermission('all');
}

window.hasPermission = hasPermission;
window.canView = canView;
window.canManage = canManage;

// ============================================================
// LOGIN
// ============================================================
async function handleLogin() {
    const email = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    const selectedRole = document.querySelector('.role-option.active')?.dataset.role || 'admin';

    if (!email || !password) {
        loginError.textContent = 'Please enter email and password.';
        loginError.style.display = 'block';
        return;
    }

    try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (!ROLES[selectedRole]) {
            throw new Error('Invalid role selected.');
        }

        currentUser = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || email.split('@')[0],
            role: selectedRole,
            permissions: ROLES[selectedRole].permissions || []
        };

        console.log('✅ Current User after login:', currentUser);

        loginScreen.classList.add('hidden');
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userRole.textContent = ROLES[selectedRole].label || selectedRole;

        await loadAllData();

        renderSidebar();
        switchPanel('dashboard');

        showToast(`👋 Welcome, ${currentUser.name}! (${ROLES[selectedRole].label})`, 'success');

    } catch (error) {
        loginError.textContent = error.message || 'Invalid credentials.';
        loginError.style.display = 'block';
        console.error('Login error:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// ============================================================
// LOGOUT
// ============================================================
async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        loginScreen.classList.remove('hidden');
        loginPassword.value = '';
        loginUsername.value = 'admin@example.com';
        loginError.style.display = 'none';
        document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.role-option[data-role="admin"]')?.classList.add('active');
        showToast('👋 Logged out.');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('❌ Logout failed.', 'error');
    }
}

// ============================================================
// FORGOT PASSWORD
// ============================================================
async function handleResetPassword() {
    const username = forgotUsername.value.trim();
    const newPassword = forgotNewPassword.value.trim();

    if (!username || !newPassword) {
        showToast('Please fill all fields.', 'error');
        return;
    }

    try {
        await auth.sendPasswordResetEmail(username);
        showToast('✅ Password reset email sent!');
        forgotModal.classList.remove('open');
    } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
loginBtn.addEventListener('click', handleLogin);

loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});
loginUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});

roleOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        roleOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

logoutBtn.addEventListener('click', handleLogout);

forgotPasswordLink.addEventListener('click', () => {
    forgotModal.classList.add('open');
});

forgotModalClose.addEventListener('click', () => {
    forgotModal.classList.remove('open');
});

resetPasswordBtn.addEventListener('click', handleResetPassword);

// ============================================================
// ✅ FIXED onAuthStateChanged
// ============================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        // If we don't have currentUser, keep login screen visible
        // so user can select role and login again.
        if (!currentUser) {
            console.log('User signed in but no currentUser. Showing login screen.');
            loginScreen.classList.remove('hidden');
        }
        // else: currentUser exists, login screen already hidden.
    } else {
        loginScreen.classList.remove('hidden');
    }
});
