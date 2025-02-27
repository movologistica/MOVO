import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2HXL-xapM7d8M1UMQSj5NTr0VBl_E0Ls",
  authDomain: "base-de-datos-451315.firebaseapp.com",
  projectId: "base-de-datos-451315",
  storageBucket: "base-de-datos-451315.appspot.com",
  messagingSenderId: "1019271417877",
  appId: "1:1019271417877:web:c5ace1c4fc935498913e1c",
  measurementId: "G-E88H32KFFT"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener el nombre del usuario desde Firestore
async function obtenerNombreCompleto() {
  const cedulaActual = sessionStorage.getItem("usuarioCedula");

  if (!cedulaActual) {
    console.error("No se encontró la cédula del usuario en sessionStorage.");
    alert("Error: No se encontró la cédula del usuario.");
    return;
  }

  try {
    // Obtener documento del usuario desde Firestore
    const userRef = doc(db, "usuarios_login", cedulaActual);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("No se encontró el usuario en Firestore.");
      alert("Error: No se encontró el usuario.");
      return;
    }

    const userData = userDoc.data();
    const nombreCompleto = userData.nombre; // Asegúrate de que el campo se llame "Nombre"

    // Mostrar el nombre en la página
    document.getElementById("nombreCompleto").textContent = nombreCompleto;

  } catch (error) {
    console.error("Error al obtener datos de Firestore:", error);
    alert("Error al conectar con Firebase.");
  }
}

// Ejecutar la función cuando la página cargue
document.addEventListener("DOMContentLoaded", obtenerNombreCompleto);

// Cerrar sesión
document.getElementById("cSesionEmpleado").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "../index.html";
});

// Entrar a auxiliar
document.getElementById("auxiliar").addEventListener("click", () => {
  window.location.href = "../paginas/auxiliar.html";
});

// Entrar a conductor
document.getElementById("conductor").addEventListener("click", () => {
  window.location.href = "../paginas/conductor.html";
});