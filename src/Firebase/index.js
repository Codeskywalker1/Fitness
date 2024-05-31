// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Storage
import { getAuth } from "firebase/auth"; // Autenticación
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5m5QHhnzlir4XQj5dCbZiSJgDfdXNU8c",
  authDomain: "authentication-app-ec68a.firebaseapp.com",
  projectId: "authentication-app-ec68a",
  storageBucket: "authentication-app-ec68a.appspot.com",
  messagingSenderId: "513259878646",
  appId: "1:513259878646:web:25eaff55c8ddc1b2ddd4d7",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancias de los servicios
const auth = getAuth(app); // Autenticación
const db = getFirestore(app); // Firestore
const storage = getStorage(app); // Storage

export { auth, db, storage, ref, uploadBytes, getDownloadURL, listAll };
