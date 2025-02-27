import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2HXL-xapM7d8M1UMQSj5NTr0VBl_E0Ls",
  authDomain: "base-de-datos-451315.firebaseapp.com",
  projectId: "base-de-datos-451315",
  storageBucket: "base-de-datos-451315.appspot.com",
  messagingSenderId: "1019271417877",
  appId: "1:1019271417877:web:c5ace1c4fc935498913e1c",
  measurementId: "G-E88H32KFFT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginEmpleado").addEventListener("click", async () => {
    const cedula = document.getElementById("cedulaEmpleado").value;
    const password = document.getElementById("passwordEmpleado").value;

    try {
      // Buscar usuario en Firestore
      const userRef = doc(db, "usuarios_login", cedula);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("No se encontró un usuario con esa cédula.");
      }

      const userData = userDoc.data();

      // Verificar la contraseña
      if (userData.password !== password) {
        throw new Error("Contraseña incorrecta.");
      }

      // Inicio de sesión exitoso
      sessionStorage.setItem('usuarioCedula', cedula);
      window.location.href = "../paginas/principalEmpleado.html";
    } catch (error) {
      alert("Error de inicio de sesión: " + error.message);
    }
  });

  document.getElementById("regresarAMine").addEventListener('click', function(){
    window.location.href = "../index.html";
  });
});
