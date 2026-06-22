// Firebase Config – Jayasinghe ERP v2
const firebaseConfig = {
    apiKey: "AIzaSyBEvrm4BoNHpVB6vTAFGIViK_aiu4RFmzA",
    authDomain: "jayasinghe-erp-v2.firebaseapp.com",
    projectId: "jayasinghe-erp-v2",
    storageBucket: "jayasinghe-erp-v2.firebasestorage.app",
    messagingSenderId: "621839570928",
    appId: "1:621839570928:web:b7f1ee499b9b1ad179af35",
    measurementId: "G-96V7EZJYN1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

db.enablePersistence()
    .then(() => console.log('🔥 Firestore offline persistence enabled'))
    .catch(err => console.warn('⚠️ Firestore persistence error:', err));
