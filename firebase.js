// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2HXL-xapM7d8M1UMQSj5NTr0VBl_E0Ls",
  authDomain: "base-de-datos-451315.firebaseapp.com",
  projectId: "base-de-datos-451315",
  storageBucket: "base-de-datos-451315.firebasestorage.app",
  messagingSenderId: "1019271417877",
  appId: "1:1019271417877:web:c5ace1c4fc935498913e1c",
  measurementId: "G-E88H32KFFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
