import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7mJ6-nsQwk1M2eVfcmsktITnB7DLdUHk",
  authDomain: "brainflip-82d6b.firebaseapp.com",
  projectId: "brainflip-82d6b",
  storageBucket: "brainflip-82d6b.firebasestorage.app",
  messagingSenderId: "454398192827",
  appId: "1:454398192827:web:b40ef56bf6e00f74940d9e",
  measurementId: "G-3N1DQCZW93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Could not set persistence:', err);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
