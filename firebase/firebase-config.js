// ============================================================
// FIREBASE CONFIGURATION
// Replace these values with your actual Firebase project config
// Get them from: Firebase Console > Project Settings > Your Apps
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCjIGh21W1efIfo-yA_UcdsqAwJrUa1Yio",    
  authDomain: "tools-a5023.firebaseapp.com",
  projectId: "tools-a5023",
  storageBucket: "tools-a5023.firebasestorage.app",
  messagingSenderId: "684116553702",
  appId: "1:684116553702:web:5dd654408060bcb8317027"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
