// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase only if config is provided
let auth;
try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
    }
} catch (e) {
    console.error("Firebase init error", e);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('loginBtn');
    const errorBox = document.getElementById('loginError');

    // Check if already logged in
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                window.location.href = 'admin.html';
            }
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorBox.style.display = 'none';
        
        // Mock Login if Firebase is not configured
        if (!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
            
            setTimeout(() => {
                if (emailInput.value === 'admin@test.com' && passwordInput.value === 'password') {
                    // Set a mock token
                    localStorage.setItem('mockAdminToken', 'true');
                    window.location.href = 'admin.html';
                } else {
                    errorBox.textContent = 'Demo Mode: Use admin@test.com / password';
                    errorBox.style.display = 'block';
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'เข้าสู่ระบบ';
                }
            }, 1000);
            return;
        }

        // Real Firebase Auth
        try {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
            
            await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
            // Redirection handled by onAuthStateChanged
        } catch (error) {
            errorBox.textContent = error.message;
            errorBox.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'เข้าสู่ระบบ';
        }
    });
});
