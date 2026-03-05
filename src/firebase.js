// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyDQvZej-SH6RgQ7hIgvxO8RP66iu66gnlM",
  authDomain: "alumni-8b352.firebaseapp.com",
  projectId: "alumni-8b352",
  storageBucket: "alumni-8b352.appspot.com", 
  messagingSenderId: "854261512420",
  appId: "1:854261512420:web:4c670f9e1397aa77f214f1",
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// Secondary Auth (for admin use)
export const secondaryAuth = getAuth(
  initializeApp(firebaseConfig, "Secondary")
);

// 🔥 Firestore
export const db = getFirestore(app);

// 🔥 Firebase Storage (FOR IMAGE UPLOAD)
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();