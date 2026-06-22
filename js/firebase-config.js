// Firebase Config – Jayasinghe ERP
const firebaseConfig = {
    apiKey: "AIzaSyBKykmEPUlkIZ0x9N-qUphLumdv8nVv1-M",
    authDomain: "jayasinghe-erp.firebaseapp.com",
    projectId: "jayasinghe-erp",
    storageBucket: "jayasinghe-erp.firebasestorage.app",
    messagingSenderId: "437971346636",
    appId: "1:437971346636:web:e855e5924eb4150e1f0e69"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth and Firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .then(() => console.log('🔥 Firestore offline persistence enabled'))
    .catch(err => console.warn('⚠️ Firestore persistence error:', err));
