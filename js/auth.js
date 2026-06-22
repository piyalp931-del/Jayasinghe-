// ============================================================
// AUTHENTICATION MODULE
// ============================================================

let currentUser = null;

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

        // Check if role matches (you can store role in Firestore or custom claims)
        // For demo, we just use the selected role
        currentUser = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || email.split('@')[0],
            role: selectedRole
        };

        // Update UI
        loginScreen.classList.add('hidden');
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userRole.textContent = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);

        // Load data from Firestore
        await loadAllData();

        renderSidebar();
        switchPanel('dashboard');

        showToast(`👋 Welcome, ${currentUser.name}!`, 'success');

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
        // In a real app, you would send a reset email
        // For demo, we just update the user's password if they exist in Firestore
        // Or you can use auth.sendPasswordResetEmail()
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

// Check auth state on load
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is already logged in
        // You can load user data from Firestore here
        console.log('User already logged in:', user.email);
    } else {
        // Show login screen
        loginScreen.classList.remove('hidden');
    }
});
