// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgbYenPNn6g3lAXkEBj_aku7RdGk8ISto",
  authDomain: "concurso-interno-violino-d5d15.firebaseapp.com",
  projectId: "concurso-interno-violino-d5d15",
  storageBucket: "concurso-interno-violino-d5d15.firebasestorage.app",
  messagingSenderId: "881864008632",
  appId: "1:881864008632:web:9ddd51de89135d7278654d",
  measurementId: "G-4L141V2ZVM"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, signInWithEmailAndPassword, storage };
