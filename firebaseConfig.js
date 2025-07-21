import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyCdYL6S0_45646qGH36vAI1NlZmQW_9mYw",
  authDomain: "omniplex-46807.firebaseapp.com",
  projectId: "omniplex-46807",
  storageBucket: "omniplex-46807.firebasestorage.app",
  messagingSenderId: "1082565764889",
  appId: "1:1082565764889:web:1f0c9d1e79810fccb84788",
  measurementId: "G-5WLZ0677JJ"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { db, storage, auth, googleProvider };

export const initializeFirebase = () => {
  return app;
};
